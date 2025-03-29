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
}

export default MusicContext