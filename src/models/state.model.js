import { formatDate, generateId, todayISO } from "@/utils/helpers.js";
import { loadFromStorage, saveToStorage } from "./storage.model.js";

import { NoteModel } from "./note.model.js";
import { SoundModel } from "./sound.model.js";

export const DEFAULT_SETTINGS = {
  pomodoroWorkTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  disableBreaks: false,
  flowBreakTime: 15,
  autoStartFlowBreaks: false,
  volume: 50,
  pomodoroEndSound: "none",
  breakEndSound: "none",
  currentSoundId: "none",
  notificationSound: true,
};

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
  notes: [],
  settings: { ...DEFAULT_SETTINGS },
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
      state.notes = saved.notes || [];
      state.activeTaskId = saved.activeTaskId || null;

      if (saved.settings) {
        state.settings = {
          ...DEFAULT_SETTINGS,
          ...saved.settings,
          pomodoroEndSound:
            saved.settings.pomodoroEndSound ??
            DEFAULT_SETTINGS.pomodoroEndSound,
          breakEndSound:
            saved.settings.breakEndSound ?? DEFAULT_SETTINGS.breakEndSound,
          longBreakInterval:
            Number(saved.settings.longBreakInterval) ||
            DEFAULT_SETTINGS.longBreakInterval,
        };
        SoundModel.init(state.settings);
      } else {
        SoundModel.init(DEFAULT_SETTINGS);
      }

      if (saved.timer) {
        state.timer = { ...state.timer, ...saved.timer };
      }
    } else {
      SoundModel.init(DEFAULT_SETTINGS);
    }

    const hasActiveTask = state.tasks.some(
      (t) => String(t.id) === String(state.activeTaskId),
    );
    if (!hasActiveTask) {
      const firstTask = state.tasks.find((t) => t.status !== "done");
      state.activeTaskId = firstTask ? String(firstTask.id) : null;
    }

    isInitialized = true;
    return state;
  },

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

    if (mode === "pomodoro") {
      state.timer.currentPhase = "work";
    } else if (mode === "flow") {
      state.timer.currentPhase = "work";
    }

    this.save();
    this.notify();
  },

  getTodaySessions() {
    const today = todayISO();
    return state.sessions.filter((session) => {
      const sessionDate = formatDate(session.completedAt);
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

  updateSettings(newSettings = {}) {
    state.settings = {
      ...state.settings,
      ...newSettings,
      longBreakInterval:
        Number(newSettings.longBreakInterval) ||
        state.settings.longBreakInterval ||
        4,
    };

    if (
      !state.timer.isRunning &&
      !state.timer.isPaused &&
      state.timer.currentPhase === "work"
    ) {
      const workSecs = (state.settings.pomodoroWorkTime || 25) * 60;
      state.timer.timeRemaining = workSecs;
      state.timer.duration = workSecs;
    }

    this.save();
    this.notify();
  },

  resetTimer() {
    const defaultSecs = (state.settings.pomodoroWorkTime || 25) * 60;
    state.timer.isRunning = false;
    state.timer.isPaused = false;

    if (state.activeMode === "pomodoro") {
      state.timer.timeRemaining = defaultSecs;
      state.timer.duration = defaultSecs;
      state.timer.currentPhase = "work";
    } else if (state.activeMode === "flow") {
      state.timer.flowTime = 0;
      state.timer.currentPhase = "work";
    }

    this.save();
    this.notify();
  },

  resetToDefaults() {
    state.settings = { ...DEFAULT_SETTINGS };
    state.tasks = [];
    state.sessions = [];
    state.notes = [];
    state.activeTaskId = null;
    state.activeMode = "pomodoro";

    const defaultSecs = DEFAULT_SETTINGS.pomodoroWorkTime * 60;
    state.timer = {
      isRunning: false,
      isPaused: false,
      timeRemaining: defaultSecs,
      duration: defaultSecs,
      flowTime: 0,
      pomodoroSessionCount: 0,
      currentPhase: "work",
    };

    SoundModel.reset();
    NoteModel.reset();

    this.save();
    this.notify();

    window.dispatchEvent(new CustomEvent("notesChanged"));
  },

  addSession(sessionData = {}) {
    const activeTask = state.tasks.find(
      (t) => String(t.id) === String(state.activeTaskId),
    );
    const session = {
      id: generateId(),
      taskId: sessionData.taskId || state.activeTaskId || null,
      taskTitle:
        sessionData.taskTitle ||
        (activeTask ? activeTask.title : "Untitled Session"),
      type: sessionData.type || state.activeMode,
      durationSeconds: sessionData.durationSeconds || 0,
      completedAt: todayISO(),
    };

    state.sessions.push(session);

    this.save();
    this.notify();
  },

  save() {
    const soundData = SoundModel.getCurrentTrack();
    const soundId = soundData ? soundData.id : "none";

    state.settings = {
      ...state.settings,
      currentSoundId: soundId,
      volume: SoundModel.getState().volume,
      isMuted: SoundModel.getState().isMuted,
    };

    saveToStorage({
      activeMode: state.activeMode,
      activeTaskId: state.activeTaskId,
      tasks: state.tasks,
      sessions: state.sessions,
      notes: state.notes,
      timer: state.timer,
      settings: state.settings,
    });
  },
};
