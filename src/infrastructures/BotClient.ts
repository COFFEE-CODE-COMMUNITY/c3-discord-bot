import { Container, injectable } from "inversify"
import { Client, Events, GatewayIntentBits } from "discord.js"
import DiscordEventListener from "../abstracts/DiscordEventListener"
import Logger from "./Logger"
import CommandHandler from "../abstracts/CommandHandler"

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
        GatewayIntentBits.GuildVoiceStates,
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

    const commandHandlerInstances = await this.container.getAllAsync(CommandHandler)
    const handlerMap = new Map<string, CommandHandler>()

    for (const instance of commandHandlerInstances) {
      handlerMap.set(instance.prefix.join('.'), instance)
      this.logger.debug(`Mapped ${instance.constructor.name} with "${instance.prefix.join(' ')}" prefix`)
    }

    this.client.on(Events.InteractionCreate, async interaction => {
      if(!interaction.isChatInputCommand()) return

      let prefix = interaction.commandName
      let subcommand: string | null = null
      let subcommandGroup: string | null = null

      try {
        subcommand = interaction.options.getSubcommand()
        subcommandGroup = interaction.options.getSubcommandGroup()
      } catch(error) {}

      if(subcommandGroup) {
        prefix += `.${subcommandGroup}.${subcommand}`
      } else if (subcommand) {
        prefix += `.${subcommand}`
      }

      this.logger.debug(`Received command: ${prefix}`)

      try {
        const handler = handlerMap.get(prefix)

        if (!handler) {
          this.logger.warn(`No handler found for "${prefix}" prefix`)

          await interaction.reply({ content: 'No command found', ephemeral: true })
          return
        }

        await handler.handle(interaction)
      } catch(error) {
        this.logger.error((error as Error).message)
        console.error(error)
        await interaction.reply({ content: 'An error occurred while executing the command', ephemeral: true })

        return
      }
    })
  }
}

export default BotClient