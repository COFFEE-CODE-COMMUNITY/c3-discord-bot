import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder
} from "discord.js"

abstract class DiscordSlashCommand {
  public isC3Only: boolean = false
  public abstract options: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder
  public abstract execute(interaction: ChatInputCommandInteraction): void | Promise<void>
}

export default DiscordSlashCommand