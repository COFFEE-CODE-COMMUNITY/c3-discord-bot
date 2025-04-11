import CommandHandler from "../../abstracts/CommandHandler"
import { injectable } from "inversify"
import { ChatInputCommandInteraction, GuildMember, VoiceChannel } from "discord.js"
import VoiceManager from "../../voice/VoiceManager"
import MusicPlayer from "../../music/MusicPlayer"

@injectable()
class PlayMusicHandler extends CommandHandler {
  public prefix: string[] = ["music", "play"]

  public constructor(private readonly voiceManager: VoiceManager) {
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

    let musicPlayer: MusicPlayer

    if (!this.voiceManager.hasConnection(voiceChannel.guildId)) {
      musicPlayer = new MusicPlayer({
        guildId: voiceChannel.guildId,
        channelId: voiceChannel.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator
      })

      this.voiceManager.setConnection(voiceChannel.guildId, musicPlayer)
    } else {
      musicPlayer = this.voiceManager.getConnection(voiceChannel.guildId)!
    }

    await musicPlayer.addTracks(query)

    musicPlayer.play()

    await interaction.reply({
      content: `Playing ${query}`,
      ephemeral: true
    })
  }
}

export default PlayMusicHandler