import BaseAudioSource from "./BaseAudioSource"
import { AudioPlayer, AudioPlayerStatus, createAudioResource, StreamType } from "@discordjs/voice"
import { spawn, ChildProcessByStdio } from 'child_process'
import { Readable } from 'stream'
import { performance } from 'perf_hooks'
import Logger from "../infrastructures/Logger"
import container from "../infrastructures/container"
import DiscordReplyException from "../exceptions/DiscordReplyException"

class YouTubeAudioSource extends BaseAudioSource {
  private readonly logger: Logger = container.get(Logger)
  private process: ChildProcessByStdio<null, Readable, null> | null = null
  private startTimestamp: number = 0
  private elapsedTime: number = 0

  protected audioPlayer: AudioPlayer
  protected audioUrl: string

  public constructor(audioPlayer: AudioPlayer, audioUrl: string) {
    super()

    this.logger.setContextName(this.constructor.name)

    this.audioPlayer = audioPlayer
    this.audioUrl = audioUrl
  }

  public play(): void {
    this.logger.debug(`Time elapsed: ${this.elapsedTime}`)
    try {
      this.process = spawn("yt-dlp", [
        "-o", "-",
        "-f", "bestaudio",
        "--no-playlist",
        "-q", "--no-warnings",
        "--no-cache-dir",
        "--quiet",
        "--extract-audio",
        ...(this.elapsedTime > 0 ? [`--start-time=${this.elapsedTime}`] : []),
        this.audioUrl
      ], { stdio: ['ignore', 'pipe', 'ignore'] })
      const audioResource = createAudioResource(this.process.stdout, {
        inputType: StreamType.Arbitrary
      })

      if (this.elapsedTime > 0) {
        this.audioPlayer.unpause()
        this.audioPlayer.play(audioResource)
      } else {
        this.audioPlayer.play(audioResource)
      }

      this.startTimestamp = performance.now()
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
      const delta = performance.now() - this.startTimestamp
      this.elapsedTime += (delta / 1000)

      this.process!.kill('SIGTERM')

      this.logger.debug('Music paused')
    } else {
      this.logger.warn('Failed to pause music')
    }
  }

  public stop(): void {
    if (this.audioPlayer.state.status != AudioPlayerStatus.Playing) {
      this.logger.warn('Music is not playing')

      return
    }

    if (this.audioPlayer.stop()) {
      this.process!.kill('SIGKILL')

      this.logger.debug('Music stopped')
    } else {
      this.logger.warn('Failed to stop music')
    }
  }
}

export default YouTubeAudioSource