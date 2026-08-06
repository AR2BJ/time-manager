import { loadFromStorage, saveToStorage } from "./storage.model.js";

export const defaultTrackList = [
  {
    id: "rain-forest",
    title: "Rain & Forest Stream (10 Hours)",
    type: "youtube",
    youtubeId: "mPZkdNFkNps",
  },
  {
    id: "brown-noise",
    title: "Pure Brown Noise (No Loop)",
    type: "youtube",
    youtubeId: "RqzGzwTY-6w",
  },
  {
    id: "fireplace",
    title: "Fireplace Crackle",
    type: "youtube",
    youtubeId: "L_LUpnjgPso",
  },
];

export const state = {
  // Navigation Views: 'timer' | 'history' | 'analytics' | 'settings'
  currentView: "timer",

  // Selected Active Task for Focus Session
  activeTaskId: null,

  // Active Timer Mode: 'pomodoro' | 'flow'
  activeMode: "pomodoro",

  // Core Timer State
  timer: {
    isRunning: false,
    isPaused: false,
    timeRemaining: 25 * 60, // seconds for Pomodoro
    duration: 25 * 60, // total duration in seconds for progress ring/bar
    flowTime: 0, // elapsed time in Flow Mode (seconds)
    pomodoroSessionCount: 0,
    currentPhase: "work", // 'work' | 'shortBreak' | 'longBreak'
  },

  // Ambient Sound Streamer State
  soundPlayer: {
    isPlaying: false,
    currentSoundId: "rain-forest",
    volume: 50,
    trackList: [...defaultTrackList],
  },

  // Lightweight Tasks List (Standalone Mode)
  tasks: [],

  // Logged Focus Sessions History
  sessions: [],

  // System Settings
  settings: {
    pomodoroWorkTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    notificationSound: true,
  },
};

// Internal listeners list for Observer pattern
const listeners = new Set();

export const StateManager = {
  init() {
    const saved = loadFromStorage();
    if (saved) {
      state.tasks = saved.tasks || [];
      state.sessions = saved.sessions || [];
      if (saved.settings) {
        state.settings = { ...state.settings, ...saved.settings };
        state.timer.timeRemaining = state.settings.pomodoroWorkTime * 60;
        state.timer.duration = state.settings.pomodoroWorkTime * 60;
        state.soundPlayer.volume = saved.settings.volume ?? 50;
        state.soundPlayer.currentSoundId =
          saved.settings.lastSelectedSoundId || "rain-forest";
      }
    }

    // Auto-select first active task if available
    const firstTask = state.tasks.find((t) => t.status !== "done");
    if (firstTask) {
      state.activeTaskId = firstTask.id;
    }

    this.notify();
    return state;
  },

  // --- Observer Pattern ---
  subscribe(listener) {
    if (typeof listener === "function") {
      listeners.add(listener);
    }
    return () => listeners.delete(listener); // Unsubscribe cleanup function
  },

  notify() {
    listeners.forEach((listener) => listener(state));
  },

  // --- Views ---
  setView(view) {
    state.currentView = view;
    this.notify();
  },

  // --- Mode ---
  setMode(mode) {
    state.activeMode = mode;
    this.notify();
  },

  // --- Task Management ---
  setActiveTaskId(taskId) {
    state.activeTaskId = taskId;
    this.notify();
  },

  getActiveTask() {
    return state.tasks.find((t) => t.id === state.activeTaskId) || null;
  },

  getTasks() {
    return state.tasks;
  },

  addTask(title, estimatedPomodoros = 1) {
    if (!title || !title.trim()) return null;

    const newTask = {
      id: crypto.randomUUID(),
      title: title.trim(),
      status: "todo",
      estimatedPomodoros: Number(estimatedPomodoros) || 1,
      completedPomodoros: 0,
      createdAt: new Date().toISOString(),
    };

    state.tasks.unshift(newTask);
    state.activeTaskId = newTask.id;
    this.save();
    this.notify();
    return newTask;
  },

  toggleTaskStatus(taskId) {
    const task = state.tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = task.status === "done" ? "todo" : "done";
      this.save();
      this.notify();
    }
  },

  // --- Timer State Controls ---
  updateTimerState(newTimerState) {
    state.timer = { ...state.timer, ...newTimerState };
    this.notify();
  },

  resetTimer() {
    const isPomodoro = state.activeMode === "pomodoro";
    const defaultSecs = state.settings.pomodoroWorkTime * 60;

    state.timer = {
      isRunning: false,
      isPaused: false,
      timeRemaining: isPomodoro ? defaultSecs : 0,
      duration: isPomodoro ? defaultSecs : 0,
      flowTime: 0,
      pomodoroSessionCount: state.timer.pomodoroSessionCount,
      currentPhase: "work",
    };
    this.notify();
  },

  // --- Sessions Log ---
  addSession(sessionData = {}) {
    const activeTask = this.getActiveTask();
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

  // --- Sound Player ---
  setSoundPlaying(isPlaying) {
    state.soundPlayer.isPlaying = isPlaying;
    this.notify();
  },

  setSoundTrack(soundId) {
    state.soundPlayer.currentSoundId = soundId;
    state.settings.lastSelectedSoundId = soundId;
    this.save();
    this.notify();
  },

  setVolume(volume) {
    state.soundPlayer.volume = volume;
    state.settings.volume = volume;
    this.save();
    this.notify();
  },

  // --- Persistence ---
  save() {
    saveToStorage({
      tasks: state.tasks,
      sessions: state.sessions,
      settings: state.settings,
    });
  },
};
