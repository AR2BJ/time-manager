import {
  setPendingDeleteId,
  setPendingEditId,
} from "./time-form.controller.js";

import { GlobalLoaderService } from "@/services/loader.service.js";
import { NotificationService } from "@/services/notification.service.js";
import { SettingsArchiveController } from "../settings/settings-archive.controller.js";
import { SettingsController } from "../settings.controller.js";
import { StateManager } from "@/models/state.model.js";
import { TimeService } from "@/services/time.service.js";
import { openSubtimesState } from "@/utils/helpers.js";

export const TimeActionController = {
  init(mainController) {
    this.mainController = mainController;
    this.bindDynamicEvents();
  },

  bindDynamicEvents() {
    const listContainer = document.getElementById("time-list");
    if (!listContainer) return;

    listContainer.addEventListener("click", (e) => {
      const target = e.target;

      const toggleBtn = target.closest(".toggle-btn");
      if (toggleBtn) {
        const id = toggleBtn.dataset.id;
        const currentTimes = StateManager.getTimes();
        const time = currentTimes.find((t) => t.id === id);

        if (time) {
          GlobalLoaderService.show(`Updating state for "${time.title}"...`);

          setTimeout(() => {
            try {
              const updated = TimeService.toggleTime(currentTimes, id);
              StateManager.save(updated);
              this.mainController.refreshUI();

              const updatedTime = updated.find((t) => t.id === id);
              const isNowCompleted = updatedTime?.status === "done";

              NotificationService.show({
                type: isNowCompleted ? "success" : "info",
                message: isNowCompleted
                  ? `Time completed: "${time.title}" ✨`
                  : `Reopened time: "${time.title}".`,
                icon: isNowCompleted ? "fa-circle-check" : "fa-circle",
                iconColor: isNowCompleted
                  ? "text-emerald-500/80"
                  : "text-brand/80",
                duration: 5000,
              });
            } catch (error) {
              NotificationService.show({
                type: "error",
                message: error.message || "Failed to update time.",
              });
            } finally {
              GlobalLoaderService.hide();
            }
          }, 30);
        }
        return;
      }

      const statusBtn = target.closest(".status-change-btn");
      if (statusBtn) {
        const id = statusBtn.dataset.id;
        const newStatus = statusBtn.dataset.status;
        const currentTimes = StateManager.getTimes();
        const time = currentTimes.find((t) => t.id === id);

        if (time) {
          try {
            const updated = TimeService.updateTimeStatus(
              currentTimes,
              id,
              newStatus,
            );
            StateManager.save(updated);
            this.mainController.refreshUI();

            NotificationService.show({
              type: "success",
              message: `Status updated to "${newStatus.replace("_", " ")}"`,
              duration: 5000,
            });
          } catch (error) {
            NotificationService.show({
              type: "error",
              message: error.message,
            });
          }
        }
        return;
      }

      const subtimeBtn = target.closest(".subtime-toggle");
      if (subtimeBtn) {
        const timeId = subtimeBtn.dataset.timeId;
        const subtimeId = subtimeBtn.dataset.subtimeId;
        const currentTimes = StateManager.getTimes();

        try {
          const updated = TimeService.toggleSubtime(
            currentTimes,
            timeId,
            subtimeId,
          );

          const updatedTime = updated.find((t) => t.id === timeId);

          if (updatedTime && updatedTime.status === "done") {
            openSubtimesState.delete(timeId);
          }

          StateManager.save(updated);
          this.mainController.refreshUI();
        } catch (error) {
          console.error("Failed to toggle subtime:", error);
        }
        return;
      }

      const subtimeDeleteBtn = target.closest(".subtime-delete-btn");
      if (subtimeDeleteBtn) {
        const timeId = subtimeDeleteBtn.dataset.timeId;
        const subtimeId = subtimeDeleteBtn.dataset.subtimeId;
        const currentTimes = StateManager.getTimes();

        try {
          const updated = TimeService.deleteSubtime(
            currentTimes,
            timeId,
            subtimeId,
          );
          StateManager.save(updated);
          this.mainController.refreshUI();
        } catch (error) {
          console.error("Failed to delete subtime:", error);
        }
        return;
      }

      const editBtn = target.closest(".edit-btn");
      if (editBtn) {
        const id = editBtn.dataset.id;
        setPendingEditId(id);

        this.mainController.toggleModal("edit-modal", true);
        return;
      }

      const deleteBtn = target.closest(".delete-btn");
      if (deleteBtn) {
        setPendingDeleteId(deleteBtn.dataset.id);
        this.mainController.toggleModal("delete-modal", true);
        return;
      }

      const archiveBtn = target.closest(".archive-btn");
      if (archiveBtn) {
        const id = archiveBtn.dataset.id;
        const currentTimes = StateManager.getTimes();
        const targetTime = currentTimes.find((t) => t.id === id);

        if (targetTime) {
          GlobalLoaderService.show(`Archiving "${targetTime.title}"...`);

          setTimeout(() => {
            try {
              const updated = TimeService.archiveTime(currentTimes, id);
              StateManager.save(updated);
              this.mainController.refreshUI();

              NotificationService.show({
                type: "info",
                message: `Archived: "${targetTime.title}"`,
                duration: 5000,
                undoAction: () => {
                  GlobalLoaderService.show("Rolling back archive operation...");
                  setTimeout(() => {
                    try {
                      const rollbackTimes = StateManager.getTimes();
                      const restored = TimeService.restoreTime(
                        rollbackTimes,
                        id,
                      );
                      StateManager.save(restored);
                      this.mainController.refreshUI();
                    } finally {
                      GlobalLoaderService.hide();
                    }
                  }, 30);
                },
              });
            } finally {
              GlobalLoaderService.hide();
            }
          }, 30);
        }
        return;
      }

      const restoreBtn = target.closest(".restore-btn");
      if (restoreBtn) {
        const id = restoreBtn.dataset.id;
        const currentTimes = StateManager.getTimes();
        const targetTime = currentTimes.find((t) => t.id === id);

        if (targetTime) {
          GlobalLoaderService.show(`Restoring "${targetTime.title}"...`);

          setTimeout(() => {
            try {
              const updated = TimeService.restoreTime(currentTimes, id);
              StateManager.save(updated);

              StateManager.init();
              if (SettingsArchiveController.runAutoArchivePipeline) {
                SettingsArchiveController.runAutoArchivePipeline();
              }

              this.mainController.refreshUI();

              NotificationService.show({
                type: "info",
                message: `Restored: "${targetTime.title}"`,
                duration: 5000,
                undoAction: () => {
                  GlobalLoaderService.show("Re-archiving time...");
                  setTimeout(() => {
                    try {
                      const rollbackTimes = StateManager.getTimes();
                      const archived = TimeService.archiveTime(
                        rollbackTimes,
                        id,
                      );
                      StateManager.save(archived);
                      this.mainController.refreshUI();
                    } finally {
                      GlobalLoaderService.hide();
                    }
                  }, 30);
                },
              });
            } finally {
              GlobalLoaderService.hide();
            }
          }, 30);
        }
        return;
      }
    });
  },
};
