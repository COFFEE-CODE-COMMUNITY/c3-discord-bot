import { Container, injectable } from "inversify"
import { Client, Events, GatewayIntentBits } from "discord.js"
import DiscordEventListener from "../abstracts/DiscordEventListener"
import Logger from "./Logger"
import DiscordSlashCommand from "../abstracts/DiscordSlashCommand"

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
    await this.mapChatCommandHandlers()
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

  private async mapChatCommandHandlers(): Promise<void> {
    this.logger.verbose('Mapping chat command handlers')

    const chatCommandInstances = await this.container.getAllAsync(DiscordSlashCommand)
    const commandMap = new Map<string, DiscordSlashCommand>()

    for (const instance of chatCommandInstances) {
      console.log(instance.options.options)
      commandMap.set(instance.options.name, instance)
      this.logger.debug(`Mapped ${instance.constructor.name} with "${instance.options.name}" command`)
    }

    this.client.on(Events.InteractionCreate, async interaction => {
      if(!interaction.isChatInputCommand()) return
      interaction.options.getSubcommand()
      // interaction.
    })
  }
}

export default BotClient