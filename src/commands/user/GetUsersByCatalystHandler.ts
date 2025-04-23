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

    const userList = users.map((user, i) => `${i + 1}. ${user.fullName}`).join("\n")
    const total = users.length

    // Format current date to "D MMMM YYYY"
    const date = new Date()
    const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`

    const content = `**Catalyst Member:**\n${userList}\n\n${total} member pada ${formattedDate}`

    await interaction.reply({ content })
  }
}

export default GetUserByCatalystHandler
