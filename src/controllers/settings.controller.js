import { SettingsExportController } from "./settings/settings-export.controller.js";
import { SettingsImportController } from "./settings/settings-import.controller.js";
import { SettingsResetController } from "./settings/settings-reset.controller.js";
import { StateManager } from "@/models/state.model.js";
import { getTheme } from "@/services/theme.service.js";
import { timerService } from "@/services/timer.service.js";

export const SettingsController = {
  init() {
    this.bindThemeEvents();
    this.bindBoundedInputEvents();
    this.bindSettingsEvents();

    // Initialize sub-controllers
    SettingsImportController.init();
    SettingsResetController.init();
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

  bindBoundedInputEvents() {
    const inputs = document.querySelectorAll(".bounded-numeric-input");

    inputs.forEach((input) => {
      const max = Number(input.dataset.max) || 99;

      input.addEventListener("input", (e) => {
        let val = e.target.value.replace(/\D/g, "");
        if (val !== "") {
          let numVal = parseInt(val, 10);
          if (numVal > max) numVal = max;
          if (numVal < 1) numVal = 1;
          val = numVal.toString();
        }
        e.target.value = val;
      });

      input.addEventListener("blur", (e) => {
        if (!e.target.value) e.target.value = "1";
        this.saveAllTimerSettings();
      });
    });
  },

  saveAllTimerSettings() {
    const pomodoroWorkTime =
      Number(document.getElementById("sett-pomo-len")?.value) || 25;
    const shortBreakTime =
      Number(document.getElementById("sett-short-break-len")?.value) || 5;
    const longBreakTime =
      Number(document.getElementById("sett-long-break-len")?.value) || 15;
    const longBreakInterval =
      Number(document.getElementById("sett-long-break-interval")?.value) || 4;

    const autoStartPomodoros =
      document.getElementById("sett-auto-start-pomo")?.checked || false;
    const autoStartBreaks =
      document.getElementById("sett-auto-start-break")?.checked || false;
    const disableBreaks =
      document.getElementById("sett-disable-breaks")?.checked || false;

    const volume = Number(document.getElementById("sett-volume")?.value) ?? 80;
    const pomodoroEndSound =
      document.getElementById("sett-pomo-end-sound")?.value || "bell";
    const breakEndSound =
      document.getElementById("sett-break-end-sound")?.value || "chime";
    const vibration =
      document.getElementById("sett-vibration")?.checked || false;
    const currentSoundId =
      document.getElementById("sett-sound-track")?.value || "none";

    StateManager.updateSettings({
      pomodoroWorkTime,
      shortBreakTime,
      longBreakTime,
      longBreakInterval,
      autoStartPomodoros,
      autoStartBreaks,
      disableBreaks,
      volume,
      pomodoroEndSound,
      breakEndSound,
      vibration,
      currentSoundId,
    });

    timerService.reset();
  },

  bindSettingsEvents() {
    // Checkboxes & Selects change event binding
    const genericElements = [
      "sett-auto-start-pomo",
      "sett-auto-start-break",
      "sett-disable-breaks",
      "sett-pomo-end-sound",
      "sett-break-end-sound",
      "sett-vibration",
      "sett-sound-track",
    ];

    genericElements.forEach((id) => {
      document
        .getElementById(id)
        ?.addEventListener("change", () => this.saveAllTimerSettings());
    });

    // Volume range slider
    const volumeEl = document.getElementById("sett-volume");
    volumeEl?.addEventListener("input", (e) => {
      const display = document.getElementById("sett-volume-val");
      if (display) display.textContent = `${e.target.value}%`;
      this.saveAllTimerSettings();
    });

    // Exports
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

    window.addEventListener("resize", () => this.syncThemeControls(getTheme()));
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
