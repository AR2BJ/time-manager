import { StateManager, state } from "./state.model.js";

import { generateId } from "@/utils/helpers.js";

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

  setActiveTaskId(taskId) {
    state.activeTaskId = taskId ? String(taskId) : null;
    StateManager.save();
    StateManager.notify();
  },

  addTask(title, estimatedPomodoros = 1) {
    if (!title || !title.trim()) return null;

    const newTask = {
      id: generateId(),
      title: title.trim(),
      status: "todo",
      estimatedPomodoros: Number(estimatedPomodoros) || 1,
      completedPomodoros: 0,
      createdAt: new Date().toISOString(),
    };

    state.tasks.unshift(newTask);
    state.activeTaskId = String(newTask.id);
    StateManager.save();
    StateManager.notify();
    return newTask;
  },

  deleteTask(taskId) {
    if (!taskId) return;

    const targetIdStr = String(taskId);
    state.tasks = state.tasks.filter((t) => String(t.id) !== targetIdStr);

    if (String(state.activeTaskId) === targetIdStr) {
      const remainingTask = state.tasks.find((t) => t.status !== "done");
      state.activeTaskId = remainingTask ? String(remainingTask.id) : null;
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
