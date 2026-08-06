import { NotificationService } from "@/services/notification.service.js";
import { StateManager } from "@/models/state.model.js";

export const SettingsArchiveController = {
  init() {
    document
      .getElementById("sett-auto-archive-toggle")
      ?.addEventListener("click", () => this.handleAutoArchiveToggle());

    this.syncAutoArchiveToggle();
  },

  syncAutoArchiveToggle() {
    const current = localStorage.getItem("sett_auto_archive") === "true";
    const toggleBtn = document.getElementById("sett-auto-archive-toggle");
    const toggleDot = document.getElementById("sett-auto-archive-dot");

    if (current) {
      toggleBtn?.classList.replace("bg-neutral-300/80", "bg-brand/80");
      toggleBtn?.classList.replace(
        "dark:bg-neutral-700/80",
        "dark:bg-brand/80",
      );
      toggleDot?.classList.replace("translate-x-0", "translate-x-5");
    } else {
      toggleBtn?.classList.replace("bg-brand/80", "bg-neutral-300/80");
      toggleBtn?.classList.replace(
        "dark:bg-brand/80",
        "dark:bg-neutral-700/80",
      );
      toggleDot?.classList.replace("translate-x-5", "translate-x-0");
    }
  },

  handleAutoArchiveToggle() {
    const current = localStorage.getItem("sett_auto_archive") === "true";
    const nextState = !current;
    localStorage.setItem("sett_auto_archive", nextState ? "true" : "false");

    this.syncAutoArchiveToggle();

    NotificationService.show({
      type: "info",
      message: `Autonomous archiving pipeline has been ${nextState ? "activated" : "deactivated"}.`,
      icon: "fa-robot",
      iconColor: "text-brand/80",
      duration: 5000,
    });

    if (nextState) this.runAutoArchivePipeline();
  },

  runAutoArchivePipeline() {
    if (localStorage.getItem("sett_auto_archive") !== "true") return;

    const times = StateManager.getTimes() || [];
    if (times.length === 0) return;

    let modified = false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    times.forEach((time) => {
      if (time.archived === true) return;

      const allActivityDates = [...(time.completedDates || [])];
      let lastActivityDateStr = time.createdAt;

      if (allActivityDates.length > 0) {
        allActivityDates.sort();
        lastActivityDateStr = allActivityDates[allActivityDates.length - 1];
      }

      const lastActivityDate = new Date(lastActivityDateStr);
      lastActivityDate.setHours(0, 0, 0, 0);

      const msDiff = todayTimestamp - lastActivityDate.getTime();
      const daysDiff = Math.floor(msDiff / (1000 * 60 * 60 * 24));

      if (daysDiff >= 30) {
        time.archived = true;
        modified = true;
      }
    });

    if (modified) {
      StateManager.save(times);

      NotificationService.show({
        type: "info",
        message:
          "Stale times exceeding 30 days structural limits auto-archived.",
        icon: "fa-box-archive",
        iconColor: "text-brand/80",
        duration: 5000,
      });
    }
  },
};
