import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
// import MusicPlayerManager from '../managers/MusicPlayerManager' // atau di mana pun kamu kelola player


export const data = new SlashCommandBuilder()
  .setName('pause')
  .setDescription('Pause lagu yang sedang diputar');

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    const guildId = interaction.guildId!;
    const member = interaction.member;
    const voiceChannel = (member as any).voice?.channel;

    if (!voiceChannel) {
      await interaction.reply({ content: 'Kamu harus berada di voice channel dulu.', ephemeral: true });
      return;
    }

    const player = MusicPlayerManager.get(guildId); // pastikan kamu punya sistem penyimpanan player per guild
    if (!player) {
      await interaction.reply({ content: 'Tidak ada musik yang sedang diputar.', ephemeral: true });
      return;
    }

    await player.pause();
    await interaction.reply({ content: 'Lagu dijeda.' });
  } catch (error: any) {
    console.error(error);
    await interaction.reply({ content: error.message || 'Terjadi kesalahan saat mencoba pause.', ephemeral: true });
  }
}
