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

export interface MusicPlayerConfiguration {
  channelId: string
  guildId: string
  adapterCreator: DiscordGatewayAdapterCreator
}

class MusicPlayer {
  private readonly connection: VoiceConnection
  private readonly player: AudioPlayer
  private readonly musics: BaseMusicSource[] = []
  private readonly logger: Logger = new Logger()

  public constructor(configuration: MusicPlayerConfiguration) {
    this.logger.setContextName(this.constructor.name)

    this.connection = joinVoiceChannel({
      channelId: configuration.channelId,
      guildId: configuration.guildId,
      adapterCreator: configuration.adapterCreator,
      debug: config.get('env') != 'production'
    })

    this.connection.on('debug', message => this.logger.debug(message))

    this.connection.on('error', error => this.logger.error(error))

    this.connection.on(VoiceConnectionStatus.Ready, () => this.logger.verbose(`Voice connection on ${configuration.guildId} is ready`))

    this.connection.on(VoiceConnectionStatus.Disconnected, async () => {
      this.logger.verbose(`Voice connection on ${configuration.guildId} is disconnected`)
    })

    this.player = createAudioPlayer({
      debug: config.get('env') != 'production'
    })

    this.player.on("debug", message => this.logger.debug(message))

    this.player.on("error", error => this.logger.error(error))

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

      if (this.musics.length > 0) {
        await this.play()
      }
    })

    this.connection.subscribe(this.player)
  }

  public async play() {
    await this.musics[0].play()
    // this.player.play()
  }

  public async pause() {

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
    const api = SpotifyService.getSpotifyAPI()

    if (url.pathname.match(/\/track\//)) {
      const trackId = url.pathname.split('/').pop()
      const track = await api.tracks.get(trackId || '')
      const artist = track.artists[0].name
      const title = track.name

      const dl = await playdl.search(`${artist} ${title}`, { limit: 1, source: { youtube: 'video' } })
      this.musics.push(new YouTubeMusicSource(this.player, dl[0].url))
    }
  }
}

export default MusicPlayer