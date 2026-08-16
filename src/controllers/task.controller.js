import { ModalController } from "./modal.controller";
import { StateManager } from "@/models/state.model.js";

export const TaskController = {
  init() {
    // this.bindEvents();
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
    StateManager.addTask(taskTitle, Number(estPomodoros) || 1);
  },
};
