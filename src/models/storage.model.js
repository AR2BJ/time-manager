import { formatDate } from "@/utils/helpers.js";

export const STORAGE_KEY = "time_manager_data";
export const STORAGE_VERSION = 1;

/**
 * Normalizes a lightweight task entity for Standalone mode
 */
function normalizeTask(task) {
  return {
    id: String(task.id || crypto.randomUUID()),
    title: task.title || "Untitled Task",
    status: task.status || "todo",
    estimatedPomodoros: Number(task.estimatedPomodoros) || 1,
    completedPomodoros: Number(task.completedPomodoros) || 0,
    createdAt: task.createdAt || formatDate(new Date()),
  };
}

/**
 * Normalizes a completed time session log
 */
function normalizeSession(session) {
  return {
    id: String(session.id || crypto.randomUUID()),
    taskId: session.taskId || null,
    taskTitle: session.taskTitle || "Untitled",
    type: session.type || "pomodoro",
    durationSeconds: Number(session.durationSeconds) || 0,
    completedAt: session.completedAt || formatDate(new Date()),
  };
}

function migrateData(data) {
  const tasks = Array.isArray(data.tasks) ? data.tasks : [];
  const sessions = Array.isArray(data.sessions) ? data.sessions : [];
  const settings = data.settings || {};

  return {
    version: STORAGE_VERSION,
    tasks: tasks.map(normalizeTask),
    sessions: sessions.map(normalizeSession),
    settings: {
      pomodoroWorkTime: Number(settings.pomodoroWorkTime) || 25,
      shortBreakTime: Number(settings.shortBreakTime) || 5,
      longBreakTime: Number(settings.longBreakTime) || 15,
      autoStartBreaks: Boolean(settings.autoStartBreaks),
      autoStartPomodoros: Boolean(settings.autoStartPomodoros),
      notificationSound: settings.notificationSound !== false,
      lastSelectedSoundId: settings.lastSelectedSoundId || "rain-forest",
      volume: Number(settings.volume) ?? 50,
    },
  };
}

export function saveToStorage(data) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        tasks: data.tasks || [],
        sessions: data.sessions || [],
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
