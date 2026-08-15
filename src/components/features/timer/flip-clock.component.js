import { StateManager } from "@/models/state.model.js";
import { formatTime } from "@/utils/helpers.js";
import { timerService } from "@/services/timer.service.js";

export class FlipClockComponent {
  constructor() {
    this.overlay = null;
    this.wakeLock = null;
    this.unsubscribeState = null;
    this.prevMinutes = null;
    this.prevSeconds = null;
    this.eventsBound = false;
  }

  render() {
    if (this.overlay) return this.overlay;

    this.overlay = document.createElement("div");
    this.overlay.id = "flip-clock-overlay";
    this.overlay.className =
      "fixed inset-0 z-50 hidden flex flex-col items-center justify-between bg-[#030712] p-6 sm:p-10 select-none overflow-hidden transition-opacity duration-300 opacity-0";

    this.overlay.innerHTML = `
      <div class="w-full max-w-6xl flex items-center justify-between z-20">
        <div 
          id="flip-phase-badge" 
          class="px-4 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold tracking-widest uppercase shadow-xs"
        >
          FOCUS PHASE
        </div>

        <button
          id="exit-fullscreen-btn"
          type="button"
          class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center cursor-pointer border border-white/10 active:scale-95"
          title="Exit Fullscreen"
        >
          <i class="fa-regular fa-compress text-base sm:text-lg pointer-events-none"></i>
        </button>
      </div>

      <div class="my-auto flex-1 flex items-center justify-center gap-4 sm:gap-8 md:gap-14 perspective-1000 w-full max-w-5xl py-6">
        <div id="flip-card-minutes" class="relative w-36 h-48 xs:w-44 xs:h-60 sm:w-64 sm:h-80 md:w-80 md:h-104 bg-surface rounded-2xl sm:rounded-3xl shadow-2xl border border-white/10 flex flex-col overflow-hidden">
        </div>

        <div class="text-4xl sm:text-7xl md:text-9xl font-black text-white/30 select-none flex items-center justify-center pb-2 sm:pb-4 animate-pulse">:</div>

        <div id="flip-card-seconds" class="relative w-36 h-48 xs:w-44 xs:h-60 sm:w-64 sm:h-80 md:w-80 md:h-104 bg-surface rounded-2xl sm:rounded-3xl shadow-2xl border border-white/10 flex flex-col overflow-hidden">
        </div>
      </div>

      <div 
        id="flip-controls-container" 
        class="mb-4 sm:mb-8 flex items-center justify-center gap-3 sm:gap-4 z-20 rounded-2xl"
      >
      </div>
    `;

    document.body.appendChild(this.overlay);
    this.bindEvents();

    return this.overlay;
  }

  async open() {
    this.render();
    this.overlay.classList.remove("hidden");
    void this.overlay.offsetWidth;
    this.overlay.classList.remove("opacity-0");

    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen request declined:", err);
    }

    await this.requestWakeLock();

    if (!this.unsubscribeState) {
      this.unsubscribeState = StateManager.subscribe(() => this.update());
    }

    this.prevMinutes = null;
    this.prevSeconds = null;
    this.update(true);
  }

  async close() {
    if (!this.overlay) return;

    this.overlay.classList.add("opacity-0");
    setTimeout(() => this.overlay.classList.add("hidden"), 300);

    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.warn("Exit fullscreen failure:", err);
      }
    }

    this.releaseWakeLock();

    if (this.unsubscribeState) {
      this.unsubscribeState();
      this.unsubscribeState = null;
    }
  }

  async requestWakeLock() {
    try {
      if ("wakeLock" in navigator) {
        this.wakeLock = await navigator.wakeLock.request("screen");
      }
    } catch (err) {
      console.warn("Wake Lock acquisition failed:", err);
    }
  }

  releaseWakeLock() {
    if (this.wakeLock) {
      this.wakeLock.release().then(() => {
        this.wakeLock = null;
      });
    }
  }

  update(force = false) {
    if (!this.overlay || this.overlay.classList.contains("hidden")) return;

    const state = StateManager.getState();
    const { activeMode, timer } = state;

    const isPomodoro = activeMode === "pomodoro";
    const totalSeconds = isPomodoro ? timer.timeRemaining : timer.flowTime;
    const formatted = formatTime(totalSeconds);
    const [mins, secs] = formatted.split(":");

    const minCard = this.overlay.querySelector("#flip-card-minutes");
    const secCard = this.overlay.querySelector("#flip-card-seconds");

    if (force || this.prevMinutes === null) {
      this.setCardValues(minCard, mins, mins);
      this.prevMinutes = mins;
    } else if (mins !== this.prevMinutes) {
      this.animateCardFlip(minCard, this.prevMinutes, mins);
      this.prevMinutes = mins;
    }

    if (force || this.prevSeconds === null) {
      this.setCardValues(secCard, secs, secs);
      this.prevSeconds = secs;
    } else if (secs !== this.prevSeconds) {
      this.animateCardFlip(secCard, this.prevSeconds, secs);
      this.prevSeconds = secs;
    }

    const badge = this.overlay.querySelector("#flip-phase-badge");
    if (badge) {
      badge.textContent = isPomodoro
        ? timer.currentPhase === "work"
          ? "Focus Phase"
          : "Break Phase"
        : "Flow Mode";
    }

    // Update Controls State dynamically (like TimerController)
    this.updateControlsState(timer);
  }

  updateControlsState(timer) {
    const controlsContainer = this.overlay.querySelector(
      "#flip-controls-container",
    );
    if (!controlsContainer) return;

    const { isRunning, isPaused } = timer;
    const currentControlState =
      isRunning && !isPaused ? "running" : isPaused ? "paused" : "idle";

    if (controlsContainer.dataset.state !== currentControlState) {
      controlsContainer.dataset.state = currentControlState;

      if (currentControlState === "idle") {
        controlsContainer.innerHTML = `
          <button
            id="btn-flip-start"
            type="button"
            class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-brand hover:bg-brand/90 text-white flex items-center justify-center transition-all transform active:scale-95 shadow-lg cursor-pointer"
            title="Start"
          >
            <i class="fa-solid fa-play text-lg sm:text-xl pointer-events-none"></i>
          </button>
        `;
      } else if (currentControlState === "running") {
        controlsContainer.innerHTML = `
          <button
            id="btn-flip-pause"
            type="button"
            class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center transition-all transform active:scale-95 shadow-lg cursor-pointer"
            title="Pause"
          >
            <i class="fa-solid fa-pause text-lg sm:text-xl pointer-events-none"></i>
          </button>
        `;
      } else if (currentControlState === "paused") {
        controlsContainer.innerHTML = `
          <button
            id="btn-flip-stop"
            type="button"
            class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all transform active:scale-95 shadow-lg cursor-pointer"
            title="Stop & Transition"
          >
            <i class="fa-solid fa-square text-lg sm:text-xl pointer-events-none"></i>
          </button>

          <button
            id="btn-flip-continue"
            type="button"
            class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-brand hover:bg-brand/90 text-white flex items-center justify-center transition-all transform active:scale-95 shadow-lg cursor-pointer"
            title="Continue"
          >
            <i class="fa-solid fa-play text-lg sm:text-xl pointer-events-none"></i>
          </button>
        `;
      }
    }
  }

  setCardValues(cardEl, topVal, botVal) {
    if (!cardEl) return;
    cardEl.innerHTML = `
      <div class="absolute inset-x-0 top-0 h-1/2 bg-[#1e293b] rounded-t-2xl sm:rounded-t-3xl border-b border-black/60 flex items-end justify-center overflow-hidden">
        <span class="text-6xl xs:text-7xl sm:text-9xl md:text-[11rem] font-mono font-black text-white translate-y-1/2 leading-none">
          ${topVal}
        </span>
      </div>

      <div class="absolute inset-x-0 bottom-0 h-1/2 bg-[#161f30] rounded-b-2xl sm:rounded-b-3xl flex items-start justify-center overflow-hidden">
        <span class="text-6xl xs:text-7xl sm:text-9xl md:text-[11rem] font-mono font-black text-white -translate-y-1/2 leading-none">
          ${botVal}
        </span>
      </div>

      <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-black/80 z-30 shadow-md"></div>
      <div class="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 sm:w-3.5 h-5 sm:h-7 bg-bg rounded-r-full z-30 border-r border-y border-white/10"></div>
      <div class="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 sm:w-3.5 h-5 sm:h-7 bg-bg rounded-l-full z-30 border-l border-y border-white/10"></div>
    `;
  }

  animateCardFlip(cardEl, oldValue, newValue) {
    if (!cardEl) return;

    if (cardEl.dataset.animating === "true") {
      this.setCardValues(cardEl, newValue, newValue);
      return;
    }

    cardEl.dataset.animating = "true";

    cardEl.innerHTML = `
      <div class="absolute inset-x-0 top-0 h-1/2 bg-[#1e293b] rounded-t-2xl sm:rounded-t-3xl border-b border-black/60 flex items-end justify-center overflow-hidden">
        <span class="text-6xl xs:text-7xl sm:text-9xl md:text-[11rem] font-mono font-black text-white translate-y-1/2 leading-none">
          ${newValue}
        </span>
      </div>

      <div class="absolute inset-x-0 bottom-0 h-1/2 bg-[#161f30] rounded-b-2xl sm:rounded-b-3xl flex items-start justify-center overflow-hidden">
        <span class="text-6xl xs:text-7xl sm:text-9xl md:text-[11rem] font-mono font-black text-white -translate-y-1/2 leading-none">
          ${oldValue}
        </span>
      </div>

      <div class="flip-leaf-top absolute inset-x-0 top-0 h-1/2 bg-[#1e293b] rounded-t-2xl sm:rounded-t-3xl border-b border-black/60 flex items-end justify-center overflow-hidden z-20">
        <span class="text-6xl xs:text-7xl sm:text-9xl md:text-[11rem] font-mono font-black text-white translate-y-1/2 leading-none">
          ${oldValue}
        </span>
      </div>

      <div class="flip-leaf-bottom absolute inset-x-0 bottom-0 h-1/2 bg-[#161f30] rounded-b-2xl sm:rounded-b-3xl flex items-start justify-center overflow-hidden z-20">
        <span class="text-6xl xs:text-7xl sm:text-9xl md:text-[11rem] font-mono font-black text-white -translate-y-1/2 leading-none">
          ${newValue}
        </span>
      </div>

      <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-black/80 z-30 shadow-md"></div>
      <div class="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 sm:w-3.5 h-5 sm:h-7 bg-bg rounded-r-full z-30 border-r border-y border-white/10"></div>
      <div class="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 sm:w-3.5 h-5 sm:h-7 bg-bg rounded-l-full z-30 border-l border-y border-white/10"></div>
    `;

    setTimeout(() => {
      this.setCardValues(cardEl, newValue, newValue);
      delete cardEl.dataset.animating;
    }, 500);
  }

  bindEvents() {
    if (this.eventsBound) return;
    this.eventsBound = true;

    // Event delegation on the overlay root
    this.overlay.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      if (btn.id === "btn-flip-start" || btn.id === "btn-flip-continue") {
        timerService.start();
      } else if (btn.id === "btn-flip-pause") {
        timerService.pause();
      } else if (btn.id === "btn-flip-stop") {
        this.prevMinutes = null;
        this.prevSeconds = null;
        timerService.stopAndTransition();
      } else if (btn.id === "exit-fullscreen-btn") {
        this.close();
      }
    });

    document.addEventListener("fullscreenchange", () => {
      if (
        !document.fullscreenElement &&
        this.overlay &&
        !this.overlay.classList.contains("hidden")
      ) {
        this.close();
      }
    });

    document.addEventListener("visibilitychange", async () => {
      if (
        document.visibilityState === "visible" &&
        this.overlay &&
        !this.overlay.classList.contains("hidden")
      ) {
        await this.requestWakeLock();
      }
    });
  }
}

export const flipClockInstance = new FlipClockComponent();
