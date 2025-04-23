import {ChatInputCommandInteraction} from "discord.js"
import prisma from "./Prisma";
import  {Peminatan} from "@prisma/client";
import dayjs from "dayjs";

export async function byPeminatanHandler(interaction: ChatInputCommandInteraction) {
  const value = interaction.options.getString("by-peminatan") as Peminatan;

  const users = await prisma.user.findMany({
    where: { peminatan: value },
    orderBy: { fullName: "asc" }
  });

  if (users.length === 0) {
    return interaction.reply({
      content: `Tidak ada user dengan peminatan **${value}**.`,
      ephemeral: true
    });
  }

  const userList = users
    .map((user, i) => `${i + 1}. ${user.fullName}`)
    .join("\n");

  const date = dayjs().format("D MMMM YYYY"); // e.g., "23 April 2025"
  const total = users.length;

  const content = `**${value}**\n${userList}\n\n${total} member pada ${date}`;

  return interaction.reply({ content });
}