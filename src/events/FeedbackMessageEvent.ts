import DiscordEventListener from "../abstracts/DiscordEventListener"
import { ButtonBuilder, Client, EmbedBuilder, Events, ButtonStyle, ActionRowBuilder } from "discord.js"
import config from '../infrastructures/config'
import Logger from "../infrastructures/Logger"
import { injectable } from "inversify"

@injectable()
class FeedbackMessageEvent extends DiscordEventListener<Events.ClientReady> {
  public event: Events.ClientReady = Events.ClientReady

  public constructor(private logger: Logger) {
    super()
  }

  public async execute(client: Client<true>) {
    const feedbackChannel = await client.channels.fetch(config.get('c3.channels.feedback.id'))

    if (!feedbackChannel) {
      this.logger.error('Feedback channel not found. Please check the configuration.')
      return;
    }

    if (!feedbackChannel.isTextBased()) {
      this.logger.error('Feedback channel is not a text-based channel.')
      return;
    }

    const feedbackChannelMessages = await feedbackChannel.messages.fetch({ limit: 1 })

    if (feedbackChannel.isSendable() && feedbackChannelMessages.size == 0) {
      const embed = new EmbedBuilder()
        .setTitle('Feedback')
        .setDescription('Silakan berikan kritik dan saran Anda untuk membantu kami meningkatkan server ini. Masukan Anda hanya akan terlihat oleh admin.')
        .setColor('#37cee6')

      const sendFeedbackButton = new ButtonBuilder()
        .setCustomId('send-feedback-button')
        .setLabel('Send Feedback')
        .setStyle(ButtonStyle.Primary)

      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(sendFeedbackButton)

      await feedbackChannel.send({
        embeds: [embed],
        components: [row]
      })
    } else {
      this.logger.debug('Feedback message already exists or the channel is not sendable.')
    }
  }
}

export default FeedbackMessageEvent