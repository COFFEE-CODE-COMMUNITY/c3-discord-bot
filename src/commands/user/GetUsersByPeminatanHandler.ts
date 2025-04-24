import { ChatInputCommandInteraction } from "discord.js"
import CommandHandler from "../../abstracts/CommandHandler"
import Database from "../../infrastructures/Database"
import { injectable } from "inversify"
import { Peminatan } from "@prisma/client"

@injectable()
class GetUserByPeminatanHandler extends CommandHandler {
  public prefix: string[] = ['user', 'get', 'by-peminatan']

  public constructor(private db: Database) {
    super()
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const value = interaction.options.getString("by-peminatan") as Peminatan
    const guildName = interaction.guild?.name ?? "server ini"

    const users = await this.db.user.findMany({
      where: { peminatan: value },
      orderBy: { fullName: "asc" }
    })

    if (users.length === 0) {
      await interaction.reply({ content: `Tidak ada user dengan peminatan ${value}.`, ephemeral: true })
      return
    }

    const userList = users
      .map((user, i) => `${i + 1}. ${user.fullName.trim()}`)
      .join("\n")
    const total = users.length

    const now = new Date()
    const formattedDate = now.toLocaleDateString('id-ID')
    const formattedTime = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })

    // Mapping timezone offset to WIB/WITA/WIT
    const offset = now.getTimezoneOffset() / -60 // negatif karena UTC
    let timeZoneLabel = "WIB"
    if (offset === 8) timeZoneLabel = "WITA"
    else if (offset === 9) timeZoneLabel = "WIT"

    const content = `**List member ${value} di ${guildName} :**\n${userList}\n\n${total} orang total dari member ${value} pada: • ${formattedDate} at ${formattedTime} ${timeZoneLabel}`

    await interaction.reply({ content })
  }
}

export default GetUserByPeminatanHandler
