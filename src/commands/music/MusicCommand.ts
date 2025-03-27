import DiscordSlashCommand from "../../abstracts/DiscordSlashCommand"
import { ChannelType, Interaction, SlashCommandBuilder } from "discord.js"
import { injectable } from "inversify"

@injectable()
class MusicCommand extends DiscordSlashCommand {
  public options: SlashCommandBuilder = new SlashCommandBuilder()
    .setName("music")
    .setDescription("Play music to the voice channel.")
    .addSubcommand(subcommand => subcommand
      .setName("play")
      .setDescription("Play music to the voice channel.")
      .addStringOption(option => option
        .setName("query")
        .setDescription("Link or search query.")
        .setRequired(false)
      )
      .addBooleanOption(option => option
        .setName("next")
        .setDescription("Play after next track.")
        .setRequired(false)
      )
      .addChannelOption(option => option
        .setName("channel")
        .setDescription("Voice channel to play music.")
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildVoice)
      )
    )
    .addSubcommand(subcommand => subcommand
      .setName("pause")
      .setDescription("Toggle pause.")
    )
    .addSubcommand(subcommand => subcommand
      .setName("stop")
      .setDescription("Clears the queue and stop the music.")
    )
    .addSubcommand(subcommand => subcommand
      .setName("view-queue")
      .setDescription("Show the queue.")
    )
    .addSubcommand(subcommand => subcommand
      .setName("previous")
      .setDescription("Play the previous track.")
    )
    .addSubcommand(subcommand => subcommand
      .setName("next")
      .setDescription("Play the next track.")
    )
    .addSubcommand(subcommand => subcommand
      .setName("shuffle")
      .setDescription("Shuffle the queue.")
    ) as SlashCommandBuilder

  public execute(interaction: Interaction): void | Promise<void> {
    return undefined
  }
}

export default MusicCommand