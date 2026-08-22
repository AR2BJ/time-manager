import { AutocompleteComponent } from "@/components/ui/autocomplete.component.js";
import { SettingsExportController } from "./settings/settings-export.controller.js";
import { SettingsImportController } from "./settings/settings-import.controller.js";
import { SettingsResetController } from "./settings/settings-reset.controller.js";
import { SoundModel } from "@/models/sound.model.js";
import { SoundSelectorComponent } from "@/components/features/sound/sound-selector.component.js";
import { StateManager } from "@/models/state.model.js";
import { getTheme } from "@/services/theme.service.js";
import { soundService } from "@/services/sound.service.js";
import { timerService } from "@/services/timer.service.js";

const VOLUME_STEP = 5;

const updateRangeFill = (inputEl) => {
  if (!inputEl) return;
  const min = Number(inputEl.min) || 0;
  const max = Number(inputEl.max) || 100;
  const val = Number(inputEl.value) || 0;
  const pct = ((val - min) / (max - min)) * 100;
  inputEl.style.background = `linear-gradient(to right, var(--color-brand, #00bba7) ${pct}%, var(--color-surface-3, #334155) ${pct}%)`;
};

export const SettingsController = {
  soundSelector: null,
  pomoSoundAutocomplete: null,
  breakSoundAutocomplete: null,
  unsubscribeSound: null,
  unsubscribeState: null,

  init() {
    this.mountSoundSelector();
    this.mountAlertSoundSelectors();
    this.bindThemeEvents();
    this.bindBoundedInputEvents();
    this.bindSettingsEvents();
    this.listenToSoundChanges();

    this.unsubscribeState = StateManager.subscribe(() => {
      this.syncUI();
    });

    SettingsImportController.init();
    SettingsResetController.init();

    this.syncUI();
  },

  syncUI() {
    const { settings } = StateManager.getState();

    const pomoLen = document.getElementById("sett-pomo-len");
    if (pomoLen) pomoLen.value = settings.pomodoroWorkTime ?? 25;

    const shortBreak = document.getElementById("sett-short-break-len");
    if (shortBreak) shortBreak.value = settings.shortBreakTime ?? 5;

    const longBreak = document.getElementById("sett-long-break-len");
    if (longBreak) longBreak.value = settings.longBreakTime ?? 15;

    const longInterval = document.getElementById("sett-long-break-interval");
    if (longInterval) longInterval.value = settings.longBreakInterval ?? 4;

    const flowBreak = document.getElementById("sett-flow-break-len");
    if (flowBreak) flowBreak.value = settings.flowBreakTime ?? 15;

    const volume = document.getElementById("sett-volume");
    if (volume) {
      volume.value = settings.volume ?? 50;
      updateRangeFill(volume);
    }

    const volumeVal = document.getElementById("sett-volume-val");
    if (volumeVal) volumeVal.textContent = `${settings.volume ?? 50}%`;

    this.setToggleUI(
      "sett-auto-start-pomo",
      Boolean(settings.autoStartPomodoros),
    );
    this.setToggleUI(
      "sett-auto-start-break",
      Boolean(settings.autoStartBreaks),
    );
    this.setToggleUI("sett-disable-breaks", Boolean(settings.disableBreaks));
    this.setToggleUI(
      "sett-auto-start-flow-break",
      Boolean(settings.autoStartFlowBreaks),
    );

    if (this.pomoSoundAutocomplete) {
      this.pomoSoundAutocomplete.setValue(
        settings.pomodoroEndSound || "none",
        false,
      );
    }
    if (this.breakSoundAutocomplete) {
      this.breakSoundAutocomplete.setValue(
        settings.breakEndSound || "none",
        false,
      );
    }

    if (this.soundSelector) {
      this.soundSelector.syncSelectedTrack();
    }
  },

  setToggleUI(id, isChecked) {
    const btn = document.getElementById(id);
    if (!btn) return;

    btn.dataset.checked = String(isChecked);
    const dot = btn.querySelector("span");

    if (isChecked) {
      btn.classList.remove("bg-neutral-300/80", "dark:bg-neutral-700/80");
      btn.classList.add("bg-brand");
      if (dot) {
        dot.classList.remove("translate-x-0");
        dot.classList.add("translate-x-5");
      }
    } else {
      btn.classList.remove("bg-brand");
      btn.classList.add("bg-neutral-300/80", "dark:bg-neutral-700/80");
      if (dot) {
        dot.classList.remove("translate-x-5");
        dot.classList.add("translate-x-0");
      }
    }
  },

  mountSoundSelector() {
    const container = document.getElementById("sett-sound-selector-container");
    if (!container) return;

    if (this.soundSelector) {
      this.soundSelector.destroy();
    }

    this.soundSelector = new SoundSelectorComponent();
    container.innerHTML = "";
    container.appendChild(this.soundSelector.render());
  },

  mountAlertSoundSelectors() {
    const { settings } = StateManager.getState();

    const soundOptions = [
      { title: "Digital Bell", value: "bell", icon: "fa-regular fa-bell" },
      { title: "Soft Chime", value: "chime", icon: "fa-regular fa-wind" },
      { title: "Deep Gong", value: "gong", icon: "fa-regular fa-circle-dot" },
      { title: "Forest Birds", value: "birds", icon: "fa-regular fa-crow" },
      { title: "Mute", value: "none", icon: "fa-regular fa-volume-xmark" },
    ];

    let isInitializingPomo = true;
    const pomoContainer = document.getElementById(
      "sett-pomo-end-sound-container",
    );
    if (pomoContainer) {
      pomoContainer.innerHTML = "";
      this.pomoSoundAutocomplete = new AutocompleteComponent(
        pomoContainer,
        soundOptions,
        {
          label: "Pomodoro End Sound",
          placeholder: "Select sound...",
          itemTitle: "title",
          itemValue: "value",
          itemIcon: "icon",
          clearable: false,
          isRow: false,
          onChange: (selected) => {
            this.saveAllTimerSettings();
            if (!isInitializingPomo) {
              soundService.playNotificationSound(selected.value);
            }
          },
        },
      );
      this.pomoSoundAutocomplete.setValue(
        settings.pomodoroEndSound || "none",
        false,
      );
      isInitializingPomo = false;
    }

    let isInitializingBreak = true;
    const breakContainer = document.getElementById(
      "sett-break-end-sound-container",
    );
    if (breakContainer) {
      breakContainer.innerHTML = "";
      this.breakSoundAutocomplete = new AutocompleteComponent(
        breakContainer,
        soundOptions,
        {
          label: "Break End Sound",
          placeholder: "Select sound...",
          itemTitle: "title",
          itemValue: "value",
          itemIcon: "icon",
          clearable: false,
          isRow: false,
          onChange: (selected) => {
            this.saveAllTimerSettings();
            if (!isInitializingBreak) {
              soundService.playNotificationSound(selected.value);
            }
          },
        },
      );
      this.breakSoundAutocomplete.setValue(
        settings.breakEndSound || "none",
        false,
      );
      isInitializingBreak = false;
    }
  },

  bindBoundedInputEvents() {
    const inputs = document.querySelectorAll(".bounded-numeric-input");

    inputs.forEach((input) => {
      const min = Number(input.dataset.min) || 1;
      const max = Number(input.dataset.max) || 99;

      input.addEventListener("input", (e) => {
        let val = e.target.value.replace(/\D/g, "");
        e.target.value = val;
      });

      input.addEventListener("blur", (e) => {
        let val = e.target.value.trim();

        if (val === "") {
          e.target.value = String(min);
        } else {
          let numVal = Number(val);
          if (numVal < min) {
            e.target.value = String(min);
          } else if (numVal > max) {
            e.target.value = String(max);
          } else {
            e.target.value = String(numVal);
          }
        }

        this.saveAllTimerSettings();
      });
    });
  },

  getToggleState(id) {
    const btn = document.getElementById(id);
    return btn ? btn.dataset.checked === "true" : false;
  },

  updateToggleUI(btn) {
    if (!btn) return;
    const isChecked = btn.dataset.checked === "true";
    const newState = !isChecked;
    btn.dataset.checked = String(newState);

    const dot = btn.querySelector("span");

    if (newState) {
      btn.classList.remove("bg-neutral-300/80", "dark:bg-neutral-700/80");
      btn.classList.add("bg-brand");
      if (dot) {
        dot.classList.remove("translate-x-0");
        dot.classList.add("translate-x-5");
      }
    } else {
      btn.classList.remove("bg-brand");
      btn.classList.add("bg-neutral-300/80", "dark:bg-neutral-700/80");
      if (dot) {
        dot.classList.remove("translate-x-5");
        dot.classList.add("translate-x-0");
      }
    }
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

    const autoStartPomodoros = this.getToggleState("sett-auto-start-pomo");
    const autoStartBreaks = this.getToggleState("sett-auto-start-break");
    const disableBreaks = this.getToggleState("sett-disable-breaks");

    const flowBreakTime =
      Number(document.getElementById("sett-flow-break-len")?.value) || 15;
    const autoStartFlowBreaks = this.getToggleState(
      "sett-auto-start-flow-break",
    );

    const volume = Number(document.getElementById("sett-volume")?.value) ?? 50;
    const pomodoroEndSound = this.pomoSoundAutocomplete?.getValue() || "bell";
    const breakEndSound = this.breakSoundAutocomplete?.getValue() || "chime";

    StateManager.updateSettings({
      pomodoroWorkTime,
      shortBreakTime,
      longBreakTime,
      longBreakInterval,
      autoStartPomodoros,
      autoStartBreaks,
      disableBreaks,
      flowBreakTime,
      autoStartFlowBreaks,
      volume,
      pomodoroEndSound,
      breakEndSound,
      currentSoundId: SoundModel.getCurrentSoundId(),
    });

    timerService.reset();
  },

  bindSettingsEvents() {
    const genericElements = [
      "sett-auto-start-pomo",
      "sett-auto-start-break",
      "sett-disable-breaks",
      "sett-auto-start-flow-break",
    ];

    genericElements.forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", () => {
          this.updateToggleUI(btn);
          this.saveAllTimerSettings();
        });
      }
    });

    const volumeEl = document.getElementById("sett-volume");
    if (volumeEl) {
      updateRangeFill(volumeEl);

      volumeEl.addEventListener("input", (e) => {
        const val = Number(e.target.value);
        const display = document.getElementById("sett-volume-val");
        if (display) display.textContent = `${val}%`;

        updateRangeFill(e.target);

        if (typeof SoundModel.setVolume === "function") {
          SoundModel.setVolume(val);
        }

        if (typeof soundService?.setVolume === "function") {
          soundService.setVolume(val);
        }

        this.saveAllTimerSettings();
      });

      volumeEl.addEventListener("keydown", (e) => {
        if (
          ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"].includes(e.key)
        ) {
          e.preventDefault();
          const currentVol = Number(volumeEl.value) || 0;
          let targetVol = currentVol;

          if (e.key === "ArrowUp" || e.key === "ArrowRight") {
            targetVol = Math.min(100, currentVol + VOLUME_STEP);
          } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
            targetVol = Math.max(0, currentVol - VOLUME_STEP);
          }

          volumeEl.value = targetVol;
          const display = document.getElementById("sett-volume-val");
          if (display) display.textContent = `${targetVol}%`;

          updateRangeFill(volumeEl);

          if (typeof SoundModel.setVolume === "function") {
            SoundModel.setVolume(targetVol);
          }

          if (typeof soundService?.setVolume === "function") {
            soundService.setVolume(targetVol);
          }

          this.saveAllTimerSettings();
        }
      });
    }

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
        SettingsExportController.handleDataExport("csv"),
      );

    window.addEventListener("resize", () => this.syncThemeControls(getTheme()));
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

      btnDark.classList.replace("text-secondary", "text-color");
      btnLight.classList.replace("text-white", "text-secondary");
    } else {
      if (isDesktop) {
        indicator.classList.add("xs:translate-x-0");
      } else {
        indicator.classList.add("translate-y-0");
      }

      btnLight.classList.replace("text-secondary", "text-white");
      btnDark.classList.replace("text-color", "text-secondary");
    }
  },

  handleThemeSwitch(targetTheme) {
    const currentTheme = getTheme();
    if (currentTheme === targetTheme) return;

    document.getElementById("theme-toggle")?.click();
    this.syncThemeControls(targetTheme);
  },

  listenToSoundChanges() {
    if (typeof SoundModel.subscribe === "function") {
      this.unsubscribeSound = SoundModel.subscribe(() => {
        const volumeEl = document.getElementById("sett-volume");
        const displayEl = document.getElementById("sett-volume-val");

        const effectiveVol = SoundModel.getEffectiveVolume();

        if (volumeEl && Number(volumeEl.value) !== effectiveVol) {
          volumeEl.value = effectiveVol;
          updateRangeFill(volumeEl);
        }

        if (displayEl) {
          displayEl.textContent = `${effectiveVol}%`;
        }

        if (this.soundSelector) {
          this.soundSelector.syncSelectedTrack();
        }
      });
    }
  },

  destroy() {
    if (this.pomoSoundAutocomplete) this.pomoSoundAutocomplete.destroy();
    if (this.breakSoundAutocomplete) this.breakSoundAutocomplete.destroy();
    if (this.soundSelector) this.soundSelector.destroy();
    if (typeof this.unsubscribeSound === "function") this.unsubscribeSound();
    if (typeof this.unsubscribeState === "function") this.unsubscribeState();
  },
};
