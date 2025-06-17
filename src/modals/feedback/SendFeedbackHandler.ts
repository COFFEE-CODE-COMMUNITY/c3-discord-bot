import { injectable } from "inversify"
import ModalHandler from "../../abstracts/ModalHandler"
import ModalId from "../../enums/ModalId"
import { ModalSubmitInteraction, EmbedBuilder, ChannelType } from "discord.js"

@injectable()
class SendFeedbackHandler extends ModalHandler {
  public modalId: ModalId = ModalId.SendFeedback

  public async handle(interaction: ModalSubmitInteraction): Promise<void> {
    const topic = interaction.fields.getTextInputValue("topic")
    const message = interaction.fields.getTextInputValue("message")

    // Optionally, you can send the feedback to a specific channel or save it in a database
    const feedbackChannelId = "1353645555846352907"
    const channel = await interaction.client.channels.fetch(feedbackChannelId)

    if (!channel || channel.type !== ChannelType.GuildText) {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "Channel feedback tidak ditemukan atau tidak valid.",
          ephemeral: true
        })
      }
      return
    }

    const embed = new EmbedBuilder()
      .setTitle(`Feedback from ${interaction.user.username} (${interaction.user.displayName})`)
      .addFields(
        {
          name: "Mentioned",
          value: `${interaction.user}`,
          inline: false
        },
        {
          name: "Title",
          value: topic,
          inline: false
        },
        {
          name: "Message",
          value: message,
          inline: false
        }
      )
      .setColor(0x1C567A)
      .setTimestamp()

    await channel.send({ embeds: [embed] })

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "Terima kasih! Feedback kamu telah dikirim.",
        ephemeral: true
      })
    }
  }
}

export default SendFeedbackHandler