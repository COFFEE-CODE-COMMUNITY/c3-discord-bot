import DiscordSlashCommand from "../../abstracts/DiscordSlashCommand"
import { Interaction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js"

class PlayMusicCommand extends DiscordSlashCommand {
  public options: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
    .setName("music play")
    .setDescription("Play a song from url or search query.")
    .addStringOption(option =>
      option
        .setName("query")
        .setDescription("The song url or search query.")
        .setRequired(true)
    )

  public execute(interaction: Interaction): void | Promise<void> {
    return undefined
  }
}