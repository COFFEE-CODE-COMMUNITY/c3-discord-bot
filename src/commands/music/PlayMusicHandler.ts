import CommandHandler from "../../abstracts/CommandHandler"
import { injectable } from "inversify"
import { ChatInputCommandInteraction, GuildMember } from "discord.js"
import MusicContext from "../../musics/MusicContext"

@injectable()
class PlayMusicHandler extends CommandHandler {
  public prefix: string[] = ["music", "play"]

  public constructor(private readonly musicContext: MusicContext) {
    super()
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const query = interaction.options.getString('query')!
    const voiceChannel = (interaction.member as GuildMember).voice.channel

    this.musicContext.createConnection({
      channelId: voiceChannel?.id!,
      guildId: voiceChannel?.guildId!,
      adapterCreator: voiceChannel?.guild.voiceAdapterCreator!
    })

    const musicPlayer = this.musicContext.getConnection(voiceChannel?.guildId!)
    await musicPlayer.addTrack(query)
    await musicPlayer.play()

    await interaction.reply({
      content: `Playing ${query}`,
      ephemeral: true
    })
  }
}

export default PlayMusicHandler