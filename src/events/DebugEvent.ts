import DiscordEventListener from "../abstracts/DiscordEventListener"
import Logger from "../infrastructures/Logger"
import { Events } from "discord.js"
import { injectable } from "inversify"

@injectable()
class DebugEvent extends DiscordEventListener<Events.Debug> {
  public readonly event = Events.Debug

  public constructor(private logger: Logger) {
    super()

    this.logger.setContextName(this.constructor.name)
  }

  public execute(message: string): void | Promise<void> {
    this.logger.debug(message)
  }
}

export default DebugEvent