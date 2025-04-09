import SpotifyService from "../../src/services/SpotifyService"

describe('SpotifyService', () => {
  let spotifyService: SpotifyService

  beforeEach(() => {
    spotifyService = new SpotifyService()
  })

  describe('playlists', () => {
    describe('getPlaylist', () => {
      it('should return a playlist', async () => {
        const playlist = await spotifyService.playlists.getPlaylistItems('0VwpqaUVJxPJEPrrl7mMWx', undefined, undefined, undefined, 100)
        expect(playlist).toBeDefined()
      })
    })
  })
})