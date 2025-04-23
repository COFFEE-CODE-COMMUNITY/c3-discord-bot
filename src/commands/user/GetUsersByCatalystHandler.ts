import { ChatInputCommandInteraction } from "discord.js"
import dayjs from "dayjs"
import CommandHandler from "../../abstracts/CommandHandler"
import Database from "../../infrastructures/Database"
import { injectable } from "inversify"

@injectable()
class GetUsersByCatalystHandler extends CommandHandler {
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
    }

    const userList = users
      .map((user, i) => `${i + 1}. ${user.fullName}`)
      .join("\n")

    const total = users.length
    const date = dayjs().format("D MMMM YYYY")

    const content = `**Catalyst**\n${userList}\n\n${total} member pada ${date}`

    await interaction.reply({ content })
  }
}

export default GetUsersByCatalystHandler
