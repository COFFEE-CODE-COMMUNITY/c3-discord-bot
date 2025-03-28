import CommandHandler from "../../abstracts/CommandHandler"
import { ChatInputCommandInteraction } from "discord.js"
import { injectable } from "inversify"

@injectable()
class PingHandler extends CommandHandler {
  public prefix: string[] = ["ping"]

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply("Pong!")
  }
}

export default PingHandler