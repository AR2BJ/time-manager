import { StateManager, state } from "@/models/state.model.js";

import { AnalyticsController } from "./analytics.controller";
import { GlobalLoaderService } from "@/services/loader.service.js";
import { TimerController } from "./timer.controller";

export class NavigationController {
  static init() {
    this.bindNavigationEvents();
    this.bindKeyboardShortcuts();

    this.updateNavigationDOM();

    StateManager.subscribe(() => {
      this.updateNavigationDOM();
      TimerController.refreshUI();
    });
  }

  static bindNavigationEvents() {
    const navButtons = ["timer", "analytics", "settings"];

    navButtons.forEach((v) => {
      const desktopBtn = document.getElementById(`nav-${v}`);
      const mobileBtn = document.getElementById(`mobile-${v}`);

      const handleNav = () => {
        if (state.currentView === v) return;

        GlobalLoaderService.show(`Navigating...`);

        setTimeout(() => {
          try {
            StateManager.setView(v);

            navButtons.forEach((nav) => {
              const dEl = document.getElementById(`nav-${nav}`);
              const mEl = document.getElementById(`mobile-${nav}`);
              dEl?.classList.replace("text-brand/80", "text-secondary");
              mEl?.classList.replace("text-brand/80", "text-secondary");
            });

            desktopBtn?.classList.replace("text-secondary", "text-brand/80");
            mobileBtn?.classList.replace("text-secondary", "text-brand/80");

            if (v === "analytics") {
              AnalyticsController.dispatchRender(
                StateManager.getState().sessions,
              );
            }

            if (v === "timer") {
              TimerController.refreshUI();
            }
          } finally {
            GlobalLoaderService.hide();
          }
        }, 30);
      };

      desktopBtn?.addEventListener("click", handleNav);
      mobileBtn?.addEventListener("click", handleNav);
    });
  }

  static bindKeyboardShortcuts() {
    window.addEventListener("keydown", (event) => {
      const activeEl = document.activeElement;
      const key = event.key.toLowerCase();

      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.isContentEditable)
      ) {
        if (event.key === "Escape") activeEl.blur();
        return;
      }

      const dispatchAsyncClick = (elementId) => {
        event.preventDefault();
        setTimeout(() => {
          document.getElementById(elementId)?.click();
        }, 10);
      };

      if (event.shiftKey) {
        const key = event.key.toLowerCase();
        const viewMap = { t: "timer", a: "analytics", s: "settings" };
        if (viewMap[key]) {
          event.preventDefault();
          this.setView(viewMap[key]);
        }
      }

      if (event.altKey) {
        if (key === "b") {
          dispatchAsyncClick("scroll-to-top-btn");
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
              StateManager.setView("settings");
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
        if (key === "p") {
          dispatchAsyncClick("mode-pomodoro");
          return;
        }
        if (key === "f") {
          dispatchAsyncClick("mode-flow");
          return;
        }
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
        }
      }

      if (event.key === "?") {
        dispatchAsyncClick("help-toggle");
        return;
      }
    });
  }

  static setView(tabType) {
    StateManager.setView(tabType);

    if (tabType === "analytics") {
      AnalyticsController.dispatchRender(StateManager.getState().sessions);
    }
  }

  static updateNavigationDOM() {
    const views = ["timer", "analytics", "settings"];
    const currentView = state.currentView;

    views.forEach((v) => {
      const el = document.getElementById(`${v}-view`);
      if (el) {
        if (currentView === v) el.classList.replace("hidden", "flex");
        else el.classList.replace("flex", "hidden");
      }

      const desktopBtn = document.getElementById(`nav-${v}`);
      const mobileBtn = document.getElementById(`mobile-${v}`);

      if (currentView === v) {
        desktopBtn?.classList.replace("text-secondary", "text-brand/80");
        desktopBtn?.classList.add("shadow-brand/10", "active");
        mobileBtn?.classList.replace("text-secondary", "text-brand/80");
        mobileBtn?.classList.add("active");
      } else {
        desktopBtn?.classList.replace("text-brand/80", "text-secondary");
        desktopBtn?.classList.remove("shadow-brand/10", "active");
        mobileBtn?.classList.replace("text-brand/80", "text-secondary");
        mobileBtn?.classList.remove("active");
      }
    });
  }
}
