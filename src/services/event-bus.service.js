// src/services/event-bus.service.js

export const TIME_MANAGER_EVENTS = {
  STORE_CHANGED: "time_manager:store:changed",
  TASKS_CHANGED: "time_manager:tasks:changed",
  NOTES_CHANGED: "time_manager:notes:changed",
  SESSIONS_CHANGED: "time_manager:sessions:changed",
  SETTINGS_CHANGED: "time_manager:settings:changed",
  TIMER_CHANGED: "time_manager:timer:changed",

  SOUND_CHANGED: "time_manager:sound:changed",
  SOUND_TRACK_CHANGED: "time_manager:sound:track_changed",
  SOUND_VOLUME_CHANGED: "time_manager:sound:volume_changed",
};

class EventBusService {
  constructor() {
    this.events = {};
  }

  subscribe(event, callback) {
    if (typeof callback !== "function") return () => {};

    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);

    return () => {
      if (!this.events[event]) return;
      this.events[event] = this.events[event].filter((cb) => cb !== callback);
    };
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach((callback) => callback(data));
    }
  }

  clear(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

export const eventBus = new EventBusService();
