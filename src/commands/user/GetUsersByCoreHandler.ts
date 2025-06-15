import {ChatInputCommandInteraction} from "discord.js"
import CommandHandler from "../../abstracts/CommandHandler"
import Database from "../../infrastructures/Database"
import {injectable} from "inversify"

@injectable()
class GetUserByCoreHandler extends CommandHandler {
  public prefix: string[] = ['user', 'get', 'by-core']

  public constructor(private db: Database) {
    super()
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const users = await this.db.user.findMany({
      where: {coreMember: true},
      orderBy: {fullName: "asc"}
    })

    if (users.length === 0) {
      await interaction.reply({
        content: "Tidak dapat menemukan Core member.",
        ephemeral: true
      })
      return
    }

    const userList = users
      .map(user => `\u00A0\u00A0• \u00A0${user.fullName.trim()}`)
      .join("\n")
    const total = users.length
    const guildName = interaction.guild?.name ?? "this server"

    const content = `Core Members list in ${guildName} :\n${userList}\n\nTotal members : ${total} people in C3 Core.`

    await interaction.reply({content})
  }
}

export default GetUserByCoreHandler
