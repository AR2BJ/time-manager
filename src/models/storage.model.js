import { formatDate, generateId } from "@/utils/helpers.js";

export const STORAGE_KEY = "time_manager_data";
export const STORAGE_VERSION = 1;

/**
 * Normalizes a lightweight task entity for Standalone mode
 */
function normalizeTask(task) {
  return {
    id: String(task.id || generateId()),
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
    id: String(session.id || generateId()),
    taskId: session.taskId || null,
    taskTitle: session.taskTitle || "Untitled",
    type: session.type || "pomodoro",
    durationSeconds: Number(session.durationSeconds) || 0,
    completedAt: session.completedAt || formatDate(new Date()),
  };
}

/**
 * Normalizes live timer dynamic state for seamless rehydration
 */
function normalizeTimer(timer, defaultWorkTime = 25) {
  const fallbackSecs = defaultWorkTime * 60;
  return {
    // If the browser was reloaded during an active tick, safety-pause to prevent time sync issues
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
  const settings = data.settings || {};
  const pomodoroWorkTime = Number(settings.pomodoroWorkTime) || 25;

  return {
    version: STORAGE_VERSION,
    activeMode: data.activeMode === "flow" ? "flow" : "pomodoro",
    tasks: tasks.map(normalizeTask),
    sessions: sessions.map(normalizeSession),
    timer: normalizeTimer(data.timer, pomodoroWorkTime),
    settings: {
      pomodoroWorkTime,
      shortBreakTime: Number(settings.shortBreakTime) || 5,
      longBreakTime: Number(settings.longBreakTime) || 15,
      longBreakInterval: Number(settings.longBreakInterval) || 4,
      autoStartBreaks: Boolean(settings.autoStartBreaks),
      autoStartPomodoros: Boolean(settings.autoStartPomodoros),
      notificationSound: settings.notificationSound !== false,
      lastSelectedSoundId: settings.lastSelectedSoundId || "track-1",
      volume: Number(settings.volume) ?? 50,
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
        tasks: data.tasks || [],
        sessions: data.sessions || [],
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
