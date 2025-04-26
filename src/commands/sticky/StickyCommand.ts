import DiscordSlashCommand from "../../abstracts/DiscordSlashCommand"
import { ChannelType, SlashCommandBuilder } from "discord.js"
import { injectable } from "inversify"

@injectable()
class StickyCommand extends DiscordSlashCommand {
  public slashCommand: SlashCommandBuilder = new SlashCommandBuilder()
    .setName("sticky")
    .setDescription("Sticky message.")
    .addSubcommand(subcommand => subcommand
      .setName('enable')
      .setDescription('Enable the sticky message')
      .addStringOption(option => option
        .setName('message')
        .setDescription('The message of sticky')
        .setRequired(true)
      )
      .addChannelOption(option => option
        .setName('channel')
        .setDescription('Specify the channel for enable sticky message.')
        .addChannelTypes(ChannelType.GuildText)
      )
    )
    .addSubcommand(subcommand => subcommand
      .setName('disable')
      .setDescription('Disable the sticky message')
      .addChannelOption(option => option
        .setName('channel')
        .setDescription('Specify the channel for disable sticky message.')
        .addChannelTypes(ChannelType.GuildText)
      )
    )
    .addSubcommand(subcommand => subcommand
      .setName('clear')
      .setDescription('Clear all the sticky messages in the server.')
    ) as SlashCommandBuilder
}

export default StickyCommand