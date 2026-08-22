export class FlipClockComponent {
  constructor() {
    this.overlay = null;
    this.hideTimeout = null;
    this.isRunning = false;
    this._isThreeCards = false;
  }

  render() {
    if (this.overlay) return this.overlay;

    this.overlay = document.createElement("div");
    this.overlay.id = "flip-clock-overlay";

    this.overlay.className =
      "fixed inset-0 z-400 hidden w-screen h-screen flex flex-col items-center justify-between bg-bg select-none overflow-hidden";

    this.overlay.innerHTML = `
      <div
        id="flip-top-bar"
        class="flip-background-shadow absolute top-0 left-0 right-0 p-12 flex items-center justify-between z-50 opacity-0 transition-opacity duration-300 pointer-events-none"
      >
        <div
          id="flip-phase-badge"
          class="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand/80 text-[10px] sm:text-xs font-bold tracking-widest uppercase shadow-xs backdrop-blur-sm"
        >
          FOCUS PHASE
        </div>

        <button
          id="exit-fullscreen-btn"
          type="button"
          class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-black/40 backdrop-blur-sm hover:bg-black text-white hover:text-white transition-all flex items-center justify-center cursor-pointer border border-white/20 active:scale-95 touch-manipulation"
          title="Exit Fullscreen"
        >
          <i
            class="fa-regular fa-compress text-sm sm:text-base pointer-events-none"
          ></i>
        </button>
      </div>

      <div
        id="flip-clock-digits-container"
        class="flex-1 flex items-center justify-center gap-5 perspective-1000 w-full py-0 px-10"
      >
      </div>

      <div
        id="flip-controls-container"
        class="absolute bottom-8 sm:bottom-12 left-0 right-0 flex items-center justify-center gap-3 sm:gap-4 z-50 opacity-0 transition-opacity duration-300 pointer-events-none"
        style="background: none;"
      >
      </div>
    `;

    document.body.appendChild(this.overlay);

    let mouseMoveTimeout;
    const showOnHover = () => {
      clearTimeout(mouseMoveTimeout);
      mouseMoveTimeout = setTimeout(() => {
        this.showControls();
      }, 10);
    };

    this.overlay.addEventListener("mousemove", showOnHover);
    this.overlay.addEventListener("touchstart", () => this.showControls(), {
      passive: true,
    });

    return this.overlay;
  }

  showControls() {
    const topBar = this.overlay?.querySelector("#flip-top-bar");
    const controls = this.overlay?.querySelector("#flip-controls-container");

    if (!topBar || !controls) return;

    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    topBar.classList.remove("pointer-events-none");
    controls.classList.remove("pointer-events-none");

    topBar.classList.remove("opacity-0");
    topBar.classList.add("opacity-100");
    controls.classList.remove("opacity-0");
    controls.classList.add("opacity-100");

    if (this.isRunning) {
      this.hideTimeout = setTimeout(() => {
        topBar.classList.add("pointer-events-none");
        controls.classList.add("pointer-events-none");

        topBar.classList.remove("opacity-100");
        topBar.classList.add("opacity-0");
        controls.classList.remove("opacity-100");
        controls.classList.add("opacity-0");
        this.hideTimeout = null;
      }, 3000);
    }
  }

  updateDisplay(hrs, mins, secs, prevHrs, prevMins, prevSecs, force = false) {
    const container = this.overlay?.querySelector(
      "#flip-clock-digits-container",
    );
    if (!container) return;

    const hasHours = parseInt(hrs, 10) > 0;

    if (this._isThreeCards === null || this._isThreeCards !== hasHours) {
      this._isThreeCards = hasHours;
      this._rebuildCardStructure(container, hasHours);
    }

    const hrsCard = container.querySelector("#flip-card-hours");
    const minCard = container.querySelector("#flip-card-minutes");
    const secCard = container.querySelector("#flip-card-seconds");

    const fontSizeClass = hasHours
      ? "text-[10dvw] md:text-[15dvw] lg:text-[20dvw]"
      : "text-[25dvw] md:text-[30dvw] lg:text-[35dvw]";

    if (hasHours && hrsCard) {
      if (force || prevHrs === null) {
        this.setCardValues(hrsCard, hrs, hrs, fontSizeClass);
      } else if (hrs !== prevHrs) {
        this.animateCardFlip(hrsCard, prevHrs, hrs, fontSizeClass);
      }
    }

    if (minCard) {
      if (force || prevMins === null) {
        this.setCardValues(minCard, mins, mins, fontSizeClass);
      } else if (mins !== prevMins) {
        this.animateCardFlip(minCard, prevMins, mins, fontSizeClass);
      }
    }

    if (secCard) {
      if (force || prevSecs === null) {
        this.setCardValues(secCard, secs, secs, fontSizeClass);
      } else if (secs !== prevSecs) {
        this.animateCardFlip(secCard, prevSecs, secs, fontSizeClass);
      }
    }
  }

  _rebuildCardStructure(container, hasHours) {
    container.innerHTML = "";

    if (hasHours) {
      container.innerHTML = `
        <div id="flip-card-hours" class="relative w-1/3 h-[40dvw] lg:h-[50dvw] bg-surface rounded-2xl sm:rounded-3xl shadow-2xl border border-border/10 flex flex-col overflow-hidden"></div>
        <div class="text-5xl sm:text-8xl lg:text-[12rem] font-black text-color/30 select-none flex items-center justify-center pb-2 sm:pb-6">:</div>
        <div id="flip-card-minutes" class="relative w-1/3 h-[40dvw] lg:h-[50dvw] bg-surface rounded-2xl sm:rounded-3xl shadow-2xl border border-border/10 flex flex-col overflow-hidden"></div>
        <div class="text-5xl sm:text-8xl lg:text-[12rem] font-black text-color/30 select-none flex items-center justify-center pb-2 sm:pb-6">:</div>
        <div id="flip-card-seconds" class="relative w-1/3 h-[40dvw] lg:h-[50dvw] bg-surface rounded-2xl sm:rounded-3xl shadow-2xl border border-border/10 flex flex-col overflow-hidden"></div>
      `;
    } else {
      container.innerHTML = `
        <div id="flip-card-minutes" class="relative w-1/2 h-[40dvw] lg:h-[50dvw] bg-surface rounded-2xl sm:rounded-3xl shadow-2xl border border-border/10 flex flex-col overflow-hidden"></div>
        <div class="text-5xl sm:text-8xl lg:text-[12rem] font-black text-color/30 select-none flex items-center justify-center pb-2 sm:pb-6">:</div>
        <div id="flip-card-seconds" class="relative w-1/2 h-[40dvw] lg:h-[50dvw] bg-surface rounded-2xl sm:rounded-3xl shadow-2xl border border-border/10 flex flex-col overflow-hidden"></div>
      `;
    }
  }

  updateBadge(text, isBreak = false) {
    const badge = this.overlay?.querySelector("#flip-phase-badge");
    if (!badge) return;

    badge.textContent = text;
    if (isBreak) {
      badge.className =
        "px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase shadow-xs backdrop-blur-sm";
    } else {
      badge.className =
        "px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand/80 text-[10px] sm:text-xs font-bold tracking-widest uppercase shadow-xs backdrop-blur-sm";
    }
  }

  updateControls(state, isFlowBreak = false) {
    const controlsContainer = this.overlay?.querySelector(
      "#flip-controls-container",
    );
    if (!controlsContainer) return;

    if (controlsContainer.dataset.state !== state) {
      controlsContainer.dataset.state = state;

      if (state === "idle" || state === "paused") {
        this.isRunning = false;
        this.showControls();
      } else if (state === "running") {
        this.isRunning = true;
        this.showControls();
      }

      const btnClass =
        "w-12 h-12 sm:w-16 sm:h-16 max-lg:landscape:w-10 max-lg:landscape:h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-lg cursor-pointer backdrop-blur-sm touch-manipulation";

      if (state === "idle") {
        controlsContainer.innerHTML = `
          <button id="btn-flip-start" type="button" class="${btnClass} bg-brand hover:bg-brand/90 text-(--color-btn-primary-text)">
            <i class="fa-solid fa-play text-xl sm:text-2xl max-lg:landscape:text-sm pointer-events-none"></i>
          </button>`;
      } else if (state === "running") {
        controlsContainer.innerHTML = `
          <button id="btn-flip-pause" type="button" class="${btnClass} bg-amber-500 hover:bg-amber-600 text-(--color-btn-primary-text)">
            <i class="fa-solid fa-pause text-xl sm:text-2xl max-lg:landscape:text-sm pointer-events-none"></i>
          </button>`;
      } else if (state === "paused") {
        controlsContainer.innerHTML = `
          <button id="btn-flip-stop" type="button" class="${btnClass} bg-red-500 hover:bg-red-600 text-(--color-btn-primary-text)">
            <i class="fa-solid fa-square text-xl sm:text-2xl max-lg:landscape:text-sm pointer-events-none"></i>
          </button>
          <button id="btn-flip-continue" type="button" class="${btnClass} bg-brand hover:bg-brand/90 text-(--color-btn-primary-text)">
            <i class="fa-solid fa-play text-xl sm:text-2xl max-lg:landscape:text-sm pointer-events-none"></i>
          </button>`;
      }
    }
  }

  setCardValues(cardEl, topVal, botVal, fontSizeClass) {
    if (!cardEl) return;

    cardEl.innerHTML = `
      <div class="absolute inset-x-0 top-0 h-1/2 bg-surface rounded-t-2xl sm:rounded-t-3xl border-b border-bg flex items-end justify-center overflow-hidden">
        <span class="digit-color ${fontSizeClass} font-[Mostin] font-black translate-y-[54%]">${topVal}</span>
      </div>
      <div class="absolute inset-x-0 bottom-0 h-1/2 bg-surface rounded-b-2xl sm:rounded-b-3xl flex items-start justify-center overflow-hidden">
        <span class="digit-color ${fontSizeClass} font-[Mostin] font-black translate-y-[-46%]">${botVal}</span>
      </div>
      <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 sm:h-1 bg-bg z-30 shadow-sm rounded-full"></div>
      <div class="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 sm:w-3.5 max-lg:landscape:w-2 h-5 sm:h-7 max-lg:landscape:h-4 bg-bg rounded-r-full z-30 border-r border-y border-primary/10"></div>
      <div class="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 sm:w-3.5 max-lg:landscape:w-2 h-5 sm:h-7 max-lg:landscape:h-4 bg-bg rounded-l-full z-30 border-l border-y border-primary/10"></div>
    `;
  }

  animateCardFlip(cardEl, oldValue, newValue, fontSizeClass) {
    if (!cardEl) return;
    if (cardEl.dataset.animating === "true") {
      this.setCardValues(cardEl, newValue, newValue, fontSizeClass);
      return;
    }

    cardEl.dataset.animating = "true";

    cardEl.innerHTML = `
      <div class="absolute inset-x-0 top-0 h-1/2 bg-surface rounded-t-2xl sm:rounded-t-3xl border-b border-bg flex items-end justify-center overflow-hidden">
        <span class="digit-color ${fontSizeClass} font-[Mostin] font-black translate-y-[54%]">${newValue}</span>
      </div>
      <div class="absolute inset-x-0 bottom-0 h-1/2 bg-surface rounded-b-2xl sm:rounded-b-3xl flex items-start justify-center overflow-hidden">
        <span class="digit-color ${fontSizeClass} font-[Mostin] font-black translate-y-[-46%]">${oldValue}</span>
      </div>
      <div class="flip-leaf-top absolute inset-x-0 top-0 h-1/2 bg-surface rounded-t-2xl sm:rounded-t-3xl border-b border-bg flex items-end justify-center overflow-hidden z-20">
        <span class="digit-color ${fontSizeClass} font-[Mostin] font-black translate-y-[54%]">${oldValue}</span>
      </div>
      <div class="flip-leaf-bottom absolute inset-x-0 bottom-0 h-1/2 bg-surface rounded-b-2xl sm:rounded-b-3xl flex items-start justify-center overflow-hidden z-20">
        <span class="digit-color ${fontSizeClass} font-[Mostin] font-black translate-y-[-46%]">${newValue}</span>
      </div>
      <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 sm:h-1 bg-bg z-30 shadow-sm rounded-full"></div>
      <div class="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 sm:w-3.5 max-lg:landscape:w-2 h-5 sm:h-7 max-lg:landscape:h-4 bg-bg rounded-r-full z-30 border-r border-y border-primary/10"></div>
      <div class="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 sm:w-3.5 max-lg:landscape:w-2 h-5 sm:h-7 max-lg:landscape:h-4 bg-bg rounded-l-full z-30 border-l border-y border-primary/10"></div>
    `;

    setTimeout(() => {
      this.setCardValues(cardEl, newValue, newValue, fontSizeClass);
      delete cardEl.dataset.animating;
    }, 500);
  }
}

export const flipClockComponent = new FlipClockComponent();
