import CommandHandler from "../../abstracts/CommandHandler"
import { injectable } from "inversify"
import { ChatInputCommandInteraction, GuildMember, VoiceChannel } from "discord.js"
import MusicContext from "../../musics/MusicContext"

@injectable()
class PlayMusicHandler extends CommandHandler {
  public prefix: string[] = ["music", "play"]

  public constructor(private readonly musicContext: MusicContext) {
    super()
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const query = interaction.options.getString('query')!
    const channel = interaction.options.getChannel('channel') as VoiceChannel

    const userChannel = (interaction.member as GuildMember).voice.channel as VoiceChannel
    const voiceChannel = channel ?? userChannel

    if (!voiceChannel) {
      await interaction.reply({
        content: "You must be in a voice channel to play music.",
        flags: 'Ephemeral'
      })

      return
    }

    if (!this.musicContext.hasConnection(voiceChannel.guildId)) {
      this.musicContext.createConnection({
        channelId: voiceChannel?.id!,
        guildId: voiceChannel?.guildId!,
        adapterCreator: voiceChannel?.guild.voiceAdapterCreator!
      })
    }

    const musicPlayer = this.musicContext.getConnection(voiceChannel?.guildId!)
    await musicPlayer.addTracks(query)
    await musicPlayer.play()

    await interaction.reply({
      content: `Playing ${query}`,
      ephemeral: true
    })
  }
}

export default PlayMusicHandler