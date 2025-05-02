import CommandHandler from "../../abstracts/CommandHandler"
import Database from "../../infrastructures/Database"
import { ChatInputCommandInteraction } from "discord.js"
import { injectable } from "inversify"

@injectable()
class EnableAutoDeleteMessageHandler extends CommandHandler {
  public prefix: string[] = ['auto-delete-message', 'enable']

  public constructor(private db: Database) {
    super()
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guildId
    const channelId = interaction.options.getChannel('channel')?.id || interaction.channelId

    if (!channelId || !guildId) {
      await interaction.reply({
        content: 'Invalid channel or guild ID.',
        flags: "Ephemeral"
      })
      return
    }

    await this.db.autoDeleteMessage.create({
      data: {
        guildId,
        channelId
      }
    })

    await interaction.reply({
      content: `Auto delete message enabled for <#${channelId}>`,
      flags: "Ephemeral"
    })
  }
}

export default EnableAutoDeleteMessageHandler