import {ChatInputCommandInteraction, EmbedBuilder, AttachmentBuilder} from "discord.js"
import CommandHandler from "../../abstracts/CommandHandler"
import {join} from "path"
import {injectable} from "inversify"

@injectable()
class BoosterHandler extends CommandHandler {
  public prefix : string[] = ['booster']

  public constructor() {
    super()
  }

  public async handle(interaction : ChatInputCommandInteraction) : Promise<void> {
    const guild = interaction.guild
    const user = interaction.user
    const attachment = new AttachmentBuilder(join("resources", "images", "server-boost.gif"), { name: "server-boost.gif" })

    if (guild) {
      const member = await interaction.guild?.members.fetch(user.id)
      const realName = member.user.username.toString()
      const serverName = `<@${member.id}>`
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

      await interaction.reply({
        embeds: [embed],
        files: [attachment]
      })
    } else {
      await interaction.reply({
        content: "Cannot send booster message",
        ephemeral: true
      })
    }
  }
}

export default BoosterHandler