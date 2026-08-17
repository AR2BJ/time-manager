import { StateManager, state } from "./state.model.js";

export const TaskModel = {
  getTasks() {
    return state.tasks || [];
  },

  getById(taskId) {
    const targetIdStr = String(taskId);
    return state.tasks.find((t) => String(t.id) === targetIdStr) || null;
  },

  getActiveTaskId() {
    return state.activeTaskId ? String(state.activeTaskId) : null;
  },

  setActiveTaskId(taskId) {
    state.activeTaskId = taskId ? String(taskId) : null;
    this.commit();
  },

  insert(taskData) {
    state.tasks.unshift(taskData);
    state.activeTaskId = String(taskData.id);
    this.commit();
    return taskData;
  },

  insertAt(taskData, index) {
    state.tasks.splice(index, 0, taskData);
    this.commit();
  },

  update(taskId, updatedFields) {
    const task = this.getById(taskId);
    if (!task) return null;

    Object.assign(task, updatedFields);
    this.commit();
    return task;
  },

  remove(taskId) {
    const targetIdStr = String(taskId);
    const index = state.tasks.findIndex((t) => String(t.id) === targetIdStr);
    if (index === -1) return null;

    const [deletedTask] = state.tasks.splice(index, 1);
    this.commit();
    return { deletedTask, index };
  },

  commit() {
    StateManager.save();
    StateManager.notify();
  },
};
