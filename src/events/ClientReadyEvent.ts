import DiscordEventListener from "../abstracts/DiscordEventListener"
import { Client, Events, Collection, Invite, Guild } from "discord.js"
import Logger from "../infrastructures/Logger"
import StatRoleService from "../services/StatRoleService"
import config from "../infrastructures/config"
import { injectable } from "inversify"

//Global variable for invite tracker feature
export const inviteCaches = new Map<string, Collection<string, Invite>>()
export const vanityUsesCache = new Map<string, number>()
const guildId = config.get("c3.guild.id")

@injectable()
class ClientReadyEvent extends DiscordEventListener<Events.ClientReady> {
  public event = Events.ClientReady as const

  public constructor(private logger: Logger, private statRoleService : StatRoleService) {
    super()

    this.logger.setContextName(this.constructor.name)
  }

  public async execute(client: Client<true>): Promise<void> {
    this.logger.info(`Logged in as ${client.user.tag}.`)
    this.logger.info('Discord bot is ready.')

    try {
      await this.statRoleService.initialize(client)
      this.logger.info("Stats Server Ready")
    } catch (error) {
      this.logger.error(`Failed to start stats server ${error}`)
    }

    // Fetch guild langsung dari API
    let guild: Guild
    try {
      guild = await client.guilds.fetch(guildId)
    } catch (error) {
      this.logger.error(`[InviteTracker] Failed to fetch guild with ID ${guildId}: ${error}`)
      return
    }

    //Cache invites
    try {
      const invites = await guild.invites.fetch()
      inviteCaches.set(guildId, invites)
      this.logger.info(`[InviteTracker] Cached invites for guild "${guild.name}"`)
    } catch(error) {
      this.logger.warn(`[InviteTracker] Could not fetch invites for guild "${guild.name}": ${error}`)
    }

    //Cache vanity uses
    try {
      const vanity = await guild.fetchVanityData()
      vanityUsesCache.set(guildId, vanity?.uses ?? 0)
      this.logger.info(`[InviteTracker] Cached vanity URL uses: ${vanity?.uses ?? 0}`)
    } catch (error) {
      vanityUsesCache.set(guildId, 0)
      this.logger.warn(`[InviteTracker] Could not fetch vanity URL for guild "${guild.name}": ${error}`)
    }

    //Listen for invite create/delete to keep cache updated
    client.on("inviteCreate", invite => {
      const guild = invite.guild
      if (!guild) return

      const invites = inviteCaches.get(guild.id) ?? new Collection<string, Invite>()
      invites.set(invite.code, invite)
      inviteCaches.set(guild.id, invites)

      this.logger.verbose(`[InviteTracker] Invite created: ${invite.code} by ${invite.inviter?.tag}`)
    })

    client.on("inviteDelete", invite => {
      const guild = invite.guild
      if (!guild) return

      const invites = inviteCaches.get(guild.id)
      if (invites) {
        invites.delete(invite.code)
        inviteCaches.set(guild.id, invites)

        this.logger.verbose(`[InviteTracker] Invite deleted: ${invite.code}`)
      }
    })
  }
}

export default ClientReadyEvent