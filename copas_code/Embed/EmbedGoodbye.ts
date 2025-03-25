import { Client, GatewayIntentBits, EmbedBuilder, TextChannel } from "discord.js";
import dotenv from "dotenv";

dotenv.config(); // Memuat variabel lingkungan dari .env

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.once("ready", () => {
  console.log(`✅ Bot siap! Login sebagai ${client.user?.tag}`);
});

client.on("guildMemberRemove", async (member) => {
  const goodbyeChannel = member.guild.channels.cache.find(
    (ch) => (ch as TextChannel).name === "goodbye"
  ) as TextChannel; // Sesuaikan dengan nama channel perpisahan

  if (!goodbyeChannel) return;

  // Membuat embed Goodbye
  const embed = new EmbedBuilder()
    .setTitle(":wave: Sayonara!")
    .setAuthor({ name: "Coffe Code Community" })
    .setDescription(
      `**${member.user.tag}** telah meninggalkan server C3.\n\n` +
      "Kami berharap yang terbaik untukmu! Jika ingin kembali, pintu kami selalu terbuka. :door::sparkles:\n\n" +
      "• Butuh bantuan atau informasi? Kunjungi website kami: [C3 Website](https://www.coffecodecommunity.com)"
    )
    .setColor(0xe74c3c) // Warna merah
    .setThumbnail(member.user.displayAvatarURL()) // Avatar user yang keluar
    .setImage("https://cdn.discordapp.com/attachments/1348339821503844493/1353752981992116375/Blue_and_White_Modern_Welcome_Banner.png?ex=67e2cc36&is=67e17ab6&hm=dcb9f125b2b0cf67206029b1fe99e5ce595407bbb8f43a7cbed8cb528124d96b&") // Ganti dengan banner perpisahan
    .setFooter({ text: "Kami berharap kita ketemu lagi! :heart:" });

  await goodbyeChannel.send({ embeds: [embed] });
});

// Jalankan bot
client.login(process.env.TOKEN);
