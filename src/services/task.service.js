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

    return TaskModel.insert(newTask);
  },

  updateTask(taskId, newTitle, newEstimatedPomodoros) {
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
      estimatedPomodoros: Number(newEstimatedPomodoros) || 1,
    };

    if (
      task.completedPomodoros < updatedFields.estimatedPomodoros &&
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
    if (!task || task.status === "done") return null;

    const activeTaskId = TaskModel.getActiveTaskId();
    const wasActive = activeTaskId === String(taskId);

    const result = TaskModel.remove(taskId);
    if (!result) return null;

    if (wasActive) {
      const remainingTask =
        TaskModel.getTasks().find((t) => t.status !== "done") ||
        TaskModel.getTasks()[0] ||
        null;
      TaskModel.setActiveTaskId(remainingTask ? remainingTask.id : null);
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

  incrementCompletedPomodoro(taskId) {
    const activeTaskId = TaskModel.getActiveTaskId();
    const targetId = taskId || activeTaskId;
    const task = TaskModel.getById(targetId);

    if (!task) return null;

    const newCompletedCount = (task.completedPomodoros || 0) + 1;
    TaskModel.update(task.id, { completedPomodoros: newCompletedCount });

    return this.autoSelectNextTask();
  },

  autoSelectNextTask() {
    const activeTask = this.getActiveTask();
    if (!activeTask) return null;

    if (activeTask.completedPomodoros >= activeTask.estimatedPomodoros) {
      TaskModel.update(activeTask.id, { status: "done" });

      const nextTask = TaskModel.getTasks().find(
        (t) => t.status !== "done" && String(t.id) !== String(activeTask.id),
      );

      TaskModel.setActiveTaskId(nextTask ? nextTask.id : null);
      return nextTask;
    }

    return null;
  },
};
