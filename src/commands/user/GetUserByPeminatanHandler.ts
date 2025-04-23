import {ChatInputCommandInteraction} from "discord.js"
import prisma from "prisma"
import  {Peminatan} from "@prisma/client";
import CommandHandler from "../../abstracts/CommandHandler"
import Database from "../../infrastructures/Database"
import { injectable } from "inversify"

// export async function byPeminatanHandler(interaction: ChatInputCommandInteraction) {
//   const value = interaction.options.getString("by-peminatan") as Peminatan
//
//   const users = await prisma.user.findMany({where: {Peminatan: value}})
//   if (users.length === 0) {
//     return interaction.reply({ content: `Tidak ada user dengan peminatan ${value}.`, ephemeral: true })
//   }
//
//   const content = users.map(user => `- ${user.fullName} (${user.username})`).join("\n");
//   return interaction.reply({ content: `**User dengan peminatan ${value}:**\n${content}` })
// }

@injectable()
class GetUserByPeminatan extends CommandHandler {
  public prefix: string[] = ['user', 'get', 'by-peminatan']

  public constructor(private db: Database) {
    super()
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const value = interaction.options.getString("by-peminatan") as Peminatan

    const users = await this.db.user.findMany({
      where: {
        peminatan: value
      }
    })

    if (users.length === 0) {
      await interaction.reply({ content: `Tidak ada user dengan peminatan ${value}.`, ephemeral: true })
    }

    const content = users.map(user => `- ${user.fullName} (${user.username})`).join("\n");
    await interaction.reply({ content: `**User dengan peminatan ${value}:**\n${content}` })
  }
}

export default GetUserByPeminatan