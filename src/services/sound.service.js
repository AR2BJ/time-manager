import { SoundModel } from "@/models/sound.model.js";
import { StateManager } from "@/models/state.model.js";

class SoundService {
  constructor() {
    this.audioCtx = null;
    this.audioElement = null;
    this.currentTrack = null;
    this.playPromise = null;
    this.aparatMetadataCache = new Map();
  }

  init() {
    this._initAudioElement();

    const currentTrack = SoundModel.getCurrentTrack();
    if (currentTrack) {
      this.fetchCoverOnly(currentTrack);
    }
  }

  _getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  playNotificationSound(soundType) {
    const { settings } = StateManager.getState();

    const type = typeof soundType === "object" ? soundType?.value : soundType;

    if (!type || type === "none") return;

    const ctx = this._getAudioContext();
    if (!ctx) return;

    const masterVolume = (settings.volume ?? 50) / 100;
    if (masterVolume <= 0) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(masterVolume, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case "bell": {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(587.33, now);
        osc2.frequency.setValueAtTime(880, now);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.2);
        osc2.stop(now + 1.2);
        break;
      }

      case "chime": {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          gain.gain.setValueAtTime(0, now + idx * 0.08);
          gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 1.5);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 1.5);
        });
        break;
      }

      case "gong": {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(108, now + 2.5);

        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 2.5);
        break;
      }

      case "birds": {
        const chirps = [
          {
            delay: 0.0,
            startFreq: 2600,
            maxFreq: 4600,
            endFreq: 3100,
            duration: 0.12,
          },
          {
            delay: 0.14,
            startFreq: 3100,
            maxFreq: 5200,
            endFreq: 2400,
            duration: 0.1,
          },
          {
            delay: 0.28,
            startFreq: 3400,
            maxFreq: 4800,
            endFreq: 2800,
            duration: 0.15,
          },
        ];

        chirps.forEach(({ delay, startFreq, maxFreq, endFreq, duration }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          const startTime = now + delay;
          const midTime = startTime + duration * 0.35;
          const stopTime = startTime + duration;

          // Pitch arc contour: Fast pitch rise followed by a drop
          osc.frequency.setValueAtTime(startFreq, startTime);
          osc.frequency.exponentialRampToValueAtTime(maxFreq, midTime);
          osc.frequency.exponentialRampToValueAtTime(endFreq, stopTime);

          // Amplitude envelope: Soft attack to avoid clicks, exponential decay
          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.22, startTime + 0.008);
          gain.gain.exponentialRampToValueAtTime(0.001, stopTime);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(startTime);
          osc.stop(stopTime);
        });
        break;
      }

      default:
        break;
    }
  }

  _initAudioElement() {
    if (!this.audioElement) {
      this.audioElement = new Audio();
      // Disable looping so the 'ended' event fires properly
      this.audioElement.loop = false;

      this.audioElement.addEventListener("loadstart", () =>
        SoundModel.setLoading(true),
      );
      this.audioElement.addEventListener("waiting", () =>
        SoundModel.setLoading(true),
      );
      this.audioElement.addEventListener("canplay", () =>
        SoundModel.setLoading(false),
      );
      this.audioElement.addEventListener("playing", () => {
        SoundModel.setLoading(false);
        SoundModel.setPlaying(true);
      });

      // AUTO-ADVANCE LOGIC ON TRACK END
      this.audioElement.addEventListener("ended", async () => {
        SoundModel.setPlaying(false);
        SoundModel.setLoading(false);
        await this.playNextTrack();
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

  async playNextTrack() {
    const nextTrack = SoundModel.getNextTrack();

    if (nextTrack) {
      // Update Model state (This automatically syncs the Autocomplete & Player UI)
      SoundModel.setSoundTrack(nextTrack.id);

      // Play the newly selected track
      await this.playTrack(nextTrack);
    } else {
      await this.stopAll();
    }
  }

  async _getAparatMetaData(hash) {
    if (this.aparatMetadataCache.has(hash)) {
      return this.aparatMetadataCache.get(hash);
    }

    try {
      const response = await fetch(
        `/aparat-api/api/fa/v1/video/video/show/videohash/${hash}`,
      );
      if (!response.ok)
        throw new Error("Failed to fetch Aparat video metadata");

      const data = await response.json();
      const attributes = data?.data?.attributes;
      const fileLinks = attributes?.file_link_all;

      if (!fileLinks || !Array.isArray(fileLinks) || fileLinks.length === 0) {
        throw new Error("No media links found in Aparat response");
      }

      const selectedFileLink =
        fileLinks.find(
          (link) =>
            String(link?.profile ?? "")
              .trim()
              .toLowerCase() === "720p",
        ) ?? fileLinks[fileLinks.length - 1];

      const streamUrl = selectedFileLink?.urls?.[0];
      const coverUrl =
        attributes?.big_poster || attributes?.small_poster || null;

      if (!streamUrl) throw new Error("Direct stream URL is invalid");

      const metaData = { streamUrl, coverUrl };
      this.aparatMetadataCache.set(hash, metaData);
      return metaData;
    } catch (err) {
      console.error("Aparat Metadata Extraction Error:", err);
      return null;
    }
  }

  async fetchCoverOnly(track) {
    if (!track || track.coverUrl || track.type !== "aparat") return;

    const metaData = await this._getAparatMetaData(track.sourceId);
    if (metaData?.coverUrl) {
      track.coverUrl = metaData.coverUrl;
      SoundModel.notify();
    }
  }

  async playTrack(track) {
    if (!track || track.id === "none") {
      await this.stopAll();
      return;
    }

    this._initAudioElement();
    const isSameTrack = this.currentTrack?.id === track.id;
    const isPlaying = this.audioElement && !this.audioElement.paused;

    if (isSameTrack && isPlaying) {
      return;
    }

    const currentVol = SoundModel.getEffectiveVolume();

    if (isSameTrack && this.audioElement.src) {
      this.audioElement.volume = currentVol / 100;
      try {
        this.playPromise = this.audioElement.play();
        await this.playPromise;
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Playback resume failed:", err);
          SoundModel.setLoading(false);
        }
      } finally {
        this.playPromise = null;
      }
      return;
    }

    let mediaSourceUrl = track.sourceId;

    if (track.type === "aparat") {
      SoundModel.setLoading(true);
      const metaData = await this._getAparatMetaData(track.sourceId);

      if (!metaData || !metaData.streamUrl) {
        console.error("Could not resolve Aparat metadata.");
        SoundModel.setLoading(false);
        return;
      }

      mediaSourceUrl = metaData.streamUrl;

      if (metaData.coverUrl) {
        track.coverUrl = metaData.coverUrl;
        SoundModel.notify();
      }
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
