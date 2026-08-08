import { StateManager } from "@/models/state.model.js";
import { formatTime } from "@/utils/helpers.js";

export class TimerDisplayComponent {
  constructor() {
    this.container = null;
    this.unsubscribeState = null;
    this.currentViewMode = "default";
  }

  render() {
    this.container = document.createElement("div");
    this.container.className =
      "lg:col-span-6 flex flex-col items-center justify-center bg-surface border border-border rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden order-1 lg:order-2";

    this.mountLayout();
    this.update();

    if (!this.unsubscribeState) {
      this.unsubscribeState = StateManager.subscribe(() => this.update());
    }

    this.bindEvents();
    return this.container;
  }

  mountLayout() {
    this.container.innerHTML = `
      <div
        class="relative flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 p-1.5 mb-6 w-full max-w-xs shadow-inner"
      >
        <div
          id="mode-indicator"
          class="absolute rounded-lg bg-brand/80 transition-all duration-300 ease-in-out"
        ></div>

        <button
          id="mode-pomodoro"
          data-mode="pomodoro"
          class="relative flex justify-center items-center gap-2 z-10 flex-1 py-2 text-sm font-semibold transition cursor-pointer text-center"
        >
          <i class="fa-regular fa-stopwatch pointer-events-none"></i>
          <span class="pointer-events-none">Pomodoro</span>
        </button>

        <button
          id="mode-flow"
          data-mode="flow"
          class="relative flex justify-center items-center gap-2 z-10 flex-1 py-2 text-sm font-semibold transition cursor-pointer text-center"
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
            Session Ready
          </span>
        </div>
      </div>

      <div
        id="timer-controls-container"
        class="mt-6 flex items-center gap-4 w-full justify-center min-h-14"
      >
        <button
          type="button"
          id="timer-start-toggle-btn"
          class="px-8 py-3.5 rounded-xl bg-brand hover:bg-brand/90 text-white font-semibold text-base shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
        >
          Start
        </button>

        <button
          type="button"
          id="timer-reset-btn"
          class="px-5 py-3.5 rounded-xl bg-surface-2 hover:bg-surface-3 text-secondary font-medium text-base transition-all duration-200 active:scale-95 cursor-pointer border border-border"
        >
          Reset
        </button>
      </div>
    `;
  }

  update() {
    if (!this.container) return;

    const state = StateManager.getState();
    const { activeMode, timer } = state;

    const isPomodoro = activeMode === "pomodoro";
    const displayTime = isPomodoro
      ? formatTime(timer.timeRemaining)
      : formatTime(timer.flowTime);

    const timerDisplayEl = this.container.querySelector("#timer-display");
    if (timerDisplayEl) {
      timerDisplayEl.textContent = displayTime;
    }

    const progressRing = this.container.querySelector("#timer-progress-ring");
    if (progressRing && isPomodoro) {
      const circumference = 879.64;
      const progress = timer.timeRemaining / (timer.duration || 1500);
      const offset = circumference - progress * circumference;
      progressRing.style.strokeDashoffset = `${offset}`;
    }

    const phaseBadge = this.container.querySelector("#timer-phase-badge");
    if (phaseBadge) {
      phaseBadge.textContent = isPomodoro
        ? timer.currentPhase === "work"
          ? "Focus Phase"
          : "Break Phase"
        : "Flow Mode";
    }
  }

  bindEvents() {
    this.container.addEventListener("click", (e) => {
      const modeBtn = e.target.closest("[data-mode]");
      if (modeBtn) {
        const mode = modeBtn.dataset.mode;
        StateManager.setMode(mode);
      }
    });
  }

  destroy() {
    if (this.unsubscribeState) this.unsubscribeState();
  }
}
