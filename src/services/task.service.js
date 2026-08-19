import { generateId, todayISO } from "@/utils/helpers.js";

import { TaskModel } from "@/models/task.model.js";
import { state } from "@/models/state.model";

export const TaskService = {
  getTasks() {
    return TaskModel.getTasks();
  },

  getActiveTask() {
    const activeId = TaskModel.getActiveTaskId();
    return activeId ? TaskModel.getById(activeId) : null;
  },

  isTitleDuplicate(title, excludeTaskId = null) {
    const cleanTitle = title.trim().toLowerCase();
    return TaskModel.getTasks().some(
      (t) =>
        t.title.trim().toLowerCase() === cleanTitle &&
        String(t.id) !== String(excludeTaskId),
    );
  },

  addTask(title, estimatedFocusUnits = 1, customId = null) {
    if (!title || !title.trim() || this.isTitleDuplicate(title, customId)) {
      return null;
    }

    const newTask = {
      id: customId || generateId(),
      title: title.trim(),
      status: "todo",
      estimatedFocusUnits: Number(estimatedFocusUnits) || 1,
      completedFocusUnits: 0,
      createdAt: todayISO(),
    };

    return TaskModel.insert(newTask);
  },

  updateTask(taskId, newTitle, newEstimatedFocusUnits) {
    const task = TaskModel.getById(taskId);
    if (
      !task ||
      task.status === "done" ||
      this.isTitleDuplicate(newTitle, taskId)
    ) {
      return null;
    }

    const updatedFields = {
      title: newTitle.trim(),
      estimatedFocusUnits: Number(newEstimatedFocusUnits) || 1,
    };

    if (
      task.completedFocusUnits < updatedFields.estimatedFocusUnits &&
      task.status === "done"
    ) {
      updatedFields.status = "todo";
    }

    return TaskModel.update(taskId, updatedFields);
  },

  setActiveTask(taskId) {
    if (!taskId) {
      TaskModel.setActiveTaskId(null);
      return;
    }

    const task = TaskModel.getById(taskId);
    if (!task || task.status === "done") return;

    TaskModel.setActiveTaskId(taskId);
  },

  deleteTask(taskId) {
    const task = TaskModel.getById(taskId);
    if (!task) return null;

    const activeTaskId = TaskModel.getActiveTaskId();
    const wasActive = String(activeTaskId) === String(taskId);

    const result = TaskModel.remove(taskId);
    if (!result) return null;

    if (wasActive) {
      const remainingTasks = TaskModel.getTasks();
      const nextActiveTask = remainingTasks.find((t) => t.status !== "done");
      TaskModel.setActiveTaskId(nextActiveTask ? nextActiveTask.id : null);
    }

    return {
      deletedTask: result.deletedTask,
      taskIndex: result.index,
      wasActive,
    };
  },

  restoreTask(task, index, restoreAsActive = false) {
    if (!task) return;

    TaskModel.insertAt(task, index);
    if (restoreAsActive) {
      TaskModel.setActiveTaskId(task.id);
    }

    state.tasks = TaskModel.getTasks();
  },

  toggleTaskStatus(taskId) {
    const task = TaskModel.getById(taskId);
    if (!task) return null;

    const newStatus = task.status === "done" ? "todo" : "done";
    return TaskModel.update(taskId, { status: newStatus });
  },

  incrementCompletedFocusUnits(taskId) {
    const activeTaskId = TaskModel.getActiveTaskId();
    const targetId = taskId || activeTaskId;
    const task = TaskModel.getById(targetId);

    if (!task) return null;

    const newCompletedCount = (task.completedFocusUnits || 0) + 1;
    TaskModel.update(task.id, { completedFocusUnits: newCompletedCount });

    return this.autoSelectNextTask();
  },

  autoSelectNextTask() {
    const activeTask = this.getActiveTask();
    if (!activeTask) return null;

    if (activeTask.completedFocusUnits >= activeTask.estimatedFocusUnits) {
      TaskModel.update(activeTask.id, { status: "done" });

      const nextTask = TaskModel.getTasks().find((t) => t.status !== "done");
      TaskModel.setActiveTaskId(nextTask ? nextTask.id : null);
    }

    return TaskModel.getActiveTaskId();
  },
};
