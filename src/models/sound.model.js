import { StateManager, state } from "./state.model.js";
import { TIME_MANAGER_EVENTS, eventBus } from "@/services/event-bus.service.js";

import { DEFAULT_TRACK_LIST } from "@/models/constants/sound.constants.json";

const defaultTrackList = DEFAULT_TRACK_LIST;

export const SOUND_STATE = {
  isPlaying: false,
  isLoading: false,
  isMuted: false,
  currentSoundId: "none",
  volume: 50,
  previousVolume: 50,
};

export const stateSound = { ...SOUND_STATE };

const listeners = new Set();

export const SoundModel = {
  init(savedSettings = { ...SOUND_STATE }) {
    stateSound.isPlaying = false;
    stateSound.isLoading = false;
    stateSound.isMuted = Boolean(savedSettings.isMuted);

    stateSound.currentSoundId = savedSettings.currentSoundId;

    stateSound.volume =
      typeof savedSettings.volume === "number" && savedSettings.volume >= 0
        ? savedSettings.volume
        : 50;
    stateSound.previousVolume = stateSound.volume > 0 ? stateSound.volume : 50;

    this.notify();
    return stateSound;
  },

  getState() {
    return stateSound;
  },

  subscribe(listener) {
    if (typeof listener === "function") {
      listeners.add(listener);
    }
    return () => listeners.delete(listener);
  },

  notify() {
    listeners.forEach((listener) => listener(stateSound));

    eventBus.emit(TIME_MANAGER_EVENTS.SOUND_CHANGED, {
      currentSoundId: stateSound.currentSoundId,
      volume: this.getEffectiveVolume(),
      stateSound: { ...stateSound },
    });
  },

  getCurrentTrack() {
    if (!stateSound.currentSoundId || stateSound.currentSoundId === "none") {
      return null;
    }

    return (
      [...defaultTrackList].find((t) => t.id === stateSound.currentSoundId) ||
      null
    );
  },

  getCurrentSoundId() {
    return stateSound.currentSoundId || "none";
  },

  getTrackList() {
    return [...defaultTrackList];
  },

  getEffectiveVolume() {
    return stateSound.isMuted ? 0 : stateSound.volume;
  },

  getNextTrack() {
    const list = [...defaultTrackList];
    if (!list || list.length === 0) return null;

    const currentIndex = list.findIndex(
      (t) => t.id === stateSound.currentSoundId,
    );

    if (currentIndex === -1) return list[0];

    const nextIndex = (currentIndex + 1) % list.length;
    return list[nextIndex];
  },

  setPlaying(isPlaying) {
    stateSound.isPlaying = Boolean(isPlaying);
    this.notify();
  },

  setLoading(isLoading) {
    stateSound.isLoading = Boolean(isLoading);
    this.notify();
  },

  setSoundTrack(soundId) {
    const targetId = soundId || "none";
    stateSound.currentSoundId = targetId;

    if (typeof StateManager?.updateSettings === "function") {
      StateManager.updateSettings({ currentSoundId: targetId });
    }

    eventBus.emit(TIME_MANAGER_EVENTS.SOUND_TRACK_CHANGED, targetId);
    this.notify();
  },

  setVolume(volume) {
    const numericVol = Math.max(0, Math.min(100, Number(volume)));
    stateSound.volume = numericVol;

    if (numericVol > 0) {
      stateSound.isMuted = false;
      stateSound.previousVolume = numericVol;
    } else {
      stateSound.isMuted = true;
    }

    if (typeof StateManager?.updateSettings === "function") {
      StateManager.updateSettings({
        volume: numericVol,
        isMuted: stateSound.isMuted,
      });
    }

    eventBus.emit(
      TIME_MANAGER_EVENTS.SOUND_VOLUME_CHANGED,
      this.getEffectiveVolume(),
    );
    this.notify();
  },

  toggleMute() {
    if (stateSound.isMuted) {
      stateSound.isMuted = false;
      stateSound.volume = stateSound.previousVolume || 50;
    } else {
      stateSound.previousVolume =
        stateSound.volume > 0 ? stateSound.volume : 50;
      stateSound.isMuted = true;
    }

    if (typeof StateManager?.updateSettings === "function") {
      StateManager.updateSettings({
        volume: stateSound.volume,
        isMuted: stateSound.isMuted,
      });
    }

    eventBus.emit(
      TIME_MANAGER_EVENTS.SOUND_VOLUME_CHANGED,
      this.getEffectiveVolume(),
    );
    this.notify();
  },

  reset() {
    Object.assign(stateSound, SOUND_STATE);

    this.setSoundTrack("none");
  },
};
