import CommandHandler from "../../abstracts/CommandHandler"
import { ChatInputCommandInteraction } from "discord.js"
import { injectable } from "inversify"

@injectable()
class PingHandler extends CommandHandler {
  public prefix: string[] = ["ping"]

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const isEphemeral = interaction.options.getBoolean("ephemeral") ?? false

    await interaction.reply({ content: "Pong!", ephemeral: isEphemeral })
  }
}

export default PingHandler