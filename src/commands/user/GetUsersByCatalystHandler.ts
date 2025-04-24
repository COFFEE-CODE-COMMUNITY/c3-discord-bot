import { ChatInputCommandInteraction } from "discord.js"
import CommandHandler from "../../abstracts/CommandHandler"
import Database from "../../infrastructures/Database"
import { injectable } from "inversify"

@injectable()
class GetUserByCatalystHandler extends CommandHandler {
  public prefix: string[] = ['user', 'get', 'by-catalyst']

  public constructor(private db: Database) {
    super()
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const users = await this.db.user.findMany({
      where: { catalyst: true },
      orderBy: { fullName: "asc" }
    })

    if (users.length === 0) {
      await interaction.reply({
        content: "Tidak ada user Catalyst member.",
        ephemeral: true
      })
      return
    }

    const userList = users
      .map((user, i) => ` ${i + 1}. ${user.fullName.trim()}`)
      .join("\n")
    const total = users.length

    const now = new Date()
    const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`
    const formattedTime = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })

    const offset = now.getTimezoneOffset() / -60
    let timeZoneLabel = "WIB"
    if (offset === 8) timeZoneLabel = "WITA"
    else if (offset === 9) timeZoneLabel = "WIT"

    const guildName = interaction.guild?.name ?? "server ini"

    const content = `**List member Catalyst di ${guildName} :**\n ${userList}\n\n${total} orang total dari member Catalyst pada: • ${formattedDate} at ${formattedTime} ${timeZoneLabel}`

    await interaction.reply({ content })
  }
}

export default GetUserByCatalystHandler
