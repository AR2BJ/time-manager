import { DEFAULT_TRACK_LIST } from "@/models/constants/sound.constants.json";

const STORAGE_KEY_SELECTED_TRACK = "app_selected_sound_id";
const defaultTrackList = DEFAULT_TRACK_LIST;

const getPersistedTrackId = () => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem(STORAGE_KEY_SELECTED_TRACK);
    }
  } catch (e) {
    console.warn("LocalStorage access denied or unavailable:", e);
  }
  return null;
};

export const soundState = {
  isPlaying: false,
  isLoading: false,
  isMuted: false,
  currentSoundId: "none",
  volume: 50,
  previousVolume: 50,
  trackList: [...defaultTrackList],
};

const listeners = new Set();

export const SoundModel = {
  init(savedSettings = {}) {
    soundState.isPlaying = false;
    soundState.isLoading = false;
    soundState.isMuted = false;

    const savedTrackId = getPersistedTrackId();
    if (savedTrackId) {
      soundState.currentSoundId = savedTrackId;
    } else if (savedSettings.lastSelectedSoundId) {
      soundState.currentSoundId = savedSettings.lastSelectedSoundId;
    } else {
      soundState.currentSoundId = defaultTrackList[0]?.id || "none";
    }

    soundState.volume =
      typeof savedSettings.volume === "number" && savedSettings.volume > 0
        ? savedSettings.volume
        : 50;
    soundState.previousVolume = soundState.volume;

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
    if (!soundState.currentSoundId || soundState.currentSoundId === "none") {
      return null;
    }

    const foundTrack = soundState.trackList.find(
      (t) => t.id === soundState.currentSoundId,
    );

    return foundTrack || null;
  },

  getCurrentSoundId() {
    return soundState.currentSoundId || "none";
  },

  getTrackList() {
    return soundState.trackList;
  },

  getEffectiveVolume() {
    return soundState.isMuted ? 0 : soundState.volume;
  },

  getNextTrack() {
    const list = soundState.trackList;
    if (!list || list.length === 0) return null;

    const currentIndex = list.findIndex(
      (t) => t.id === soundState.currentSoundId,
    );

    if (currentIndex === -1) return list[0];

    const nextIndex = (currentIndex + 1) % list.length;
    return list[nextIndex];
  },

  setPlaying(isPlaying) {
    soundState.isPlaying = Boolean(isPlaying);
    this.notify();
  },

  setLoading(isLoading) {
    soundState.isLoading = Boolean(isLoading);
    this.notify();
  },

  setSoundTrack(soundId) {
    const targetId = soundId || "none";
    soundState.currentSoundId = targetId;

    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(STORAGE_KEY_SELECTED_TRACK, targetId);
      }
    } catch (e) {
      console.warn("Failed to save track to LocalStorage:", e);
    }
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
