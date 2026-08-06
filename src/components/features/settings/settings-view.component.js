import { SettingsResetComponent } from "@/components/modals/settings-reset-modal.component.js";

export const SettingsViewComponent = {
  render() {
    const isDark =
      document.documentElement.classList.contains("dark") ||
      localStorage.getItem("theme") === "dark";

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
              class="text-xl sm:text-2xl font-bold text-primary tracking-tight"
            >
              Application Settings
            </h1>
            <p class="text-xs sm:text-sm text-secondary leading-relaxed">
              Configure and manage your V4 time tracking workspace environment.
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
                  class="text-sm sm:text-base font-semibold text-primary truncate"
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
                class="w-8 h-8 rounded-lg bg-brand/10 text-brand/80 flex items-center justify-center shrink-0"
              >
                <i class="fa-regular fa-tags text-sm"></i>
              </div>
              <div class="min-w-0">
                <h3
                  class="text-sm sm:text-base font-semibold text-primary truncate"
                >
                  Global Tag Management
                </h3>
                <p class="text-[11px] sm:text-xs text-secondary truncate">
                  Create, edit, or remove workspace tags globally.
                </p>
              </div>
            </div>

            <div class="flex flex-col xs:flex-row gap-2 items-center">
              <input
                type="text"
                id="sett-new-tag-input"
                placeholder="Enter new tag name..."
                class="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-2 text-xs sm:text-sm text-primary placeholder:text-muted truncate focus:outline-none focus:border-brand/80 transition"
              />
              <button
                id="sett-add-tag-btn"
                class="w-full xs:w-auto px-4 py-2 bg-brand/80 hover:bg-brand text-white font-medium text-xs sm:text-sm rounded-xl transition cursor-pointer shrink-0 flex justify-center items-center gap-1.5"
              >
                <i class="fa-regular fa-plus"></i>
                <span>Add Tag</span>
              </button>
            </div>

            <div
              id="sett-tags-list"
              class="flex flex-col gap-2 mt-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-surface-2 pe-1"
            >
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
                  class="text-sm sm:text-base font-semibold text-primary truncate"
                >
                  Data Backup & Sandbox
                </h3>
                <p class="text-[11px] sm:text-xs text-secondary truncate">
                  Export workspace records, import historical snapshots, or seed
                  environment mock data.
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
                  class="w-full px-3 py-2.5 bg-surface-2 hover:bg-surface-3 border border-border rounded-xl text-primary text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer group"
                >
                  <i
                    class="fa-regular fa-file-code text-amber-500/80 text-sm group-hover:scale-105 transition"
                  ></i>
                  <span>JSON Ledger</span>
                </button>

                <button
                  id="sett-export-md-btn"
                  class="w-full px-3 py-2.5 bg-surface-2 hover:bg-surface-3 border border-border rounded-xl text-primary text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer group"
                >
                  <i
                    class="fa-brands fa-markdown text-indigo-500/80 text-sm group-hover:scale-105 transition"
                  ></i>
                  <span>Markdown Log</span>
                </button>

                <button
                  id="sett-export-csv-btn"
                  class="w-full px-3 py-2.5 bg-surface-2 hover:bg-surface-3 border border-border rounded-xl text-primary text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer group"
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
                <i class="fa-regular fa-flask-vial opacity-70"></i>
                <span>Development & Sandbox</span>
              </label>
              <button
                id="sett-seed-btn"
                class="w-full px-4 py-2.5 bg-brand/5 hover:bg-brand/10 border border-brand/20 rounded-xl text-brand/80 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <div
                  id="sett-seed-icon"
                  class="flex"
                >
                  <i
                    class="fa-regular fa-flask text-sm transition-transform duration-200"
                  ></i>
                </div>
                <div
                  id="sett-seed-spinner"
                  class="hidden"
                >
                  <i class="fa-regular fa-spinner fa-spin text-sm"></i>
                </div>

                <span
                  id="sett-seed-text"
                  class="flex"
                  >Seed Historical Mock Data</span
                >
              </button>
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
                class="w-8 h-8 rounded-lg bg-brand/10 text-brand/80 flex items-center justify-center shrink-0"
              >
                <i class="fa-regular fa-brain-circuit text-sm"></i>
              </div>
              <div class="min-w-0">
                <h3
                  class="text-sm sm:text-base font-semibold text-primary truncate"
                >
                  Automation Rules
                </h3>
                <p class="text-[11px] sm:text-xs text-secondary truncate">
                  Configure autonomous pipeline structures for times archiving.
                </p>
              </div>
            </div>

            <div class="flex items-start justify-between gap-4 mt-1">
              <div class="flex flex-col gap-0.5 min-w-0">
                <span class="text-xs sm:text-sm font-medium text-primary"
                  >Auto-Archive Inactive Times</span
                >
                <span
                  class="text-[11px] sm:text-xs text-secondary leading-relaxed"
                >
                  Automatically shift time profiles to the archived tab if zero
                  commit logs are registered within the last 30 days.
                </span>
              </div>

              <button
                id="sett-auto-archive-toggle"
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-0.5 bg-neutral-300/80 dark:bg-neutral-700/80"
              >
                <span
                  id="sett-auto-archive-dot"
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0"
                ></span>
              </button>
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
                  times permanently.
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
