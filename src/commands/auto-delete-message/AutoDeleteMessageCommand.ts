import DiscordSlashCommand from "../../abstracts/DiscordSlashCommand"
import { ChannelType, SlashCommandBuilder } from "discord.js"
import { injectable } from "inversify"

@injectable()
class AutoDeleteMessageCommand extends DiscordSlashCommand {
  public slashCommand: SlashCommandBuilder = new SlashCommandBuilder()
    .setName('auto-delete-message')
    .setDescription('Automatically delete incoming message on specific channel.')
    .addSubcommand(subcommand => subcommand
      .setName('enable')
      .setDescription('Enable auto delete message.')
      .addChannelOption(option => option
        .setName('channel')
        .setDescription('The channel to enable auto delete message.')
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildText)
      )
    )
    .addSubcommand(subcommand => subcommand
      .setName('disable')
      .setDescription('Disable auto delete message.')
      .addChannelOption(option => option
        .setName('channel')
        .setDescription('The channel to disable auto delete message.')
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildText)
      )
    )
    .addSubcommand(subcommand => subcommand
      .setName('clear')
      .setDescription('Clear auto delete message on this guild.')
    ) as SlashCommandBuilder
}

export default AutoDeleteMessageCommand