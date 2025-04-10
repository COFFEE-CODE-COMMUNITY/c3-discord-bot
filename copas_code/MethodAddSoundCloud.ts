private async addTracksFromSoundCloud(url: URL) {
  this.logger.silly(url.toString())

  const validated = await playdl.validate(url.toString())

  if (validated === 'search') {
    throw new DiscordReplyException({
      content: 'SoundCloud search URLs are not supported. Use direct track or playlist URLs.',
      flags: 'Ephemeral'
    })
  }

  try {
    if (validated === 'track') {
      const track = await playdl.soundcloud(url.toString())
      this.logger.debug(`Adding SoundCloud track: ${track.name}`)
      this.musics.push(new YouTubeAudioSource(this.player, url.toString())) // You might want a SoundCloudAudioSource if needed
    } else if (validated === 'playlist') {
      const playlist = await playdl.soundcloud_playlist(url.toString())
      for (const track of playlist.tracks) {
        this.logger.debug(`Adding SoundCloud playlist track: ${track.name}`)
        this.musics.push(new YouTubeAudioSource(this.player, track.url)) // You might want a SoundCloudAudioSource if needed
      }
    } else {
      throw new DiscordReplyException({
        content: 'Invalid SoundCloud URL.',
        flags: 'Ephemeral'
      })
    }
  } catch (error: any) {
    this.logger.warn(error.message)
    throw new DiscordReplyException({
      content: 'Failed to process SoundCloud URL.',
      flags: 'Ephemeral'
    })
  }
}
