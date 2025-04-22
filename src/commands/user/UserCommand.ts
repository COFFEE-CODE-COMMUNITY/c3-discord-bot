import DiscordSlashCommand from "../../abstracts/DiscordSlashCommand"
import {SlashCommandBuilder} from "discord.js"
import {} from "@prisma/client"

class UserCommand extends DiscordSlashCommand {
  public slashCommand = new SlashCommandBuilder()
    .setName("user")
    .setDescription("list user")
    .addSubcommandGroup(group => group
      .setName("get")
      .setDescription("get users")
      .addSubcommand(sub => sub
        .setName("all")
        .setDescription("get all users")
      )
      .addSubcommand(sub => sub.setName("by-peminatan")
        .setDescription("get users by peminatan")
        .addStringOption(option =>
          option
            .setName("by-peminatan")
            .setDescription("get users by peminatan")
            .setRequired(true)
            .addChoices(
              {name: 'Frontend', value: 'Frontend'},
              {name: 'Backend', value: 'Backend'}
            )
        )
      )
      .addSubcommand(sub => sub
        .setName("by-catalyst")
        .setDescription("get users by catalyst")
      )
      .addSubcommand(sub => sub
        .setName("by-core")
        .setDescription("get users by core")
      )
    ) as SlashCommandBuilder
}