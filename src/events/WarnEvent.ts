import DiscordEventListener from "../abstracts/DiscordEventListener"
import { Events } from "discord.js"
import Logger from "../infrastructures/Logger"
import { injectable } from "inversify"

@injectable()
class WarnEvent extends DiscordEventListener<Events.Warn> {
  public readonly event = Events.Warn

  public constructor(private logger: Logger) {
    super()

    this.logger.setContextName(this.constructor.name)
    this.execute = this.execute.bind(this)
  }

  public execute(message: string): void | Promise<void> {
    this.logger.warn(message)
  }
}

export default WarnEvent