import { ChatInputCommandInteraction } from "discord.js"
import { Peminatan } from "@prisma/client"
import CommandHandler from "../../abstracts/CommandHandler"
import Database from "../../infrastructures/Database"
import { injectable } from "inversify"
import dayjs from "dayjs"

@injectable()
class GetUserByPeminatan extends CommandHandler {
  public prefix: string[] = ['user', 'get', 'by-peminatan']

  public constructor(private db: Database) {
    super()
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const value = interaction.options.getString("by-peminatan") as Peminatan

    const users = await this.db.user.findMany({
      where: { peminatan: value },
      orderBy: { fullName: "asc" }
    })

    if (users.length === 0) {
      await interaction.reply({
        content: `Tidak ada user dengan peminatan ${value}`,
        ephemeral: true
      })
      return
    }

    const userList = users.map((user, i) => `${i + 1}. ${user.fullName}`).join("\n")
    const total = users.length
    const date = dayjs().format("D MMMM YYYY")

    const content = `**${value}**\n${userList}\n\n${total} member pada ${date}`

    await interaction.reply({ content })
  }
}

export default GetUserByPeminatan
