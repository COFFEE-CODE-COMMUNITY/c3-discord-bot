import { ChatInputCommandInteraction } from "discord.js"
import dayjs from "dayjs"
import CommandHandler from "../../abstracts/CommandHandler"
import Database from "../../infrastructures/Database"
import { injectable } from "inversify"

@injectable()
class GetUserByCoreHandler extends CommandHandler {
  public prefix: string[] = ['user', 'get', 'core']

  public constructor(private db: Database) {
    super()
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const users = await this.db.user.findMany({
      where: { coreMember: true },
      orderBy: { fullName: "asc" }
    })

    if (users.length === 0) {
      await interaction.reply({
        content: "Tidak ada user Core member",
        ephemeral: true
      })
      return
    }

    const userList = users.map((user, i) => `${i + 1}. ${user.fullName}`).join("\n")
    const total = users.length
    const date = dayjs().format("D MMMM YYYY")

    const content = `**Core**\n${userList}\n\n${total} member pada ${date}`

    await interaction.reply({ content })
  }
}

export default GetUserByCoreHandler
