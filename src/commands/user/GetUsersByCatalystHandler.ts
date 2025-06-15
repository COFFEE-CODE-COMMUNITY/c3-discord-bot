import {ChatInputCommandInteraction} from "discord.js"
import CommandHandler from "../../abstracts/CommandHandler"
import Database from "../../infrastructures/Database"
import {injectable} from "inversify"

@injectable()
class GetUserByCatalystHandler extends CommandHandler {
  public prefix: string[] = ['user', 'get', 'by-catalyst']

  public constructor(private db: Database) {
    super()
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const users = await this.db.user.findMany({
      where: {catalyst: true},
      orderBy: {fullName: "asc"}
    })

    if (users.length === 0) {
      await interaction.reply({
        content: "Tidak dapat menemukan Catalyst member.",
        ephemeral: true
      })
      return
    }

    const userList = users
      .map(user => `\u00A0\u00A0• \u00A0${user.fullName.trim()}`)
      .join("\n")
    const total = users.length
    const guildName = interaction.guild?.name ?? "server ini"

    const content = `Daftar member catalyst di ${guildName} :\n${userList}\n\nTotal member : ${total} orang di C3 Catalyst.`

    await interaction.reply({content})
  }
}

export default GetUserByCatalystHandler
