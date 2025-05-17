import DiscordSlashCommand from "../../abstracts/DiscordSlashCommand";
import {SlashCommandBuilder} from "discord.js";
import {injectable} from "inversify";

@injectable()
class AutoMatchCommand extends DiscordSlashCommand{
  public slashCommand = new SlashCommandBuilder()
    .setName("auto-match")
    .setDescription("Matchmaking command")
    .addSubcommand(sub => sub
      .addIntegerOption(option => option
        .setName("number-player")
        .setDescription("The number of players")
        .setMinValue(1)
        .setMaxValue(20)
        .setRequired(true)
      )
    )
    .addSubcommand(sub => sub
      .setName("exclude")
      .setDescription("Exclude players to match")
      .addUserOption(option => option
        .setName("target")
        .setDescription("The targeted player")
        .setRequired(true)
      )
    ) as SlashCommandBuilder
}

export default AutoMatchCommand