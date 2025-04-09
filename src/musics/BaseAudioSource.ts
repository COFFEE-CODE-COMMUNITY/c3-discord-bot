import { AudioPlayer } from "@discordjs/voice"

abstract class BaseAudioSource {
  protected abstract audioPlayer: AudioPlayer
  protected abstract audioUrl: string

  public abstract play(): void | Promise<void>
  public abstract pause(): void | Promise<void>
  public abstract stop(): void | Promise<void>
}

export default BaseAudioSource