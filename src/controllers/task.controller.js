import { ModalController } from "./modal.controller.js";
import { TaskService } from "@/services/task.service.js";

export const TaskController = {
  createTask(title, estimatedFocusUnits = 1) {
    return TaskService.addTask(title, estimatedFocusUnits);
  },

  updateTask(taskId, newTitle, newEstimatedFocusUnits) {
    return TaskService.updateTask(taskId, newTitle, newEstimatedFocusUnits);
  },

  deleteTask(taskId) {
    const result = TaskService.deleteTask(taskId);
    if (!result) return;

    const { deletedTask } = result;

    if (ModalController.editingTask?.id === deletedTask.id) {
      ModalController.editingTask = null;
    }

    ModalController.closeTaskModal();
    ModalController.openTaskModal();
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
