import { AudioPlayerState, AudioPlayerStatus, createAudioResource, StreamType } from "@discordjs/voice"
import MusicStreamProvider from "./MusicStreamProvider"
import VoicePlayer, { AudioPlayerNewState, VoicePlayerConfiguration } from "../voice/VoicePlayer"
import DiscordReplyException from "../exceptions/DiscordReplyException"
import { EmbedBuilder } from "discord.js"
import container from "../infrastructures/container"
import SpotifyService from "../services/SpotifyService"
import playdl from 'play-dl'
import YouTubeMusicStream from "./YouTubeMusicStream"

class MusicPlayer extends VoicePlayer {
  private readonly musicQueue: MusicStreamProvider[] = []
  private readonly spotifyService: SpotifyService = container.get(SpotifyService)

  public constructor(configuration: VoicePlayerConfiguration) {
    super(configuration)

    this.logger.setContextName(this.constructor.name)
  }

  protected override onAudioStateChange(oldState: AudioPlayerState, newState: AudioPlayerNewState) {
    if (oldState.status == AudioPlayerStatus.Playing && newState.status == AudioPlayerStatus.Idle) {
      this.logger.debug('Playing next music ')
      this.musicQueue.shift()

      if (this.musicQueue.length > 0) {
        this.play()
      }
    }

    super.onAudioStateChange(oldState, newState)
  }

  public play(): void {
    if (this.audio.state.status === AudioPlayerStatus.Idle && this.musicQueue.length > 0) {
      this.logger.debug('Playing music')

      const audioResource = createAudioResource(this.musicQueue[0].getAudioStream(), {
        inputType: StreamType.Arbitrary
      })

      this.audio.play(audioResource)
    } else if (this.audio.state.status == AudioPlayerStatus.Paused) {
      this.audio.unpause()

      this.logger.debug('Unpaused current track')
    }
  }

  public pause(): void {
    if (this.audio.state.status === AudioPlayerStatus.Playing) {
      this.audio.pause()

      this.logger.debug('Paused current track')
    }
  }

  public next() {
    if (this.musicQueue.length > 0) {
      this.audio.stop(true)

      this.logger.debug('Skipping music')
    } else {
      throw new DiscordReplyException({
        content: 'Need atleast 1 song in queue.',
        flags: "Ephemeral"
      })
    }
  }

  public shuffle() {
    if (this.musicQueue.length <= 1) {
      throw new DiscordReplyException({
        content: 'Need atleast 2 songs for shuffle',
        flags: 'Ephemeral'
      })
    }

    const [current, ...rest] = this.musicQueue
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[rest[i], rest[j]] = [rest[j], rest[i]]
    }

    this.musicQueue.splice(0, this.musicQueue.length, current, ...rest)
    this.logger.debug('Playlist has been shuffled.')
  }

  public async addTracks(query: string): Promise<EmbedBuilder> {
    try {
      const url = new URL(query)

      switch (url.hostname) {
        // case 'open.spotify.com':
        //   await this.addTracksFromSpotify(url)
        //   break
        case 'youtu.be':
        case 'www.youtube.com':
        case 'youtube.com':
        case 'music.youtube.com':
          await this.addTracksFromYouTube(url)
          break
      }
    } catch (_) {
      // await this.addTracksFromQuery(query)
    }

    return new EmbedBuilder()
  }

  // private async addTracksFromSpotify(url: URL) {
  //   this.logger.silly(url.toString())
  //   if (url.pathname.match(/\/track\//)) {
  //     try {
  //       const trackId = url.pathname.split('/').pop()
  //       const track = await this.spotifyService.tracks.get(trackId || '')
  //       const artist = track.artists[0].name
  //       const title = track.name
  //
  //       const dl = await playdl.search(`${artist} ${title}`, { limit: 1, source: { youtube: 'video' } })
  //       this.musics.push(new YouTubeAudioSource(this.player, dl[0].url))
  //     } catch(error: any) {
  //       this.logger.warn(error.message)
  //
  //       throw new DiscordReplyException({
  //         content: 'Spotify track not found.',
  //         flags: "Ephemeral"
  //       })
  //     }
  //   } else if (url.pathname.match(/\/playlist\//)) {
  //     this.logger.silly('Spotify playlist detected')
  //
  //     try {
  //       const playlistId = url.pathname.split('/').pop()
  //
  //       let currentOffset = 0
  //       let totalTracks = 0
  //       do {
  //         const tracks = await this.spotifyService.playlists.getPlaylistItems(
  //           playlistId || '',
  //           undefined,
  //           undefined,
  //           undefined,
  //           currentOffset
  //         )
  //         currentOffset += tracks.items.length
  //         totalTracks ||= tracks.total
  //
  //         const dlSearch = await Promise.all(tracks.items.map(track => {
  //           this.logger.debug(`Adding ${track.track.artists[0].name} - ${track.track.name} to queue`)
  //           return playdl.search(`${track.track.artists[0].name} ${track.track.name}`, { limit: 1, source: { youtube: 'video' } })
  //         }))
  //
  //         dlSearch.forEach(dl => {
  //           this.logger.debug(`Adding ${dl[0].title} to queue`)
  //           this.musics.push(new YouTubeAudioSource(this.player, dl[0].url))
  //         })
  //
  //         // for (const track of tracks.items) {
  //         //   const artist = track.track.artists[0].name
  //         //   const title = track.track.name
  //         //
  //         //   const dl = await playdl.search(`${artist} ${title}`, { limit: 1, source: { youtube: 'video' } })
  //         //   this.logger.debug(`Adding ${artist} - ${title} to queue`)
  //         //   this.musics.push(new YouTubeAudioSource(this.player, dl[0].url))
  //         // }
  //       } while (currentOffset < totalTracks)
  //     } catch (error: any) {
  //       this.logger.warn(error.message)
  //
  //       throw new DiscordReplyException({
  //         content: 'Spotify playlist not found.',
  //         flags: "Ephemeral"
  //       })
  //     }
  //   } else {
  //     throw new DiscordReplyException({
  //       content: 'Spotify URL must be from track or playlist.',
  //       flags: "Ephemeral"
  //     })
  //   }
  // }

  private async addTracksFromYouTube(url: URL) {
    this.logger.silly(url.toString())

    if (playdl.yt_validate(url.toString()) === 'video') {
      try {
        const info = await playdl.video_info(url.toString())

        this.musicQueue.push(new YouTubeMusicStream(url))
      } catch (error: any) {
        this.logger.warn(error.message)

        throw new DiscordReplyException({
          content: 'YouTube video not found.',
          flags: 'Ephemeral'
        })
      }

    } else if (playdl.yt_validate(url.toString()) === 'playlist') {
      try {
        const playlist = await playdl.playlist_info(url.toString(), { incomplete: true })
        const videos = await playlist.all_videos()

        for (const video of videos) {
          this.logger.debug(`Adding ${video.title} to queue`)

          this.musicQueue.push(new YouTubeMusicStream(new URL(video.url)))
        }

        this.logger.info(`${videos.length} tracks added from YouTube playlist`)
      } catch (error: any) {
        this.logger.warn(error.message)
        throw new DiscordReplyException({
          content: 'YouTube playlist not found.',
          flags: 'Ephemeral'
        })
      }

    } else {
      throw new DiscordReplyException({
        content: 'URL must be a YouTube video or playlist.',
        flags: 'Ephemeral'
      })
    }
  }

  // private async addTracksFromQuery(query: string) {
  //   this.logger.silly(`Searching YouTube for query: ${query}`)
  //
  //   try {
  //     const results = await playdl.search(query, {
  //       source: { youtube: 'video' },
  //       limit: 1
  //     })
  //
  //     if (!results.length) {
  //       throw new DiscordReplyException({
  //         content: 'No results found on YouTube.',
  //         flags: 'Ephemeral'
  //       })
  //     }
  //
  //     const track = results[0]
  //     this.logger.debug(`Found YouTube video: ${track.title} - ${track.url}`)
  //     this.musics.push(new YouTubeAudioSource(this.player, track.url))
  //   } catch (error: any) {
  //     this.logger.warn(error.message)
  //     throw new DiscordReplyException({
  //       content: 'Failed to search YouTube.',
  //       flags: 'Ephemeral'
  //     })
  //   }
  // }
}

// class MusicPlayer {
//   private readonly connection: VoiceConnection
//   private readonly player: AudioPlayer
//   private readonly musics: BaseAudioSource[] = []
//   private readonly logger: Logger = container.get(Logger)
//   private readonly spotifyService: SpotifyService = container.get(SpotifyService)
//
//   public constructor(configuration: MusicPlayerConfiguration) {
//     this.logger.setContextName(this.constructor.name)
//
//     this.connection = joinVoiceChannel({
//       channelId: configuration.channelId,
//       guildId: configuration.guildId,
//       adapterCreator: configuration.adapterCreator,
//       debug: config.get('env') != 'production'
//     })
//
//     this.connection.on('debug', message => this.logger.debug(message))
//
//     this.connection.on('error', error => this.logger.error(error.message))
//
//     this.connection.on(VoiceConnectionStatus.Ready, () => this.logger.verbose(`Voice connection on ${configuration.guildId} is ready`))
//
//     this.connection.on(VoiceConnectionStatus.Disconnected, async () => {
//       this.logger.verbose(`Voice connection on ${configuration.guildId} is disconnected`)
//     })
//     // this.connection.on('')
//
//     this.player = createAudioPlayer({
//       debug: config.get('env') != 'production'
//     })
//
//     this.player.on("debug", message => this.logger.debug(message))
//
//     this.player.on("error", error => this.logger.error(error.message))
//
//     this.player.on(AudioPlayerStatus.Paused, () => {
//       this.logger.verbose(`Audio player on guild ${configuration.guildId} with channel ${configuration.channelId} is paused`)
//     })
//
//     this.player.on(AudioPlayerStatus.Playing, () => {
//       this.logger.verbose(`Audio player on guild ${configuration.guildId} with channel ${configuration.channelId} is playing`)
//     })
//
//     this.player.on(AudioPlayerStatus.Buffering, () => {
//       this.logger.warn(`Audio player on guild ${configuration.guildId} with channel ${configuration.channelId} is buffering`)
//     })
//
//     this.player.on(AudioPlayerStatus.Idle, async () => {
//       this.logger.verbose(`Audio player on guild ${configuration.guildId} with channel ${configuration.channelId} is idle`)
//     })
//
//     this.player.on("stateChange", (oldState, newState) => {
//       if (oldState.status == AudioPlayerStatus.Playing && newState.status == AudioPlayerStatus.Idle) {
//         this.musics.shift()
//
//         if (this.musics.length > 0) {
//           this.musics[0].play()
//         }
//       }
//     })
//
//     this.connection.subscribe(this.player)
//   }
//
//   public async play() {
//     if (this.player.state.status == AudioPlayerStatus.Idle && this.musics.length > 0) {
//       this.logger.debug('Playing music')
//
//       this.musics[0].play()
//     }
//   }
//
//   public async pause() {
//     if (this.player.state.status === AudioPlayerStatus.Playing) {
//       this.musics[0].pause()
//
//       this.logger.debug('Paused current track')
//     } else if (this.player.state.status === AudioPlayerStatus.Paused) {
//       this.musics[0].play()
//
//       this.logger.debug('Unpaused current track')
//     }
//   }
//
//   public async next() {
//     if (this.musics.length > 0) {
//       this.musics[0].stop()
//
//       this.logger.debug('Skipping music')
//     } else {
//       throw new DiscordReplyException({
//         content: 'Need atleast 1 song in queue.',
//         flags: "Ephemeral"
//       })
//     }
//   }
//
//   public async shuffle() {
//     if (this.musics.length <= 1) {
//       throw new discordReplyException({
//         content: 'Need atleast 2 songs for shuffle',
//         flags: 'Ephemeral'
//       })
//     }
//
//     const [current, ...rest] = this.musics
//     for (let i = rest.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1))
//       ;[rest[i], rest[j]] = [rest[j], rest[i]]
//     }
//
//     this.musics.splice(0, this.musics.length, current, ...rest)
//     this.logger.debug('Playlist has been shuffled.')
//   }
//
//   // public async resume() {
//   //   if (this.player.state.status === AudioPlayerStatus.Paused) {
//   //     this.musics[0].resume()
//   //
//   //     this.logger.debug('Resumed current track')
//   //   } else {
//   //
//   //   }
//   // }
//
//   public stop(): void {
//
//   }
//
//   public disconnect(): void {
//     this.player.stop(true)
//     this.connection.destroy()
//   }
//
//   public async addTracks(query: string): Promise<EmbedBuilder> {
//     try {
//       const url = new URL(query)
//
//       switch (url.hostname) {
//         case 'open.spotify.com':
//           await this.addTracksFromSpotify(url)
//           break
//         case 'youtu.be':
//         case 'www.youtube.com':
//         case 'youtube.com':
//         case 'music.youtube.com':
//           await this.addTracksFromYouTube(url)
//           break
//       }
//     } catch (_) {
//       await this.addTracksFromQuery(query)
//     }
//
//     return new EmbedBuilder()
//   }
//
//   private async addTracksFromSpotify(url: URL) {
//     this.logger.silly(url.toString())
//     if (url.pathname.match(/\/track\//)) {
//       try {
//         const trackId = url.pathname.split('/').pop()
//         const track = await this.spotifyService.tracks.get(trackId || '')
//         const artist = track.artists[0].name
//         const title = track.name
//
//         const dl = await playdl.search(`${artist} ${title}`, { limit: 1, source: { youtube: 'video' } })
//         this.musics.push(new YouTubeAudioSource(this.player, dl[0].url))
//       } catch(error: any) {
//         this.logger.warn(error.message)
//
//         throw new DiscordReplyException({
//           content: 'Spotify track not found.',
//           flags: "Ephemeral"
//         })
//       }
//     } else if (url.pathname.match(/\/playlist\//)) {
//       this.logger.silly('Spotify playlist detected')
//
//       try {
//         const playlistId = url.pathname.split('/').pop()
//
//         let currentOffset = 0
//         let totalTracks = 0
//         do {
//           const tracks = await this.spotifyService.playlists.getPlaylistItems(
//             playlistId || '',
//             undefined,
//             undefined,
//             undefined,
//             currentOffset
//           )
//           currentOffset += tracks.items.length
//           totalTracks ||= tracks.total
//
//           const dlSearch = await Promise.all(tracks.items.map(track => {
//             this.logger.debug(`Adding ${track.track.artists[0].name} - ${track.track.name} to queue`)
//             return playdl.search(`${track.track.artists[0].name} ${track.track.name}`, { limit: 1, source: { youtube: 'video' } })
//           }))
//
//           dlSearch.forEach(dl => {
//             this.logger.debug(`Adding ${dl[0].title} to queue`)
//             this.musics.push(new YouTubeAudioSource(this.player, dl[0].url))
//           })
//
//           // for (const track of tracks.items) {
//           //   const artist = track.track.artists[0].name
//           //   const title = track.track.name
//           //
//           //   const dl = await playdl.search(`${artist} ${title}`, { limit: 1, source: { youtube: 'video' } })
//           //   this.logger.debug(`Adding ${artist} - ${title} to queue`)
//           //   this.musics.push(new YouTubeAudioSource(this.player, dl[0].url))
//           // }
//         } while (currentOffset < totalTracks)
//       } catch (error: any) {
//         this.logger.warn(error.message)
//
//         throw new DiscordReplyException({
//           content: 'Spotify playlist not found.',
//           flags: "Ephemeral"
//         })
//       }
//     } else {
//       throw new DiscordReplyException({
//         content: 'Spotify URL must be from track or playlist.',
//         flags: "Ephemeral"
//       })
//     }
//   }
//
//   private async addTracksFromYouTube(url: URL) {
//     this.logger.silly(url.toString())
//
//     if (playdl.yt_validate(url.toString()) === 'video') {
//       try {
//         const info = await playdl.video_info(url.toString())
//         this.logger.debug(`Adding ${info.video_details.title} to queue`)
//         this.musics.push(new YouTubeAudioSource(this.player, url.toString()))
//       } catch (error: any) {
//         this.logger.warn(error.message)
//         throw new DiscordReplyException({
//           content: 'YouTube video not found.',
//           flags: 'Ephemeral'
//         })
//       }
//
//     } else if (playdl.yt_validate(url.toString()) === 'playlist') {
//       try {
//         const playlist = await playdl.playlist_info(url.toString(), { incomplete: true })
//         const videos = await playlist.all_videos()
//
//         for (const video of videos) {
//           this.logger.debug(`Adding ${video.title} to queue`)
//           this.musics.push(new YouTubeAudioSource(this.player, video.url))
//         }
//
//         this.logger.info(`${videos.length} tracks added from YouTube playlist`)
//       } catch (error: any) {
//         this.logger.warn(error.message)
//         throw new DiscordReplyException({
//           content: 'YouTube playlist not found.',
//           flags: 'Ephemeral'
//         })
//       }
//
//     } else {
//       throw new DiscordReplyException({
//         content: 'URL must be a YouTube video or playlist.',
//         flags: 'Ephemeral'
//       })
//     }
//   }
//
//   private async addTracksFromQuery(query: string) {
//     this.logger.silly(`Searching YouTube for query: ${query}`)
//
//     try {
//       const results = await playdl.search(query, {
//         source: { youtube: 'video' },
//         limit: 1
//       })
//
//       if (!results.length) {
//         throw new DiscordReplyException({
//           content: 'No results found on YouTube.',
//           flags: 'Ephemeral'
//         })
//       }
//
//       const track = results[0]
//       this.logger.debug(`Found YouTube video: ${track.title} - ${track.url}`)
//       this.musics.push(new YouTubeAudioSource(this.player, track.url))
//     } catch (error: any) {
//       this.logger.warn(error.message)
//       throw new DiscordReplyException({
//         content: 'Failed to search YouTube.',
//         flags: 'Ephemeral'
//       })
//     }
//   }
// }

export default MusicPlayer