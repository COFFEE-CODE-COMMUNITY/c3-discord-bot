import { injectable } from "inversify"
import { Client, GatewayIntentBits } from "discord.js"
import { readdirSync } from "fs"
import { container } from "./inversify.config"
import DiscordEventListener from "../abstracts/DiscordEventListener"
import Logger from "./Logger"

@injectable()
class BotClient {
  private client: Client

  public constructor(private logger: Logger) {
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
    const eventFiles = readdirSync('./src/events').filter(file => file.endsWith('.ts'))

    for (const file of eventFiles) {
      const { default: event } = await import(`../events/${file}`)

      container.bind(event.name).to(event).inSingletonScope()

      const instance = container.get<DiscordEventListener<any>>(event.name)

      if (instance.once) {
        this.client.once(instance.event, (...args) => instance.execute(...args))
      } else {
        this.client.on(instance.event, (...args) => instance.execute(...args))
      }

      this.logger.verbose(`Mapped ${event.name} with "${instance.event}" event`)
    }
  }
}

export default BotClient