import { StateManager, state } from "./state.model.js";

import { SoundModel } from "./sound.model.js";

export const store = {
  // 🟢 Tasks
  get tasks() {
    return state.tasks || [];
  },
  set tasks(value) {
    state.tasks = Array.isArray(value) ? value : [];
    StateManager.save();
    StateManager.notify();
  },

  // 🟢 Sound (به جای Tags)
  get sound() {
    return SoundModel.getState();
  },
  set sound(value) {
    if (typeof value === "object" && value !== null) {
      if (value.currentSoundId !== undefined) {
        SoundModel.setSoundTrack(value.currentSoundId);
      }
      if (value.volume !== undefined) {
        SoundModel.setVolume(value.volume);
      }
    }
  },

  // 🟢 Notes
  get notes() {
    return state.notes || [];
  },
  set notes(value) {
    state.notes = Array.isArray(value) ? value : [];
    StateManager.save();
    StateManager.notify();
  },

  // 🟢 Sessions (Pomodoro / Flow Logs)
  get sessions() {
    return state.sessions || [];
  },
  set sessions(value) {
    state.sessions = Array.isArray(value) ? value : [];
    StateManager.save();
    StateManager.notify();
  },

  // 🟢 Settings
  get settings() {
    return state.settings || {};
  },
  set settings(value) {
    if (typeof value === "object" && value !== null) {
      StateManager.updateSettings(value);
    }
  },

  // 🟢 Timer State
  get timer() {
    return state.timer || {};
  },
  set timer(value) {
    if (typeof value === "object" && value !== null) {
      StateManager.updateTimerState(value);
    }
  },

  // 🟢 Raw State Access
  get rawState() {
    return StateManager.getState();
  },
};
