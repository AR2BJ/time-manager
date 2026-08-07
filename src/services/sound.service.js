import { SoundModel } from "@/models/sound.model.js";

class SoundService {
  constructor() {
    this.aparatFrame = null;
    this.audioElement = null;
    this.currentTrack = null;
    this.playPromise = null;
  }

  init() {
    this._initAudioElement();
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

    const isSameTrack = this.currentTrack?.id === track.id;
    const currentVol = SoundModel.getEffectiveVolume();

    if (track.type === "aparat") {
      if (!isSameTrack) {
        await this.stopAll();
        this.currentTrack = track;
        const aparatUrl = `https://www.aparat.com/video/video/embed/videohash/${track.sourceId}/vt/frame?titleShow=false&autoplay=true`;
        if (this.aparatFrame) {
          this.aparatFrame.src = aparatUrl;
        }
      }
      SoundModel.setPlaying(true);
    } else if (track.type === "audio") {
      if (!this.audioElement) this._initAudioElement();

      // Only re-set src and reset position if switching to a new track
      if (!isSameTrack || !this.audioElement.src) {
        await this.stopAll();
        this.currentTrack = track;
        this.audioElement.src = track.sourceId;
      }

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

    if (this.currentTrack.type === "aparat") {
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

  setVolume() {
    const effectiveVol = SoundModel.getEffectiveVolume();

    if (this.audioElement) {
      this.audioElement.volume = effectiveVol / 100;
    }
  }

  getCurrentTimeData() {
    if (this.currentTrack?.type === "audio" && this.audioElement) {
      return {
        currentTime: this.audioElement.currentTime || 0,
        duration: this.audioElement.duration || 0,
      };
    }
    return { currentTime: 0, duration: 0 };
  }
}

export const soundService = new SoundService();
