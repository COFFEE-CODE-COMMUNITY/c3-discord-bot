import DiscordEventListener from "../abstracts/DiscordEventListener"
import { Client, Events } from "discord.js"
import Logger from "../infrastructures/Logger"
import StatRoleService from "../services/StatRoleService"
import { injectable } from "inversify"

@injectable()
class ClientReadyEvent extends DiscordEventListener<Events.ClientReady> {
  public event = Events.ClientReady as const

  public constructor(private logger: Logger, private statRoleService : StatRoleService) {
    super()

    this.logger.setContextName(this.constructor.name)
  }

  public async execute(client: Client<true>): Promise<void> {
    this.logger.info(`Logged in as ${client.user.tag}.`)
    this.logger.info('Discord bot is ready.')

    try {
      await this.statRoleService.initialize(client)
      this.logger.info("Stats Server Ready")
    } catch (error) {
      this.logger.error(`Failed to start stats server ${error}`)
    }
  }
}

export default ClientReadyEvent