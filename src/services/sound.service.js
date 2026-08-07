import { SoundModel } from "@/models/sound.model.js";

class SoundService {
  constructor() {
    this.ytPlayer = null;
    this.aparatFrame = null;
    this.audioElement = null;
    this.isYtReady = false;
    this.currentTrack = null;
    this.pendingTrack = null;
    this.playPromise = null;
  }

  init() {
    this._initAudioElement();
    this._initYouTubeAPI();
    this._initAparatContainer();
  }

  _initAudioElement() {
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.loop = true;

      this.audioElement.addEventListener("ended", () => {
        SoundModel.setPlaying(false);
      });

      this.audioElement.addEventListener("pause", () => {
        if (this.currentTrack?.type === "audio") {
          SoundModel.setPlaying(false);
        }
      });

      this.audioElement.addEventListener("play", () => {
        if (this.currentTrack?.type === "audio") {
          SoundModel.setPlaying(true);
        }
      });
    }
  }

  _initYouTubeAPI() {
    if (window.YT && window.YT.Player) {
      this._createYtPlayer();
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScript = document.getElementsByTagName("script")[0];
    firstScript?.parentNode?.insertBefore(tag, firstScript);

    window.onYouTubeIframeAPIReady = () => {
      this._createYtPlayer();
    };
  }

  _createYtPlayer() {
    let container = document.getElementById("yt-sound-player-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "yt-sound-player-container";
      container.className =
        "absolute -top-[9999px] -left-[9999px] w-1 h-1 opacity-0 pointer-events-none";
      document.body.appendChild(container);
    }

    this.ytPlayer = new window.YT.Player("yt-sound-player-container", {
      height: "1",
      width: "1",
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
        modestbranding: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: () => {
          this.isYtReady = true;
          if (this.pendingTrack && this.pendingTrack.type === "youtube") {
            this.playTrack(this.pendingTrack);
            this.pendingTrack = null;
          }
        },
        onStateChange: (event) => {
          if (window.YT && window.YT.PlayerState) {
            if (event.data === window.YT.PlayerState.PLAYING) {
              SoundModel.setPlaying(true);
            } else if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.ENDED
            ) {
              SoundModel.setPlaying(false);
            }
          }
        },
      },
    });
  }

  _initAparatContainer() {
    let iframe = document.getElementById("aparat-sound-player-frame");
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "aparat-sound-player-frame";
      iframe.className =
        "absolute -top-[9999px] -left-[9999px] w-1 h-1 opacity-0 pointer-events-none";
      iframe.setAttribute("allow", "autoplay");
      document.body.appendChild(iframe);
    }
    this.aparatFrame = iframe;
  }

  async playTrack(track) {
    if (!track) return;

    await this.stopAll();

    this.currentTrack = track;
    const currentVol = SoundModel.soundState?.isMuted
      ? 0
      : (SoundModel.soundState?.volume ?? 50);

    if (track.type === "youtube") {
      if (!this.isYtReady) {
        this.pendingTrack = track;
        return;
      }
      this.ytPlayer.loadVideoById(track.sourceId);
      this.ytPlayer.setVolume(currentVol);
      this.ytPlayer.playVideo();
      SoundModel.setPlaying(true);
    } else if (track.type === "aparat") {
      const aparatUrl = `https://www.aparat.com/video/video/embed/videohash/${track.sourceId}/vt/frame?autoplay=true`;
      if (this.aparatFrame) {
        this.aparatFrame.src = aparatUrl;
      }
      SoundModel.setPlaying(true);
    } else if (track.type === "audio") {
      if (!this.audioElement) this._initAudioElement();
      this.audioElement.src = track.sourceId;
      this.audioElement.volume = currentVol / 100;

      try {
        this.playPromise = this.audioElement.play();
        await this.playPromise;
        SoundModel.setPlaying(true);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Audio playback error:", err);
        }
      } finally {
        this.playPromise = null;
      }
    }
  }

  async pause() {
    if (!this.currentTrack) return;

    if (
      this.currentTrack.type === "youtube" &&
      this.isYtReady &&
      this.ytPlayer?.pauseVideo
    ) {
      this.ytPlayer.pauseVideo();
    } else if (this.currentTrack.type === "aparat") {
      if (this.aparatFrame) this.aparatFrame.src = "";
    } else if (this.currentTrack.type === "audio" && this.audioElement) {
      if (this.playPromise) {
        try {
          await this.playPromise;
        } catch (_) {}
      }
      this.audioElement.pause();
    }

    SoundModel.setPlaying(false);
  }

  async stopAll() {
    if (this.isYtReady && this.ytPlayer?.stopVideo) {
      this.ytPlayer.stopVideo();
    }
    if (this.aparatFrame) {
      this.aparatFrame.src = "";
    }
    if (this.audioElement) {
      if (this.playPromise) {
        try {
          await this.playPromise;
        } catch (_) {}
      }
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    SoundModel.setPlaying(false);
  }

  setVolume(volume) {
    const normalizedVol = Math.max(0, Math.min(100, Number(volume)));

    if (this.isYtReady && this.ytPlayer?.setVolume) {
      this.ytPlayer.setVolume(normalizedVol);
    }
    if (this.audioElement) {
      this.audioElement.volume = normalizedVol / 100;
    }
  }

  seekTo(seconds) {
    if (this.currentTrack?.type === "audio" && this.audioElement) {
      this.audioElement.currentTime = seconds;
    } else if (
      this.currentTrack?.type === "youtube" &&
      this.isYtReady &&
      this.ytPlayer?.seekTo
    ) {
      this.ytPlayer.seekTo(seconds, true);
    }
  }

  getCurrentTimeData() {
    if (this.currentTrack?.type === "audio" && this.audioElement) {
      return {
        currentTime: this.audioElement.currentTime || 0,
        duration: this.audioElement.duration || 0,
      };
    } else if (
      this.currentTrack?.type === "youtube" &&
      this.isYtReady &&
      this.ytPlayer?.getCurrentTime
    ) {
      return {
        currentTime: this.ytPlayer.getCurrentTime() || 0,
        duration: this.ytPlayer.getDuration() || 0,
      };
    }
    return { currentTime: 0, duration: 0 };
  }
}

export const soundService = new SoundService();
