import { injectable } from "inversify"
import VoicePlayer from "./VoicePlayer"

@injectable()
class VoiceManager {
  private readonly voiceConnection = new Map<string, VoicePlayer>()

  public setConnection<T extends VoicePlayer>(guildId: string, voicePlayer: T): void {
    const existingConnection = this.voiceConnection.get(guildId)

    if (existingConnection) {
      existingConnection.disconnect()
    }

    this.voiceConnection.set(guildId, voicePlayer)
  }

  public getConnection<T extends VoicePlayer>(guildId: string): T | null {
    const voicePlayer = this.voiceConnection.get(guildId)

    if (!voicePlayer) {
      return null
    }

    return voicePlayer as T
  }

  public hasConnection(guildId: string): boolean {
    return this.voiceConnection.has(guildId)
  }

  public deleteConnection(guildId: string): void {
    const musicPlayer = this.voiceConnection.get(guildId)

    if (musicPlayer) {
      musicPlayer.disconnect()
      this.voiceConnection.delete(guildId)
    }
  }
}

export default VoiceManager