import { SoundModel } from "@/models/sound.model.js";

class SoundService {
  constructor() {
    this.audioElement = null;
    this.currentTrack = null;
    this.playPromise = null;
    this.aparatUrlCache = new Map();
  }

  init() {
    this._initAudioElement();
  }

  _initAudioElement() {
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.loop = true;

      // Event Listeners for buffering & loading states
      this.audioElement.addEventListener("loadstart", () => {
        SoundModel.setLoading(true);
      });

      this.audioElement.addEventListener("waiting", () => {
        SoundModel.setLoading(true);
      });

      this.audioElement.addEventListener("canplay", () => {
        SoundModel.setLoading(false);
      });

      this.audioElement.addEventListener("playing", () => {
        SoundModel.setLoading(false);
        SoundModel.setPlaying(true);
      });

      this.audioElement.addEventListener("ended", () => {
        SoundModel.setPlaying(false);
        SoundModel.setLoading(false);
      });

      this.audioElement.addEventListener("pause", () => {
        SoundModel.setPlaying(false);
        SoundModel.setLoading(false);
      });

      this.audioElement.addEventListener("error", (e) => {
        console.error("Audio playback error:", e);
        SoundModel.setPlaying(false);
        SoundModel.setLoading(false);
      });
    }
  }

  async _getAparatDirectUrl(hash) {
    if (this.aparatUrlCache.has(hash)) {
      return this.aparatUrlCache.get(hash);
    }

    try {
      const response = await fetch(
        `/aparat-api/api/fa/v1/video/video/show/videohash/${hash}`,
      );
      if (!response.ok)
        throw new Error("Failed to fetch Aparat video metadata");

      const data = await response.json();
      const fileLinks = data?.data?.attributes?.file_link_all;

      if (!fileLinks || !Array.isArray(fileLinks) || fileLinks.length === 0) {
        throw new Error("No media links found in Aparat response");
      }

      // Pick low-tier stream URL (e.g., 240p/360p) to optimize initial buffer time
      const directUrl = fileLinks[0]?.urls?.[0];

      if (!directUrl) throw new Error("Direct stream URL is invalid");

      this.aparatUrlCache.set(hash, directUrl);
      return directUrl;
    } catch (err) {
      console.error("Aparat URL Extraction Error:", err);
      return null;
    }
  }

  async playTrack(track) {
    if (!track) return;

    this._initAudioElement();
    const isSameTrack = this.currentTrack?.id === track.id;
    const currentVol = SoundModel.getEffectiveVolume();

    let mediaSourceUrl = track.sourceId;

    if (track.type === "aparat") {
      SoundModel.setLoading(true);
      const directUrl = await this._getAparatDirectUrl(track.sourceId);
      if (!directUrl) {
        console.error("Could not resolve Aparat direct audio stream.");
        SoundModel.setLoading(false);
        return;
      }
      mediaSourceUrl = directUrl;
    }

    if (!isSameTrack || this.audioElement.src !== mediaSourceUrl) {
      await this.stopAll();
      this.currentTrack = track;
      SoundModel.setLoading(true);
      this.audioElement.src = mediaSourceUrl;
    }

    this.audioElement.volume = currentVol / 100;

    try {
      this.playPromise = this.audioElement.play();
      await this.playPromise;
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Playback execution failed:", err);
        SoundModel.setLoading(false);
      }
    } finally {
      this.playPromise = null;
    }
  }

  async pause() {
    if (this.audioElement) {
      if (this.playPromise) {
        try {
          await this.playPromise;
        } catch (_) {}
      }
      this.audioElement.pause();
    }
    SoundModel.setPlaying(false);
    SoundModel.setLoading(false);
  }

  async stopAll() {
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
    SoundModel.setLoading(false);
  }

  setVolume() {
    const effectiveVol = SoundModel.getEffectiveVolume();
    if (this.audioElement) {
      this.audioElement.volume = effectiveVol / 100;
    }
  }

  getCurrentTimeData() {
    if (this.audioElement) {
      return {
        currentTime: this.audioElement.currentTime || 0,
        duration: this.audioElement.duration || 0,
      };
    }
    return { currentTime: 0, duration: 0 };
  }
}

export const soundService = new SoundService();
