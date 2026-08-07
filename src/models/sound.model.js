import { DEFAULT_TRACK_LIST } from "@/models/constants/sound.constants.json";

const defaultTrackList = DEFAULT_TRACK_LIST;

export const soundState = {
  isPlaying: false,
  isMuted: false,
  currentSoundId: "rain-stream",
  volume: 50,
  previousVolume: 50,
  trackList: [...defaultTrackList],
};

const listeners = new Set();

export const SoundModel = {
  init(savedSettings = {}) {
    soundState.isPlaying = false;
    soundState.isMuted = false;

    soundState.volume =
      typeof savedSettings.volume === "number" && savedSettings.volume > 0
        ? savedSettings.volume
        : 50;
    soundState.previousVolume = soundState.volume;

    if (savedSettings.lastSelectedSoundId) {
      soundState.currentSoundId = savedSettings.lastSelectedSoundId;
    }

    this.notify();
    return soundState;
  },

  getState() {
    return soundState;
  },

  subscribe(listener) {
    if (typeof listener === "function") {
      listeners.add(listener);
    }
    return () => listeners.delete(listener);
  },

  notify() {
    listeners.forEach((listener) => listener(soundState));
  },

  getCurrentTrack() {
    return (
      soundState.trackList.find((t) => t.id === soundState.currentSoundId) ||
      soundState.trackList[0]
    );
  },

  getTrackList() {
    return soundState.trackList;
  },

  getEffectiveVolume() {
    return soundState.isMuted ? 0 : soundState.volume;
  },

  setPlaying(isPlaying) {
    soundState.isPlaying = Boolean(isPlaying);
    this.notify();
  },

  setSoundTrack(soundId) {
    soundState.currentSoundId = soundId;
    this.notify();
  },

  setVolume(volume) {
    const numericVol = Math.max(0, Math.min(100, Number(volume)));
    soundState.volume = numericVol;
    if (numericVol > 0) {
      soundState.isMuted = false;
      soundState.previousVolume = numericVol;
    } else {
      soundState.isMuted = true;
    }
    this.notify();
  },

  toggleMute() {
    if (soundState.isMuted) {
      soundState.isMuted = false;
      soundState.volume = soundState.previousVolume || 50;
    } else {
      soundState.previousVolume =
        soundState.volume > 0 ? soundState.volume : 50;
      soundState.isMuted = true;
    }
    this.notify();
  },
};
