import DiscordSlashCommand from "../../abstracts/DiscordSlashCommand"
import {SlashCommandBuilder} from "discord.js"
import {Peminatan} from "@prisma/client"
import { injectable } from "inversify"

@injectable()
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
              Object.keys(Peminatan).map(peminatan => ({
                name : peminatan,
                value : peminatan
              }))
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

export default UserCommand