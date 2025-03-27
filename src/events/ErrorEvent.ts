import DiscordEventListener from "../abstracts/DiscordEventListener"
import { Events } from "discord.js"
import Logger from "../infrastructures/Logger"
import { injectable } from "inversify"

@injectable()
class ErrorEvent extends DiscordEventListener<Events.Error> {
  public readonly event = Events.Error

  public constructor(private logger: Logger) {
    super()

    this.logger.setContextName(this.constructor.name)
  }

  public execute(error: Error): void | Promise<void> {
    this.logger.error(error.message)
  }
}

export default ErrorEvent