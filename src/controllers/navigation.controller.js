import { StateManager, state } from "@/models/state.model.js";

import { GlobalLoaderService } from "@/services/loader.service.js";
import { TimerController } from "./timer.controller";

export class NavigationController {
  static init() {
    this.bindNavigationEvents();
    this.bindKeyboardShortcuts();

    this.updateNavigationDOM();

    StateManager.subscribe(() => {
      this.updateNavigationDOM();
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
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.isContentEditable)
      ) {
        if (event.key === "Escape") activeEl.blur();
        return;
      }

      if (event.shiftKey) {
        const key = event.key.toLowerCase();
        const viewMap = { t: "timer", a: "analytics", s: "settings" };
        if (viewMap[key]) {
          event.preventDefault();
          StateManager.setView(viewMap[key]);
        }
      }
    });
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
