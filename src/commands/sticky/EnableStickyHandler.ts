import { injectable } from "inversify"
import CommandHandler from "../../abstracts/CommandHandler"
import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} from "discord.js"
import ModalId from "../../enums/ModalId"
import EnableStickyContext from "../../sticky/EnableStickyContext"

@injectable()
class EnableStickyHandler extends CommandHandler {
  public prefix: string[] = ['sticky', 'enable']

  public constructor(private context: EnableStickyContext) {
    super()
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const channelOption = interaction.options.getChannel("channel")
    const channelId = channelOption?.id || interaction.channelId
    const userId = interaction.user.id

    this.context.set(userId, channelId)

    const messageInput = new TextInputBuilder()
      .setCustomId("sticky-message")
      .setLabel("Sticky Message")
      .setStyle(TextInputStyle.Paragraph)
      .setMinLength(1)

    const actionRow = new ActionRowBuilder<TextInputBuilder>()
      .addComponents(messageInput)

    const modal = new ModalBuilder()
      .setCustomId(ModalId.CreateStickyMessage)
      .setTitle("Enable Sticky")
      .addComponents(actionRow)

    await interaction.showModal(modal)
  }
}

export default EnableStickyHandler