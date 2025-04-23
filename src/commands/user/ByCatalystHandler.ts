import {ChatInputCommandInteraction} from "discord.js";
import prisma from "./Prisma";
import dayjs from "dayjs";

export async function byCatalystHandler(interaction: ChatInputCommandInteraction) {
  const users = await prisma.user.findMany({
    where: { catalyst: true },
    orderBy: { fullName: "asc" }
  });

  if (users.length === 0) {
    return interaction.reply({
      content: "Tidak ada user Catalyst member.",
      ephemeral: true
    });
  }

  const userList = users
    .map((user, i) => `${i + 1}. ${user.fullName}`)
    .join("\n");

  const total = users.length;
  const date = dayjs().format("D MMMM YYYY");

  const content = `**Catalyst**\n${userList}\n\n${total} member pada ${date}`;

  return interaction.reply({ content });
}