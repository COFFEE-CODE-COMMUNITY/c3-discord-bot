import {ChatInputCommandInteraction} from "discord.js"
import CommandHandler from "../../abstracts/CommandHandler"
import Database from "../../infrastructures/Database"
import {injectable} from "inversify"
import {Peminatan} from "@prisma/client"

@injectable()
class GetUserByPeminatanHandler extends CommandHandler {
  public prefix: string[] = ['user', 'get', 'by-peminatan']

  public constructor(private db: Database) {
    super()
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const value = interaction.options.getString("by-peminatan") as Peminatan

    const users = await this.db.user.findMany({
      where: {peminatan: value},
      orderBy: {fullName: "asc"}
    })

    if (users.length === 0) {
      await interaction.reply({content: `No user with peminatan ${value}.`, ephemeral: true})
      return
    }

    const userList = users
      .map(user => `\u00A0\u00A0• \u00A0${user.fullName.trim()}`)
      .join("\n")
    const total = users.length
    const guildName = interaction.guild?.name ?? "this server"

    const content = `${value} members list in ${guildName} :\n${userList}\n\nTotal members : ${total} people in C3 ${value}.`

    await interaction.reply({content})
  }
}

export default GetUserByPeminatanHandler
