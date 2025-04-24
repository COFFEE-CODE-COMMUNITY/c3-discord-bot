import { ChatInputCommandInteraction } from "discord.js"
import CommandHandler from "../../abstracts/CommandHandler"
import Database from "../../infrastructures/Database"
import { injectable } from "inversify"

@injectable()
class GetAllUsersHandler extends CommandHandler {
  public prefix: string[] = ['user', 'get', 'all']

  public constructor(private db: Database) {
    super()
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const users = await this.db.user.findMany({
      orderBy: { fullName: "asc" }
    })

    if (users.length === 0) {
      await interaction.reply({
        content: "Tidak ada user yang terdaftar.",
        ephemeral: true
      })
      return
    }

    const userList = users
      .map(user => `\u00A0\u00A0• \u00A0${user.fullName.trim()}`)
      .join("\n")
    const total = users.length

    const date = new Date()
    const formattedTime = date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })

    const offset = date.getTimezoneOffset() / -60
    let timeZoneLabel = "WIB"
    if (offset === 8) timeZoneLabel = "WITA"
    else if (offset === 9) timeZoneLabel = "WIT"

    const guildName = interaction.guild?.name ?? "server ini"

    const content = `List semua member di ${guildName} :\n${userList}\n\nJumlah ${total} orang total dari semua member. • ${formattedTime} ${timeZoneLabel}`

    await interaction.reply({ content })
  }
}

export default GetAllUsersHandler
