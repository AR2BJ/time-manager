import { SettingsResetComponent } from "@/components/modals/settings-reset-modal.component.js";
import { StateManager } from "@/models/state.model.js";

export const SettingsViewComponent = {
  render() {
    const isDark =
      document.documentElement.classList.contains("dark") ||
      localStorage.getItem("theme") === "dark";

    const { settings } = StateManager.getState();

    return `
      <section id="settings-view" class="hidden">
        <div class="flex flex-col gap-5 p-4 sm:p-6 max-w-2xl mx-auto w-full animate-fade-in pb-16">
          <div class="flex flex-col gap-1 px-1">
            <h1 class="text-xl sm:text-2xl font-bold text-primary tracking-tight">
              Application Settings
            </h1>
            <p class="text-xs sm:text-sm text-secondary leading-relaxed">
              Configure and manage your time tracking workspace environment.
            </p>
          </div>

          <div class="bg-surface rounded-2xl p-4 sm:p-6 flex flex-col gap-4 shadow-sm border border-border">
            <div class="flex items-center gap-3 border-b border-border pb-3">
              <div class="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400/80 shrink-0">
                <i class="fa-regular fa-palette text-sm"></i>
              </div>
              <div class="min-w-0">
                <h3 class="text-sm sm:text-base font-semibold text-primary truncate">Appearance Theme</h3>
                <p class="text-[11px] sm:text-xs text-secondary truncate">Customize how the interface looks on your device.</p>
              </div>
            </div>

            <div class="relative flex flex-col xs:flex-row w-full bg-surface-2 rounded-xl p-1 border border-border mt-1 gap-1 xs:gap-0">
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

          <div class="bg-surface rounded-2xl p-4 sm:p-6 flex flex-col gap-4 shadow-sm border border-border">
            <div class="flex items-center gap-3 border-b border-border pb-3">
              <div class="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                <i class="fa-regular fa-stopwatch text-sm"></i>
              </div>
              <div class="min-w-0">
                <h3 class="text-sm sm:text-base font-semibold text-primary truncate">Timer Configurations</h3>
                <p class="text-[11px] sm:text-xs text-secondary truncate">Set durations and cycle bounds for focus sessions.</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="sett-pomo-len" class="block text-xs font-semibold text-secondary mb-1 ps-1">
                  Pomodoro Length (Max 120m)
                </label>
                <input
                  id="sett-pomo-len"
                  type="text"
                  inputmode="numeric"
                  data-max="120"
                  value="${settings.pomodoroWorkTime || 25}"
                  class="bounded-numeric-input w-full h-10 rounded-xl bg-surface-2 border border-border px-3 text-xs text-primary focus:outline-none focus:border-brand transition"
                />
              </div>

              <div>
                <label for="sett-short-break-len" class="block text-xs font-semibold text-secondary mb-1 ps-1">
                  Short Break Length (Max 60m)
                </label>
                <input
                  id="sett-short-break-len"
                  type="text"
                  inputmode="numeric"
                  data-max="60"
                  value="${settings.shortBreakTime || 5}"
                  class="bounded-numeric-input w-full h-10 rounded-xl bg-surface-2 border border-border px-3 text-xs text-primary focus:outline-none focus:border-brand transition"
                />
              </div>

              <div>
                <label for="sett-long-break-len" class="block text-xs font-semibold text-secondary mb-1 ps-1">
                  Long Break Length (Max 90m)
                </label>
                <input
                  id="sett-long-break-len"
                  type="text"
                  inputmode="numeric"
                  data-max="90"
                  value="${settings.longBreakTime || 15}"
                  class="bounded-numeric-input w-full h-10 rounded-xl bg-surface-2 border border-border px-3 text-xs text-primary focus:outline-none focus:border-brand transition"
                />
              </div>

              <div>
                <label for="sett-long-break-interval" class="block text-xs font-semibold text-secondary mb-1 ps-1">
                  Long Break Interval (Max 12 Pomo)
                </label>
                <input
                  id="sett-long-break-interval"
                  type="text"
                  inputmode="numeric"
                  data-max="12"
                  value="${settings.longBreakInterval || 4}"
                  class="bounded-numeric-input w-full h-10 rounded-xl bg-surface-2 border border-border px-3 text-xs text-primary focus:outline-none focus:border-brand transition"
                />
              </div>
            </div>

            <div class="flex flex-col gap-3 pt-2 border-t border-border/60">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-primary">Auto-start Next Pomodoro</span>
                <input
                  type="checkbox"
                  id="sett-auto-start-pomo"
                  ${settings.autoStartPomodoros ? "checked" : ""}
                  class="w-4 h-4 accent-brand cursor-pointer"
                />
              </div>

              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-primary">Auto-start Break</span>
                <input
                  type="checkbox"
                  id="sett-auto-start-break"
                  ${settings.autoStartBreaks ? "checked" : ""}
                  class="w-4 h-4 accent-brand cursor-pointer"
                />
              </div>

              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-primary">Disable Breaks</span>
                <input
                  type="checkbox"
                  id="sett-disable-breaks"
                  ${settings.disableBreaks ? "checked" : ""}
                  class="w-4 h-4 accent-brand cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div class="bg-surface rounded-2xl p-4 sm:p-6 flex flex-col gap-4 shadow-sm border border-border">
            <div class="flex items-center gap-3 border-b border-border pb-3">
              <div class="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                <i class="fa-regular fa-volume-high text-sm"></i>
              </div>
              <div class="min-w-0">
                <h3 class="text-sm sm:text-base font-semibold text-primary truncate">Audio & Haptics</h3>
                <p class="text-[11px] sm:text-xs text-secondary truncate">Manage feedback sounds, volume, and ambient audio.</p>
              </div>
            </div>

            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-1.5">
                <div class="flex justify-between items-center text-xs">
                  <span class="font-medium text-primary">Volume</span>
                  <span id="sett-volume-val" class="font-bold text-brand">${settings.volume ?? 80}%</span>
                </div>
                <input
                  type="range"
                  id="sett-volume"
                  min="0"
                  max="100"
                  value="${settings.volume ?? 80}"
                  class="w-full h-2 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-brand"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-medium text-secondary">Pomodoro End Sound</label>
                  <select
                    id="sett-pomo-end-sound"
                    class="w-full h-10 rounded-xl bg-surface-2 border border-border px-3 text-xs text-primary focus:outline-none focus:border-brand"
                  >
                    <option value="bell" ${settings.pomodoroEndSound === "bell" ? "selected" : ""}>Digital Bell</option>
                    <option value="chime" ${settings.pomodoroEndSound === "chime" ? "selected" : ""}>Soft Chime</option>
                    <option value="gong" ${settings.pomodoroEndSound === "gong" ? "selected" : ""}>Deep Gong</option>
                    <option value="none" ${settings.pomodoroEndSound === "none" ? "selected" : ""}>Mute</option>
                  </select>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-medium text-secondary">Break End Sound</label>
                  <select
                    id="sett-break-end-sound"
                    class="w-full h-10 rounded-xl bg-surface-2 border border-border px-3 text-xs text-primary focus:outline-none focus:border-brand"
                  >
                    <option value="chime" ${settings.breakEndSound === "chime" ? "selected" : ""}>Soft Chime</option>
                    <option value="bell" ${settings.breakEndSound === "bell" ? "selected" : ""}>Digital Bell</option>
                    <option value="birds" ${settings.breakEndSound === "birds" ? "selected" : ""}>Forest Birds</option>
                    <option value="none" ${settings.breakEndSound === "none" ? "selected" : ""}>Mute</option>
                  </select>
                </div>
              </div>

              <div class="flex items-center justify-between border-t border-border/60 pt-3">
                <span class="text-xs font-medium text-primary">Vibration Reminder</span>
                <input
                  type="checkbox"
                  id="sett-vibration"
                  ${settings.vibration ? "checked" : ""}
                  class="w-4 h-4 accent-brand cursor-pointer"
                />
              </div>

              <div class="flex flex-col gap-1.5 border-t border-border/60 pt-3">
                <label class="text-xs font-medium text-secondary">White Noise (Ambient Player Sync)</label>
                <select
                  id="sett-sound-track"
                  class="w-full h-10 rounded-xl bg-surface-2 border border-border px-3 text-xs text-primary focus:outline-none focus:border-brand"
                >
                  <option value="none" ${settings.currentSoundId === "none" ? "selected" : ""}>None (Off)</option>
                  <option value="rain" ${settings.currentSoundId === "rain" ? "selected" : ""}>Soft Rain</option>
                  <option value="cafe" ${settings.currentSoundId === "cafe" ? "selected" : ""}>Cozy Cafe</option>
                  <option value="waves" ${settings.currentSoundId === "waves" ? "selected" : ""}>Ocean Waves</option>
                  <option value="forest" ${settings.currentSoundId === "forest" ? "selected" : ""}>Night Forest</option>
                </select>
              </div>
            </div>
          </div>

          <div class="bg-surface rounded-2xl p-4 sm:p-6 flex flex-col gap-6 shadow-sm border border-border">
            <div class="flex items-center gap-3 border-b border-border pb-3">
              <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500/80 flex items-center justify-center shrink-0">
                <i class="fa-regular fa-share text-sm"></i>
              </div>
              <div class="min-w-0">
                <h3 class="text-sm sm:text-base font-semibold text-primary truncate">Data Backup & Sandbox</h3>
                <p class="text-[11px] sm:text-xs text-secondary truncate">Export workspace records, import snapshots, or seed mock data.</p>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] sm:text-[11px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <i class="fa-regular fa-file-export opacity-70"></i>
                <span>Export Application Ledger</span>
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button id="sett-export-json-btn" class="w-full px-3 py-2.5 bg-surface-2 hover:bg-surface-3 border border-border rounded-xl text-primary text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer group">
                  <i class="fa-regular fa-file-code text-amber-500/80 text-sm group-hover:scale-105 transition"></i>
                  <span>JSON Ledger</span>
                </button>
                <button id="sett-export-md-btn" class="w-full px-3 py-2.5 bg-surface-2 hover:bg-surface-3 border border-border rounded-xl text-primary text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer group">
                  <i class="fa-brands fa-markdown text-indigo-500/80 text-sm group-hover:scale-105 transition"></i>
                  <span>Markdown Log</span>
                </button>
                <button id="sett-export-csv-btn" class="w-full px-3 py-2.5 bg-surface-2 hover:bg-surface-3 border border-border rounded-xl text-primary text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer group">
                  <i class="fa-regular fa-table text-emerald-500/80 text-sm group-hover:scale-105 transition"></i>
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
                <span class="text-xs font-semibold text-primary px-2">
                  Drag & drop file here or
                  <span class="text-brand/80 font-bold"
                    >browse local files</span
                  >
                </span>
                <span class="text-[10px] text-secondary font-medium"
                  >Supports validated .json backups, .md reports or structured
                  .csv tables</span
                >
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
                  class="text-sm sm:text-base font-semibold text-primary truncate"
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

        ${SettingsResetComponent.render()}
      </section>
    `;
  },
};
