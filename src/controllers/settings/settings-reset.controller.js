import { StateManager, state } from "@/models/state.model.js";

import { GlobalLoaderService } from "@/services/loader.service.js";
import { NoteController } from "../note.controller";
import { NoteModel } from "@/models/note.model";
import { NoteService } from "@/services/note.service";
import { NotificationService } from "@/services/notification.service.js";
import { STORAGE_KEY } from "@/models/storage.model.js";
import { SoundModel } from "@/models/sound.model.js";
import { TimerController } from "../timer.controller";
import { soundService } from "@/services/sound.service.js";

export const SettingsResetController = {
  keydownHandler: null,

  init() {
    this.initResetModalEvents();
  },

  closeResetModal() {
    const resetModal = document.getElementById("settings-reset-modal");
    if (!resetModal) return;

    resetModal.classList.add("hidden");
    resetModal.classList.remove("flex");

    document.body.classList.remove("overflow-hidden");
  },

  initResetModalEvents() {
    const triggerResetBtn = document.getElementById("trigger-reset-btn");
    const resetModal = document.getElementById("settings-reset-modal");
    const cancelResetBtn = document.getElementById("cancel-settings-reset");
    const confirmResetBtn = document.getElementById("confirm-settings-reset");

    triggerResetBtn?.addEventListener("click", () => {
      resetModal?.classList.replace("hidden", "flex");
      document.body.classList.add("overflow-hidden");
    });
    cancelResetBtn?.addEventListener("click", () => this.closeResetModal());

    confirmResetBtn?.addEventListener("click", () => {
      this.closeResetModal();
      this.executeApplicationReset();
    });

    if (this.keydownHandler) {
      document.removeEventListener("keydown", this.keydownHandler);
    }

    this.keydownHandler = (e) => {
      const resetModal = document.getElementById("settings-reset-modal");
      const resetOpen = resetModal && !resetModal.classList.contains("hidden");

      if (!resetOpen) return;

      if (e.key === "Escape" || e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
      }

      if (e.key === "Escape") this.closeResetModal();
      if (e.ctrlKey && e.key === "Enter")
        document.getElementById("confirm-settings-reset")?.click();
    };

    document.addEventListener("keydown", this.keydownHandler);
  },

  executeApplicationReset() {
    const previousPayload = localStorage.getItem(STORAGE_KEY);

    const previousState = {
      tasks: (state.tasks || []).map((t) => ({ ...t })),
      notes: (state.notes || []).map((t) => ({ ...t })),
      sessions: (state.sessions || []).map((s) => ({ ...s })),
      settings: { ...state.settings },
      activeMode: state.activeMode,
      activeTaskId: state.activeTaskId,
      timer: { ...state.timer },
    };

    this.closeResetModal();

    GlobalLoaderService.show("Purging storage layers & resetting workspace...");

    setTimeout(() => {
      try {
        StateManager.resetToDefaults();
        soundService.stopAll();

        StateManager.setView("timer");
        TimerController.refreshUI();

        NotificationService.show({
          type: "error",
          message:
            "Application synchronization storage and audio settings have been completely reset",
          duration: 5000,
          undoAction: () => {
            GlobalLoaderService.show(
              "Re-instating application database state...",
            );
            setTimeout(() => {
              try {
                if (previousPayload) {
                  localStorage.setItem(STORAGE_KEY, previousPayload);
                }

                state.tasks = previousState.tasks;
                state.notes = previousState.notes;
                state.sessions = previousState.sessions;
                state.settings = previousState.settings;
                state.activeMode = previousState.activeMode;
                state.activeTaskId = previousState.activeTaskId;
                state.timer = previousState.timer;

                SoundModel.init(previousState.settings);
                NoteService.restoreNotes(previousState.notes);
                NoteController.init();

                StateManager.setView("timer");

                StateManager.save();
                StateManager.notify();
                TimerController.refreshUI();
              } finally {
                GlobalLoaderService.hide();
              }
            }, 30);
          },
        });
      } finally {
        GlobalLoaderService.hide();
      }
    }, 50);
  },
};
