import MusicSource from "./MusicSource"
import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioResource, StreamType } from "@discordjs/voice"
import { PassThrough } from 'stream'
import { performance } from 'perf_hooks'
import DiscordReplyException from "../exceptions/DiscordReplyException"
import { spawn } from "child_process"
import MusicMetadata from "./MusicMetadata"

class YouTubeMusicSource extends MusicSource {
  public constructor(private readonly url: URL) {
    super()
  }

  public getAudioStream(): PassThrough {
    const ytdlp = spawn("yt-dlp", [
      "-o", "-",
      "-f", "bestaudio",
      "--no-playlist",
      "-q", "--no-warnings",
      "--no-cache-dir",
      "--quiet",
      "--extract-audio",
      this.url.toString()
    ], { stdio: ['ignore', 'pipe', 'ignore'] })

    const audioStream = new PassThrough()

    ytdlp.stdout.pipe(audioStream)

    return audioStream
  }

  public getMusicMetadata(): MusicMetadata {
    throw new Error("Method not implemented.")
  }
}

export default YouTubeMusicSource