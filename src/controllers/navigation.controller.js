import { StateManager, state } from "@/models/state.model.js";

import { AnalyticsController } from "./analytics.controller.js";
import { CalendarController } from "./calendar.controller.js";
import { GlobalLoaderService } from "@/services/loader.service.js";
import { MatrixController } from "./matrix.controller.js";
import { TimeController } from "./time.controller.js";

export class NavigationController {
  static tagKeyBuffer = "";
  static tagKeyTimeoutId = null;
  static TAG_KEY_TIMEOUT = 200;

  static init() {
    this.setupNavigationListeners();
    this.setupKeyboardShortcuts();
    this.setDefaultActive();
  }

  static setupNavigationListeners() {
    document.getElementById("nav-times")?.addEventListener("click", () => {
      this.setActiveTab("times");
      TimeController.updateTabStyles(state.activeTab);
    });
    document.getElementById("nav-analytics")?.addEventListener("click", () => {
      this.setActiveTab("analytics");
    });
    document.getElementById("nav-calendar")?.addEventListener("click", () => {
      this.setActiveTab("calendar");
    });
    document.getElementById("nav-matrix")?.addEventListener("click", () => {
      this.setActiveTab("matrix");
    });
    document.getElementById("nav-settings")?.addEventListener("click", () => {
      this.setActiveTab("settings");
    });

    document.getElementById("mobile-times")?.addEventListener("click", () => {
      this.setActiveTab("times");
      TimeController.updateTabStyles(state.activeTab);
    });
    document
      .getElementById("mobile-analytics")
      ?.addEventListener("click", () => {
        this.setActiveTab("analytics");
      });
    document
      .getElementById("mobile-calendar")
      ?.addEventListener("click", () => {
        this.setActiveTab("calendar");
      });
    document.getElementById("mobile-matrix")?.addEventListener("click", () => {
      this.setActiveTab("matrix");
    });
    document
      .getElementById("mobile-settings")
      ?.addEventListener("click", () => {
        this.setActiveTab("settings");
      });
  }

  static setupKeyboardShortcuts() {
    window.addEventListener("keydown", (event) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.isContentEditable)
      ) {
        if (event.key === "Escape") {
          activeEl.blur();
          this.closeAllActiveModals();
        }
        return;
      }

      const key = event.key.toLowerCase();

      if (event.key === "Escape") {
        event.preventDefault();
        this.closeAllActiveModals();
        return;
      }

      const dispatchAsyncClick = (elementId) => {
        event.preventDefault();
        setTimeout(() => {
          document.getElementById(elementId)?.click();
        }, 10);
      };

      if (event.altKey) {
        if (key === "b") {
          dispatchAsyncClick("scroll-to-top-btn");
          return;
        }
        if (key === "c") {
          dispatchAsyncClick("btn-toggle-time-form");
          return;
        }
        if (key === "t") {
          dispatchAsyncClick("theme-toggle");
          return;
        }
        if (key === "n") {
          dispatchAsyncClick("menu-toggle");
          return;
        }
        if (key === "r") {
          event.preventDefault();

          GlobalLoaderService.show("Redirecting to purge terminal...");

          setTimeout(() => {
            try {
              this.setActiveTab("settings");
              const resetBtn =
                document.getElementById("trigger-reset-btn") ||
                document.querySelector('[id*="reset"]');

              setTimeout(() => resetBtn.click(), 10);
            } finally {
              GlobalLoaderService.hide();
            }
          }, 50);
          return;
        }
        if (key === "a") {
          dispatchAsyncClick("tab-active");
          return;
        }
        if (key === "d") {
          dispatchAsyncClick("tab-completed");
          return;
        }
        if (key === "x") {
          dispatchAsyncClick("tab-archived");
          return;
        }
        // NavigationController.js

        if (["1", "2", "3"].includes(event.key)) {
          const currentSection = document.querySelector("section:not(.hidden)");
          if (!currentSection) return;

          if (currentSection.id === "analytics-view") {
            const chartViewButtons = Array.from(
              document.querySelectorAll(
                "#heatmap-mobile-menu button, #chart-view-switcher button, button[data-view]",
              ),
            ).filter(
              (btn) =>
                !btn.disabled &&
                window.getComputedStyle(btn).display !== "none",
            );

            const targetButton = chartViewButtons[parseInt(event.key, 10) - 1];
            if (targetButton) {
              event.preventDefault();
              setTimeout(() => targetButton.click(), 10);
            }
          }

          if (currentSection.id === "calendar-view") {
            const calendarTabs = [
              document.getElementById("btn-calendar-day"),
              document.getElementById("btn-calendar-month"),
              document.getElementById("btn-calendar-year"),
            ];

            const targetBtn = calendarTabs[parseInt(event.key, 10) - 1];
            if (targetBtn) {
              event.preventDefault();
              setTimeout(() => targetBtn.click(), 10);
            }
          }

          if (currentSection.id === "matrix-view") {
            const matrixTabs = [
              document.getElementById("btn-matrix-eisenhower"),
              document.getElementById("btn-matrix-abcde"),
            ];

            const targetBtn = matrixTabs[parseInt(event.key, 10) - 1];
            if (targetBtn) {
              event.preventDefault();
              setTimeout(() => targetBtn.click(), 10);
            }
          }
        }
      }

      if (event.shiftKey) {
        if (["t", "a", "c", "m", "s"].includes(key)) {
          event.preventDefault();

          const viewNames = {
            t: "Times Dashboard",
            a: "Analytical Metrics",
            m: "Priority Matrix",
            c: "Calendar View",
            s: "System Settings",
          };
          const targetTab =
            key === "t"
              ? "times"
              : key === "a"
                ? "analytics"
                : key === "m"
                  ? "matrix"
                  : key === "c"
                    ? "calendar"
                    : "settings";

          GlobalLoaderService.show(`Navigating to ${viewNames[key]}...`);

          setTimeout(() => {
            try {
              this.setActiveTab(targetTab);
            } finally {
              GlobalLoaderService.hide();
            }
          }, 40);
          return;
        }
      }

      if (key === "/") {
        const searchInput =
          document.getElementById("search-times") ||
          document.querySelector('input[type="search"]');
        if (searchInput) {
          event.preventDefault();
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      if (event.key === "?") {
        dispatchAsyncClick("help-toggle");
        return;
      }

      if (
        ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(event.key)
      ) {
        const currentSection = document.querySelector("section:not(.hidden)");
        if (currentSection && currentSection.id === "times-view") {
          event.preventDefault();
          this.queueTagShortcutKey(event.key);
        }
      }
    });
  }

  static queueTagShortcutKey(digit) {
    if (this.tagKeyTimeoutId) {
      clearTimeout(this.tagKeyTimeoutId);
    }

    if (this.tagKeyBuffer.length >= 2) {
      this.tagKeyBuffer = digit;
    } else {
      this.tagKeyBuffer += digit;
    }

    this.tagKeyTimeoutId = setTimeout(() => {
      this.processTagShortcutKey();
    }, this.TAG_KEY_TIMEOUT);
  }

  static processTagShortcutKey() {
    const index = parseInt(this.tagKeyBuffer, 10);
    this.tagKeyBuffer = "";
    this.tagKeyTimeoutId = null;

    const tagButtons = Array.from(
      document.querySelectorAll("#tag-filters button, .tag-filter-btn"),
    ).filter((btn) => {
      const style = window.getComputedStyle(btn);
      return (
        !btn.disabled &&
        style.display !== "none" &&
        style.visibility !== "hidden"
      );
    });

    const targetButton = tagButtons[index];
    if (targetButton) {
      setTimeout(() => targetButton.click(), 10);
    }
  }

  static closeAllActiveModals() {
    const modalIds = [
      "help-modal",
      "time-modal",
      "delete-modal",
      "reset-modal",
      "edit-modal",
    ];
    modalIds.forEach((id) => {
      const modal = document.getElementById(id);
      if (modal && !modal.classList.contains("hidden")) {
        modal.querySelector('[id*="close"], [id*="btn-close"]')?.click() ||
          modal.classList.add("hidden");
      }
    });
  }

  static handleViewSwitch(view) {
    StateManager.setView(view);
    TimeController.refreshUI();
  }

  static setActiveTab(tabType) {
    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.getElementById(`nav-${tabType}`)?.classList.add("active");

    document.querySelectorAll(".mobile-nav-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.getElementById(`mobile-${tabType}`)?.classList.add("active");

    this.handleViewSwitch(tabType);
    this.showSection(tabType);

    if (tabType === "analytics") {
      AnalyticsController.dispatchRender(StateManager.getTimes());
    }

    if (tabType === "calendar") {
      CalendarController.dispatchRender();
    }

    if (tabType === "matrix") {
      MatrixController.dispatchRender();
    }
  }

  static showSection(sectionType) {
    document.querySelectorAll('section[id$="-view"]').forEach((section) => {
      section.classList.add("hidden");
    });
    document.getElementById(`${sectionType}-view`)?.classList.remove("hidden");
  }

  static setDefaultActive() {
    this.setActiveTab("times");
  }
}
