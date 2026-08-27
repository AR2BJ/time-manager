import {
  applyTheme,
  getTheme,
  setTheme,
  toggleTheme,
} from "@/services/theme.service.js";

import { GlobalLoaderService } from "@/services/loader.service";

export const ThemeController = {
  updateIcon(theme) {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;
    btn.innerHTML =
      theme === "dark"
        ? `<i class="fa-regular fa-sun text-yellow-500/80"></i>`
        : `<i class="fa-regular fa-moon text-secondary"></i>`;
    theme === "dark"
      ? btn.classList.replace("hover:bg-slate-600/10", "hover:bg-yellow-600/10")
      : btn.classList.replace(
          "hover:bg-yellow-600/10",
          "hover:bg-slate-600/10",
        );
  },

  init() {
    const currentTheme = getTheme();
    setTheme(currentTheme);
    this.updateIcon(currentTheme);

    const btn = document.getElementById("theme-toggle");

    btn?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      GlobalLoaderService.show("Recalibrating workspace interface...");

      setTimeout(() => {
        try {
          toggleTheme();
          const newTheme = getTheme();
          this.updateIcon(newTheme);

          const themeEvent = new CustomEvent("themeChanged", {
            detail: { theme: newTheme },
          });
          document.dispatchEvent(themeEvent);

          requestAnimationFrame(() => {
            setTimeout(() => {
              GlobalLoaderService.hide();
            }, 50);
          });
        } catch (error) {
          console.error("Theme switch failure:", error);
          GlobalLoaderService.hide();
        }
      }, 40);
    });

    window.addEventListener("storage", (e) => {
      if (e.key === "theme") {
        const newTheme = e.newValue || "dark";
        applyTheme(newTheme);
        this.updateIcon(newTheme);

        document.dispatchEvent(
          new CustomEvent("themeChanged", { detail: { theme: newTheme } }),
        );
      }
    });
  },
};
