import { EmbedBuilder, Events, GuildMember } from "discord.js"
import Logger from "../infrastructures/Logger"
import appSettings from "../../app.settings.json"
import { createCanvas, loadImage } from "@napi-rs/canvas"
import { join } from "path"
import { injectable } from "inversify"
import DiscordEventListener from "../abstracts/DiscordEventListener"

@injectable()
class UserJoinGuild extends DiscordEventListener<Events.GuildMemberAdd> {
  public readonly event = Events.GuildMemberAdd

  public constructor(private logger: Logger) {
    super()

    this.logger.setContextName(this.constructor.name)
    this.execute = this.execute.bind(this)
  }

  public async execute(member: GuildMember): Promise<void> {
    this.logger.verbose(`${member.user.username} has joined the guild.`)

    const channel = member.guild.channels.cache.get(appSettings.channels.gate.id)

    if (!channel) return

    // Create banner
    const background = await loadImage(join("resources", "images", "welcome-banner.png"))
    const canvas = createCanvas(background.width, background.height)
    const ctx = canvas.getContext("2d")

    ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

    ctx.font = "bold 105px Poppins"
    ctx.textAlign = "center"
    ctx.fillStyle = "#1f6faf"
    ctx.fillText(`WELCOME, ${member.user.username.toUpperCase()}`, canvas.width / 2, canvas.height / 2, (canvas.height / 2) - 150)

    const avatar = await loadImage(member.user.displayAvatarURL())
    ctx.beginPath()
    ctx.arc(250, 250, 200, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(avatar, 50, 50, 250, 250)

    // Create embed
    const embed = new EmbedBuilder()
      .setTitle("C3")
      .setAuthor({ name: "Coffe Code Community" })
      .setDescription(
        `Welcome ${member.toString()}\n\n` +
        "*Hai, Hai! Selamat Datang di C3*\n\n" + // Italic style
        "Halo untuk kamu yang baru bergabung! Kami senang bisa menyambutmu di sini.\n\n" +
        "Di komunitas ini, kamu akan menemukan berbagai informasi menarik seputar C3 " +
        "yang bisa membantu kamu lebih memahami tentang komunitas ini.\n\n" +
        "• Mau tahu lebih banyak soal C3? Cek di <#1289860748448759857>\n" +
        "• Punya ide keren atau masukan? Langsung tulis di <#1347594181752786995>"
      )
      .setColor(0x3498db) // Warna biru
      .setImage("https://cdn.discordapp.com/attachments/1348339821503844493/1353752979869536277/Blue_and_White_Modern_Welcome_Banner_1.png?ex=67e2cc35&is=67e17ab5&hm=c148774cc63803419d5eef179779f87a9aae414876bcbbc3adbed796a2d4ba7c&") // Ganti dengan URL banner welcome
      .setFooter({ text: "Copyright© 2024 Coffe Code Community" })

    // Send message
    // await channel.send({ embeds: [embed], files: [{ attachment: canvas.toBuffer(), name: "welcome-banner.png" }] })
    if (channel.isSendable()) {
      channel.send({
        embeds: [embed],
        files: [{ attachment: canvas.toBuffer("image/png"), name: "welcome-banner.png" }]
      })
    }
  }
}

export default UserJoinGuild