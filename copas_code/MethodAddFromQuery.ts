private async addTracksFromQuery(query: string) {
  this.logger.silly(`Searching YouTube for query: ${query}`)

  try {
    const results = await playdl.search(query, {
      source: { youtube: 'video' },
      limit: 1
    })

    if (!results.length) {
      throw new DiscordReplyException({
        content: 'No results found on YouTube.',
        flags: 'Ephemeral'
      })
    }

    const track = results[0]
    this.logger.debug(`Found YouTube video: ${track.title} - ${track.url}`)
    this.musics.push(new YouTubeAudioSource(this.player, track.url))
  } catch (error: any) {
    this.logger.warn(error.message)
    throw new DiscordReplyException({
      content: 'Failed to search YouTube.',
      flags: 'Ephemeral'
    })
  }
}
