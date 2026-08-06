import { StateManager, state } from "@/models/state.model.js";

import { AnalyticsView } from "@/views/analytics-view.js";
import { DesktopNavComponent } from "@/components/layout/desktop-nav.component.js";
import { GlobalLoaderService } from "@/services/loader.service";
import { HeaderComponent } from "@/components/shared/header.component.js";
import { InfoModalComponent } from "@/components/modals/info-modal.component.js";
import { MobileNavComponent } from "@/components/layout/mobile-nav.component.js";
import { SettingsViewComponent } from "@/components/features/settings/settings-view.component.js";
import { TimerView } from "@/views/timer-view.js";
import { soundService } from "@/services/sound.service.js";
import { timerService } from "@/services/timer.service.js";

export const TimerController = {
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
    const btnToggle = document.getElementById("btn-timer-toggle");
    const btnReset = document.getElementById("btn-timer-reset");
    const btnFinishFlow = document.getElementById("btn-timer-finish-flow");
    const btnPomodoro = document.getElementById("mode-pomodoro");
    const btnFlow = document.getElementById("mode-flow");

    btnToggle?.addEventListener("click", () => {
      if (state.timer.isRunning && !state.timer.isPaused) {
        timerService.pause();
      } else {
        timerService.start();
      }
    });

    btnReset?.addEventListener("click", () => {
      timerService.reset();
    });

    btnFinishFlow?.addEventListener("click", () => {
      timerService.stopAndSaveFlowSession();
    });

    const handleModeClick = (targetMode, loaderText) => {
      if (state.activeMode === targetMode) return;

      GlobalLoaderService.show(loaderText);

      setTimeout(() => {
        try {
          this.handleModeSwitch(targetMode);
        } finally {
          GlobalLoaderService.hide();
        }
      }, 30);
    };

    btnPomodoro?.addEventListener("click", () =>
      handleModeClick("pomodoro", "Switching to Pomodoro Timer..."),
    );
    btnFlow?.addEventListener("click", () =>
      handleModeClick("flow", "Loading flow Timer..."),
    );
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
        document.getElementById("btn-timer-toggle")?.click();
      }

      if (event.key.toLowerCase() === "r" && !event.altKey && !event.ctrlKey) {
        event.preventDefault();
        document.getElementById("btn-timer-reset")?.click();
      }
    });
  },

  bindSoundEvents() {
    const soundSelector = document.getElementById("sound-selector");
    const btnToggleSound = document.getElementById("btn-toggle-sound");

    soundSelector?.addEventListener("change", (e) => {
      const soundId = e.target.value;
      StateManager.setSoundTrack(soundId);

      if (state.timer.isRunning && !state.timer.isPaused) {
        const currentTrack = state.soundPlayer.trackList.find(
          (t) => t.id === soundId,
        );
        if (currentTrack?.youtubeId) {
          soundService.playTrack(currentTrack.youtubeId);
          StateManager.setSoundPlaying(true);
        }
      }
    });

    btnToggleSound?.addEventListener("click", () => {
      if (state.soundPlayer.isPlaying) {
        soundService.pause();
        StateManager.setSoundPlaying(false);
      } else {
        const currentTrack = state.soundPlayer.trackList.find(
          (t) => t.id === state.soundPlayer.currentSoundId,
        );
        if (currentTrack?.youtubeId) {
          soundService.playTrack(currentTrack.youtubeId);
          StateManager.setSoundPlaying(true);
        }
      }
    });
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

  updateTimerDisplay() {
    const displayEl = document.getElementById("timer-display");
    const btnToggle = document.getElementById("btn-timer-toggle");
    const phaseBadge = document.getElementById("timer-phase-badge");
    const subInfo = document.getElementById("timer-sub-info");
    const btnFinishFlow = document.getElementById("btn-timer-finish-flow");

    if (!displayEl) return;

    if (state.activeMode === "pomodoro") {
      const totalSeconds = state.timer.timeRemaining;
      const mins = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
      const secs = String(totalSeconds % 60).padStart(2, "0");
      displayEl.textContent = `${mins}:${secs}`;

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

      btnFinishFlow?.classList.add("hidden");
    } else if (state.activeMode === "flow") {
      const totalSeconds = state.timer.flowTime;
      const mins = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
      const secs = String(totalSeconds % 60).padStart(2, "0");
      displayEl.textContent = `${mins}:${secs}`;

      if (phaseBadge) {
        phaseBadge.textContent = "Flow Mode";
      }

      if (subInfo) {
        subInfo.textContent = "Continuous Focus Duration";
      }

      if (state.timer.flowTime > 10) {
        btnFinishFlow?.classList.remove("hidden");
      } else {
        btnFinishFlow?.classList.add("hidden");
      }
    }

    if (btnToggle) {
      const isRunning = state.timer.isRunning && !state.timer.isPaused;
      const iconClass = isRunning ? "fa-solid fa-pause" : "fa-solid fa-play";
      const labelText = isRunning
        ? "Pause"
        : state.timer.isPaused
          ? "Resume"
          : "Start Focus";

      btnToggle.innerHTML = `
        <i id="timer-toggle-icon" class="${iconClass}"></i>
        <span id="timer-toggle-label">${labelText}</span>
      `;
    }
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

  updateAudioUI() {
    const btnToggleSound = document.getElementById("btn-toggle-sound");
    if (btnToggleSound) {
      const iconClass = state.soundPlayer.isPlaying
        ? "fa-regular fa-volume-high text-brand"
        : "fa-regular fa-volume-xmark";

      btnToggleSound.innerHTML = `<i id="sound-icon" class="${iconClass}"></i>`;
    }
  },
};
