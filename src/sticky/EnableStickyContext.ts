import { injectable } from "inversify"


/**
 * Context for enabling sticky messages in a Discord channel.
 *
 * This class extends a Map to store user IDs and their corresponding channel IDs.
 */
@injectable()
class EnableStickyContext extends Map<string, string> {}

export default EnableStickyContext