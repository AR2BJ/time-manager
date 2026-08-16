export class FlipClockComponent {
  constructor() {
    this.overlay = null;
  }

  render() {
    if (this.overlay) return this.overlay;

    this.overlay = document.createElement("div");
    this.overlay.id = "flip-clock-overlay";
    this.overlay.className =
      "fixed inset-0 z-350 hidden flex flex-col items-center justify-between bg-bg p-4 sm:p-10 max-lg:landscape:p-2 select-none overflow-hidden transition-opacity duration-300 opacity-0";

    this.overlay.innerHTML = `
      <div class="w-full p-4 max-w-6xl flex items-center justify-between z-20 shrink-0">
        <div 
          id="flip-phase-badge" 
          class="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand/80 text-[10px] sm:text-xs font-bold tracking-widest uppercase shadow-xs"
        >
          FOCUS PHASE
        </div>

        <button
          id="exit-fullscreen-btn"
          type="button"
          class="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-surface hover:bg-surface-2 text-secondary hover:text-primary transition-all flex items-center justify-center cursor-pointer border border-border active:scale-95"
          title="Exit Fullscreen"
        >
          <i class="fa-regular fa-compress text-xs sm:text-sm pointer-events-none"></i>
        </button>
      </div>

      <div class="my-auto flex-1 flex items-center justify-center gap-3 sm:gap-8 lg:gap-14 max-lg:landscape:gap-4 perspective-1000 w-full max-w-5xl py-2 sm:py-6 max-lg:landscape:py-1">
        <div id="flip-card-minutes" class="relative w-28 h-36 xs:w-36 xs:h-48 sm:w-64 sm:h-80 lg:w-80 lg:h-104 max-lg:landscape:w-[28vw] max-lg:landscape:h-[52vh] max-lg:landscape:max-w-50 max-lg:landscape:max-h-60 bg-surface rounded-2xl sm:rounded-3xl shadow-2xl border border-border/10 flex flex-col overflow-hidden">
        </div>

        <div class="text-3xl sm:text-7xl lg:text-9xl max-lg:landscape:text-4xl font-black text-primary/30 select-none flex items-center justify-center pb-2 sm:pb-4 animate-pulse">:</div>

        <div id="flip-card-seconds" class="relative w-28 h-36 xs:w-36 xs:h-48 sm:w-64 sm:h-80 lg:w-80 lg:h-104 max-lg:landscape:w-[28vw] max-lg:landscape:h-[52vh] max-lg:landscape:max-w-50 max-lg:landscape:max-h-60 bg-surface rounded-2xl sm:rounded-3xl shadow-2xl border border-border/10 flex flex-col overflow-hidden">
        </div>
      </div>

      <div 
        id="flip-controls-container" 
        class="mb-2 sm:mb-8 max-lg:landscape:mb-1 flex items-center justify-center gap-3 sm:gap-4 z-20 rounded-2xl shrink-0"
      >
      </div>
    `;

    document.body.appendChild(this.overlay);
    return this.overlay;
  }

  updateDisplay(mins, secs, prevMins, prevSecs, force = false) {
    const minCard = this.overlay?.querySelector("#flip-card-minutes");
    const secCard = this.overlay?.querySelector("#flip-card-seconds");

    if (!minCard || !secCard) return;

    if (force || prevMins === null) {
      this.setCardValues(minCard, mins, mins);
    } else if (mins !== prevMins) {
      this.animateCardFlip(minCard, prevMins, mins);
    }

    if (force || prevSecs === null) {
      this.setCardValues(secCard, secs, secs);
    } else if (secs !== prevSecs) {
      this.animateCardFlip(secCard, prevSecs, secs);
    }
  }

  updateBadge(text) {
    const badge = this.overlay?.querySelector("#flip-phase-badge");
    if (badge) badge.textContent = text;
  }

  updateControls(state) {
    const controlsContainer = this.overlay?.querySelector(
      "#flip-controls-container",
    );
    if (!controlsContainer) return;

    if (controlsContainer.dataset.state !== state) {
      controlsContainer.dataset.state = state;

      if (state === "idle") {
        controlsContainer.innerHTML = `
          <button id="btn-flip-start" type="button" class="w-10 h-10 sm:w-14 sm:h-14 max-lg:landscape:w-10 max-lg:landscape:h-10 rounded-xl bg-brand hover:bg-brand/90 text-primary flex items-center justify-center transition-all active:scale-95 shadow-lg cursor-pointer">
            <i class="fa-solid fa-play text-base sm:text-xl max-lg:landscape:text-sm pointer-events-none"></i>
          </button>`;
      } else if (state === "running") {
        controlsContainer.innerHTML = `
          <button id="btn-flip-pause" type="button" class="w-10 h-10 sm:w-14 sm:h-14 max-lg:landscape:w-10 max-lg:landscape:h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-primary flex items-center justify-center transition-all active:scale-95 shadow-lg cursor-pointer">
            <i class="fa-solid fa-pause text-base sm:text-xl max-lg:landscape:text-sm pointer-events-none"></i>
          </button>`;
      } else if (state === "paused") {
        controlsContainer.innerHTML = `
          <button id="btn-flip-stop" type="button" class="w-10 h-10 sm:w-14 sm:h-14 max-lg:landscape:w-10 max-lg:landscape:h-10 rounded-xl bg-red-500 hover:bg-red-600 text-primary flex items-center justify-center transition-all active:scale-95 shadow-lg cursor-pointer">
            <i class="fa-solid fa-square text-base sm:text-xl max-lg:landscape:text-sm pointer-events-none"></i>
          </button>
          <button id="btn-flip-continue" type="button" class="w-10 h-10 sm:w-14 sm:h-14 max-lg:landscape:w-10 max-lg:landscape:h-10 rounded-xl bg-brand hover:bg-brand/90 text-primary flex items-center justify-center transition-all active:scale-95 shadow-lg cursor-pointer">
            <i class="fa-solid fa-play text-base sm:text-xl max-lg:landscape:text-sm pointer-events-none"></i>
          </button>`;
      }
    }
  }

  setCardValues(cardEl, topVal, botVal) {
    if (!cardEl) return;
    cardEl.innerHTML = `
      <div class="absolute inset-x-0 top-0 h-1/2 bg-surface rounded-t-2xl sm:rounded-t-3xl border-b border-black/60 flex items-end justify-center overflow-hidden">
        <span class="text-6xl xs:text-7xl sm:text-8xl lg:text-9xl xl:text-[10rem] max-lg:landscape:text-8xl font-mono font-black text-primary translate-y-1/2 leading-none">${topVal}</span>
      </div>
      <div class="absolute inset-x-0 bottom-0 h-1/2 bg-surface rounded-b-2xl sm:rounded-b-3xl flex items-start justify-center overflow-hidden">
        <span class="text-6xl xs:text-7xl sm:text-8xl lg:text-9xl xl:text-[10rem] max-lg:landscape:text-8xl font-mono font-black text-primary -translate-y-1/2 leading-none">${botVal}</span>
      </div>
      <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-black/80 z-30 shadow-md"></div>
      <div class="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 sm:w-3.5 max-lg:landscape:w-2 h-5 sm:h-7 max-lg:landscape:h-4 bg-bg rounded-r-full z-30 border-r border-y border-primary/10"></div>
      <div class="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 sm:w-3.5 max-lg:landscape:w-2 h-5 sm:h-7 max-lg:landscape:h-4 bg-bg rounded-l-full z-30 border-l border-y border-primary/10"></div>
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
      <div class="absolute inset-x-0 top-0 h-1/2 bg-surface rounded-t-2xl sm:rounded-t-3xl border-b border-black/60 flex items-end justify-center overflow-hidden">
        <span class="text-6xl xs:text-7xl sm:text-8xl lg:text-9xl xl:text-[10rem] max-lg:landscape:text-8xl font-mono font-black text-primary translate-y-1/2 leading-none">${newValue}</span>
      </div>
      <div class="absolute inset-x-0 bottom-0 h-1/2 bg-surface rounded-b-2xl sm:rounded-b-3xl flex items-start justify-center overflow-hidden">
        <span class="text-6xl xs:text-7xl sm:text-8xl lg:text-9xl xl:text-[10rem] max-lg:landscape:text-8xl font-mono font-black text-primary -translate-y-1/2 leading-none">${oldValue}</span>
      </div>
      <div class="flip-leaf-top absolute inset-x-0 top-0 h-1/2 bg-surface rounded-t-2xl sm:rounded-t-3xl border-b border-bg/60 flex items-end justify-center overflow-hidden z-20">
        <span class="text-6xl xs:text-7xl sm:text-8xl lg:text-9xl xl:text-[10rem] max-lg:landscape:text-8xl font-mono font-black text-primary translate-y-1/2 leading-none">${oldValue}</span>
      </div>
      <div class="flip-leaf-bottom absolute inset-x-0 bottom-0 h-1/2 bg-surface rounded-b-2xl sm:rounded-b-3xl flex items-start justify-center overflow-hidden z-20">
        <span class="text-6xl xs:text-7xl sm:text-8xl lg:text-9xl xl:text-[10rem] max-lg:landscape:text-8xl font-mono font-black text-primary -translate-y-1/2 leading-none">${newValue}</span>
      </div>
      <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-bg/80 z-30 shadow-md"></div>
      <div class="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 sm:w-3.5 max-lg:landscape:w-2 h-5 sm:h-7 max-lg:landscape:h-4 bg-bg rounded-r-full z-30 border-r border-y border-primary/10"></div>
      <div class="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 sm:w-3.5 max-lg:landscape:w-2 h-5 sm:h-7 max-lg:landscape:h-4 bg-bg rounded-l-full z-30 border-l border-y border-primary/10"></div>
    `;

    setTimeout(() => {
      this.setCardValues(cardEl, newValue, newValue);
      delete cardEl.dataset.animating;
    }, 500);
  }
}

export const flipClockComponent = new FlipClockComponent();
