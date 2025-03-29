import { InteractionReplyOptions, MessagePayload } from "discord.js"

type DiscordReplyExceptionOptions = string | MessagePayload | InteractionReplyOptions

class DiscordReplyException extends Error {
  public constructor(private options: DiscordReplyExceptionOptions) {
    super()
  }

  public getOptionsReply(): DiscordReplyExceptionOptions {
    return this.options
  }
}

export default DiscordReplyException