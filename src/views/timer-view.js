export const TimerView = {
  render() {
    return `
      <section
        id="timer-view"
        class="hidden w-full max-w-375 mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in"
      >
        <div class="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div class="lg:col-span-3 flex flex-col gap-6 order-2 lg:order-1">
            <div
              class="bg-surface border border-border rounded-3xl p-5 shadow-xs"
            >
              <div
                class="flex items-center justify-between mb-4 pb-3 border-b border-border"
              >
                <span
                  class="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2"
                >
                  <i class="fa-regular fa-headphones text-brand"></i>
                  Soundscape Player
                </span>
              </div>

              <div class="mb-4">
                <label
                  class="block text-[11px] font-bold uppercase tracking-wider text-muted mb-2"
                  >Select Sound</label
                >
                <div class="relative">
                  <select
                    id="sound-selector"
                    class="w-full rounded-xl border border-border bg-surface-2 p-3 text-xs font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-brand/40 cursor-pointer appearance-none pr-8"
                  >
                    <option value="rain-forest">Rain & Forest Stream</option>
                    <option value="brown-noise">Pure Brown Noise</option>
                    <option value="fireplace">Fireplace Crackle</option>
                    <option value="cafe">Cozy Cafe Ambience</option>
                  </select>
                  <i
                    class="fa-regular fa-chevron-down absolute right-3 top-3.5 text-xs text-muted pointer-events-none"
                  ></i>
                </div>
              </div>

              <div
                id="sound-track-card"
                class="p-3.5 rounded-2xl bg-surface-2 border border-border flex items-center justify-between"
              >
                <div class="flex flex-col min-w-0 pr-2">
                  <span
                    id="sound-track-title"
                    class="text-xs font-bold text-primary truncate"
                    >Rain & Forest Stream</span
                  >
                  <span class="text-[10px] text-muted">Ambient Background</span>
                </div>

                <button
                  id="btn-toggle-sound"
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white hover:bg-(--color-brand-hover) transition cursor-pointer shadow-sm active:scale-95"
                  title="Play / Pause Audio"
                >
                  <i
                    id="sound-icon"
                    class="fa-regular fa-play text-xs pointer-events-none"
                  ></i>
                </button>
              </div>
            </div>
          </div>

          <div
            class="lg:col-span-6 flex flex-col items-center justify-center bg-surface border border-border rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden order-1 lg:order-2"
          >
            <div
              class="relative flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 p-1.5 mb-6 w-full max-w-xs shadow-inner"
            >
              <div
                id="mode-indicator"
                class="absolute rounded-lg bg-brand/80 transition-all duration-300 ease-in-out"
              ></div>

              <button
                id="mode-pomodoro"
                class="relative flex justify-center items-center gap-2 z-10 flex-1 py-2 text-sm font-semibold text-(--color-btn-primary-text) transition cursor-pointer text-center"
              >
                <i class="fa-regular fa-stopwatch pointer-events-none"></i>
                <span class="pointer-events-none">Pomodoro</span>
              </button>

              <button
                id="mode-flow"
                class="relative flex justify-center items-center gap-2 z-10 flex-1 py-2 text-sm font-semibold text-secondary transition cursor-pointer text-center"
              >
                <i class="fa-regular fa-water pointer-events-none"></i>
                <span class="pointer-events-none">Flow Mode</span>
              </button>
            </div>

            <div
              class="relative flex items-center justify-center w-95 h-95 sm:w-110 sm:h-110"
            >
              <svg
                id="timer-svg-container"
                class="w-full h-full transform -rotate-90 origin-center relative z-0"
                viewBox="0 0 320 320"
              >
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  class="stroke-surface-3"
                  stroke-width="10"
                  fill="transparent"
                />

                <circle
                  id="timer-progress-ring"
                  cx="160"
                  cy="160"
                  r="140"
                  class="stroke-brand origin-center transition-all duration-300"
                  stroke-width="10"
                  stroke-linecap="round"
                  fill="transparent"
                  stroke-dasharray="879.64"
                  stroke-dashoffset="879.64"
                />
              </svg>

              <canvas
                id="flow-comet-canvas"
                width="320"
                height="320"
                class="absolute inset-0 w-full h-full pointer-events-none z-10 transition-opacity duration-300 opacity-0"
              ></canvas>

              <div
                class="absolute flex flex-col items-center justify-center text-center pointer-events-none select-none z-20"
              >
                <span
                  id="timer-phase-badge"
                  class="mb-3 rounded-full bg-brand/10 px-4 py-1 text-xs font-bold text-brand uppercase tracking-widest border border-brand/20"
                >
                  Focus Phase
                </span>

                <span
                  id="timer-display"
                  class="font-mono text-5xl sm:text-7xl font-extrabold tracking-tighter text-primary my-1"
                >
                  25:00
                </span>

                <span
                  id="timer-sub-info"
                  class="mt-2 text-xs font-medium text-muted"
                >
                  Session #1 ready
                </span>
              </div>
            </div>

            <div
              id="timer-controls-container"
              class="mt-6 flex items-center gap-4 w-full justify-center min-h-14"
            ></div>
          </div>

          <div class="lg:col-span-3 flex flex-col gap-6 order-3">
            <div id="active-task-container"></div>
            <div id="today-overview-container"></div>
          </div>
        </div>
      </section>
    `;
  },
};
