import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  DiscordGatewayAdapterCreator,
  joinVoiceChannel,
  VoiceConnection,
  VoiceConnectionStatus
} from "@discordjs/voice"
import Logger from "../infrastructures/Logger"
import config from "../infrastructures/config"
import { EmbedBuilder } from "discord.js"
import YouTubeMusicSource from "./YouTubeMusicSource"
import BaseMusicSource from "./BaseMusicSource"
import SpotifyService from "../services/SpotifyService"
import playdl from 'play-dl'
import container from "../infrastructures/container"
import DiscordReplyException from "../exceptions/DiscordReplyException"

export interface MusicPlayerConfiguration {
  channelId: string
  guildId: string
  adapterCreator: DiscordGatewayAdapterCreator
}

class MusicPlayer {
  private readonly connection: VoiceConnection
  private readonly player: AudioPlayer
  private readonly musics: BaseMusicSource[] = []
  private readonly logger: Logger = container.get(Logger)
  private readonly spotifyService: SpotifyService = container.get(SpotifyService)

  public constructor(configuration: MusicPlayerConfiguration) {
    this.logger.setContextName(this.constructor.name)

    this.connection = joinVoiceChannel({
      channelId: configuration.channelId,
      guildId: configuration.guildId,
      adapterCreator: configuration.adapterCreator,
      debug: config.get('env') != 'production'
    })

    this.connection.on('debug', message => this.logger.debug(message))

    this.connection.on('error', error => this.logger.error(error.message))

    this.connection.on(VoiceConnectionStatus.Ready, () => this.logger.verbose(`Voice connection on ${configuration.guildId} is ready`))

    this.connection.on(VoiceConnectionStatus.Disconnected, async () => {
      this.logger.verbose(`Voice connection on ${configuration.guildId} is disconnected`)
    })

    this.player = createAudioPlayer({
      debug: config.get('env') != 'production'
    })

    this.player.on("debug", message => this.logger.debug(message))

    this.player.on("error", error => this.logger.error(error.message))

    this.player.on(AudioPlayerStatus.Paused, () => {
      this.logger.verbose(`Audio player on guild ${configuration.guildId} with channel ${configuration.channelId} is paused`)
    })

    this.player.on(AudioPlayerStatus.Playing, () => {
      this.logger.verbose(`Audio player on guild ${configuration.guildId} with channel ${configuration.channelId} is playing`)
    })

    this.player.on(AudioPlayerStatus.Buffering, () => {
      this.logger.warn(`Audio player on guild ${configuration.guildId} with channel ${configuration.channelId} is buffering`)
    })

    this.player.on(AudioPlayerStatus.Idle, async () => {
      this.logger.verbose(`Audio player on guild ${configuration.guildId} with channel ${configuration.channelId} is idle`)
    })

    this.player.on("stateChange", (oldState, newState) => {
      if (oldState.status == AudioPlayerStatus.Playing && newState.status == AudioPlayerStatus.Idle) {
        this.musics.shift()

        if (this.musics.length > 0) {
          this.musics[0].play()
        }
      }
    })

    this.connection.subscribe(this.player)
  }

  public async play() {
    if (this.player.state.status == AudioPlayerStatus.Idle && this.musics.length > 0) {
      this.musics[0].play()
    }
    // this.player.play()
  }

  public async pause() {

  }

  public stop(): void {

  }

  public async addTrack(query: string): Promise<EmbedBuilder> {
    try {
      const url = new URL(query)

      switch (url.hostname) {
        case 'open.spotify.com':
          await this.addTrackFromSpotify(url)
          break;
      }
    } catch (_) {
    }

    return new EmbedBuilder()
  }

  private async addTrackFromSpotify(url: URL) {
    this.logger.silly(url.toString())
    if (url.pathname.match(/\/track\//)) {
      try {
        const trackId = url.pathname.split('/').pop()
        const track = await this.spotifyService.tracks.get(trackId || '')
        const artist = track.artists[0].name
        const title = track.name

        const dl = await playdl.search(`${artist} ${title}`, { limit: 1, source: { youtube: 'video' } })
        this.musics.push(new YouTubeMusicSource(this.player, dl[0].url))
      } catch(error: any) {
        this.logger.warn(error.message)

        throw new DiscordReplyException({
          content: 'Spotify track not found.',
          flags: "Ephemeral"
        })
      }
    } else if (url.pathname.match(/\/playlist\//)) {
      this.logger.debug('Spotify playlist detected')

      try {
        const playlistId = url.pathname.split('/').pop()

        let currentOffset = 0
        let totalTracks = 0
        do {
          const tracks = await this.spotifyService.playlists.getPlaylistItems(
            playlistId || '',
            undefined,
            undefined,
            undefined,
            currentOffset
          )
          currentOffset += tracks.items.length
          totalTracks ||= tracks.total

          const dlSearch = await Promise.all(tracks.items.map(track => {
            this.logger.debug(`Adding ${track.track.artists[0].name} - ${track.track.name} to queue`)
            return playdl.search(`${track.track.artists[0].name} ${track.track.name}`, { limit: 1, source: { youtube: 'video' } })
          }))

          dlSearch.forEach(dl => {
            this.logger.debug(`Adding ${dl[0].title} to queue`)
            this.musics.push(new YouTubeMusicSource(this.player, dl[0].url))
          })

          // for (const track of tracks.items) {
          //   const artist = track.track.artists[0].name
          //   const title = track.track.name
          //
          //   const dl = await playdl.search(`${artist} ${title}`, { limit: 1, source: { youtube: 'video' } })
          //   this.logger.debug(`Adding ${artist} - ${title} to queue`)
          //   this.musics.push(new YouTubeMusicSource(this.player, dl[0].url))
          // }
        } while (currentOffset <= totalTracks)
      } catch (error: any) {
        this.logger.warn(error.message)

        throw new DiscordReplyException({
          content: 'Spotify playlist not found.',
          flags: "Ephemeral"
        })
      }
    } else {
      throw new DiscordReplyException({
        content: 'Spotify URL must be from track or playlist.',
        flags: "Ephemeral"
      })
    }
  }
}

export default MusicPlayer