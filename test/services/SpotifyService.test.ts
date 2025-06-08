import SpotifyService from "../../src/services/SpotifyService"
import { writeFileSync } from "fs"

describe('SpotifyService', () => {
  let spotifyService: SpotifyService

  beforeEach(() => {
    spotifyService = new SpotifyService()
  })

  describe('playlists', () => {
    describe('getPlaylist', () => {
      it('should return a playlist', async () => {
        const playlist1 = await spotifyService.playlists.getPlaylistItems('0VwpqaUVJxPJEPrrl7mMWx', undefined, undefined, undefined, undefined)
        const playlist2 = await spotifyService.playlists.getPlaylistItems('0VwpqaUVJxPJEPrrl7mMWx', undefined, undefined, undefined, 100)
        const tracks = playlist1.items.concat(playlist2.items).map(item => item.track).map(item => ({
          name: item.name,
          artists: item.artists.map(artist => artist.name),
          album: item.album.name,
        }))

        writeFileSync('calm.json', JSON.stringify(tracks, null, 2))
        // expect(playlist).toBeDefined()
      })
    })
  })
})