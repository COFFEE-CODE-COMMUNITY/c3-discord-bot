import { Container, injectable } from "inversify"
import { Client, GatewayIntentBits } from "discord.js"
import { readdirSync } from "fs"
import DiscordEventListener from "../abstracts/DiscordEventListener"
import Logger from "./Logger"

@injectable()
class BotClient {
  private client: Client

  public constructor(private logger: Logger, private container: Container) {
    this.logger.setContextName(this.constructor.name)

    this.logger.verbose('Discord bot client instantiated')

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
      ]
    })
  }

  public async start(token: string): Promise<void> {
    this.logger.info('Starting discord bot client')

    await this.mapEventHandlers()
    await this.client.login(token)
  }

  private async mapEventHandlers(): Promise<void> {
    this.logger.verbose('Mapping event handlers')
    const eventInstances = await this.container.getAllAsync(DiscordEventListener)

    for (const instance of eventInstances) {
      if (instance.once) {
        this.client.once(instance.event, (...args) => instance.execute(...args))
      } else {
        this.client.on(instance.event, (...args) => instance.execute(...args))
      }

      this.logger.debug(`Mapped ${instance.constructor.name} with "${instance.event}" event`)
    }
  }
}

export default BotClient