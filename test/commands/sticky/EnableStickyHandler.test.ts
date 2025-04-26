import { mock, MockProxy } from 'jest-mock-extended'
import EnableStickyContext from "../../../src/sticky/EnableStickyContext"
import EnableStickyHandler from "../../../src/commands/sticky/EnableStickyHandler"

describe('EnableStickyHandler', () => {
  let enableStickyContextMock: MockProxy<EnableStickyContext>

  beforeEach(() => {
    enableStickyContextMock = mock<EnableStickyContext>()
  })

  describe('handle', () => {
    it('should set the channel ID in the context', async () => {
      const userId = 'user-id'
      const channelId = 'channel-id'
      const interactionMock = {
        options: {
          getChannel: jest.fn().mockReturnValue({ id: channelId })
        },
        user: { id: userId },
        channelId,
        showModal: jest.fn()
      } as unknown as any

      const handler = new EnableStickyHandler(enableStickyContextMock)

      await handler.handle(interactionMock)

      expect(enableStickyContextMock.set).toHaveBeenCalledWith(userId, channelId)
      expect(interactionMock.showModal).toHaveBeenCalled()
    })
  })
})