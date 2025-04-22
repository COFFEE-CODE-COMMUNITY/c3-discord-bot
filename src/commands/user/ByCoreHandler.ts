import {ChatInputCommandInteraction} from "discord.js";
import prisma from "prisma";

export async function byCoreHandler(interaction: ChatInputCommandInteraction) {
  const users = await prisma.user.findMany({where: {coreMember: true}})

  if (users.length === 0) {
    return interaction.reply({content: "Tidak ada user core member.", ephemeral: true})
  }

  const content = users.map(user => `- ${user.fullName} (${user.username})`).join("\n")
  return interaction.reply({ content: "**Core Member:**\n" + content })
}