import DiscordSlashCommand from "../../abstracts/DiscordSlashCommand"
import {SlashCommandBuilder} from "discord.js"
import {injectable} from "inversify"

@injectable()
class BoosterCommand extends DiscordSlashCommand {
  public slashCommand: SlashCommandBuilder = new SlashCommandBuilder()
    .setName("booster")
    .setDescription("Show booster")
}

export default BoosterCommand