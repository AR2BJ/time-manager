import { loadFromStorage, saveToStorage } from "./storage.model.js";

import { SoundModel } from "./sound.model.js";

export const state = {
  currentView: "timer",
  activeTaskId: null,
  activeMode: "pomodoro",
  timer: {
    isRunning: false,
    isPaused: false,
    timeRemaining: 25 * 60,
    duration: 25 * 60,
    flowTime: 0,
    pomodoroSessionCount: 0,
    currentPhase: "work",
  },
  tasks: [],
  sessions: [],
  settings: {
    pomodoroWorkTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    notificationSound: true,
  },
};

const listeners = new Set();
let isInitialized = false;

export const StateManager = {
  init() {
    if (isInitialized) return state;

    const saved = loadFromStorage();
    if (saved) {
      state.activeMode = saved.activeMode || "pomodoro";
      state.tasks = saved.tasks || [];
      state.sessions = saved.sessions || [];

      if (saved.settings) {
        state.settings = { ...state.settings, ...saved.settings };
        SoundModel.init(saved.settings);
      }
      if (saved.timer) {
        state.timer = { ...state.timer, ...saved.timer };
      }
    } else {
      SoundModel.init({});
    }

    const firstTask = state.tasks.find((t) => t.status !== "done");
    if (firstTask) {
      state.activeTaskId = firstTask.id;
    }

    isInitialized = true;
    return state;
  },

  // Safe State Getter method without triggering notifications
  getState() {
    return state;
  },

  subscribe(listener) {
    if (typeof listener === "function") {
      listeners.add(listener);
    }
    return () => listeners.delete(listener);
  },

  notify() {
    listeners.forEach((listener) => listener(state));
  },

  setView(view) {
    state.currentView = view;
    this.notify();
  },

  setMode(mode) {
    if (state.activeMode === mode) return;
    state.activeMode = mode;
    this.save();
    this.notify();
  },

  getTodaySessions() {
    const today = new Date().toISOString().split("T")[0];
    return state.sessions.filter((session) => {
      const sessionDate = new Date(session.completedAt)
        .toISOString()
        .split("T")[0];
      return sessionDate === today;
    });
  },

  getTodayOverview() {
    const todaySessions = this.getTodaySessions();
    const sessionsDone = todaySessions.length;
    const totalSeconds = todaySessions.reduce(
      (acc, s) => acc + (s.durationSeconds || 0),
      0,
    );
    const totalMinutes = Math.round(totalSeconds / 60);

    return { sessionsDone, totalMinutes };
  },

  updateTimerState(newTimerState) {
    state.timer = { ...state.timer, ...newTimerState };
    this.save();
    this.notify();
  },

  resetTimer() {
    const defaultSecs = state.settings.pomodoroWorkTime * 60;
    state.timer.isRunning = false;
    state.timer.isPaused = false;

    if (state.activeMode === "pomodoro") {
      state.timer.timeRemaining = defaultSecs;
      state.timer.duration = defaultSecs;
      state.timer.currentPhase = "work";
    } else {
      state.timer.flowTime = 0;
    }

    this.save();
    this.notify();
  },

  addSession(sessionData = {}) {
    const activeTask = state.tasks.find((t) => t.id === state.activeTaskId);
    const session = {
      id: crypto.randomUUID(),
      taskId: sessionData.taskId || state.activeTaskId || null,
      taskTitle:
        sessionData.taskTitle ||
        (activeTask ? activeTask.title : "Untitled Session"),
      type: sessionData.type || state.activeMode,
      durationSeconds: sessionData.durationSeconds || 0,
      completedAt: new Date().toISOString(),
    };

    state.sessions.unshift(session);

    if (session.taskId) {
      const task = state.tasks.find((t) => t.id === session.taskId);
      if (task) {
        task.completedPomodoros += 1;
      }
    }

    this.save();
    this.notify();
  },

  save() {
    const soundData = SoundModel.getCurrentTrack();
    saveToStorage({
      activeMode: state.activeMode,
      tasks: state.tasks,
      sessions: state.sessions,
      timer: state.timer,
      settings: {
        ...state.settings,
        lastSelectedSoundId: soundData ? soundData.id : "rain-forest",
      },
    });
  },
};
