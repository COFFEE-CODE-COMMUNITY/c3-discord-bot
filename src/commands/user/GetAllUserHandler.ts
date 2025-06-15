import {ChatInputCommandInteraction} from "discord.js"
import CommandHandler from "../../abstracts/CommandHandler"
import Database from "../../infrastructures/Database"
import {injectable} from "inversify"

@injectable()
class GetAllUsersHandler extends CommandHandler {
  public prefix: string[] = ['user', 'get', 'all']

  public constructor(private db: Database) {
    super()
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const users = await this.db.user.findMany({
      orderBy: {fullName: "asc"}
    })

    if (users.length === 0) {
      await interaction.reply({
        content: "Tidak dapat menemukan member.",
        ephemeral: true
      })
      return
    }

    const userList = users
      .map(user => `\u00A0\u00A0• \u00A0${user.fullName.trim()}`)
      .join("\n")
    const total = users.length
    const guildName = interaction.guild?.name ?? "this server"

    const content = `Daftar semua member di ${guildName} :\n${userList}\n\nTotal member : ${total} orang di ${guildName}.`

    await interaction.reply({content})
  }
}

export default GetAllUsersHandler
