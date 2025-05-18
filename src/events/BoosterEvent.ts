import {
  EmbedBuilder,
  AttachmentBuilder,
  TextChannel,
  Message,
  Events,
  OmitPartialGroupDMChannel,
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
    const idChannel = "1347976322328170507"
    const boostMessageType = [8, 9, 10, 11] //Message type for booster
    const isBoostMessage = message.content.toLowerCase().includes("boost") || boostMessageType.includes(message.type)

    //check message
    if (message.channelId === idChannel && message.member && isBoostMessage) {
      const user = message.member.user
      const realName = user.username
      const guild = message.guild
      const customRole = "1342397104592781333"
      const serverName = `<@${message.member.id}>`
      const attachment = new AttachmentBuilder(join("resources", "images", "server-boost.gif"), { name: "server-boost.gif" })

      //check if message only appear in server
      if (guild) {
        const boostLevel = ['0', '1', '2', '3'][guild.premiumTier]
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
            `Please DM our discord mod for <@&${customRole}>.`
          )
          .setThumbnail(`${avatarUrl}`)
          .setFooter({text: `Server level ${boostLevel}. • ${time}`
          })

        //Get channel object for type TextChannel
        const targetChannel = await message.client.channels.fetch(idChannel)

        //Deleting previous message
        await message.delete().catch(console.error)

        //Sending message
        if (targetChannel instanceof TextChannel) {
          await targetChannel.send({
            content: `${serverName}`,
            embeds: [embed],
            files: [attachment]
          })
        } else {
          console.error('The fetched channel is not Text Channel!')
        }
      }
    } else {
      return
    }
  }
}

export default BoosterEvent
