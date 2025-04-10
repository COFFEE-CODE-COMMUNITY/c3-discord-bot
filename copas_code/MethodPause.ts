public async pause(): Promise<void> {
  if (this.player.state.status === AudioPlayerStatus.Playing) {
  this.player.pause();
  this.logger.debug('Paused current track');
} else {
  throw new DiscordReplyException({
    content: 'Tidak ada lagu yang sedang diputar.',
    flags: 'Ephemeral'
  });
}
}