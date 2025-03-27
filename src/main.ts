import 'reflect-metadata'
import dotenv from "dotenv"
import { GlobalFonts } from "@napi-rs/canvas"
import { join } from "path"
import BotClient from "./infrastructures/BotClient"
import { Container, injectable } from "inversify"
import { Command } from "commander"
import * as process from "node:process"
import * as fs from "fs/promises"
import * as path from "node:path"
import DiscordEventListener from "./abstracts/DiscordEventListener"
import DiscordSlashCommand from "./abstracts/DiscordSlashCommand"
import { REST, Routes } from "discord.js"

@injectable()
class Main {
  private readonly DISCORD_BOT_TOKEN: string = process.env.DISCORD_BOT_TOKEN as string

  public constructor(private readonly bot: BotClient) {
    const program = new Command('bot')

    program
      .command('start')
      .description('Start the bot.')
      .action(async () => this.startBot())

    program
      .command('register')
      .command('command')
      .description('Register bot command to discord.')
      .action(async () => this.registerCommand())

    program.parse(process.argv)
  }

  private async startBot(): Promise<void> {
    await this.bot.start(this.DISCORD_BOT_TOKEN)
  }

  private async registerCommand(): Promise<void> {
    const rest = new REST().setToken(this.DISCORD_BOT_TOKEN)

    rest.put(Routes)
  }

  static {
    dotenv.config()

    GlobalFonts.registerFromPath(join(__dirname, 'resources', 'fonts', 'Poppins-Bold.ttf'), 'Poppins')
  }

  private static container = new Container({ defaultScope: 'Singleton' })

  public static async main(): Promise<void> {
    await this.scanInjectableClasses(path.resolve(process.env.NODE_ENV == 'development' ? 'src' : 'dist/src'))
    this.container.bind(Container).toConstantValue(this.container)
    this.container.bind(Main).toSelf()
    this.container.get(Main)
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
            this.container.bind(DiscordEventListener).to(module.default).inSingletonScope()
          } else if (DiscordSlashCommand.isPrototypeOf(module.default)) {
            this.container.bind(DiscordSlashCommand).to(module.default).inSingletonScope()
          } else {
            this.container.bind(module.default).toSelf()
          }
        }
      }
    }
  }
}
Main.main()