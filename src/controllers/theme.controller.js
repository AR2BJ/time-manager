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

    if (theme === "dark") {
      btn.innerHTML = `<i id="btn-sun" class="ti ti-sun text-yellow-500/80 text-lg lg:text-xl transition-transform duration-300 ease-in-out"></i>`;
      btn.classList.replace("hover:bg-slate-600/10", "hover:bg-yellow-600/10");
    } else {
      btn.innerHTML = `
        <div class="relative w-5 h-5 flex items-center justify-center">
          <i id="btn-moon" class="ti ti-moon text-secondary text-lg lg:text-xl absolute transition-all duration-300 ease-in-out opacity-100 scale-100"></i>
          <i id="btn-moon-stars" class="ti ti-moon-stars text-secondary text-lg lg:text-xl absolute transition-all duration-300 ease-in-out opacity-0 scale-75 -rotate-12"></i>
        </div>
      `;
      btn.classList.replace("hover:bg-yellow-600/10", "hover:bg-slate-600/10");
    }
  },

  init() {
    const currentTheme = getTheme();
    setTheme(currentTheme);
    this.updateIcon(currentTheme);
    this.bindEvent();

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

  bindEvent() {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;

    btn.addEventListener("mouseenter", () => {
      const sunIcon = document.getElementById("btn-sun");
      const moonIcon = document.getElementById("btn-moon");
      const moonStarsIcon = document.getElementById("btn-moon-stars");

      if (sunIcon) {
        sunIcon.classList.add("rotate-45", "scale-110");
        sunIcon.classList.replace("ti-sun", "ti-sun-high");
      }

      if (moonIcon && moonStarsIcon) {
        moonIcon.classList.replace("opacity-100", "opacity-0");
        moonIcon.classList.replace("scale-100", "scale-75");

        moonStarsIcon.classList.replace("opacity-0", "opacity-100");
        moonStarsIcon.classList.replace("scale-75", "scale-110");
      }
    });

    btn.addEventListener("mouseleave", () => {
      const sunIcon = document.getElementById("btn-sun");
      const moonIcon = document.getElementById("btn-moon");
      const moonStarsIcon = document.getElementById("btn-moon-stars");

      if (sunIcon) {
        sunIcon.classList.remove("rotate-45", "scale-110");
        sunIcon.classList.replace("ti-sun-high", "ti-sun");
      }

      if (moonIcon && moonStarsIcon) {
        moonIcon.classList.replace("opacity-0", "opacity-100");
        moonIcon.classList.replace("scale-75", "scale-100");

        moonStarsIcon.classList.replace("opacity-100", "opacity-0");
        moonStarsIcon.classList.replace("scale-110", "scale-75");
      }
    });
  },
};
