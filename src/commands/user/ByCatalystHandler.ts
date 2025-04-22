import {ChatInputCommandInteraction} from "discord.js";
import prisma from "prisma";

export async function byCatalystHandler(interaction: ChatInputCommandInteraction) {
  const users = await prisma.user.findMany({where: {catalystMember: true}})

  if (users.length === 0) {
    return interaction.reply({content: "Tidak ada user catalyst member.", ephemeral: true})
  }

  const content = users.map(user => `- ${user.fullName} (${user.username})`).join("\n")
  return interaction.reply({ content: "**Core Member:**\n" + content })
}