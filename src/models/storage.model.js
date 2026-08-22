import { generateId, todayISO } from "@/utils/helpers.js";

export const STORAGE_KEY = "time_manager";
export const STORAGE_VERSION = 1;

function normalizeTask(task) {
  return {
    id: String(task.id || generateId()),
    title: task.title || "Untitled Task",
    status: task.status || "todo",
    estimatedFocusUnits: Number(task.estimatedFocusUnits) || 1,
    completedFocusUnits: Number(task.completedFocusUnits) || 0,
    createdAt: task.createdAt || todayISO(),
  };
}

function normalizeSession(session) {
  return {
    id: String(session.id || generateId()),
    taskId: session.taskId ? String(session.taskId) : null,
    taskTitle: session.taskTitle || "Untitled Task",
    type: session.type || "pomodoro",
    durationSeconds: Number(session.durationSeconds) || 0,
    completedAt: session.completedAt || todayISO(),
  };
}

function normalizeNote(note) {
  return {
    id: String(note.id || generateId()),
    text: note.text ? String(note.text).trim() : "",
    createdAt: note.createdAt || todayISO(),
  };
}

function normalizeTimer(timer, defaultWorkTime = 25) {
  const fallbackSecs = defaultWorkTime * 60;
  return {
    isRunning: false,
    isPaused: Boolean(timer?.isRunning || timer?.isPaused),
    timeRemaining: Number(timer?.timeRemaining) ?? fallbackSecs,
    duration: Number(timer?.duration) ?? fallbackSecs,
    flowTime: Number(timer?.flowTime) || 0,
    pomodoroSessionCount: Number(timer?.pomodoroSessionCount) || 0,
    currentPhase: timer?.currentPhase || "work",
  };
}

function migrateData(data) {
  const tasks = Array.isArray(data.tasks) ? data.tasks : [];
  const sessions = Array.isArray(data.sessions) ? data.sessions : [];
  const notes = Array.isArray(data.notes) ? data.notes : [];
  const settings = data.settings || {};
  const pomodoroWorkTime = Number(settings.pomodoroWorkTime) || 25;

  return {
    version: STORAGE_VERSION,
    activeMode: data.activeMode === "flow" ? "flow" : "pomodoro",
    activeTaskId: data.activeTaskId ? String(data.activeTaskId) : null,
    tasks: tasks.map(normalizeTask),
    sessions: sessions.map(normalizeSession),
    notes: notes.map(normalizeNote),
    timer: normalizeTimer(data.timer, pomodoroWorkTime),
    settings: {
      ...settings,
      pomodoroWorkTime,
      shortBreakTime: Number(settings.shortBreakTime) || 5,
      longBreakTime: Number(settings.longBreakTime) || 15,
      longBreakInterval: Number(settings.longBreakInterval) || 4,
      autoStartBreaks: Boolean(settings.autoStartBreaks),
      autoStartPomodoros: Boolean(settings.autoStartPomodoros),
      flowBreakTime: Number(settings.flowBreakTime) || 15,
      autoStartFlowBreaks: Boolean(settings.autoStartFlowBreaks),
      notificationSound: Boolean(settings.notificationSound),
      pomodoroEndSound: settings.pomodoroEndSound || "none",
      breakEndSound: settings.breakEndSound || "none",
      currentSoundId:
        settings.currentSoundId || settings.lastSelectedSoundId || "none",
      volume: typeof settings.volume === "number" ? settings.volume : 50,
      isMuted: Boolean(settings.isMuted),
    },
  };
}

export function saveToStorage(data) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        activeMode: data.activeMode || "pomodoro",
        activeTaskId: data.activeTaskId ? String(data.activeTaskId) : null,
        tasks: data.tasks || [],
        sessions: data.sessions || [],
        notes: data.notes || [],
        timer: data.timer || {},
        settings: data.settings || {},
      }),
    );
  } catch (error) {
    console.error("Failed to save Time Manager data to localStorage:", error);
  }
}

export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    return migrateData(JSON.parse(raw));
  } catch (error) {
    console.error("Failed to load Time Manager data from localStorage:", error);
    return null;
  }
}
