import { injectable } from "inversify"
import CommandHandler from "../../abstracts/CommandHandler"
import Database from "../../infrastructures/Database"
import { ChatInputCommandInteraction } from "discord.js"

@injectable()
class DisableAutoDeleteMessageHandler extends CommandHandler {
  public prefix: string[] = ["auto-delete-message", "disable"]

  public constructor(private db: Database) {
    super()
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guildId
    const channelId = interaction.options.getChannel("channel")?.id || interaction.channelId

    if (!channelId || !guildId) {
      await interaction.reply({
        content: "Invalid channel or guild ID.",
        flags: "Ephemeral"
      })
      return
    }

    await this.db.autoDeleteMessage.delete({
      where: {
        channelId
      }
    })

    await interaction.reply({
      content: `Auto delete message disabled for <#${channelId}>`,
      flags: "Ephemeral"
    })
  }
}

export default DisableAutoDeleteMessageHandler