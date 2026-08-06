import { StateManager, state } from "@/models/state.model.js";

import { GlobalLoaderService } from "@/services/loader.service";
import { NotificationService } from "@/services/notification.service.js";
import { STORAGE_KEY } from "@/models/storage.model.js";
import { SettingsArchiveController } from "./settings-archive.controller.js";
import { generateDynamicMockData } from "@/utils/seed-generator";

export const SettingsResetController = {
  keydownHandler: null,

  init() {
    this.initResetModalEvents();
    this.initSeedEvents();
  },

  initSeedEvents() {
    document
      .getElementById("sett-seed-btn")
      ?.addEventListener("click", () => this.handleDataSeeding());
  },

  handleDataSeeding() {
    const seedBtn = document.getElementById("sett-seed-btn");
    const seedIcon = document.getElementById("sett-seed-icon");
    const seedSpinner = document.getElementById("sett-seed-spinner");
    const seedText = document.getElementById("sett-seed-text");

    const mockDataCount = Math.floor(Math.random() * 100);

    if (seedBtn) seedBtn.disabled = true;
    if (seedIcon) seedIcon.classList.replace("flex", "hidden");
    if (seedSpinner) seedSpinner.classList.replace("hidden", "flex");
    if (seedText)
      seedText.textContent = "Processing & Constructing Database Layers...";

    NotificationService.show({
      type: "info",
      message: `Initiating massive ${mockDataCount}-time matrix calculation...`,
      icon: "fa-gears",
      iconColor: "text-brand/80",
      duration: 5000,
    });

    setTimeout(() => {
      SettingsArchiveController.runAutoArchivePipeline();
      this.resetSession();
    }, 200);

    setTimeout(() => {
      try {
        const dynamicMockData = generateDynamicMockData(mockDataCount);

        // StateManager.save(dynamicMockData.times, dynamicMockData.tags || []);

        state.activeTab = "active";
        state.currentView = "times";

        setTimeout(() => {
          NotificationService.show({
            type: "success",
            message: `Sandbox environment populated with ${mockDataCount} edge-case routine logs.`,
            icon: "fa-circle-check",
            iconColor: "text-emerald-500/80",
            duration: 5000,
          });

          if (seedBtn) seedBtn.disabled = false;
          if (seedIcon) seedIcon.classList.replace("hidden", "flex");
          if (seedSpinner) seedSpinner.classList.replace("flex", "hidden");
          if (seedText) seedText.textContent = "Seed Historical Mock Data";
        }, 200);
      } catch (error) {
        console.error("Critical fault inside seeding controller:", error);

        if (seedBtn) seedBtn.disabled = false;
        if (seedIcon) seedIcon.classList.replace("hidden", "flex");
        if (seedSpinner) seedSpinner.classList.replace("flex", "hidden");

        NotificationService.show({
          type: "error",
          message: error.message || "Fail-Safe Trigger: Retry Seeding",
          icon: "fa-circle-exclamation",
          iconColor: "text-red-500/80",
          duration: 5000,
        });
      }
    }, 60);
  },

  resetSession() {
    StateManager.init();
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

    // Keydown handler for reset modal
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
    const previousTimes = StateManager.getTimes().map((time) => ({ ...time }));
    const previousTags = StateManager.getTags().map((tag) => ({ ...tag }));

    this.closeResetModal();

    GlobalLoaderService.show("Purging storage layers & resetting workspace...");

    setTimeout(() => {
      try {
        localStorage.removeItem(STORAGE_KEY);

        state.times = [];
        state.tags = [];
        state.activeTab = "active";
        state.currentView = "times";

        renderTimeList([], state.activeTab);

        NotificationService.show({
          type: "error",
          message:
            "Application synchronization storage has been completely cleared.",
          duration: 5000,
          undoAction: () => {
            GlobalLoaderService.show(
              "Re-instating application database state...",
            );
            setTimeout(() => {
              try {
                if (previousPayload) {
                  localStorage.setItem(STORAGE_KEY, previousPayload);
                } else {
                  localStorage.removeItem(STORAGE_KEY);
                }

                StateManager.save(previousTimes || [], previousTags || []);
                state.times = previousTimes || [];
                state.tags = previousTags || [];

                state.activeTab = "active";
                state.currentView = "times";

                renderTimeList(
                  StateManager.getFilteredTimes(),
                  state.activeTab,
                );
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
