import { StateManager } from "@/models/state.model.js";
import { formatTime } from "@/utils/helpers.js";
import { timerService } from "@/services/timer.service.js";

export class TimerDisplayComponent {
  constructor() {
    this.container = null;
    this.unsubscribeState = null;
    this.currentViewMode = "default";
    this.onDocumentTouch = this.handleOutsideTouch.bind(this);
  }

  render() {
    this.container = document.createElement("div");
    this.container.className =
      "lg:col-span-4 flex flex-col items-center justify-center bg-surface border border-border rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden";

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
        class="relative flex flex-col w-full justify-center rounded-xl border border-border bg-surface p-1 mb-6 sm:flex-row sm:w-fit sm:justify-start"
      >
        <div
          id="mode-indicator"
          class="absolute top-1 left-1 h-12 w-[calc(100%-8px)] rounded-lg bg-brand/80 transition-all duration-300 xs:h-[calc(100%-8px)] sm:w-32"
        ></div>

        <button
          id="mode-pomodoro"
          data-mode="pomodoro"
          class="relative z-10 flex-1 w-full rounded-t-xl py-2 text-sm font-medium text-(--color-btn-primary-text) transition cursor-pointer text-center sm:w-35 xs:rounded-l-xl xs:rounded-tr-none"
        >
          <i class="fa-regular fa-stopwatch pointer-events-none"></i>
          <span class="pointer-events-none">Pomodoro</span>
        </button>

        <button
          id="mode-flow"
          data-mode="flow"
          class="relative z-10 flex-1 w-full rounded-none py-2 text-sm font-medium text-secondary transition cursor-pointer text-center sm:w-35"
        >
          <i class="fa-regular fa-water pointer-events-none"></i>
          <span class="pointer-events-none">Flow Mode</span>
        </button>
      </div>

      <div
        id="timer-ring-wrapper"
        class="relative group flex items-center justify-center w-50 h-50 xs:w-64 xs:h-64 sm:w-90 sm:h-90 lg:w-100 lg:h-100 2xl:w-110 2xl:h-110 transition cursor-pointer"
      >
        <button
          id="open-fullscreen-btn"
          type="button"
          class="absolute top-1 right-1 sm:top-6 sm:right-6 z-30 backdrop-blur-md duration-300 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-surface hover:bg-surface-2  text-secondary hover:text-color transition flex items-center justify-center cursor-pointer border border-border active:scale-95"
          title="Enter Fullscreen Focus"
        >
          <i
            class="fa-regular fa-expand text-xs sm:text-sm pointer-events-none"
          ></i>
        </button>

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
            class="mb-3 rounded-lg bg-brand/10 px-2 py-0.5 sm:px-4 sm:py-1 text-[8px] xs:text-[10px] sm:text-xs font-bold text-brand uppercase tracking-widest border border-brand/20"
          >
            Focus Phase
          </span>

          <span
            id="timer-display"
            class="font-[Mostin] text-2xl xs:text-3xl sm:text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold tracking-tighter text-color my-1"
          >
            25:00
          </span>

          <span
            id="timer-sub-info"
            class="mt-2 text-[8px] xs:text-[10px] sm:text-xs font-medium text-muted"
          >
            Session Ready
          </span>
        </div>
      </div>

      <div
        id="timer-controls-container"
        class="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 w-full min-h-14"
      >
        <button
          type="button"
          id="timer-start-toggle-btn"
          class="px-5 py-3 rounded-xl xs:px-6 xs:py-3.5 sm:px-8 sm:py-3.5 bg-brand hover:bg-brand/90 text-white font-semibold text-sm xs:text-base shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
        >
          Start Focus
        </button>

        <button
          type="button"
          id="timer-reset-btn"
          class="px-4 py-3 rounded-xl xs:px-5 xs:py-3.5 sm:px-5 sm:py-3.5 bg-surface-2 hover:bg-surface-3 text-secondary font-medium text-sm xs:text-base transition-all duration-200 active:scale-95 cursor-pointer border border-border"
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
    const isBreak =
      isPomodoro &&
      (timer.currentPhase === "shortBreak" ||
        timer.currentPhase === "longBreak");
    const isFlowBreak = activeMode === "flow" && timer.currentPhase === "break";

    const totalSeconds = isFlowBreak
      ? timer.timeRemaining
      : isPomodoro
        ? timer.timeRemaining
        : timer.flowTime;

    const displayTime = formatTime(totalSeconds);

    const timerDisplayEl = this.container.querySelector("#timer-display");
    if (timerDisplayEl) {
      timerDisplayEl.textContent = displayTime;
    }

    const phaseBadge = this.container.querySelector("#timer-phase-badge");
    if (phaseBadge) {
      if (isPomodoro) {
        if (isBreak) {
          phaseBadge.className =
            "mb-3 rounded-lg bg-emerald-500/10 px-2 py-0.5 sm:px-4 sm:py-1 text-[8px] xs:text-[10px] sm:text-xs font-bold text-emerald-500 uppercase tracking-widest border border-emerald-500/20";
        } else {
          phaseBadge.className =
            "mb-3 rounded-lg bg-brand/10 px-2 py-0.5 sm:px-4 sm:py-1 text-[8px] xs:text-[10px] sm:text-xs font-bold text-brand uppercase tracking-widest border border-brand/20";
        }
      } else {
        if (isFlowBreak) {
          phaseBadge.className =
            "mb-3 rounded-lg bg-emerald-500/10 px-2 py-0.5 sm:px-4 sm:py-1 text-[8px] xs:text-[10px] sm:text-xs font-bold text-emerald-500 uppercase tracking-widest border border-emerald-500/20";
        } else {
          phaseBadge.className =
            "mb-3 rounded-lg bg-brand/10 px-2 py-0.5 sm:px-4 sm:py-1 text-[8px] xs:text-[10px] sm:text-xs font-bold text-brand uppercase tracking-widest border border-brand/20";
        }
      }
    }
  }

  bindEvents() {
    const fullscreenBtn = this.container.querySelector("#open-fullscreen-btn");

    this.container.addEventListener(
      "touchstart",
      (e) => {
        if (e.target.closest("#open-fullscreen-btn")) return;

        this.showFullscreenBtn(fullscreenBtn);
      },
      { passive: true },
    );

    document.addEventListener("touchstart", this.onDocumentTouch, {
      passive: true,
    });

    this.container.addEventListener("click", (e) => {
      const toggleBtn = e.target.closest("#timer-start-toggle-btn");
      if (toggleBtn) {
        timerService.toggle();
        return;
      }

      const resetBtn = e.target.closest("#timer-reset-btn");
      if (resetBtn) {
        timerService.reset();
        return;
      }

      const modeBtn = e.target.closest("[data-mode]");
      if (modeBtn) {
        const mode = modeBtn.dataset.mode;
        StateManager.setMode(mode);
      }
    });
  }

  showFullscreenBtn(btn) {
    if (!btn) return;
    btn.classList.remove("opacity-0", "pointer-events-none");
    btn.classList.add("opacity-100", "pointer-events-auto");
  }

  hideFullscreenBtn(btn) {
    if (!btn) return;
    btn.classList.remove("opacity-100", "pointer-events-auto");
    btn.classList.add("opacity-0", "pointer-events-none");
  }

  handleOutsideTouch(e) {
    if (!this.container || this.container.contains(e.target)) return;
    const fullscreenBtn = this.container.querySelector("#open-fullscreen-btn");
    this.hideFullscreenBtn(fullscreenBtn);
  }

  destroy() {
    document.removeEventListener("touchstart", this.onDocumentTouch);
    if (this.unsubscribeState) this.unsubscribeState();
  }
}
