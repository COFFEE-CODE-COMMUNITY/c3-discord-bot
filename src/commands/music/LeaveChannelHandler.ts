import { ChatInputCommandInteraction } from "discord.js"
import VoiceManager from '../../voice/VoiceManager'
import CommandHandler from "../../abstracts/CommandHandler"
import { injectable } from "inversify"
import Logger from "../../infrastructures/Logger"

@injectable()
class LeaveChannelHandler extends CommandHandler {
  public prefix: string[] = ["music", "leave"]

  public constructor(private readonly musicContext: VoiceManager, private logger: Logger) {
    super()

    this.logger.setContextName(this.constructor.name)
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guildId as string

    if (this.musicContext.hasConnection(guildId)) {
      this.logger.debug(`Leaving voice channel on ${guildId} guild`)

      this.musicContext.deleteConnection(guildId)

      await interaction.reply({
        content: "Left the voice channel.",
        flags: "Ephemeral"
      })
    } else {
      await interaction.reply({
        content: "I am not in a voice channel.",
        flags: "Ephemeral"
      })
    }
  }
}

export default LeaveChannelHandler