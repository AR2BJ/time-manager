import { formatDate } from "@/utils/helpers.js";

export const STORAGE_KEY = "time_manager";
export const STORAGE_VERSION = 1;

function normalizeTag(tag) {
  if (typeof tag === "string") {
    return { id: crypto.randomUUID(), name: tag.trim() };
  }
  return {
    id: String(tag.id || crypto.randomUUID()),
    name: String(tag.name || tag.title || "").trim(),
  };
}

function normalizeTime(time) {
  return {
    id: String(time.id || crypto.randomUUID()),
    title: time.title || "Untitled Time",
    description: time.description || "",
    status: time.status || "todo",
    priority: time.priority || "low",
    dueDate: time.dueDate || null,
    createdAt: time.createdAt || formatDate(new Date()),
    updatedAt: time.updatedAt || formatDate(new Date()) || null,
    completedAt: time.completedAt || null,
    estimatedMinutes: Number(time.estimatedMinutes) || 0,
    archived: Boolean(time.archived),
    tags: Array.isArray(time.tags)
      ? time.tags.map((t) => (typeof t === "object" ? t.id : String(t)))
      : [],
    subtimes: Array.isArray(time.subtimes)
      ? time.subtimes.map((st) => ({
          id: String(st.id || crypto.randomUUID()),
          title: st.title || "",
          completed: Boolean(st.completed),
          createdAt: time.createdAt || formatDate(new Date()),
          updatedAt: time.updatedAt || formatDate(new Date()) || null,
        }))
      : [],
  };
}

function migrateData(data) {
  const times = Array.isArray(data.times) ? data.times : [];
  const tags = Array.isArray(data.tags) ? data.tags : [];

  return {
    version: STORAGE_VERSION,
    tags: tags.map(normalizeTag),
    times: times.map(normalizeTime),
  };
}

export function saveToStorage(data) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        tags: data.tags || [],
        times: data.times || [],
      }),
    );
  } catch (error) {
    console.error("Failed to save data to localStorage:", error);
  }
}

export function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    const migrated = migrateData(data);

    return migrated;
  } catch (error) {
    console.error("Failed to load data from localStorage:", error);
    return null;
  }
}
