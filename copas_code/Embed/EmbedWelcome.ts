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

client.on("guildMemberAdd", async (member) => {
  const welcomeChannel = member.guild.channels.cache.find(
    (ch) => (ch as TextChannel).name === "welcome"
  ) as TextChannel; // Sesuaikan dengan nama channel selamat datang

  if (!welcomeChannel) return;

  // Membuat embed
  const embed = new EmbedBuilder()
    .setTitle("C3")
    .setAuthor({ name: "Coffe Code Community" })
    .setDescription(
      `Welcome ${member.toString()}\n\n` +
      "*Hai, Hai! Selamat Datang di C3*\n\n" + // Italic style
      "Halo untuk kamu yang baru bergabung! Kami senang bisa menyambutmu di sini.\n\n" +
      "Di komunitas ini, kamu akan menemukan berbagai informasi menarik seputar C3 " +
      "yang bisa membantu kamu lebih memahami tentang komunitas ini.\n\n" +
      "• Mau tahu lebih banyak soal C3? Cek di <#1289860748448759857>\n" +
      "• Punya ide keren atau masukan? Langsung tulis di <#1347594181752786995>"
    )
    .setColor(0x3498db) // Warna biru
    .setImage("https://cdn.discordapp.com/attachments/1348339821503844493/1353752979869536277/Blue_and_White_Modern_Welcome_Banner_1.png?ex=67e2cc35&is=67e17ab5&hm=c148774cc63803419d5eef179779f87a9aae414876bcbbc3adbed796a2d4ba7c&") // Ganti dengan URL banner welcome
    .setFooter({ text: "Copyright© 2024 Coffe Code Community" });

  await welcomeChannel.send({ embeds: [embed] });
});

// Jalankan bot
client.login(process.env.TOKEN);
