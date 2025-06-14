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
      // 1. Fetch new invites & vanity
      [newInvites] = await Promise.all([
        guild.invites.fetch()
      ])

      const vanity = await guild.fetchVanityData().catch(() => null)
      newVanityUses = vanity?.uses ?? 0

      // 2. Cek vanity dulu
      if (newVanityUses > oldVanityUses) {
        isVanity = true
      }

      // 3. Cek invite jika bukan vanity
      if (!isVanity) {
        for (const [code, invite] of newInvites) {
          const prevUses = oldInvites.get(code)?.uses ?? 0
          const newUses = invite.uses ?? 0
          if (newUses > prevUses) {
            usedInvite = invite
            break
          }
        }
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
        `➣ Welcome      : ${member.user.toString()}\n` +
        `➣ Invite By    : vanity URL\n` +
        `➣ Total Member : ${guild.memberCount}`
      ).setColor(0x1C567A)
    } else if (usedInvite && inviter) {
      embed.setDescription(
        `➣ Welcome      : ${member.user.toString()}\n` +
        `➣ Invite By    : <@${inviter.id}>\n` +
        `➣ Total Invite : ${usedInvite.uses ?? "?"}\n` +
        `➣ Total Member : ${guild.memberCount}`
      ).setColor(0x1C567A)
    } else {
      embed.setDescription(
        `I cannot figure out who invited ${member.user.username}..\n\n` +
        `Maybe cause:\n` +
        `• Invited by : unknown\n` +
        `• Invite was deleted or expired\n\n` +
        `Total Member: ${guild.memberCount}`
      ).setColor(0x1C567A)
    }

    // 7. Send embed
    await (logChannel as TextChannel).send({ embeds: [embed] })
  }
}

export default InviteTrackerService
