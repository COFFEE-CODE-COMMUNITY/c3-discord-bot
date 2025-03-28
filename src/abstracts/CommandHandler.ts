import { ChatInputCommandInteraction } from "discord.js"

abstract class CommandHandler {
  public abstract prefix: string[]
  public abstract handle(interaction: ChatInputCommandInteraction): void | Promise<void>
}

export default CommandHandler