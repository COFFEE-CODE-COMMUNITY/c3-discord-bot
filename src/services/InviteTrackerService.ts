import { GuildMember, Invite, EmbedBuilder, TextChannel, Collection } from "discord.js"
import { injectable } from "inversify"
import { inviteCaches, vanityUsesCache } from "../events/ClientReadyEvent"
import Logger from "../infrastructures/Logger"

@injectable()
class InviteTrackerService {
  private logger: Logger

  public constructor(logger: Logger) {
    this.logger = logger
    this.logger.setContextName(this.constructor.name)
  }

  public async handle(member: GuildMember): Promise<void> {
    this.logger.verbose(`[InviteTracker] Handling join for: ${member.user.tag}`)
    const guild = member.guild
    const guildId = guild.id

    const oldInvites = inviteCaches.get(guildId) ?? new Collection<string, Invite>()
    const oldVanityUses = vanityUsesCache.get(guildId) ?? 0

    let usedInvite: Invite | undefined
    let isVanity = false

    let newInvites: Collection<string, Invite> = new Collection()
    let newVanityUses = oldVanityUses

    try {
      // 1. Fetch invites + vanity
      [newInvites] = await Promise.all([guild.invites.fetch()])
      const vanity = await guild.fetchVanityData().catch(() => null)
      newVanityUses = vanity?.uses ?? 0

      // 2. Cek vanity
      if (newVanityUses > oldVanityUses) {
        isVanity = true
      }

      // 3. Jika bukan vanity, REFRESH invites lagi langsung sebelum cek
      if (!isVanity) {
        const refreshedInvites = await guild.invites.fetch()

        this.logger.debug("===== INVITE USAGE DEBUG START =====")
        for (const [code, invite] of refreshedInvites) {
          const prevUses = oldInvites.get(code)?.uses ?? 0
          const currentUses = invite.uses ?? 0
          const inviter = invite.inviter?.tag ?? "null"
          this.logger.debug(`Invite ${code} | Before: ${prevUses} → After: ${currentUses} | By: ${inviter}`)
        }
        this.logger.debug("===== INVITE USAGE DEBUG END =====")

        for (const [code, invite] of refreshedInvites) {
          const prevUses = oldInvites.get(code)?.uses ?? 0
          const newUses = invite.uses ?? 0
          if (newUses > prevUses) {
            usedInvite = invite
            break
          }
        }

        if (!usedInvite) {
          this.logger.warn(`[InviteTracker] No invite usage increase found for ${member.user.tag}`)
        }

        // gunakan refreshed untuk update cache
        newInvites = refreshedInvites
      }
    } catch (error) {
      this.logger.warn(`[InviteTracker] Failed to fetch invites or vanity data: ${error}`)
    }

    // 4. Update cache
    inviteCaches.set(guildId, newInvites)
    vanityUsesCache.set(guildId, newVanityUses)

    // 5. Prepare log channel
    const logChannel = guild.channels.cache.get("1347587687132958720")
    if (!logChannel || !logChannel.isTextBased()) {
      this.logger.warn("[InviteTracker] Log channel is missing or not text-based.")
      return
    }

    // 6. Create embed
    const embed = new EmbedBuilder().setTitle("Invite Tracker")
    const inviter = usedInvite?.inviter

    if (isVanity) {
      embed.setDescription(
        `➣ Selamat Datang   : ${member.user.toString()}\n` +
        `➣ Status undangan  : vanity URL\n` +
        `➣ Total anggota    : ${guild.memberCount}`
      ).setColor(0x1C567A)
    } else if (usedInvite && inviter) {
      embed.setDescription(
        `➣ Selamat Datang   : ${member.user.toString()}\n` +
        `➣ Status undangan  : <@${inviter.id}>\n` +
        `➣ Total undangan   : ${usedInvite.uses ?? "?"}\n` +
        `➣ Total anggota    : ${guild.memberCount}`
      ).setColor(0x1C567A)
    } else {
      embed.setDescription(
        `Saya tidak tahu siapa mengundang ${member.user.username}..\n\n` +
        `Dikarenakan:\n` +
        `• Status undangan : tidak diketahui\n` +
        `• Undangan telah dihapus atau kadaluarsa\n\n` +
        `Total anggota: ${guild.memberCount}`
      ).setColor(0x1C567A)
    }

    // 7. Send embed
    await (logChannel as TextChannel).send({ embeds: [embed] })
  }
}

export default InviteTrackerService
