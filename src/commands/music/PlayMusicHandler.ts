import CommandHandler from "../../abstracts/CommandHandler"
import { injectable } from "inversify"

@injectable()
class PlayMusicHandler extends CommandHandler {
  public prefix: string[] = ["music", "play"]

  public async handle(): Promise<void> {

  }
}

export default PlayMusicHandler