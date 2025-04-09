import { injectable } from "inversify"
import MusicPlayer, { MusicPlayerConfiguration } from "./MusicPlayer"

@injectable()
class MusicContext {
  private readonly audioConnection = new Map<string, MusicPlayer>()

  public createConnection(configuration: MusicPlayerConfiguration): void {
    this.audioConnection.set(configuration.guildId, new MusicPlayer(configuration))
  }

  public getConnection(guildId: string): MusicPlayer {
    const musicPlayer = this.audioConnection.get(guildId)

    if (!musicPlayer) {
      throw new Error(`Music player for guild ${guildId} not found`)
    }

    return musicPlayer
  }

  public hasConnection(guildId: string): boolean {
    return this.audioConnection.has(guildId)
  }

  public deleteConnection(guildId: string): void {
    const musicPlayer = this.audioConnection.get(guildId)

    if (musicPlayer) {
      musicPlayer.disconnect()
      this.audioConnection.delete(guildId)
    }
  }
}

export default MusicContext