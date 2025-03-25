import DiscordEventListener from "../abstracts/DiscordEventListener"
import { Client, Events } from "discord.js"
import Logger from "../infrastructures/Logger"
import { injectable } from "inversify"

@injectable()
class ClientReadyEvent extends DiscordEventListener<Events.ClientReady> {
  public event = Events.ClientReady as const

  public constructor(private logger: Logger) {
    super()

    this.logger.setContextName(this.constructor.name)
    this.execute = this.execute.bind(this)
  }

  public execute(client: Client<true>): void {
    this.logger.info(`Logged in as ${client.user.tag}.`)
    this.logger.info('Discord bot is ready.')
  }
}

export default ClientReadyEvent