import { DeepMockProxy, mockDeep } from "jest-mock-extended"
import Database from "../../../src/infrastructures/Database"
import { ChatInputCommandInteraction } from "discord.js"
import EnableAutoDeleteMessageHandler from "../../../src/commands/auto-delete-message/EnableAutoDeleteMessageHandler"

describe('EnableAutoDeleteMessageHandler', () => {
  let databaseMock: DeepMockProxy<Database>
  let interactionMock: DeepMockProxy<ChatInputCommandInteraction>
  let handler: EnableAutoDeleteMessageHandler

  beforeEach(() => {
    databaseMock = mockDeep<Database>()
    interactionMock = mockDeep<ChatInputCommandInteraction>()
    handler = new EnableAutoDeleteMessageHandler(databaseMock)
  })

  it('should enable auto delete message for the specified channel', async () => {
    const channelId = crypto.randomUUID()

    interactionMock.guildId = crypto.randomUUID()
    interactionMock.channelId = channelId
    interactionMock.options.getChannel.mockReturnValue({ id: channelId } as any)

    await handler.handle(interactionMock)

    expect(databaseMock.autoDeleteMessage.create).toHaveBeenCalledWith({
      data: {
        guildId: interactionMock.guildId,
        channelId
      }
    })
    expect(interactionMock.reply).toHaveBeenCalledWith({
      content: `Auto delete message enabled for <#${channelId}>`,
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