import DiscordEventListener from "../abstracts/DiscordEventListener"
import { Events, Message, OmitPartialGroupDMChannel } from "discord.js"
import Database from "../infrastructures/Database"
import { injectable } from "inversify"

@injectable()
class AutoDeleteMessageEvent extends DiscordEventListener<Events.MessageCreate> {
  public event: Events.MessageCreate = Events.MessageCreate

  public constructor(private db: Database) {
    super()
  }

  public async execute(interaction: OmitPartialGroupDMChannel<Message>): Promise<void> {
    if (interaction.author.bot) return

    const channelId = interaction.channelId

    const isChannelExists = await this.db.autoDeleteMessage.count({
      where: { channelId },
      take: 1
    })

    if (!isChannelExists) return

    await interaction.delete()
  }
}

export default AutoDeleteMessageEvent