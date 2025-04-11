import CommandHandler from "../../abstracts/CommandHandler"
import { ChatInputCommandInteraction } from "discord.js"
import VoiceManager from "../../voice/VoiceManager"
import { injectable } from "inversify"
import MusicPlayer from "../../music/MusicPlayer"

@injectable()
class ShuffleMusicHandler extends CommandHandler {
  public prefix: string[] = ["music", "shuffle"]

  public constructor(private readonly musicContext: VoiceManager) {
    super()
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guildId as string
    const musicPlayer = this.musicContext.getConnection<MusicPlayer>(guildId)

    if (musicPlayer) {
      musicPlayer.shuffle()

      await interaction.reply({
        content: "Music has been shuffled successfully.",
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

export default ShuffleMusicHandler