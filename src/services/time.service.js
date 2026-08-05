import { generateId, todayISO } from "@/utils/helpers.js";

function sanitizeTagIds(tags) {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((tag) => {
      if (typeof tag === "object" && tag !== null) {
        return String(tag.id || tag.value || "");
      }
      return String(tag || "").trim();
    })
    .filter(Boolean);
}

export const TimeService = {
  validateTimeLimits(times, targetDate, newPriority, excludeTimeId = null) {
    if (!targetDate) return;

    const LIMITS = {
      high: 6,
      medium: 8,
      low: 10,
      total: 24,
    };

    const sameDateTimes = times.filter((time) => {
      if (time.archived) return false;
      if (excludeTimeId && time.id === excludeTimeId) return false;

      const timeDate = time.dueDate || time.createdAt;
      return timeDate === targetDate;
    });

    if (sameDateTimes.length >= LIMITS.total) {
      throw new Error(
        `Daily capacity reached! Maximum total times allowed for ${targetDate} is ${LIMITS.total}.`,
      );
    }

    const countByPriority = sameDateTimes.reduce(
      (acc, time) => {
        const p = time.priority || "low";
        acc[p] = (acc[p] || 0) + 1;
        return acc;
      },
      { high: 0, medium: 0, low: 0 },
    );

    const targetPriority = newPriority || "low";
    const currentCount = countByPriority[targetPriority] || 0;
    const maxAllowed = LIMITS[targetPriority] || LIMITS.low;

    if (currentCount >= maxAllowed) {
      throw new Error(
        `Priority capacity exceeded! You can only set up to ${maxAllowed} ${targetPriority.toUpperCase()} priority times for ${targetDate}.`,
      );
    }
  },

  createTime(currentTimes, timeData) {
    const rawTitle = typeof timeData === "string" ? timeData : timeData.title;
    const cleanedTitle = (rawTitle || "").trim().replace(/\s+/g, " ");

    if (!cleanedTitle || cleanedTitle.length < 2 || cleanedTitle.length > 120) {
      throw new Error("Time title must be between 2 and 120 characters.");
    }

    const alreadyExists = currentTimes.some(
      (time) =>
        time.title.toLowerCase() === cleanedTitle.toLowerCase() &&
        !time.archived,
    );
    if (alreadyExists) {
      throw new Error("An active time with this title already exists.");
    }

    const timeDate = timeData.dueDate || todayISO();
    const timePriority = timeData.priority || "low";

    this.validateTimeLimits(currentTimes, timeDate, timePriority);

    const parsedTagIds = sanitizeTagIds(timeData.tags);

    const newTime = {
      id: generateId(),
      title: cleanedTitle,
      description: (timeData.description || "").trim(),
      status: timeData.status || "todo",
      priority: timePriority,
      dueDate: timeData.dueDate || null,
      createdAt: todayISO(),
      updatedAt: null,
      completedAt: timeData.status === "done" ? todayISO() : null,
      archived: false,
      tags: parsedTagIds,
      subtimes: Array.isArray(timeData.subtimes) ? timeData.subtimes : [],
    };

    return [newTime, ...currentTimes];
  },

  toggleTime(currentTimes, id) {
    const today = todayISO();

    return currentTimes.map((time) => {
      if (time.id !== id) return time;
      if (time.archived) return time;

      const isCompleted = time.status === "done";
      const newStatus = isCompleted ? "todo" : "done";

      let updatedSubtimes = [];
      let savedSubtimeIds = time.completedSubtimeIdsBeforeDone || [];

      if (newStatus === "done") {
        savedSubtimeIds = (time.subtimes || [])
          .filter((st) => st.completed)
          .map((st) => st.id);

        updatedSubtimes = (time.subtimes || []).map((st) => ({
          ...st,
          completed: true,
        }));
      } else {
        updatedSubtimes = (time.subtimes || []).map((st) => ({
          ...st,
          completed: savedSubtimeIds.includes(st.id),
        }));
      }

      return {
        ...time,
        status: newStatus,
        completedAt: newStatus === "done" ? today : null,
        subtimes: updatedSubtimes,
        completedSubtimeIdsBeforeDone: savedSubtimeIds,
      };
    });
  },

  updateTimeStatus(currentTimes, id, newStatus) {
    const validStatuses = ["todo", "in_progress", "done", "blocked"];
    if (!validStatuses.includes(newStatus)) {
      throw new Error("Invalid time status.");
    }

    const today = todayISO();

    return currentTimes.map((time) => {
      if (time.id !== id) return time;

      return {
        ...time,
        status: newStatus,
        completedAt: newStatus === "done" ? today : null,
        updatedAt: today,
      };
    });
  },

  editTime(currentTimes, id, updatedFields) {
    const time = currentTimes.find((t) => t.id === id);
    if (!time) throw new Error("Time not found.");

    let cleanedTitle = time.title;
    if (updatedFields.title) {
      cleanedTitle = updatedFields.title.trim().replace(/\s+/g, " ");
      if (cleanedTitle.length < 2 || cleanedTitle.length > 120) {
        throw new Error("Time title must be between 2 and 120 characters.");
      }
    }

    const targetDate =
      updatedFields.dueDate !== undefined
        ? updatedFields.dueDate
        : time.dueDate;
    const finalDate = targetDate || time.createdAt;
    const targetPriority = updatedFields.priority || time.priority;

    this.validateTimeLimits(currentTimes, finalDate, targetPriority, id);

    const parsedTagIds =
      updatedFields.tags !== undefined
        ? sanitizeTagIds(updatedFields.tags)
        : time.tags;

    const alreadyExists = currentTimes.some(
      (t) =>
        t.id !== id && t.title.toLowerCase() === cleanedTitle.toLowerCase(),
    );
    if (alreadyExists) {
      throw new Error("Time already exists.");
    }

    return currentTimes.map((t) => {
      if (t.id !== id) return t;

      return {
        ...t,
        ...updatedFields,
        title: cleanedTitle,
        tags: parsedTagIds,
        updatedAt: todayISO(),
      };
    });
  },

  toggleSubtime(currentTimes, timeId, subtimeId) {
    const today = todayISO();

    return currentTimes.map((time) => {
      if (time.id !== timeId) return time;

      const updatedSubtimes = (time.subtimes || []).map((st) => {
        if (st.id !== subtimeId) return st;
        return { ...st, completed: !st.completed };
      });

      if (time.archived) {
        return {
          ...time,
          subtimes: updatedSubtimes,
        };
      }

      const hasSubtimes = updatedSubtimes.length > 0;
      const allCompleted =
        hasSubtimes && updatedSubtimes.every((st) => st.completed);

      let newStatus = time.status;
      let completedAt = time.completedAt;
      let savedSubtimeIds = time.completedSubtimeIdsBeforeDone || [];

      if (allCompleted) {
        newStatus = "done";
        completedAt = today;
      } else if (time.status === "done" && !allCompleted) {
        newStatus = "in_progress";
        completedAt = null;
      }

      if (newStatus !== "done") {
        savedSubtimeIds = updatedSubtimes
          .filter((st) => st.completed)
          .map((st) => st.id);
      }

      return {
        ...time,
        status: newStatus,
        completedAt: completedAt,
        subtimes: updatedSubtimes,
        completedSubtimeIdsBeforeDone: savedSubtimeIds,
      };
    });
  },

  addSubtime(currentTimes, timeId, subtimeTitle) {
    const cleaned = subtimeTitle.trim();
    if (!cleaned) throw new Error("Subtime title cannot be empty.");

    return currentTimes.map((time) => {
      if (time.id !== timeId) return time;

      const newSubtime = {
        id: generateId(),
        title: cleaned,
        completed: false,
        createdAt: todayISO(),
        updatedAt: null,
      };

      return {
        ...time,
        subtimes: [...(time.subtimes || []), newSubtime],
        updatedAt: todayISO(),
      };
    });
  },

  deleteSubtime(currentTimes, timeId, subtimeId) {
    return currentTimes.map((time) => {
      if (time.id !== timeId) return time;

      return {
        ...time,
        subtimes: (time.subtimes || []).filter((st) => st.id !== subtimeId),
        updatedAt: todayISO(),
      };
    });
  },

  deleteTime(currentTimes, id) {
    return currentTimes.filter((time) => time.id !== id);
  },

  archiveTime(currentTimes, id) {
    return currentTimes.map((time) =>
      time.id === id ? { ...time, archived: true } : time,
    );
  },

  restoreTime(currentTimes, id) {
    const time = currentTimes.find((t) => t.id === id);
    if (time) {
      const timeDate = time.dueDate || time.createdAt;
      this.validateTimeLimits(currentTimes, timeDate, time.priority, id);
    }

    return currentTimes.map((time) =>
      time.id === id ? { ...time, archived: false } : time,
    );
  },
};
