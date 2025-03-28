import DiscordSlashCommand from "../../abstracts/DiscordSlashCommand"
import {
  SlashCommandBuilder,
} from "discord.js"
import { injectable } from "inversify"

@injectable()
class PingCommand extends DiscordSlashCommand {
  public slashCommand: SlashCommandBuilder = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!")
    .addBooleanOption(option => option
      .setName("is_ephemeral")
      .setDescription("Whether the response should be ephemeral")
      .setRequired(false)) as SlashCommandBuilder
}

export default PingCommand