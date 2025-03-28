import {
  SlashCommandBuilder
} from "discord.js"

abstract class DiscordSlashCommand {
  public isC3Only: boolean = false
  public abstract slashCommand: SlashCommandBuilder
}

export default DiscordSlashCommand