import { StateManager, state } from "./state.model.js";

export const TaskModel = {
  getTasks() {
    return state.tasks || [];
  },

  getActiveTask() {
    return state.tasks.find((t) => t.id === state.activeTaskId) || null;
  },

  setActiveTaskId(taskId) {
    state.activeTaskId = taskId;
    StateManager.notify();
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
    StateManager.save();
    StateManager.notify();
    return newTask;
  },

  deleteTask(taskId) {
    if (!taskId) return;

    state.tasks = state.tasks.filter((t) => t.id !== taskId);

    if (state.activeTaskId === taskId) {
      state.activeTaskId = null;
    }

    StateManager.save();
    StateManager.notify();
  },

  toggleTaskStatus(taskId) {
    const task = state.tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = task.status === "done" ? "todo" : "done";
      StateManager.save();
      StateManager.notify();
    }
  },
};
