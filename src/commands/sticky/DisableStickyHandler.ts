import CommandHandler from "../../abstracts/CommandHandler"
import { ChatInputCommandInteraction } from "discord.js"
import Database from "../../infrastructures/Database"
import { injectable } from "inversify"

@injectable()
class DisableStickyHandler extends CommandHandler {
  public prefix: string[] = ["sticky", "disable"]

  public constructor(private db: Database) {
    super()
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const channelOption = interaction.options.getChannel("channel")
    const channelId = channelOption?.id || interaction.channelId
    const guildId = interaction.guildId || ''

    await this.db.stickyMessage.delete({
      where: {
        channelId,
        guildId,
      }
    })

    await interaction.reply({
      content: `Sticky message disabled for <#${channelId}>`,
      flags: "Ephemeral"
    })
  }
}

export default DisableStickyHandler