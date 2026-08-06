import { StateManager, state } from "@/models/state.model.js";

import { AnalyticsView } from "@/views/analytics-view.js";
import { DesktopNavComponent } from "@/components/layout/desktop-nav.component.js";
import { HeaderComponent } from "@/components/shared/header.component.js";
import { InfoModalComponent } from "@/components/modals/info-modal.component.js";
import { MobileNavComponent } from "@/components/layout/mobile-nav.component.js";
import { SettingsViewComponent } from "@/components/features/settings/settings-view.component.js";
import { TimerView } from "@/views/timer-view.js";
import { soundService } from "@/services/sound.service.js";
import { timerService } from "@/services/timer.service.js";

export const TimerController = {
  animationFrameId: null,
  flowStartTimestamp: null,
  accumulatedFlowTime: 0,

  init() {
    StateManager.init();
    this.renderComponents();
    this.bindStaticEvents();
    this.bindTimerEvents();
    this.bindSoundEvents();
    this.bindTimerShortcuts();
    this.bindMenuToggle();
    this.bindModalEvents();

    this.refreshUI();

    StateManager.subscribe(() => {
      this.refreshUI();
    });
  },

  renderComponents() {
    const renderMap = {
      "header-container": HeaderComponent.render,
      "desktop-nav-container": DesktopNavComponent.render,
      "mobile-nav-container": MobileNavComponent.render,
      "timer-view-container": TimerView.render,
      "analytics-view-container": AnalyticsView.render,
      "settings-view-container": SettingsViewComponent.render,
      "help-modal-container": InfoModalComponent.render,
    };

    Object.entries(renderMap).forEach(([id, renderFn]) => {
      const container = document.getElementById(id);
      if (container && typeof renderFn === "function") {
        container.innerHTML = renderFn();
      }
    });
  },

  bindTimerEvents() {
    const btnPomodoro = document.getElementById("mode-pomodoro");
    const btnFlow = document.getElementById("mode-flow");
    const controlsContainer = document.getElementById(
      "timer-controls-container",
    );

    controlsContainer?.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      if (btn.id === "btn-timer-start" || btn.id === "btn-timer-continue") {
        this.flowStartTimestamp = performance.now();
        timerService.start();
      } else if (btn.id === "btn-timer-pause") {
        if (this.flowStartTimestamp) {
          this.accumulatedFlowTime +=
            (performance.now() - this.flowStartTimestamp) / 1000;
          this.flowStartTimestamp = null;
        }
        timerService.pause();
      } else if (btn.id === "btn-timer-stop") {
        this.flowStartTimestamp = null;
        this.accumulatedFlowTime = 0;
        timerService.stopAndTransition();
      }
    });

    btnPomodoro?.addEventListener("click", () =>
      this.handleModeSwitch("pomodoro"),
    );
    btnFlow?.addEventListener("click", () => this.handleModeSwitch("flow"));
  },

  startFlowAnimation() {
    const canvas = document.getElementById("flow-comet-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const computedStyle = getComputedStyle(document.documentElement);
    const brandColorRaw =
      computedStyle.getPropertyValue("--color-brand").trim() || "#00bba7";

    let r = 16,
      g = 185,
      b = 129;
    if (brandColorRaw.startsWith("#")) {
      const hex = brandColorRaw.replace("#", "");
      if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
      }
    }

    if (
      !this.flowStartTimestamp &&
      state.timer.isRunning &&
      !state.timer.isPaused
    ) {
      this.flowStartTimestamp = performance.now();
    }

    const render = (now) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (
        state.activeMode === "flow" &&
        (state.timer.isRunning || state.timer.isPaused)
      ) {
        const centerX = 160;
        const centerY = 160;
        const radius = 140;
        const strokeWidth = 10;

        let currentFlowSeconds = this.accumulatedFlowTime;
        if (
          state.timer.isRunning &&
          !state.timer.isPaused &&
          this.flowStartTimestamp
        ) {
          currentFlowSeconds += (now - this.flowStartTimestamp) / 1000;
        }

        const startOriginAngle = -Math.PI / 2;
        const totalDistanceAngle = (currentFlowSeconds / 60) * Math.PI * 2;
        const headAngle = startOriginAngle + totalDistanceAngle;

        const maxArcLength = Math.PI * 0.6;
        const tailAngle = headAngle - maxArcLength;

        const steps = 300;
        const deltaAngle = maxArcLength / steps;

        ctx.save();

        if (totalDistanceAngle < Math.PI * 2) {
          ctx.beginPath();
          ctx.arc(
            centerX,
            centerY,
            radius + strokeWidth,
            startOriginAngle,
            headAngle + 0.1,
            false,
          );
          ctx.lineTo(centerX, centerY);
          ctx.closePath();
          ctx.clip();
        }

        ctx.lineCap = "round";

        for (let i = 0; i < steps; i++) {
          const currentStart = tailAngle + i * deltaAngle;
          const currentEnd = currentStart + deltaAngle + 0.006;

          const progress = i / (steps - 1);
          const alpha = Math.pow(progress, 2);

          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, currentStart, currentEnd);
          ctx.lineWidth = strokeWidth;
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.stroke();
        }

        ctx.restore();
      }

      if (state.timer.isRunning && !state.timer.isPaused) {
        this.animationFrameId = requestAnimationFrame(render);
      }
    };

    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (state.timer.isRunning && !state.timer.isPaused) {
      this.animationFrameId = requestAnimationFrame(render);
    } else {
      render(performance.now());
    }
  },

  stopFlowAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    const canvas = document.getElementById("flow-comet-canvas");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  },

  updateTimerDisplay() {
    const displayEl = document.getElementById("timer-display");
    const phaseBadge = document.getElementById("timer-phase-badge");
    const subInfo = document.getElementById("timer-sub-info");
    const progressRing = document.getElementById("timer-progress-ring");
    const flowCanvas = document.getElementById("flow-comet-canvas");
    const controlsContainer = document.getElementById(
      "timer-controls-container",
    );

    if (!displayEl) return;

    const CIRCUMFERENCE = 879.64;

    if (state.activeMode === "pomodoro") {
      this.stopFlowAnimation();
      flowCanvas?.classList.add("opacity-0");
      progressRing?.classList.remove("opacity-0");

      const totalSeconds = state.timer.timeRemaining;
      const mins = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
      const secs = String(totalSeconds % 60).padStart(2, "0");
      displayEl.textContent = `${mins}:${secs}`;

      if (progressRing) {
        const totalDuration = state.timer.totalPhaseDuration || 1500;
        const elapsedTime = totalDuration - totalSeconds;
        const progressFraction = Math.min(
          Math.max(elapsedTime / totalDuration, 0),
          1,
        );

        progressRing.style.strokeDasharray = `${CIRCUMFERENCE}`;
        const offset = CIRCUMFERENCE - progressFraction * CIRCUMFERENCE;
        progressRing.style.strokeDashoffset = `${offset}`;
      }

      if (phaseBadge) {
        const phaseNames = {
          work: "Focus Phase",
          shortBreak: "Short Break",
          longBreak: "Long Break",
        };
        phaseBadge.textContent =
          phaseNames[state.timer.currentPhase] || "Focus Phase";
      }

      if (subInfo) {
        subInfo.textContent = `Completed Sessions: ${state.timer.pomodoroSessionCount}`;
      }
    } else if (state.activeMode === "flow") {
      progressRing?.classList.add("opacity-0");

      const totalSeconds = state.timer.flowTime;
      const mins = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
      const secs = String(totalSeconds % 60).padStart(2, "0");
      displayEl.textContent = `${mins}:${secs}`;

      if (flowCanvas) {
        if (state.timer.isRunning || state.timer.isPaused) {
          flowCanvas.classList.remove("opacity-0");
          this.startFlowAnimation();
        } else {
          flowCanvas.classList.add("opacity-0");
          this.stopFlowAnimation();
        }
      }

      if (phaseBadge) phaseBadge.textContent = "Flow Mode";
      if (subInfo) subInfo.textContent = "Continuous Focus Duration";
    }

    if (controlsContainer) {
      const { isRunning, isPaused } = state.timer;
      const currentControlState =
        isRunning && !isPaused ? "running" : isPaused ? "paused" : "idle";

      if (controlsContainer.dataset.state !== currentControlState) {
        controlsContainer.dataset.state = currentControlState;

        if (currentControlState === "idle") {
          controlsContainer.innerHTML = `
            <button
              id="btn-timer-start"
              class="flex h-14 min-w-48 items-center justify-center gap-3 rounded-2xl bg-brand px-8 text-base font-bold text-white shadow-lg shadow-brand/25 hover:bg-(--color-brand-hover) transition-all cursor-pointer active:scale-95"
            >
              <i class="fa-solid fa-play pointer-events-none"></i>
              <span class="pointer-events-none">Start Focus</span>
            </button>
          `;
        } else if (currentControlState === "running") {
          controlsContainer.innerHTML = `
            <button
              id="btn-timer-pause"
              class="flex h-14 min-w-48 items-center justify-center gap-3 rounded-2xl bg-amber-500 px-8 text-base font-bold text-white shadow-lg shadow-amber-500/25 hover:bg-amber-600 transition-all cursor-pointer active:scale-95"
            >
              <i class="fa-solid fa-pause pointer-events-none"></i>
              <span class="pointer-events-none">Pause</span>
            </button>
          `;
        } else if (currentControlState === "paused") {
          controlsContainer.innerHTML = `
            <button
              id="btn-timer-stop"
              class="flex h-14 items-center justify-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-6 text-sm font-bold text-rose-500 hover:bg-rose-500/20 transition cursor-pointer active:scale-95"
              title="Stop & Reset"
            >
              <i class="fa-solid fa-square pointer-events-none"></i>
              <span class="pointer-events-none">Stop</span>
            </button>

            <button
              id="btn-timer-continue"
              class="flex h-14 min-w-40 items-center justify-center gap-3 rounded-2xl bg-brand px-8 text-base font-bold text-white shadow-lg shadow-brand/25 hover:bg-(--color-brand-hover) transition-all cursor-pointer active:scale-95"
            >
              <i class="fa-solid fa-play pointer-events-none"></i>
              <span class="pointer-events-none">Continue</span>
            </button>
          `;
        }
      }
    }
  },

  bindTimerShortcuts() {
    window.addEventListener("keydown", (event) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      if (state.currentView !== "timer") return;

      if (event.code === "Space") {
        event.preventDefault();
        const { isRunning, isPaused } = state.timer;
        if (!isRunning || isPaused) {
          this.flowStartTimestamp = performance.now();
          timerService.start();
        } else {
          if (this.flowStartTimestamp) {
            this.accumulatedFlowTime +=
              (performance.now() - this.flowStartTimestamp) / 1000;
            this.flowStartTimestamp = null;
          }
          timerService.pause();
        }
      }
    });
  },

  bindSoundEvents() {
    const soundSelector = document.getElementById("sound-selector");
    const btnToggleSound = document.getElementById("btn-toggle-sound");

    soundSelector?.addEventListener("change", (e) => {
      const soundId = e.target.value;
      StateManager.setSoundTrack(soundId);

      const trackNames = {
        "rain-forest": "Rain & Forest Stream",
        "brown-noise": "Pure Brown Noise",
        fireplace: "Fireplace Crackle",
        cafe: "Cozy Cafe Ambience",
      };

      const titleEl = document.getElementById("sound-track-title");
      if (titleEl)
        titleEl.textContent = trackNames[soundId] || "Background Sound";

      if (state.soundPlayer.isPlaying) {
        soundService.playTrack(soundId);
      }
    });

    btnToggleSound?.addEventListener("click", () => {
      if (state.soundPlayer.isPlaying) {
        soundService.pause();
        StateManager.setSoundPlaying(false);
      } else {
        soundService.playTrack(
          state.soundPlayer.currentSoundId || "rain-forest",
        );
        StateManager.setSoundPlaying(true);
      }
      this.updateAudioUI();
    });
  },

  updateAudioUI() {
    const btnToggleSound = document.getElementById("btn-toggle-sound");
    if (btnToggleSound) {
      const iconClass = state.soundPlayer.isPlaying
        ? "fa-regular fa-volume-high text-brand"
        : "fa-regular fa-volume-xmark";

      btnToggleSound.innerHTML = `<i id="sound-icon" class="${iconClass}"></i>`;
    }
  },

  bindMenuToggle() {
    const menuToggle = document.getElementById("menu-toggle");
    const desktopNav = document.getElementById("desktop-nav");
    const app = document.getElementById("app");

    let isMenuOpen = false;

    menuToggle?.addEventListener("click", () => {
      isMenuOpen = !isMenuOpen;
      if (isMenuOpen) {
        desktopNav?.classList.replace(
          "-translate-x-[calc(100%+2rem)]",
          "translate-x-0",
        );
        app?.classList.replace("lg:ps-8", "lg:ps-30");
      } else {
        desktopNav?.classList.replace(
          "translate-x-0",
          "-translate-x-[calc(100%+2rem)]",
        );
        app?.classList.replace("lg:ps-30", "lg:ps-8");
      }
    });
  },

  bindModalEvents() {
    const helpToggle = document.getElementById("help-toggle");
    const helpModal = document.getElementById("help-modal");
    const closeHelpModal = document.getElementById("close-help-modal");
    const btnCloseHelp = document.getElementById("btn-close-help");
    const helpBackdrop = document.getElementById("help-modal-backdrop");

    const openHelp = () => {
      helpModal?.classList.replace("hidden", "flex");
      document.body.classList.add("overflow-hidden");
    };

    const closeHelp = () => {
      helpModal?.classList.replace("flex", "hidden");
      document.body.classList.remove("overflow-hidden");
    };

    helpToggle?.addEventListener("click", openHelp);
    closeHelpModal?.addEventListener("click", closeHelp);
    btnCloseHelp?.addEventListener("click", closeHelp);
    helpBackdrop?.addEventListener("click", closeHelp);
  },

  bindStaticEvents() {
    const scrollTopBtn = document.getElementById("scroll-to-top-btn");

    if (scrollTopBtn) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 400) {
          scrollTopBtn.classList.replace("hidden", "flex");
        } else {
          scrollTopBtn.classList.replace("flex", "hidden");
        }
      });

      scrollTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    window.addEventListener("resize", () => {
      this.updateModeStyles(state.activeMode);
    });
  },

  refreshUI() {
    this.updateTimerDisplay();
    this.updateAudioUI();
    this.updateModeStyles(state.activeMode);
  },

  handleModeSwitch(mode) {
    StateManager.setMode(mode);
    this.updateModeStyles(mode);
    this.refreshUI();
  },

  updateModeStyles(mode) {
    const indicator = document.getElementById("mode-indicator");
    const pomodoroBtn = document.getElementById("mode-pomodoro");
    const flowBtn = document.getElementById("mode-flow");

    if (!indicator || !pomodoroBtn || !flowBtn) return;

    const buttons = { pomodoro: pomodoroBtn, flow: flowBtn };
    const targetBtn = buttons[mode] || pomodoroBtn;

    const width = targetBtn.offsetWidth;
    const height = targetBtn.offsetHeight;
    const left = targetBtn.offsetLeft;
    const top = targetBtn.offsetTop;

    indicator.style.width = `${width}px`;
    indicator.style.height = `${height}px`;
    indicator.style.left = `${left}px`;
    indicator.style.top = `${top}px`;

    Object.entries(buttons).forEach(([key, btn]) => {
      if (key === mode) {
        btn.classList.add("text-(--color-btn-primary-text)");
        btn.classList.remove("text-secondary");
      } else {
        btn.classList.remove("text-(--color-btn-primary-text)");
        btn.classList.add("text-secondary");
      }
    });
  },
};
