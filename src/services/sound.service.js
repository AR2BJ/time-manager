// src/services/sound.service.js
import { SoundModel } from "@/models/sound.model.js";

class SoundService {
  constructor() {
    this.ytPlayer = null;
    this.aparatFrame = null;
    this.audioElement = null;
    this.isYtReady = false;
    this.currentTrack = null;
    this.pendingTrack = null;
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

    // src/services/sound.service.js

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
        onError: (event) => {
          console.warn("YouTube Player Warning/Error code:", event.data);
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

  playTrack(track) {
    if (!track) return;
    this.stopAll();

    this.currentTrack = track;

    if (track.type === "youtube") {
      if (!this.isYtReady) {
        this.pendingTrack = track;
        return;
      }
      this.ytPlayer.loadVideoById(track.sourceId);
      this.ytPlayer.setVolume(
        SoundModel.getCurrentTrack() ? SoundModel.soundState?.volume || 50 : 50,
      );
      this.ytPlayer.playVideo();
    } else if (track.type === "aparat") {
      const aparatUrl = `https://www.aparat.com/video/video/embed/videohash/${track.sourceId}/vt/frame?autoplay=true`;
      this.aparatFrame.src = aparatUrl;
    } else if (track.type === "audio") {
      this.audioElement.src = track.sourceId;
      this.audioElement.volume = (SoundModel.soundState?.volume || 50) / 100;
      this.audioElement.play();
    }

    SoundModel.setPlaying(true);
  }

  pause() {
    if (!this.currentTrack) return;

    if (
      this.currentTrack.type === "youtube" &&
      this.isYtReady &&
      this.ytPlayer.pauseVideo
    ) {
      this.ytPlayer.pauseVideo();
    } else if (this.currentTrack.type === "aparat") {
      this.aparatFrame.src = "";
    } else if (this.currentTrack.type === "audio") {
      this.audioElement.pause();
    }

    SoundModel.setPlaying(false);
  }

  stopAll() {
    if (this.isYtReady && this.ytPlayer?.stopVideo) {
      this.ytPlayer.stopVideo();
    }
    if (this.aparatFrame) {
      this.aparatFrame.src = "";
    }
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    SoundModel.setPlaying(false);
  }

  setVolume(volume) {
    const normalizedVol = Math.max(0, Math.min(100, volume));

    if (this.isYtReady && this.ytPlayer?.setVolume) {
      this.ytPlayer.setVolume(normalizedVol);
    }
    if (this.audioElement) {
      this.audioElement.volume = normalizedVol / 100;
    }
  }
}

export const soundService = new SoundService();
