import BaseMusicSource from "./BaseMusicSource"
import { AudioPlayer, AudioPlayerStatus, createAudioResource, StreamType } from "@discordjs/voice"
import MusicSource from "./MusicSource"
import { spawn } from 'child_process'
import Logger from "../infrastructures/Logger"
import container from "../infrastructures/container"
import DiscordReplyException from "../exceptions/DiscordReplyException"

class YouTubeMusicSource extends BaseMusicSource {
  private readonly logger: Logger = container.get(Logger)
  private process: any = null
  protected source: MusicSource = MusicSource.YOUTUBE
  protected audioPlayer: AudioPlayer
  protected audioUrl: string

  public constructor(audioPlayer: AudioPlayer, audioUrl: string) {
    super()

    this.logger.setContextName(this.constructor.name)

    this.audioPlayer = audioPlayer
    this.audioUrl = audioUrl
  }

  public async play(): Promise<void> {
    try {
      this.process = spawn("yt-dlp", [
        "-o", "-",
        "-f", "bestaudio",
        "--no-playlist",
        "-q", "--no-warnings",
        "--no-cache-dir",
        "--quiet",
        // "--audio-format"
        "--extract-audio",
        this.audioUrl
      ], { stdio: ['ignore', 'pipe', 'ignore'] })
      const audioResource = createAudioResource(this.process.stdout, {
        inputType: StreamType.Arbitrary,
        // inlineVolume: true
      })

      // audioResource.volume?.setVolume(1)

      this.audioPlayer.play(audioResource)
    } catch (error) {
      this.logger.error('Failed to play music', (error as Error))

      throw new DiscordReplyException({
        content: 'Failed to play music.',
        flags: "Ephemeral"
      })
    }
  }

  public pause(): void {
    if (this.audioPlayer.state.status != AudioPlayerStatus.Playing) {
      this.logger.warn('Music is not playing')

      return
    }

    if (this.audioPlayer.pause()) {
      this.process.stdin.pause()

      this.logger.debug('Music paused')
    } else {
      this.logger.warn('Failed to pause music')
    }
  }

  public async stop(): Promise<void> {
    if (this.audioPlayer.state.status != AudioPlayerStatus.Playing) {
      this.logger.warn('Music is not playing')

      return
    }

    if (this.audioPlayer.stop()) {
      this.process.kill('SIGKILL')

      this.logger.debug('Music stopped')
    } else {
      this.logger.warn('Failed to stop music')
    }
  }
}

export default YouTubeMusicSource