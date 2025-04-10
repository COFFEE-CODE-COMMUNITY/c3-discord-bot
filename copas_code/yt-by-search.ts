private async addTrackFromYouTube(query: string) {
  this.logger.silly(query);

  // Cek apakah input adalah URL valid
  if (playdl.yt_validate(query) === 'video') {
    try {
      const info = await playdl.video_info(query);
      this.logger.debug(`Adding ${info.video_details.title} to queue`);
      this.musics.push(new YouTubeMusicSource(this.player, query));
    } catch (error: any) {
      this.logger.warn(error.message);
      throw new DiscordReplyException({
        content: 'YouTube video not found.',
        flags: 'Ephemeral'
      });
    }

  } else if (playdl.yt_validate(query) === 'playlist') {
    try {
      const playlist = await playdl.playlist_info(query, { incomplete: true });
      const videos = await playlist.all_videos();

      for (const video of videos) {
        this.logger.debug(`Adding ${video.title} to queue`);
        this.musics.push(new YouTubeMusicSource(this.player, video.url));
      }

      this.logger.info(`${videos.length} tracks added from YouTube playlist`);
    } catch (error: any) {
      this.logger.warn(error.message);
      throw new DiscordReplyException({
        content: 'YouTube playlist not found.',
        flags: 'Ephemeral'
      });
    }

  } else {
    // Asumsikan input adalah judul lagu (query pencarian)
    try {
      const results = await playdl.search(query, { source: { youtube: "video" }, limit: 1 });

      if (!results.length) {
        throw new DiscordReplyException({
          content: 'No search results found for your query.',
          flags: 'Ephemeral'
        });
      }

      const video = results[0];
      this.logger.debug(`Search result: ${video.title} (${video.url})`);
      this.musics.push(new YouTubeMusicSource(this.player, video.url));
    } catch (error: any) {
      this.logger.warn(error.message);
      throw new DiscordReplyException({
        content: 'Failed to search YouTube.',
        flags: 'Ephemeral'
      });
    }
  }
}
