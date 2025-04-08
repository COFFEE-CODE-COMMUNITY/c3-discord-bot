import { mock } from "jest-mock-extended"
import { Container } from "inversify"
import Logger from "../../src/infrastructures/Logger"
import SpotifyService from "../../src/services/SpotifyService"

const containerMock = mock<Container>()
  .get.mockImplementation(clazz => {
    if (clazz instanceof Logger) {
      return new Logger()
    } else if (clazz instanceof SpotifyService) {
      return new SpotifyService()
    }
  })

jest.mock('../../src/infrastructures/container', () => containerMock)

describe('MusicPlayer', () => {

})