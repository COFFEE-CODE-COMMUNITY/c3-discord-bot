import CommandHandler from "../../abstracts/CommandHandler"
import { ChatInputCommandInteraction } from "discord.js"
import MusicContext from "../../musics/MusicContext"
import { injectable } from "inversify"

@injectable()
class ShuffleMusicHandler extends CommandHandler {
  public prefix: string[] = ["music", "shuffle"]

  public constructor(private readonly musicContext: MusicContext) {
    super()
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guildId as string

    if (this.musicContext.hasConnection(guildId)) {
      await this.musicContext.getConnection(guildId).shuffle()

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