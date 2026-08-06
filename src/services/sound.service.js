/**
 * Ambient Sound Streamer Service using YouTube IFrame Player API
 */
class SoundService {
  constructor() {
    this.player = null;
    this.isReady = false;
    this.currentTrackId = null;
    this.currentVolume = 50;
    this.pendingTrackId = null;
  }

  /**
   * Initializes YouTube Iframe API and creates hidden container
   */
  init() {
    if (window.YT && window.YT.Player) {
      this._createPlayer();
      return;
    }

    // Inject YouTube IFrame API script dynamically
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Global callback required by YouTube API
    window.onYouTubeIframeAPIReady = () => {
      this._createPlayer();
    };
  }

  /**
   * Creates hidden DOM element and initializes YT Player
   * @private
   */
  _createPlayer() {
    let container = document.getElementById("yt-sound-player-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "yt-sound-player-container";
      // Hide the player visually but leave it in DOM to allow streaming
      container.style.position = "absolute";
      container.style.top = "-9999px";
      container.style.left = "-9999px";
      container.style.width = "1px";
      container.style.height = "1px";
      container.style.opacity = "0";
      container.style.pointerEvents = "none";
      document.body.appendChild(container);
    }

    this.player = new window.YT.Player("yt-sound-player-container", {
      height: "1",
      width: "1",
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
      },
      events: {
        onReady: () => {
          this.isReady = true;
          this.setVolume(this.currentVolume);
          if (this.pendingTrackId) {
            this.playTrack(this.pendingTrackId);
            this.pendingTrackId = null;
          }
        },
        onError: (e) => {
          console.error("Sound Streamer Player Error:", e);
        },
      },
    });
  }

  /**
   * Plays a specific YouTube sound track by video ID
   * @param {string} youtubeId
   */
  playTrack(youtubeId) {
    if (!youtubeId) return;

    if (!this.isReady) {
      this.pendingTrackId = youtubeId;
      return;
    }

    if (this.currentTrackId === youtubeId) {
      this.player.playVideo();
    } else {
      this.currentTrackId = youtubeId;
      this.player.loadVideoById(youtubeId);
    }
  }

  /**
   * Pauses ambient audio
   */
  pause() {
    if (
      this.isReady &&
      this.player &&
      typeof this.player.pauseVideo === "function"
    ) {
      this.player.pauseVideo();
    }
  }

  /**
   * Adjusts volume (0 to 100)
   * @param {number} volume
   */
  setVolume(volume) {
    this.currentVolume = Math.max(0, Math.min(100, volume));
    if (
      this.isReady &&
      this.player &&
      typeof this.player.setVolume === "function"
    ) {
      this.player.setVolume(this.currentVolume);
    }
  }
}

export const soundService = new SoundService();
