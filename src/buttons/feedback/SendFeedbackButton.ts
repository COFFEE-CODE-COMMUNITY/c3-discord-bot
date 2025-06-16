import ButtonHandler from "../../abstracts/ButtonHandler"
import { ActionRowBuilder, ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js"
import { injectable } from "inversify"
import ModalId from "../../enums/ModalId"

@injectable()
class SendFeedbackButton extends ButtonHandler {
  public buttonId: string = 'send-feedback-button'

  public async handle(interaction: ButtonInteraction): Promise<void> {
    const topicInput = new TextInputBuilder()
      .setCustomId('topic')
      .setLabel('Topic')
      .setStyle(TextInputStyle.Short)

    const messageInput = new TextInputBuilder()
      .setCustomId('message')
      .setLabel('Message')
      .setStyle(TextInputStyle.Paragraph);

    const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(topicInput)
    const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(messageInput);

    const feedbackModal = new ModalBuilder()
      .setCustomId(ModalId.SendFeedback)
      .setTitle('Send Feedback')
      .addComponents(
        firstActionRow,
        secondActionRow
      );

    await interaction.showModal(feedbackModal);
  }
}

export default SendFeedbackButton