import { AudioPlayer, AudioResource } from "@discordjs/voice"
import MusicSource from "./MusicSource"

abstract class BaseMusicSource {
  protected abstract source: MusicSource
  protected abstract audioPlayer: AudioPlayer
  protected abstract audioUrl: string

  public abstract play(): void
}

export default BaseMusicSource