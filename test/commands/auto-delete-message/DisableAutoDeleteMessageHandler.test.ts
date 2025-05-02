import { ChatInputCommandInteraction } from "discord.js"
import { DeepMockProxy, mockDeep } from "jest-mock-extended"
import DisableAutoDeleteMessageHandler from "../../../src/commands/auto-delete-message/DisableAutoDeleteMessageHandler"
import Database from "../../../src/infrastructures/Database"

describe('DisableAutoDeleteMessageHandler', () => {
  let databaseMock: DeepMockProxy<Database>
  let interactionMock: DeepMockProxy<ChatInputCommandInteraction>
  let handler: DisableAutoDeleteMessageHandler

  beforeEach(() => {
    databaseMock = mockDeep<Database>()
    interactionMock = mockDeep<ChatInputCommandInteraction>()
    handler = new DisableAutoDeleteMessageHandler(databaseMock)
  })

  it('should disable auto delete message for the specified channel', async () => {
    const channelId = crypto.randomUUID()

    interactionMock.guildId = crypto.randomUUID()
    interactionMock.channelId = channelId
    interactionMock.options.getChannel.mockReturnValue({ id: channelId } as any)

    await handler.handle(interactionMock)

    expect(databaseMock.autoDeleteMessage.delete).toHaveBeenCalledWith({
      where: {
        channelId
      }
    })
    expect(interactionMock.reply).toHaveBeenCalledWith({
      content: `Auto delete message disabled for <#${channelId}>`,
      flags: "Ephemeral"
    })
  })

  it('should reply with an error message if channel ID is invalid', async () => {
    // @ts-ignore
    interactionMock.channelId = null

    await handler.handle(interactionMock)

    expect(interactionMock.reply).toHaveBeenCalledWith({
      content: 'Invalid channel or guild ID.',
      flags: "Ephemeral"
    })
  })
})