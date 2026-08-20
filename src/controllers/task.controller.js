import { ModalController } from "./modal.controller.js";
import { NotificationService } from "@/services/notification.service.js";
import { TaskService } from "@/services/task.service.js";

export const TaskController = {
  init() {
    this.bindEvents();
  },

  createTask(title, estimatedFocusUnits = 1) {
    if (TaskService.isTitleDuplicate(title)) {
      NotificationService.show({
        type: "error",
        message: "Task has already exist.",
        icon: "fa-triangle-exclamation",
        iconColor: "text-red-500/80",
        duration: 5000,
      });

      return;
    }

    const newTask = TaskService.addTask(title, estimatedFocusUnits);
    if (!newTask) return null;

    NotificationService.show({
      type: "success",
      message: `Task "${newTask.title}" created.`,
      icon: "fa-plus",
      iconColor: "text-emerald-500",
    });

    return newTask;
  },

  updateTask(taskId, newTitle, newEstimatedFocusUnits) {
    const updatedTask = TaskService.updateTask(
      taskId,
      newTitle,
      newEstimatedFocusUnits,
    );
    if (updatedTask) {
      NotificationService.show({
        type: "success",
        message: "Task updated successfully.",
        icon: "fa-pen-to-square",
        iconColor: "text-emerald-500",
      });
    }
    return updatedTask;
  },

  deleteTask(taskId) {
    const result = TaskService.deleteTask(taskId);
    if (!result) return;

    const { deletedTask, taskIndex, wasActive } = result;

    if (ModalController.editingTask?.id === deletedTask.id) {
      ModalController.editingTask = null;
    }

    ModalController.refreshTaskModal();

    NotificationService.show({
      type: "error",
      message: `Task "${deletedTask.title}" removed.`,
      undoAction: () => {
        TaskService.restoreTask(deletedTask, taskIndex, wasActive);
        ModalController.refreshTaskModal();
      },
    });
  },

  bindEvents() {
    document.addEventListener("click", (e) => {
      const btnSelect = e.target.closest("#btn-select-task");
      const boxEmpty = e.target.closest("#box-empty-task");

      if (btnSelect || boxEmpty) {
        ModalController.openTaskModal();
      }
    });
  },

  openTaskSelectionModal() {
    const taskTitle = prompt("Enter a task title for this focus session:");
    if (!taskTitle || !taskTitle.trim()) return;

    const estPomodoros = prompt("Estimated Pomodoros?", "1");
    this.createTask(taskTitle, Number(estPomodoros) || 1);
  },
};
