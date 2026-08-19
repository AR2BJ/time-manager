export class FlipClockComponent {
  constructor() {
    this.overlay = null;
    this.hideTimeout = null;
    this.isRunning = false;
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
        class="absolute top-0 left-0 right-0 p-12 flex items-center justify-between z-50 opacity-0 transition-opacity duration-300 pointer-events-none"
        style="background: linear-gradient(180deg, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 100%);"
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
        class="flex-1 flex items-center justify-center gap-4 sm:gap-8 lg:gap-14 perspective-1000 w-full py-0 px-10"
      >
        <div
          id="flip-card-minutes"
          class="relative w-1/2 h-[40dvw] lg:h-[50dvw] bg-surface rounded-2xl sm:rounded-3xl shadow-2xl border border-border/10 flex flex-col overflow-hidden"
        ></div>

        <div
          class="text-5xl sm:text-8xl lg:text-[12rem] font-black text-primary/30 select-none flex items-center justify-center pb-2 sm:pb-6"
        >
          :
        </div>

        <div
          id="flip-card-seconds"
          class="relative w-1/2 h-[40dvw] lg:h-[50dvw] bg-surface rounded-2xl sm:rounded-3xl shadow-2xl border border-border/10 flex flex-col overflow-hidden"
        ></div>
      </div>

      <div
        id="flip-controls-container"
        class="absolute bottom-8 sm:bottom-12 left-0 right-0 flex items-center justify-center gap-3 sm:gap-4 z-50 opacity-0 transition-opacity duration-300 pointer-events-none"
        style="background: none;"
      ></div>
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

      let startText = "Start";
      let continueText = "Continue";

      if (isFlowBreak) {
        startText = "Start Break";
        continueText = "Continue Break";
      } else {
        startText = "Start";
        continueText = "Continue";
      }

      if (state === "idle") {
        controlsContainer.innerHTML = `
          <button id="btn-flip-start" type="button" class="${btnClass} bg-brand hover:bg-brand/90 text-primary">
            <i class="fa-solid fa-play text-xl sm:text-2xl max-lg:landscape:text-sm pointer-events-none"></i>
          </button>`;
      } else if (state === "running") {
        controlsContainer.innerHTML = `
          <button id="btn-flip-pause" type="button" class="${btnClass} bg-amber-500 hover:bg-amber-600 text-primary">
            <i class="fa-solid fa-pause text-xl sm:text-2xl max-lg:landscape:text-sm pointer-events-none"></i>
          </button>`;
      } else if (state === "paused") {
        controlsContainer.innerHTML = `
          <button id="btn-flip-stop" type="button" class="${btnClass} bg-red-500 hover:bg-red-600 text-primary">
            <i class="fa-solid fa-square text-xl sm:text-2xl max-lg:landscape:text-sm pointer-events-none"></i>
          </button>
          <button id="btn-flip-continue" type="button" class="${btnClass} bg-brand hover:bg-brand/90 text-primary">
            <i class="fa-solid fa-play text-xl sm:text-2xl max-lg:landscape:text-sm pointer-events-none"></i>
          </button>`;
      }
    }
  }
}

export const flipClockComponent = new FlipClockComponent();
