import { StateManager, state } from "./state.model.js";
import { generateId, todayISO } from "@/utils/helpers.js";

export const TaskModel = {
  getTasks() {
    return state.tasks || [];
  },

  getActiveTask() {
    if (!state.activeTaskId) return null;
    return (
      state.tasks.find((t) => String(t.id) === String(state.activeTaskId)) ||
      null
    );
  },

  isTitleDuplicate(title, excludeTaskId = null) {
    const cleanTitle = title.trim().toLowerCase();
    return state.tasks.some(
      (t) =>
        t.title.trim().toLowerCase() === cleanTitle &&
        String(t.id) !== String(excludeTaskId),
    );
  },

  addTask(title, estimatedPomodoros = 1, customId = null) {
    if (!title || !title.trim() || this.isTitleDuplicate(title, customId)) {
      return null;
    }

    const newTask = {
      id: customId || generateId(),
      title: title.trim(),
      status: "todo",
      estimatedPomodoros: Number(estimatedPomodoros) || 1,
      completedPomodoros: 0,
      createdAt: todayISO(),
    };

    state.tasks.unshift(newTask);
    state.activeTaskId = String(newTask.id);
    StateManager.save();
    StateManager.notify();

    return newTask;
  },

  updateTask(taskId, newTitle, newEstimatedPomodoros) {
    const targetIdStr = String(taskId);
    const task = state.tasks.find((t) => String(t.id) === targetIdStr);

    if (
      !task ||
      task.status === "done" ||
      this.isTitleDuplicate(newTitle, taskId)
    )
      return false;

    task.title = newTitle.trim();
    task.estimatedPomodoros = Number(newEstimatedPomodoros) || 1;

    if (
      task.completedPomodoros < task.estimatedPomodoros &&
      task.status === "done"
    )
      task.status = "todo";

    StateManager.save();
    StateManager.notify();
    return true;
  },

  setActiveTaskId(taskId) {
    if (!taskId) {
      state.activeTaskId = null;
      StateManager.save();
      StateManager.notify();
      return;
    }

    const task = state.tasks.find((t) => String(t.id) === String(taskId));

    if (!task || task.status === "done") {
      return;
    }

    state.activeTaskId = String(taskId);
    StateManager.save();
    StateManager.notify();
  },

  autoSelectNextTask() {
    const activeTask = this.getActiveTask();
    if (!activeTask) return null;

    if (activeTask.completedPomodoros >= activeTask.estimatedPomodoros) {
      activeTask.status = "done";

      const nextTask = state.tasks.find(
        (t) => t.status !== "done" && String(t.id) !== String(activeTask.id),
      );

      state.activeTaskId = nextTask ? String(nextTask.id) : null;

      StateManager.save();
      StateManager.notify();

      return nextTask;
    }

    return null;
  },

  incrementCompletedPomodoro(taskId) {
    const targetIdStr = String(taskId || state.activeTaskId);
    const task = state.tasks.find((t) => String(t.id) === targetIdStr);

    if (task) {
      task.completedPomodoros = (task.completedPomodoros || 0) + 1;
      return this.autoSelectNextTask();
    }
    return null;
  },

  deleteTask(taskId) {
    if (!taskId) return null;

    const targetIdStr = String(taskId);
    const task = state.tasks.find((t) => String(t.id) === targetIdStr);

    if (!task || task.status === "done") return null;

    const taskIndex = state.tasks.findIndex(
      (t) => String(t.id) === targetIdStr,
    );
    if (taskIndex === -1) return null;

    const deletedTask = { ...state.tasks[taskIndex] };
    const wasActive = String(state.activeTaskId) === targetIdStr;

    state.tasks.splice(taskIndex, 1);

    if (wasActive) {
      const remainingTask =
        state.tasks.find((t) => t.status !== "done") || state.tasks[0] || null;
      state.activeTaskId = remainingTask ? String(remainingTask.id) : null;
    }

    StateManager.save();
    StateManager.notify();

    return { deletedTask, taskIndex, wasActive };
  },

  restoreTask(task, index, restoreAsActive = false) {
    if (!task) return;

    state.tasks.splice(index, 0, task);
    if (restoreAsActive) {
      state.activeTaskId = String(task.id);
    }

    StateManager.save();
    StateManager.notify();
  },

  toggleTaskStatus(taskId) {
    const targetIdStr = String(taskId);
    const task = state.tasks.find((t) => String(t.id) === targetIdStr);
    if (task) {
      task.status = task.status === "done" ? "todo" : "done";
      StateManager.save();
      StateManager.notify();
    }
  },
};
