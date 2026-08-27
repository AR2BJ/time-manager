import { STORAGE_KEY, loadFromStorage } from "@/models/storage.model.js";
import { TIME_MANAGER_EVENTS, eventBus } from "./event-bus.service.js";

import { SoundModel } from "@/models/sound.model.js";
import { StateManager } from "@/models/state.model.js";

class StoreService {
  constructor() {
    this.cacheKey = STORAGE_KEY;
    this.lastRaw = "";
    this.initCache();
    this.listenToStorage();
  }

  initCache() {
    this.lastRaw = localStorage.getItem(this.cacheKey) || "";
  }

  listenToStorage() {
    window.addEventListener("storage", (e) => {
      if (e.key === this.cacheKey) {
        this.lastRaw = e.newValue || "";
        this.notifyChanges();
      }
    });

    setInterval(() => {
      const currentRaw = localStorage.getItem(this.cacheKey) || "";
      if (currentRaw !== this.lastRaw) {
        this.lastRaw = currentRaw;
        this.notifyChanges();
      }
    }, 300);
  }

  notifyChanges() {
    const updatedData = loadFromStorage();
    if (!updatedData) return;

    if (typeof StateManager?.init === "function") {
      StateManager.init();
    }

    const settings = updatedData.settings || {};

    if (settings.currentSoundId !== undefined) {
      SoundModel.setSoundTrack(settings.currentSoundId);
    }

    eventBus.emit(TIME_MANAGER_EVENTS.TASKS_CHANGED, updatedData.tasks || []);
    eventBus.emit(TIME_MANAGER_EVENTS.NOTES_CHANGED, updatedData.notes || []);
    eventBus.emit(
      TIME_MANAGER_EVENTS.SESSIONS_CHANGED,
      updatedData.sessions || [],
    );
    eventBus.emit(TIME_MANAGER_EVENTS.SETTINGS_CHANGED, settings);
    eventBus.emit(TIME_MANAGER_EVENTS.TIMER_CHANGED, updatedData.timer || {});

    eventBus.emit(TIME_MANAGER_EVENTS.SOUND_CHANGED, {
      currentSoundId: settings.currentSoundId || "none",
      volume: settings.volume ?? 50,
      soundState: SoundModel.getState(),
    });
    eventBus.emit(
      TIME_MANAGER_EVENTS.SOUND_TRACK_CHANGED,
      settings.currentSoundId || "none",
    );
    eventBus.emit(
      TIME_MANAGER_EVENTS.SOUND_VOLUME_CHANGED,
      settings.volume ?? 50,
    );

    eventBus.emit(TIME_MANAGER_EVENTS.STORE_CHANGED, updatedData);
  }
}

export const store = new StoreService();
