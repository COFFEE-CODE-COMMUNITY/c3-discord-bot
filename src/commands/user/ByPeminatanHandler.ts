import {ChatInputCommandInteraction} from "discord.js"
import prisma from "prisma"
import  {Peminatan} from "@prisma/client";

export async function byPeminatanHandler(interaction: ChatInputCommandInteraction) {
  const value = interaction.options.getString("by-peminatan") as Peminatan

  const users = await prisma.user.findMany({where: {Peminatan: value}})
  if (users.length === 0) {
    return interaction.reply({ content: `Tidak ada user dengan peminatan ${value}.`, ephemeral: true })
  }

  const content = users.map(user => `- ${user.fullName} (${user.username})`).join("\n");
  return interaction.reply({ content: `**User dengan peminatan ${value}:**\n${content}` })
}