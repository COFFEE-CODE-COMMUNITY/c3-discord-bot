import {
  EmbedBuilder,
  AttachmentBuilder,
  MessageType,
  Message,
  Events,
  OmitPartialGroupDMChannel
} from "discord.js"
import DiscordEventListener from "../abstracts/DiscordEventListener";
import {join} from "path"
import {injectable} from "inversify"

@injectable()
class BoosterEvent extends DiscordEventListener<Events.MessageCreate> {
  public readonly event = Events.MessageCreate

  public constructor() {
    super();
  }

  public async execute(message: OmitPartialGroupDMChannel<Message>): Promise<void> {
    const idChannelBooster = "1348339821503844493"
    if (message.channelId === idChannelBooster && message.member && !message.author.bot) {
      const user = message.member.user
      const realName = user.username
      const guild = message.guild
      const serverName = `<@${message.member.id}>`
      const attachment = new AttachmentBuilder(join("resources", "images", "server-boost.gif"), { name: "server-boost.gif" })

      if (guild) {
        const boostLevel = ['None', 'Level 1', 'Level 2', 'Level 3'][guild.premiumTier]
        const totalBoost = guild.premiumSubscriptionCount
        const avatarUrl = user.displayAvatarURL({
          dynamic: true,
          size: 1024
        } as any)
        const now = new Date()
        const time = now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Jakarta"
        })

        const embed = new EmbedBuilder()
          .setColor(0xEB459E) // Warna pink seperti ikon boost
          .setAuthor({
            name: `${realName} just boosted the server!`,
            iconURL: "attachment://server-boost.gif"
          })
          .setDescription(
            `Hi, ${serverName}! Thanks for the boost 💎.\n` +
            `Because of you, we are now has ${totalBoost} in total.\n` +
            `Please DM our discord mod for custom role.`
          )
          .setThumbnail(`${avatarUrl}`)
          .setFooter({text: `Currently server level ${boostLevel}. • ${time}`})

        await message.channel.send({
          embeds: [embed],
          files: [attachment]
        })
      }
    } else {
      return
    }
  }
}

export default BoosterEvent
