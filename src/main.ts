import 'reflect-metadata'
import dotenv from "dotenv"
import { container } from "./infrastructures/inversify.config"
import { GlobalFonts } from "@napi-rs/canvas"
import { join } from "path"
import BotClient from "./infrastructures/BotClient"

dotenv.config()

GlobalFonts.registerFromPath(join(__dirname, 'resources', 'fonts', 'Poppins-Bold.ttf'), 'Poppins')

const bot = container.get<BotClient>(BotClient)
bot.start(process.env.DISCORD_BOT_TOKEN as string)