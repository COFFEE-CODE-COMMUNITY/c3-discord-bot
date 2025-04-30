import DiscordEventListener from "../abstracts/DiscordEventListener"
import { Events, Message, OmitPartialGroupDMChannel } from "discord.js"
import { injectable } from "inversify"
import Database from "../infrastructures/Database"

@injectable()
class StickyMessageEvent extends DiscordEventListener<Events.MessageCreate> {
  public readonly event = Events.MessageCreate

  public constructor(private db: Database) {
    super()
  }

  public async execute(interaction: OmitPartialGroupDMChannel<Message>): Promise<void> {
    if (interaction.author.bot) return

    const stickyMessage = await this.db.stickyMessage.findUnique({
      where: { channelId: interaction.channelId },
      select: {
        messageId: true,
        message: true
      }
    })

    if (!stickyMessage) return

    const message = await interaction.channel.messages.fetch(stickyMessage.messageId)
    await message.delete()

    const { id: messageId } = await interaction.channel.send(stickyMessage.message)

    await this.db.stickyMessage.update({
      where: { channelId: interaction.channelId },
      data: {
        messageId,
      }
    })
  }
}

export default StickyMessageEvent