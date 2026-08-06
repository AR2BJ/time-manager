export const TimerView = {
  render() {
    return `
      <section
        id="timer-view"
        class="w-full min-w-0 flex flex-col items-center justify-center py-6 animate-fade-in"
      >
        <div
          class="relative flex-col w-full xs:flex-row xs:w-fit xs:justify-start mb-8 flex items-center justify-center gap-2 rounded-xl border border-border bg-surface p-1.5 shadow-sm"
        >
          <div
            id="mode-indicator"
            class="absolute rounded-lg bg-brand/80 transition-all duration-300 ease-in-out"
          ></div>

          <button
            id="mode-pomodoro"
            class="relative flex justify-center items-center gap-2 z-10 flex-1 w-full rounded-t-xl py-2 text-sm font-medium text-(--color-btn-primary-text) transition cursor-pointer text-center xs:w-30 xs:rounded-l-xl xs:rounded-tr-none"
          >
            <i class="fa-regular fa-stopwatch"></i>
            Pomodoro
          </button>

          <button
            id="mode-flow"
            class="relative flex justify-center items-center gap-2 z-10 flex-1 w-full rounded-none py-2 text-sm font-medium text-secondary transition cursor-pointer text-center xs:w-30"
          >
            <i class="fa-regular fa-water"></i>
            Flow Mode
          </button>
        </div>

        <div class="mb-8 w-full max-w-md">
          <div
            class="flex items-center justify-between rounded-xl border border-border bg-surface p-3 shadow-xs"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand"
              >
                <i class="fa-regular fa-bullseye-arrow"></i>
              </span>
              <div class="min-w-0 flex-col">
                <p
                  class="text-[11px] font-bold uppercase tracking-wider text-muted"
                >
                  Active Focus Task
                </p>
                <p
                  id="active-task-title"
                  class="truncate text-sm font-semibold text-primary"
                >
                  Select or create task...
                </p>
              </div>
            </div>

            <button
              id="btn-select-active-task"
              class="shrink-0 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-secondary hover:text-primary hover:bg-surface-3 transition cursor-pointer"
            >
              Change Task
            </button>
          </div>
        </div>

        <div class="relative my-4 flex items-center justify-center">
          <div
            class="relative flex h-72 w-72 sm:h-80 sm:w-80 items-center justify-center rounded-full border-4 border-surface-2 bg-surface shadow-inner"
          >
            <div class="flex flex-col items-center justify-center text-center">
              <span
                id="timer-phase-badge"
                class="mb-3 rounded-full bg-brand/10 px-3.5 py-1 text-xs font-bold text-brand uppercase tracking-widest"
              >
                Focus Phase
              </span>

              <span
                id="timer-display"
                class="font-mono text-6xl sm:text-7xl font-extrabold tracking-tighter text-primary select-none"
              >
                25:00
              </span>

              <span
                id="timer-sub-info"
                class="mt-3 text-xs font-medium text-muted"
              >
                Session #1 ready
              </span>
            </div>
          </div>
        </div>

        <div
          class="mt-4 mb-8 flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2 shadow-xs"
        >
          <i class="fa-regular fa-headphones text-brand text-sm"></i>
          <span class="text-xs font-medium text-secondary"
            >Background Sound:</span
          >

          <select
            id="sound-selector"
            class="bg-transparent text-xs font-semibold text-primary focus:outline-none cursor-pointer"
          >
            <option value="rain-forest">Rain & Forest Stream</option>
            <option value="brown-noise">Pure Brown Noise</option>
            <option value="fireplace">Fireplace Crackle</option>
          </select>

          <div class="h-3 w-px bg-border mx-1"></div>

          <button
            id="btn-toggle-sound"
            class="text-secondary hover:text-brand transition cursor-pointer text-sm"
            title="Toggle Audio"
          >
            <i
              id="sound-icon"
              class="fa-regular fa-volume-xmark"
            ></i>
          </button>
        </div>

        <div class="flex items-center gap-4">
          <button
            id="btn-timer-reset"
            class="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface text-secondary hover:text-primary hover:bg-surface-2 transition cursor-pointer shadow-xs"
            title="Reset Timer"
          >
            <i class="fa-regular fa-rotate-left text-lg"></i>
          </button>

          <button
            id="btn-timer-toggle"
            class="flex h-14 min-w-50 items-center justify-center gap-3 rounded-2xl bg-brand px-8 text-base font-bold text-white shadow-lg shadow-brand/20 hover:bg-(--color-brand-hover) transition-all cursor-pointer active:scale-95"
          >
            <i
              id="timer-toggle-icon"
              class="fa-solid fa-play"
            ></i>
            <span id="timer-toggle-label">Start Focus</span>
          </button>

          <button
            id="btn-timer-finish-flow"
            class="hidden h-12 items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 text-xs font-bold text-emerald-600 hover:bg-emerald-500/20 transition cursor-pointer"
            title="Save Session"
          >
            <i class="fa-regular fa-check"></i>
            Complete Session
          </button>
        </div>
      </section>
    `;
  },
};
