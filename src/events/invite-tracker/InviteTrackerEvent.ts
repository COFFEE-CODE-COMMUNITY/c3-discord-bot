import DiscordEventListener from "../../abstracts/DiscordEventListener"
import {inviteCaches} from "../ClientReadyEvent"
import {Events} from "discord.js"
import {injectable} from "inversify"

@injectable()
class InviteTrackerEvent extends DiscordEventListener<Events.GuildMemberAdd>{
  public readonly event: Events.GuildMemberAdd

  public async execute(event: Events.GuildMemberAdd) {

  }
}

export default InviteTrackerEvent