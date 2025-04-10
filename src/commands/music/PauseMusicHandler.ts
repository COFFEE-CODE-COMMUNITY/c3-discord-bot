import CommandHandler from "../../abstracts/CommandHandler"
import { ChatInputCommandInteraction } from "discord.js"
import MusicContext from "../../musics/MusicContext"
import { injectable } from "inversify"

@injectable()
class PauseMusicHandler extends CommandHandler {
  public prefix: string[] = ["music", "pause"]

  public constructor(private readonly musicContext: MusicContext) {
    super()
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guildId as string

    if (this.musicContext.hasConnection(guildId)) {
      await this.musicContext.getConnection(guildId).pause()

      await interaction.reply({
        content: "Paused the music.",
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

export default PauseMusicHandler