import CommandHandler from "../../abstracts/CommandHandler"
import Database from "../../infrastructures/Database"
import { ChatInputCommandInteraction } from "discord.js"
import { injectable } from "inversify"

@injectable()
class ClearAutoDeleteMessageHandler extends CommandHandler {
  public prefix: string[] = ["auto-delete-message", "clear"]

  public constructor(private db: Database) {
    super()
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guildId

    if (!guildId) {
      await interaction.reply({
        content: 'This command can only be used in a server.',
        flags: "Ephemeral"
      })

      return
    }

    await this.db.autoDeleteMessage.deleteMany({
      where: { guildId }
    })

    await interaction.reply({
      content: 'All auto delete message have been deleted on this server.',
      flags: "Ephemeral"
    })
  }
}

export default ClearAutoDeleteMessageHandler