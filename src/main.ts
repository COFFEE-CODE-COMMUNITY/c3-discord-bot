import 'reflect-metadata'
import { GlobalFonts } from "@napi-rs/canvas"
import { join } from "path"
import BotClient from "./infrastructures/BotClient"
import { Container, injectable } from "inversify"
import { Command, Option } from "commander"
import * as process from "node:process"
import * as fs from "fs/promises"
import * as path from "node:path"
import DiscordEventListener from "./abstracts/DiscordEventListener"
import DiscordSlashCommand from "./abstracts/DiscordSlashCommand"
import { REST, Routes } from "discord.js"
import config from "./infrastructures/config"
import CommandHandler from "./abstracts/CommandHandler"
import container from "./infrastructures/container"
import ModalHandler from "./abstracts/ModalHandler"
import ButtonHandler from "./abstracts/ButtonHandler"

@injectable()
class Main {
  public constructor(private readonly bot: BotClient, private readonly container: Container) {
    const program = new Command('bot')

    program
      .command('start')
      .description('Start the bot.')
      .action(async () => this.startBot())

    program
      .command('register-command')
      .description('Register bot command to discord.')
      .action(async () => this.registerCommand())

    program
      .command('delete-command')
      .description('Delete all registered commands.')
      .addOption(new Option('-g, --global', 'Delete global commands.').default(false))
      .action(options => this.deleteCommand(options))

    program.parse(process.argv)
  }

  private async startBot(): Promise<void> {
    await this.bot.start(config.get('bot.token'))
  }

  private async registerCommand(): Promise<void> {
    const rest = new REST().setToken(config.get('bot.token'))
    const commands = await this.container.getAllAsync(DiscordSlashCommand)

    await rest.put(Routes.applicationCommands(config.get('bot.clientId')),
      { body: commands.filter(command => !command.isC3Only).map(command => command.slashCommand.toJSON() ) })
    await rest.put(Routes.applicationGuildCommands(config.get('bot.clientId'), config.get('c3.guild.id')),
      { body: commands.filter(command => command.isC3Only).map(command => command.slashCommand.toJSON() ) })

    console.log(`Successfully registered ${commands.length} commands.`)
  }

  private async deleteCommand(options: { global: boolean }) {
    const rest = new REST().setToken(config.get('bot.token'))

    if (options.global) {
      await rest.put(Routes.applicationCommands(config.get('bot.clientId')), { body: [] })

      console.log('Successfully deleted all global commands.')
    } else {
      await rest.put(Routes.applicationGuildCommands(config.get('bot.clientId'), config.get('c3.guild.id')), { body: [] })

      console.log('Successfully deleted all C3 guild commands.')
    }
  }

  static {
    GlobalFonts.registerFromPath(join(__dirname, 'resources', 'fonts', 'Poppins-Bold.ttf'), 'Poppins')
  }

  public static async main(): Promise<void> {
    await this.scanInjectableClasses(path.resolve(config.get('env') == 'production' ? 'dist/src' : 'src'))

    container.bind(Container).toConstantValue(container)
    container.bind(Main).toSelf()
    container.get(Main)
  }

  private static async scanInjectableClasses(dirPath: string) {
    const INJECTABLE_METADATA_KEY = '@inversifyjs/core/classIsInjectableFlagReflectKey'
    const files = await fs.readdir(dirPath, { withFileTypes: true })

    for (const file of files) {
      const fullPath = join(dirPath, file.name)

      if (file.isDirectory()) {
        await this.scanInjectableClasses(fullPath)
      } else if(file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.js'))) {
        const module = await import(fullPath).catch(() => null)

        if (module?.default && Reflect.getMetadata(INJECTABLE_METADATA_KEY, module.default)) {
          if (DiscordEventListener.isPrototypeOf(module.default)) {
            container.bind(DiscordEventListener).to(module.default).inSingletonScope()
          } else if (DiscordSlashCommand.isPrototypeOf(module.default)) {
            container.bind(DiscordSlashCommand).to(module.default).inSingletonScope()
          } else if(CommandHandler.isPrototypeOf(module.default)) {
            container.bind(CommandHandler).to(module.default).inSingletonScope()
          } else if(ModalHandler.isPrototypeOf(module.default)) {
            container.bind(ModalHandler).to(module.default).inSingletonScope()
          } else if (ButtonHandler.isPrototypeOf(module.default)) {
            container.bind(ButtonHandler).to(module.default).inSingletonScope()
          } else {
            container.bind(module.default).toSelf()
          }
        }
      }
    }
  }
}
Main.main()