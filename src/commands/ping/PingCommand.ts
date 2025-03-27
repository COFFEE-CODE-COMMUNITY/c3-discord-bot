import DiscordSlashCommand from "../../abstracts/DiscordSlashCommand"
import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder
} from "discord.js"

class PingCommand extends DiscordSlashCommand {
  public options: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!")
    .addBooleanOption(option => option
      .setName("is_ephemeral")
      .setDescription("Whether the response should be ephemeral")
      .setRequired(false))

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const isEphemeral = interaction.options.getBoolean("is_ephemeral") ?? false

    if (interaction.isRepliable()) {
      await interaction.reply({
        content: "pong!",
        ephemeral: isEphemeral
      })
    }
  }
}