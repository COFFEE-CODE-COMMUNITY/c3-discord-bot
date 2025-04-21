import DiscordSlashCommand from "../../abstracts/DiscordSlashCommand";
import {SlashCommandBuilder} from "discord.js";

class UserCommand extends DiscordSlashCommand {
  public slashCommand = new SlashCommandBuilder()
    .setName("user")
    .setDescription("list user")
    .addSubcommandGroup(group =>
      group
        .setName("get")
        .setDescription("get users")
        .addSubcommand(sub =>
          sub
            .setName("all")
            .setDescription("get all users")
        ).addSubcommand(sub =>
        sub.setName("by-category")
          .setDescription("get users by category")
          .addStringOption(option =>
            option
              .setName("category")
              .setDescription("name")
              .setRequired(true)
              .addChoices()
          )
      )
    ) as SlashCommandBuilder
}