import { SettingsArchiveController } from "./settings/settings-archive.controller.js";
import { SettingsExportController } from "./settings/settings-export.controller.js";
import { SettingsImportController } from "./settings/settings-import.controller.js";
import { SettingsResetController } from "./settings/settings-reset.controller.js";
import { SettingsTagController } from "./settings/settings-tag.controller.js";
import { getTheme } from "@/services/theme.service.js";

export const SettingsController = {
  init() {
    this.bindThemeEvents();
    this.bindSettingsEvents();

    // Initialize sub-controllers
    SettingsTagController.init();
    SettingsImportController.init();
    SettingsResetController.init();
    SettingsArchiveController.init();
  },

  bindThemeEvents() {
    document
      .getElementById("sett-theme-light")
      ?.addEventListener("click", () => this.handleThemeSwitch("light"));
    document
      .getElementById("sett-theme-dark")
      ?.addEventListener("click", () => this.handleThemeSwitch("dark"));

    document.addEventListener("themeChanged", (event) => {
      this.syncThemeControls(event.detail?.theme || getTheme());
    });

    this.syncThemeControls(getTheme());
  },

  bindSettingsEvents() {
    // Export events
    document
      .getElementById("sett-export-json-btn")
      ?.addEventListener("click", () =>
        SettingsExportController.handleDataExport("json"),
      );

    document
      .getElementById("sett-export-md-btn")
      ?.addEventListener("click", () =>
        SettingsExportController.handleDataExport("markdown"),
      );

    document
      .getElementById("sett-export-csv-btn")
      ?.addEventListener("click", () =>
        SettingsExportController.handleDataExport("notion"),
      );

    // Window resize handler for theme
    window.addEventListener("resize", () => {
      this.syncThemeControls(getTheme());
    });
  },

  syncThemeControls(targetTheme) {
    const indicator = document.getElementById("theme-tab-indicator");
    const btnLight = document.getElementById("sett-theme-light");
    const btnDark = document.getElementById("sett-theme-dark");

    if (!indicator || !btnLight || !btnDark) return;

    const isDesktop = window.screen.availWidth >= 375;

    indicator.classList.remove(
      "xs:translate-x-0",
      "xs:translate-x-full",
      "translate-y-0",
      "translate-y-full",
    );

    if (targetTheme === "dark") {
      if (isDesktop) {
        indicator.classList.add("xs:translate-x-full");
      } else {
        indicator.classList.add("translate-y-full");
      }

      btnDark.classList.replace("text-secondary", "text-primary");
      btnLight.classList.replace("text-white", "text-secondary");
    } else {
      if (isDesktop) {
        indicator.classList.add("xs:translate-x-0");
      } else {
        indicator.classList.add("translate-y-0");
      }

      btnLight.classList.replace("text-secondary", "text-white");
      btnDark.classList.replace("text-primary", "text-secondary");
    }
  },

  handleThemeSwitch(targetTheme) {
    const currentTheme = getTheme();
    if (currentTheme === targetTheme) return;

    document.getElementById("theme-toggle")?.click();
    this.syncThemeControls(targetTheme);
  },
};
