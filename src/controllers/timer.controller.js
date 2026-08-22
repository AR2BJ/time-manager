import { StateManager, state } from "@/models/state.model.js";

import { ActiveTaskCardComponent } from "@/components/features/tasks/active-task-card.component";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsView } from "@/views/analytics-view.js";
import { DesktopNavComponent } from "@/components/layout/desktop-nav.component.js";
import { FlipClockController } from "./flip-clock.controller";
import { HeaderComponent } from "@/components/shared/header.component.js";
import { MobileNavComponent } from "@/components/layout/mobile-nav.component.js";
import { ModalController } from "./modal.controller";
import { NoteController } from "./note.controller";
import { NotificationService } from "@/services/notification.service";
import { SettingsViewComponent } from "@/components/features/settings/settings-view.component.js";
import { SoundModel } from "@/models/sound.model.js";
import { TaskService } from "@/services/task.service";
import { TimerView } from "@/views/timer-view.js";
import { TodayOverviewComponent } from "@/components/features/tasks/today-overview.component";
import { formatTime } from "@/utils/helpers";
import { soundService } from "@/services/sound.service.js";
import { timerService } from "@/services/timer.service.js";

export const TimerController = {
  animationFrameId: null,
  flowStartTimestamp: null,
  accumulatedFlowTime: 0,
  timerViewInstance: null,
  isHour12: false,

  init() {
    StateManager.init();
    timerService.initFromSavedState();
    NoteController.init();
    ModalController.init();
    FlipClockController.init();

    soundService.init();

    this.renderComponents();
    this.bindStaticEvents();
    this.bindTimerEvents();
    this.bindSoundEvents();
    this.bindTimerShortcuts();
    this.bindMenuToggle();
    this.startHeaderClock();

    this.refreshUI();

    StateManager.subscribe(() => {
      this.refreshUI();
    });
  },

  renderComponents() {
    // 1. Instantiate & Render Class-based Stateful Views
    if (!this.timerViewInstance) {
      this.timerViewInstance = new TimerView();
    }
    this.timerViewInstance.render();

    // 2. Render Functional Static Template Components (Returning Strings)
    const staticRenderMap = {
      "header-container": HeaderComponent.render,
      "desktop-nav-container": DesktopNavComponent.render,
      "mobile-nav-container": MobileNavComponent.render,
      "analytics-view-container": AnalyticsView.render,
      "settings-view-container": SettingsViewComponent.render,
    };

    Object.entries(staticRenderMap).forEach(([id, renderFn]) => {
      const container = document.getElementById(id);
      if (container && typeof renderFn === "function") {
        container.innerHTML = renderFn();
      }
    });

    this.renderTaskWidgets();
  },

  bindTimerEvents() {
    const btnPomodoro = document.getElementById("mode-pomodoro");
    const btnFlow = document.getElementById("mode-flow");
    const btnOpenFlip = document.getElementById("open-fullscreen-btn");
    const controlsContainer = document.getElementById(
      "timer-controls-container",
    );

    controlsContainer?.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      if (btn.id === "btn-timer-start" || btn.id === "btn-timer-continue") {
        const activeTask = TaskService.getActiveTask();
        if (!activeTask && state.timer.currentPhase === "work") {
          NotificationService.show({
            type: "warning",
            message: "You need an active task to start a focus session",
            icon: "fa-bullseye-arrow",
            iconColor: "text-amber-500",
            duration: 5000,
            actionButton: {
              text: "Create Task",
              icon: "fa-plus",
              onClick: async () => {
                if (document.fullscreenElement) await document.exitFullscreen();
                ModalController.openTaskModal();
              },
            },
          });
          return;
        }
      }

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

    btnPomodoro?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleModeSwitch("pomodoro");
    });

    btnFlow?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleModeSwitch("flow");
    });

    btnOpenFlip?.addEventListener("click", (e) => {
      e.preventDefault();
      FlipClockController.open();
    });
  },

  startHeaderClock() {
    const timeEl = document.getElementById("header-current-time");
    if (timeEl && !timeEl.dataset.initialized) {
      timeEl.dataset.initialized = "true";
      timeEl.innerHTML = `
        <span class="flex items-center gap-3 px-6 py-1 font-bold text-secondary tracking-wide">
          <span id="clock-date-part" class="inline">Loading...</span>
          <span class="text-border inline">|</span>
          <span id="clock-tabular-nums" class="hover:text-primary cursor-pointer transition">Loading...</span>
        </span>
      `;

      const clockTabularNums = document.getElementById("clock-tabular-nums");
      clockTabularNums?.addEventListener("click", () => {
        this.isHour12 = !this.isHour12;
      });
    }

    const timeElMobile = document.getElementById("mobile-time-container");
    timeElMobile.classList.add(
      "flex",
      "lg:hidden",
      "justify-center",
      "items-center",
      "p-3",
      "mb-6",
    );

    if (timeElMobile && !timeElMobile.dataset.initialized) {
      timeElMobile.dataset.initialized = "true";

      timeElMobile.innerHTML = `
        <span class="flex items-center gap-1.5 py-1 text-sm font-bold text-secondary tracking-wide">
          <span id="mobile-clock-date-part" class="inline">Loading...</span>
          <span class="text-border inline">|</span>
          <span id="mobile-clock-tabular-nums" class="hover:text-color cursor-pointer transition">Loading...</span>
        </span>
      `;

      const clockTabularNums = document.getElementById(
        "mobile-clock-tabular-nums",
      );
      clockTabularNums?.addEventListener("click", () => {
        this.isHour12 = !this.isHour12;
      });
    }

    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        year: "numeric",
        month: "short",
        day: "numeric",
        weekday: "short",
        hour12: this.isHour12,
      });

      const dateEl = document.getElementById("clock-date-part");
      const clickableEl = document.getElementById("clock-tabular-nums");
      if (dateEl) {
        dateEl.textContent = timeStr.split(",").slice(0, 3).join(" ");
      }
      if (clickableEl) {
        clickableEl.textContent = timeStr.split(",")[3];
      }

      const mobileTimeStr = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        year: "numeric",
        month: "short",
        day: "numeric",
        weekday: "short",
        hour12: this.isHour12,
      });

      const mobileDateEl = document.getElementById("mobile-clock-date-part");
      const mobileClickableEl = document.getElementById(
        "mobile-clock-tabular-nums",
      );
      if (mobileDateEl) {
        mobileDateEl.textContent = mobileTimeStr
          .split(",")
          .slice(0, 3)
          .join(" ");
      }
      if (mobileClickableEl) {
        mobileClickableEl.textContent = mobileTimeStr.split(",")[3];
      }
    };

    updateClock();
    setInterval(updateClock, 1000);
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

    const isPomodoro = state.activeMode === "pomodoro";
    const isFlow = state.activeMode === "flow";
    const isFlowBreak = isFlow && state.timer.currentPhase === "break";
    const isPomodoroBreak =
      isPomodoro &&
      (state.timer.currentPhase === "shortBreak" ||
        state.timer.currentPhase === "longBreak");

    if (isFlowBreak) {
      this.stopFlowAnimation();
      flowCanvas?.classList.add("opacity-0");
      progressRing?.classList.remove("opacity-0");

      const totalSeconds = Number.isFinite(state.timer.timeRemaining)
        ? state.timer.timeRemaining
        : 1500;
      const displayTime = formatTime(totalSeconds);
      const parts = displayTime.split(":");

      let timerHtml = `<span class="flex flex-row justify-center items-center gap-1.5">`;
      parts.forEach((part, index) => {
        timerHtml += `<span class="digit-color font-[Mostin] font-black text-2xl xs:text-3xl sm:text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl tracking-normal">${part}</span>`;
        if (index < parts.length - 1) {
          timerHtml += `<span class="digit-color font-['Roboto_Condensed'] text-lg xs:text-xl sm:text-2xl md:text-3xl xl:text-4xl 2xl:text-5xl pb-1.5 sm:pb-3">:</span>`;
        }
      });
      timerHtml += `</span>`;
      displayEl.innerHTML = timerHtml;

      if (progressRing) {
        const totalDuration = state.timer.duration || 1500;
        const elapsedTime = totalDuration - totalSeconds;
        const progressFraction = Math.min(
          Math.max(elapsedTime / totalDuration, 0),
          1,
        );

        progressRing.style.strokeDasharray = `${CIRCUMFERENCE}`;
        const offset = CIRCUMFERENCE - progressFraction * CIRCUMFERENCE;
        progressRing.style.strokeDashoffset = `${offset}`;
        progressRing.classList.remove("stroke-brand");
        progressRing.classList.add("stroke-emerald-500");
      }

      if (phaseBadge) {
        phaseBadge.textContent = "Flow Break";
      }

      if (subInfo) {
        subInfo.textContent = "Flow Break in progress";
      }
    } else if (isPomodoro) {
      this.stopFlowAnimation();
      flowCanvas?.classList.add("opacity-0");
      progressRing?.classList.remove("opacity-0");

      const totalSeconds = Number.isFinite(state.timer.timeRemaining)
        ? state.timer.timeRemaining
        : 1500;
      const displayTime = formatTime(totalSeconds);
      const parts = displayTime.split(":");

      let timerHtml = `<span class="flex flex-row justify-center items-center gap-1.5">`;
      parts.forEach((part, index) => {
        timerHtml += `<span class="digit-color font-[Mostin] font-black text-2xl xs:text-3xl sm:text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl tracking-normal">${part}</span>`;
        if (index < parts.length - 1) {
          timerHtml += `<span class="digit-color font-['Roboto_Condensed'] text-lg xs:text-xl sm:text-2xl md:text-3xl xl:text-4xl 2xl:text-5xl pb-1.5 sm:pb-3">:</span>`;
        }
      });
      timerHtml += `</span>`;
      displayEl.innerHTML = timerHtml;

      if (progressRing) {
        const totalDuration = state.timer.duration || 1500;
        const elapsedTime = totalDuration - totalSeconds;
        const progressFraction = Math.min(
          Math.max(elapsedTime / totalDuration, 0),
          1,
        );

        progressRing.style.strokeDasharray = `${CIRCUMFERENCE}`;
        const offset = CIRCUMFERENCE - progressFraction * CIRCUMFERENCE;
        progressRing.style.strokeDashoffset = `${offset}`;

        if (isPomodoroBreak) {
          progressRing.classList.remove("stroke-brand");
          progressRing.classList.add("stroke-emerald-500");
        } else {
          progressRing.classList.remove("stroke-emerald-500");
          progressRing.classList.add("stroke-brand");
        }
      }

      if (phaseBadge) {
        const currentPhase = state.timer.currentPhase;
        const isSingleInterval = Number(state.settings.longBreakInterval) === 1;

        const phaseNames = {
          work: "Focus Phase",
          shortBreak: "Short Break",
          longBreak: isSingleInterval ? "Break Phase" : "Long Break",
        };

        phaseBadge.textContent = phaseNames[currentPhase] || "Focus Phase";
      }

      if (subInfo) {
        subInfo.textContent = `Completed Sessions: ${state.timer.pomodoroSessionCount || 0}`;
      }
    } else if (isFlow) {
      progressRing?.classList.add("opacity-0");

      const totalSeconds = Number.isFinite(state.timer.flowTime)
        ? state.timer.flowTime
        : 0;
      const displayTime = formatTime(totalSeconds);
      const parts = displayTime.split(":");

      let timerHtml = `<span class="flex flex-row justify-center items-center gap-1.5">`;
      parts.forEach((part, index) => {
        timerHtml += `<span class="font-[Mostin] font-black text-color text-2xl xs:text-3xl sm:text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl tracking-normal">${part}</span>`;
        if (index < parts.length - 1) {
          timerHtml += `<span class="digit-color font-['Roboto_Condensed'] text-lg xs:text-xl sm:text-2xl md:text-3xl xl:text-4xl 2xl:text-5xl pb-1.5 sm:pb-3">:</span>`;
        }
      });
      timerHtml += `</span>`;
      displayEl.innerHTML = timerHtml;

      if (flowCanvas) {
        if (state.timer.isRunning || state.timer.isPaused) {
          flowCanvas.classList.remove("opacity-0");
          this.startFlowAnimation();
        } else {
          flowCanvas.classList.add("opacity-0");
          this.stopFlowAnimation();
        }
      }

      if (phaseBadge) {
        phaseBadge.textContent = "Flow Mode";
      }

      if (subInfo) {
        subInfo.textContent = "Continuous Focus Duration";
      }
    }

    if (controlsContainer) {
      const { isRunning, isPaused } = state.timer;
      const currentControlState =
        isRunning && !isPaused ? "running" : isPaused ? "paused" : "idle";
      const currentModeState = `${state.activeMode}-${state.timer.currentPhase}`;

      const wasModeState = controlsContainer.dataset.modeState;
      const wasControlState = controlsContainer.dataset.state;

      if (
        wasModeState !== currentModeState ||
        wasControlState !== currentControlState
      ) {
        controlsContainer.dataset.modeState = currentModeState;
        controlsContainer.dataset.state = currentControlState;

        if (currentControlState === "idle") {
          let btnText = "Start Focus";

          if (isPomodoroBreak) {
            btnText = "Start Break";
          } else if (isFlowBreak) {
            btnText = "Start Break";
          } else if (isFlow) {
            btnText = "Start Flow";
          }

          controlsContainer.innerHTML = `
            <button
              id="btn-timer-start"
              class="flex h-10 sm:h-14 min-w-40 items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-brand/80 px-8 text-xs xs:text-sm sm:text-base font-bold text-(--color-btn-primary-text) hover:bg-brand/50 transition-all cursor-pointer active:scale-95"
            >
              <i class="fa-regular fa-play pointer-events-none"></i>
              <span class="pointer-events-none">${btnText}</span>
            </button>
          `;
        } else if (currentControlState === "running") {
          controlsContainer.innerHTML = `
            <button
              id="btn-timer-pause"
              class="flex h-10 sm:h-14 min-w-40 items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-amber-500/80 px-8 text-xs xs:text-sm sm:text-base font-bold text-(--color-btn-primary-text) hover:bg-amber-600/50 transition-all cursor-pointer active:scale-95"
            >
              <i class="fa-regular fa-pause pointer-events-none"></i>
              <span class="pointer-events-none">Pause</span>
            </button>
          `;
        } else if (currentControlState === "paused") {
          controlsContainer.innerHTML = `
            <button
              id="btn-timer-stop"
              class="flex h-10 sm:h-14 min-w-40 sm:min-w-0 items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-red-500/80 px-8 text-xs xs:text-sm sm:text-base font-bold text-(--color-btn-primary-text) hover:bg-red-600/50 transition-all cursor-pointer active:scale-95"
              title="Stop & Reset"
            >
              <i class="fa-regular fa-square pointer-events-none"></i>
              <span class="pointer-events-none">Stop</span>
            </button>

            <button
              id="btn-timer-continue"
              class="flex h-10 sm:h-14 min-w-40 items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-brand/80 px-8 text-xs xs:text-sm sm:text-base font-bold text-(--color-btn-primary-text) hover:bg-brand/50 transition-all cursor-pointer active:scale-95"
            >
              <i class="fa-regular fa-play pointer-events-none"></i>
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
    const btnToggleSound = document.getElementById("btn-toggle-sound");

    btnToggleSound?.addEventListener("click", () => {
      const soundState = SoundModel.getState();
      if (soundState.isPlaying) {
        soundService.pause();
      } else {
        const currentTrack = SoundModel.getCurrentTrack();
        if (currentTrack) {
          soundService.playTrack(currentTrack);
        }
      }
    });
  },

  async updateAudioUI() {
    const btnToggleSound = document.getElementById("btn-toggle-sound");
    if (btnToggleSound) {
      const soundState = SoundModel.getState();
      const iconClass = soundState.isPlaying
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

  bindStaticEvents() {
    const scrollTopBtn = document.getElementById("scroll-to-top-btn");

    if (scrollTopBtn) {
      let isVisible = false;
      let hideTimeout;

      window.addEventListener("scroll", () => {
        const scrollThreshold = 600;

        if (window.scrollY > scrollThreshold) {
          if (!isVisible) {
            isVisible = true;
            clearTimeout(hideTimeout);
            scrollTopBtn.classList.replace("hidden", "flex");
            requestAnimationFrame(() => {
              scrollTopBtn.classList.remove("opacity-0", "scale-75");
              scrollTopBtn.classList.add("opacity-100", "scale-100");
            });
          }
        } else {
          if (isVisible) {
            isVisible = false;
            requestAnimationFrame(() => {
              scrollTopBtn.classList.remove("opacity-100", "scale-100");
              scrollTopBtn.classList.add("opacity-0", "scale-75");
            });

            hideTimeout = setTimeout(() => {
              if (!isVisible) {
                scrollTopBtn.classList.replace("flex", "hidden");
              }
            }, 200);
          }
        }
      });

      scrollTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    window.addEventListener("resize", () => {
      this.updateModeStyles(state.activeMode);
    });

    window.currentThemeListener = () => {
      const allSessions = StateManager.getState().sessions;
      AnalyticsController.dispatchRender(allSessions);
    };
    document.addEventListener("themeChanged", window.currentThemeListener);
  },

  renderTaskWidgets() {
    const taskContainer = document.getElementById("active-task-container");
    const overviewContainer = document.getElementById(
      "today-overview-container",
    );

    if (taskContainer) {
      taskContainer.innerHTML = ActiveTaskCardComponent.render();
    }
    if (overviewContainer) {
      overviewContainer.innerHTML = TodayOverviewComponent.render();
    }
  },

  refreshUI() {
    this.updateTimerDisplay();
    this.updateAudioUI();
    this.updateModeStyles(state.activeMode);
    this.renderTaskWidgets();
  },

  handleModeSwitch(targetMode) {
    if (state.activeMode === targetMode) return;

    if (state.timer.isRunning || state.timer.isPaused) {
      ModalController.openConfirm({
        title: "Switch Timer Mode?",
        message: `Timer is currently active. Are you sure you want to stop it and switch to ${targetMode.toUpperCase()} mode?`,
        onConfirm: () => {
          timerService.stopAndTransition();
          this.flowStartTimestamp = null;
          this.accumulatedFlowTime = 0;

          StateManager.setMode(targetMode);
          timerService.pause();
          StateManager.resetTimer();

          this.refreshUI();
        },
      });
      return;
    }

    StateManager.setMode(targetMode);
    StateManager.resetTimer();

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
