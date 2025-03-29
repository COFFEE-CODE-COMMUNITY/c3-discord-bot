import BaseMusicSource from "./BaseMusicSource"
import { AudioPlayer, createAudioResource, StreamType } from "@discordjs/voice"
import MusicSource from "./MusicSource"
import { spawn } from 'child_process'

class YouTubeMusicSource extends BaseMusicSource {
  protected source: MusicSource = MusicSource.YOUTUBE
  protected audioPlayer: AudioPlayer
  protected audioUrl: string

  public constructor(audioPlayer: AudioPlayer, audioUrl: string) {
    super()

    this.audioPlayer = audioPlayer
    this.audioUrl = audioUrl
  }

  public async play(): Promise<void> {
    const process = spawn("yt-dlp", [
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
    const audioResource = createAudioResource(process.stdout, {
      inputType: StreamType.Arbitrary
    })

    this.audioPlayer.play(audioResource)
  }
}

export default YouTubeMusicSource