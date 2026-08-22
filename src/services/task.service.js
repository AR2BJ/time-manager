import { generateId, todayISO } from "@/utils/helpers.js";

import { ModalController } from "@/controllers/modal.controller";
import { NotificationService } from "@/services/notification.service.js";
import { TaskModel } from "@/models/task.model.js";
import { state } from "@/models/state.model";
import { timerService } from "@/services/timer.service.js";

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
        String(t.id) !== String(excludeTaskId) &&
        t.title.trim().toLowerCase() === cleanTitle,
    );
  },

  addTask(title, estimatedFocusUnits = 1) {
    if (!title || !title.trim()) {
      NotificationService.show({
        type: "warning",
        message: "Task title cannot be empty",
        icon: "fa-pencil",
        iconColor: "text-amber-500",
        duration: 5000,
      });
      return null;
    }

    if (this.isTitleDuplicate(title)) {
      NotificationService.show({
        type: "error",
        message: "A task with this title already exists",
        icon: "fa-triangle-exclamation",
        iconColor: "text-red-500/80",
        duration: 5000,
      });
      return null;
    }

    const newTask = {
      id: generateId(),
      title: title.trim(),
      status: "todo",
      estimatedFocusUnits: Number(estimatedFocusUnits) || 1,
      completedFocusUnits: 0,
      createdAt: todayISO(),
    };

    const inserted = TaskModel.insert(newTask);

    if (inserted) {
      NotificationService.show({
        type: "success",
        message: `Task "${newTask.title}" created`,
        icon: "fa-plus",
        iconColor: "text-emerald-500",
      });
      return inserted;
    }

    return null;
  },

  updateTask(taskId, newTitle, newEstimatedFocusUnits) {
    const task = TaskModel.getById(taskId);
    if (!task || task.status === "done") {
      return null;
    }

    if (!newTitle || !newTitle.trim()) {
      NotificationService.show({
        type: "warning",
        message: "Task title cannot be empty",
        icon: "fa-pencil",
        iconColor: "text-amber-500",
        duration: 5000,
      });
      return null;
    }

    if (this.isTitleDuplicate(newTitle, taskId)) {
      NotificationService.show({
        type: "error",
        message: "A task with this title already exists",
        icon: "fa-triangle-exclamation",
        iconColor: "text-red-500/80",
        duration: 5000,
      });
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

    const updated = TaskModel.update(taskId, updatedFields);

    if (updated) {
      NotificationService.show({
        type: "success",
        message: `Task "${updated.title}" updated`,
        icon: "fa-pen-to-square",
        iconColor: "text-emerald-500",
      });
      return updated;
    }

    return null;
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
    const isActive = String(activeTaskId) === String(taskId);

    const todoTasks = TaskModel.getTasks().filter((t) => t.status !== "done");
    const isOnlyTodoTask = todoTasks.length === 1;

    if (isActive && isOnlyTodoTask && timerService.isTimerRunning()) {
      NotificationService.show({
        type: "error",
        message:
          "Cannot delete the active task while the timer is running. Stop the timer first.",
        icon: "fa-triangle-exclamation",
        iconColor: "text-red-500/80",
        duration: 5000,
      });
      return null;
    }

    const wasActive = isActive;

    const result = TaskModel.remove(taskId);
    if (!result) return null;

    if (wasActive) {
      const remainingTasks = TaskModel.getTasks();
      const nextActiveTask = remainingTasks.find((t) => t.status !== "done");
      TaskModel.setActiveTaskId(nextActiveTask ? nextActiveTask.id : null);
    }

    NotificationService.show({
      type: "error",
      message: `Task "${result.deletedTask.title}" removed`,
      undoAction: () => {
        TaskService.restoreTask(result.deletedTask, result.index, wasActive);
        ModalController.refreshTaskModal();
      },
    });

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
