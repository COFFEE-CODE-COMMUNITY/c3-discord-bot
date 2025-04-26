import CommandHandler from "../../abstracts/CommandHandler"
import { injectable } from "inversify"
import Database from "../../infrastructures/Database"
import { ChatInputCommandInteraction } from "discord.js"

@injectable()
class ClearStickyHandler extends CommandHandler {
  public prefix: string[] = ["sticky", "clear"]

  public constructor(private db: Database) {
    super()
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guildId ?? ""

    await this.db.stickyMessage.deleteMany({
      where: { guildId }
    })

    await interaction.reply({
      content: "All sticky messages have been cleared on this server.",
      flags: "Ephemeral"
    })
  }
}

export default ClearStickyHandler