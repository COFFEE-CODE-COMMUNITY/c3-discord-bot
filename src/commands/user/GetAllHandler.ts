// import {ChatInputCommandInteraction} from "discord.js"
// import prisma from "prisma"
//
// export async function getAllHandler(interaction: ChatInputCommandInteraction) {
//   const users = await prisma.user.findMany()
//   if (users.length === 0) {
//     return interaction.reply({content : `No users found.`, ephemeral : true})
//   }
//
//   const content = users.map(user =>  `- ${user.fullName} (${user.username})`).join("\n")
//   return interaction.reply({ content: `**Semua User:**\n${content}` });
// }