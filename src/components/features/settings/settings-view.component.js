import { SettingsResetComponent } from "@/components/modals/settings-reset-modal.component.js";
import { StateManager } from "@/models/state.model.js";

export const SettingsViewComponent = {
  renderToggle(id, isChecked) {
    return `
      <button
        type="button"
        id="${id}"
        data-checked="${isChecked}"
        class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-0.5 ${
          isChecked ? "bg-brand" : "bg-neutral-300/80 dark:bg-neutral-700/80"
        }"
      >
        <span
          id="${id}-dot"
          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isChecked ? "translate-x-5" : "translate-x-0"
          }"
        ></span>
      </button>
    `;
  },

  render() {
    const isDark =
      document.documentElement.classList.contains("dark") ||
      localStorage.getItem("theme") === "dark";

    const { settings } = StateManager.getState();

    return `
      <section
        id="settings-view"
        class="hidden"
      >
        <div
          class="flex flex-col gap-5 p-4 sm:p-6 max-w-2xl mx-auto w-full animate-fade-in pb-16"
        >
          <div class="flex flex-col gap-1 px-1">
            <h1
              class="text-xl sm:text-2xl font-bold text-color tracking-tight"
            >
              Application Settings
            </h1>
            <p class="text-xs sm:text-sm text-secondary leading-relaxed">
              Configure and manage your time tracking workspace environment.
            </p>
          </div>

          <div
            class="bg-surface rounded-2xl p-4 sm:p-6 flex flex-col gap-4 shadow-sm border border-border"
          >
            <div class="flex items-center gap-3 border-b border-border pb-3">
              <div
                class="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400/80 shrink-0"
              >
                <i class="fa-regular fa-palette text-sm"></i>
              </div>
              <div class="min-w-0">
                <h3
                  class="text-sm sm:text-base font-semibold text-color truncate"
                >
                  Appearance Theme
                </h3>
                <p class="text-[11px] sm:text-xs text-secondary truncate">
                  Customize how the interface looks on your device.
                </p>
              </div>
            </div>

            <div
              class="relative flex flex-col xs:flex-row w-full bg-surface-2 rounded-xl p-1 border border-border mt-1 gap-1 xs:gap-0"
            >
              <div
                id="theme-tab-indicator"
                class="absolute top-1 left-1 h-[calc(50%-4px)] w-[calc(100%-8px)] rounded-lg bg-brand/80 transition-all duration-300 xs:h-[calc(100%-8px)] xs:w-[calc(50%-4px)] ${
                  isDark
                    ? "translate-y-full xs:translate-x-full"
                    : "translate-y-0 xs:translate-x-0"
                }"
              ></div>

              <button
                id="sett-theme-light"
                class="relative z-10 w-full py-2.5 text-xs xs:text-sm font-medium rounded-lg transition cursor-pointer flex items-center justify-center gap-1 xs:w-1/2 text-white"
              >
                <i class="fa-regular fa-sun text-base"></i>
                <span>Light Mode</span>
              </button>

              <button
                id="sett-theme-dark"
                class="relative z-10 w-full py-2.5 text-xs xs:text-sm font-medium rounded-lg transition cursor-pointer flex items-center justify-center gap-1 xs:w-1/2 text-secondary"
              >
                <i class="fa-regular fa-moon text-base"></i>
                <span>Dark Mode</span>
              </button>
            </div>
          </div>

          <div
            class="bg-surface rounded-2xl p-4 sm:p-6 flex flex-col gap-4 shadow-sm border border-border"
          >
            <div class="flex items-center gap-3 border-b border-border pb-3">
              <div
                class="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0"
              >
                <i class="fa-regular fa-stopwatch text-sm"></i>
              </div>
              <div class="min-w-0">
                <h3
                  class="text-sm sm:text-base font-semibold text-color truncate"
                >
                  Pomodoro Configurations
                </h3>
                <p class="text-[11px] sm:text-xs text-secondary truncate">
                  Set durations and cycle bounds for Pomodoro sessions.
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  for="sett-pomo-len"
                  class="block text-xs font-semibold text-secondary mb-1 ps-1"
                >
                  Pomodoro Length (25m ~ 200m)
                </label>
                <input
                  id="sett-pomo-len"
                  type="text"
                  inputmode="numeric"
                  data-min="25"
                  data-max="200"
                  value="${settings.pomodoroWorkTime || 25}"
                  class="bounded-numeric-input w-full h-10 rounded-xl bg-surface-2 border border-border px-3 text-xs text-color focus:outline-none focus:border-brand transition"
                />
              </div>

              <div>
                <label
                  for="sett-short-break-len"
                  class="block text-xs font-semibold text-secondary mb-1 ps-1"
                >
                  Short Break Length (5m ~ 40m)
                </label>
                <input
                  id="sett-short-break-len"
                  type="text"
                  inputmode="numeric"
                  data-min="5"
                  data-max="40"
                  value="${settings.shortBreakTime || 5}"
                  class="bounded-numeric-input w-full h-10 rounded-xl bg-surface-2 border border-border px-3 text-xs text-color focus:outline-none focus:border-brand transition"
                />
              </div>

              <div>
                <label
                  for="sett-long-break-len"
                  class="block text-xs font-semibold text-secondary mb-1 ps-1"
                >
                  Long Break Length (15m ~ 120m)
                </label>
                <input
                  id="sett-long-break-len"
                  type="text"
                  inputmode="numeric"
                  data-min="15"
                  data-max="120"
                  value="${settings.longBreakTime || 15}"
                  class="bounded-numeric-input w-full h-10 rounded-xl bg-surface-2 border border-border px-3 text-xs text-color focus:outline-none focus:border-brand transition"
                />
              </div>

              <div>
                <label
                  for="sett-long-break-interval"
                  class="block text-xs font-semibold text-secondary mb-1 ps-1"
                >
                  Long Break Interval (1 ~ 20 Pomo)
                </label>
                <input
                  id="sett-long-break-interval"
                  type="text"
                  inputmode="numeric"
                  data-min="1"
                  data-max="20"
                  value="${settings.longBreakInterval || 4}"
                  class="bounded-numeric-input w-full h-10 rounded-xl bg-surface-2 border border-border px-3 text-xs text-color focus:outline-none focus:border-brand transition"
                />
              </div>
            </div>

            <div class="flex flex-col gap-3 pt-2 border-t border-border/60">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-color"
                  >Auto-start Next Pomodoro</span
                >
                ${SettingsViewComponent.renderToggle(
                  "sett-auto-start-pomo",
                  settings.autoStartPomodoros,
                )}
              </div>

              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-color"
                  >Auto-start Break</span
                >
                ${SettingsViewComponent.renderToggle(
                  "sett-auto-start-break",
                  settings.autoStartBreaks,
                )}
              </div>

              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-color"
                  >Disable Breaks</span
                >
                ${SettingsViewComponent.renderToggle(
                  "sett-disable-breaks",
                  settings.disableBreaks,
                )}
              </div>
            </div>
          </div>

          <div
            class="bg-surface rounded-2xl p-4 sm:p-6 flex flex-col gap-4 shadow-sm border border-border"
          >
            <div class="flex items-center gap-3 border-b border-border pb-3">
              <div
                class="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0"
              >
                <i class="fa-regular fa-water text-sm"></i>
              </div>
              <div class="min-w-0">
                <h3
                  class="text-sm sm:text-base font-semibold text-color truncate"
                >
                  Flow Configurations
                </h3>
                <p class="text-[11px] sm:text-xs text-secondary truncate">
                  Configure flow mode breaks and auto-start behavior.
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="col-span-2">
                <label
                  for="sett-flow-break-len"
                  class="block text-xs font-semibold text-secondary mb-1 ps-1"
                >
                  Flow Break Length (15m ~ 120m)
                </label>
                <input
                  id="sett-flow-break-len"
                  type="text"
                  inputmode="numeric"
                  data-min="15"
                  data-max="120"
                  value="${settings.flowBreakTime || 15}"
                  class="bounded-numeric-input w-full h-10 rounded-xl bg-surface-2 border border-border px-3 text-xs text-color focus:outline-none focus:border-brand transition"
                />
              </div>
            </div>

            <div class="flex flex-col gap-3 pt-2 border-t border-border/60">
              <div
                class="flex items-center justify-between w-full sm:w-auto gap-6"
              >
                <span class="text-xs font-medium text-color"
                  >Auto-start Flow Break</span
                >
                ${SettingsViewComponent.renderToggle(
                  "sett-auto-start-flow-break",
                  settings.autoStartFlowBreaks,
                )}
              </div>
            </div>
          </div>

          <div
            class="bg-surface rounded-2xl p-4 sm:p-6 flex flex-col gap-4 shadow-sm border border-border"
          >
            <div class="flex items-center gap-3 border-b border-border pb-3">
              <div
                class="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0"
              >
                <i class="fa-regular fa-volume-high text-sm"></i>
              </div>
              <div class="min-w-0">
                <h3
                  class="text-sm sm:text-base font-semibold text-color truncate"
                >
                  Audio & Haptics
                </h3>
                <p class="text-[11px] sm:text-xs text-secondary truncate">
                  Manage feedback sounds, volume, and background sounds.
                </p>
              </div>
            </div>

            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-1.5">
                <div class="flex justify-between items-center text-xs">
                  <span class="font-medium text-color">Volume</span>
                  <span
                    id="sett-volume-val"
                    class="font-bold text-brand"
                    >${settings.volume ?? 50}%</span
                  >
                </div>
                <input
                  type="range"
                  id="sett-volume"
                  min="0"
                  max="100"
                  step="5"
                  value="${settings.volume ?? 50}"
                  class="slider-fill-track w-full h-2 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-brand"
                  aria-label="Master Volume Control"
                />
              </div>

              <div class="flex flex-col gap-1.5 border-b border-border/60 pb-3">
                <div id="sett-sound-selector-container"></div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div id="sett-pomo-end-sound-container"></div>
                <div id="sett-break-end-sound-container"></div>
              </div>
            </div>
          </div>

          <div
            class="bg-surface rounded-2xl p-4 sm:p-6 flex flex-col gap-6 shadow-sm border border-border"
          >
            <div class="flex items-center gap-3 border-b border-border pb-3">
              <div
                class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500/80 flex items-center justify-center shrink-0"
              >
                <i class="fa-regular fa-share text-sm"></i>
              </div>
              <div class="min-w-0">
                <h3
                  class="text-sm sm:text-base font-semibold text-color truncate"
                >
                  Data Backup & Synchronization
                </h3>
                <p class="text-[11px] sm:text-xs text-secondary truncate">
                  Export core ledger, import backup snapshots, or reset storage.
                </p>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label
                class="text-[10px] sm:text-[11px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5"
              >
                <i class="fa-regular fa-file-export opacity-70"></i>
                <span>Export Application Ledger</span>
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  id="sett-export-json-btn"
                  class="w-full px-3 py-2.5 bg-surface-2 hover:bg-surface-3 border border-border rounded-xl text-color text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer group"
                >
                  <i
                    class="fa-regular fa-file-code text-amber-500/80 text-sm group-hover:scale-105 transition"
                  ></i>
                  <span>JSON Ledger</span>
                </button>
                <button
                  id="sett-export-md-btn"
                  class="w-full px-3 py-2.5 bg-surface-2 hover:bg-surface-3 border border-border rounded-xl text-color text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer group"
                >
                  <i
                    class="fa-brands fa-markdown text-indigo-500/80 text-sm group-hover:scale-105 transition"
                  ></i>
                  <span>Markdown Log</span>
                </button>
                <button
                  id="sett-export-csv-btn"
                  class="w-full px-3 py-2.5 bg-surface-2 hover:bg-surface-3 border border-border rounded-xl text-color text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer group"
                >
                  <i
                    class="fa-regular fa-table text-emerald-500/80 text-sm group-hover:scale-105 transition"
                  ></i>
                  <span>Spreadsheet CSV</span>
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-2 border-t border-border/60 pt-4">
              <label
                class="text-[10px] sm:text-[11px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5"
              >
                <i class="fa-regular fa-file-import opacity-70"></i>
                <span>Import Database Snapshot</span>
              </label>
              <div
                id="sett-dropzone"
                class="border-2 border-dashed border-border hover:border-brand/60 rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2 bg-surface-2/40 hover:bg-surface-2 transition cursor-pointer group text-center"
              >
                <i
                  class="fa-regular fa-cloud-arrow-up text-lg sm:text-xl text-secondary group-hover:text-brand/80 transition animate-pulse"
                ></i>
                <span class="text-xs font-semibold text-color px-2">
                  Drag & drop file here or
                  <span class="text-brand/80 font-bold"
                    >browse local files</span
                  >
                </span>
                <span class="text-[10px] text-secondary font-medium">
                  Supports validated .json backups, .md reports or structured
                  .csv tables
                </span>
                <input
                  type="file"
                  id="sett-import-file"
                  accept=".json,.md,.csv"
                  class="hidden"
                />
              </div>
            </div>
          </div>

          <div
            class="bg-surface rounded-2xl p-4 sm:p-6 flex flex-col gap-4 shadow-sm border border-border"
          >
            <div class="flex items-center gap-3 border-b border-border pb-3">
              <div
                class="w-8 h-8 rounded-lg bg-red-500/10 text-red-500/80 flex items-center justify-center shrink-0"
              >
                <i class="fa-regular fa-database text-sm"></i>
              </div>
              <div class="min-w-0">
                <h3
                  class="text-sm sm:text-base font-semibold text-color truncate"
                >
                  Storage & Factory Reset
                </h3>
                <p class="text-[11px] sm:text-xs text-secondary truncate">
                  Clear localized database structures and cache records.
                </p>
              </div>
            </div>

            <div
              class="w-full flex flex-wrap lg:flex-nowrap items-stretch lg:items-center justify-between bg-red-500/5 border border-red-500/20 rounded-xl p-3 sm:p-4 gap-3 mt-1"
            >
              <div class="flex flex-col gap-0.5 min-w-0">
                <span
                  class="text-xs sm:text-sm font-semibold text-red-600/80 dark:text-red-400/80"
                  >Reset All Database Records</span
                >
                <span
                  class="text-[11px] sm:text-xs text-secondary leading-relaxed"
                >
                  This action will wipe out all tracking histories and custom
                  timer permanently.
                </span>
              </div>

              <button
                id="trigger-reset-btn"
                class="w-full lg:w-36 px-4 py-2.5 rounded-xl bg-red-600/80 hover:bg-red-800/80 text-white font-medium text-xs sm:text-sm transition shadow-sm cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                <i class="fa-regular fa-trash-can text-xs"></i>
                <span>Reset Data</span>
              </button>
            </div>
          </div>
        </div>

        ${SettingsResetComponent.render()}
      </section>
    `;
  },
};
