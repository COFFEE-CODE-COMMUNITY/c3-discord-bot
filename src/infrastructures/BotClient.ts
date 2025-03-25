import { injectable } from "inversify"
import { Client, GatewayIntentBits } from "discord.js"
import { readdirSync } from "fs"
import { container } from "./inversify.config"
import DiscordEventListener from "../abstracts/DiscordEventListener"

@injectable()
class BotClient {
  private client: Client

  public constructor() {
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
    await this.registerEventHandlers()
    await this.client.login(token)
  }

  private async registerEventHandlers(): Promise<void> {
    const eventFiles = readdirSync('./src/events').filter(file => file.endsWith('.ts'))

    for (const file of eventFiles) {
      const { default: event } = await import(`../events/${file}`)

      container.bind(event.name).to(event).inSingletonScope()

      const instance = container.get<DiscordEventListener<any>>(event.name)

      if (instance.once) {
        this.client.once(instance.event, instance.execute)
      } else {
        this.client.on(instance.event, instance.execute)
      }
    }
  }
}

export default BotClient