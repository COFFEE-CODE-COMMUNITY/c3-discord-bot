import ModalId from "../../enums/ModalId"
import ModalHandler from "../../abstracts/ModalHandler"
import { ChannelType, ModalSubmitInteraction } from "discord.js"
import EnableStickyContext from "../../sticky/EnableStickyContext"
import { injectable } from "inversify"
import Database from "../../infrastructures/Database"

@injectable()
class CreateStickyMessageHandler extends ModalHandler {
  public modalId: ModalId = ModalId.CreateStickyMessage

  public constructor(private context: EnableStickyContext, private db: Database) {
    super()
  }

  public async handle(interaction: ModalSubmitInteraction): Promise<void> {
    const message = interaction.fields.getTextInputValue("sticky-message")
    const guildId = interaction.guildId
    const userId = interaction.user.id
    const channelId = this.context.get(userId)

    if (!channelId || !guildId) {
      await interaction.reply({ content: "No channel found for sticky message.", flags: "Ephemeral" })

      return
    }

    // Acknowledge the modal submission
    await interaction.reply({ content: "Sticky message created!", flags: "Ephemeral" })

    const targetChannel = await interaction.client.channels.fetch(channelId)

    if (targetChannel?.type != ChannelType.GuildText) {
      await interaction.reply({ content: "Channel type is not guild text." })

      return
    }

    const { id: messageId } = await targetChannel.send(message)

    // Save the sticky message to the database
    await this.db.stickyMessage.create({
      data: {
        guildId,
        channelId,
        message,
        messageId
      }
    })

    // Delete channelId context
    this.context.delete(userId)
  }
}

export default CreateStickyMessageHandler
