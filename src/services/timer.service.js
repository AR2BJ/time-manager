import { StateManager, state } from "@/models/state.model.js";

import { NotificationService } from "./notification.service.js";
import { SoundModel } from "@/models/sound.model.js";
import { TaskService } from "./task.service.js";
import { soundService } from "./sound.service.js";

class TimerService {
  constructor() {
    this.timerInterval = null;
  }

  initFromSavedState() {
    if (state.timer?.isRunning && !state.timer?.isPaused) {
      StateManager.updateTimerState({ isPaused: true, isRunning: false });
    }
  }

  toggle() {
    if (state.timer.isRunning && !state.timer.isPaused) {
      this.pause();
    } else {
      this.start();
    }
  }

  start() {
    if (state.timer.isRunning && !state.timer.isPaused) return;

    StateManager.updateTimerState({ isRunning: true, isPaused: false });

    const currentTrack = SoundModel.getCurrentTrack();
    if (currentTrack) {
      soundService.playTrack(currentTrack);
    }

    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this._tick();
    }, 1000);
  }

  pause() {
    clearInterval(this.timerInterval);
    StateManager.updateTimerState({ isRunning: false, isPaused: true });

    soundService.pause();
  }

  stopAndTransition() {
    clearInterval(this.timerInterval);

    if (state.activeMode === "flow") {
      StateManager.updateTimerState({
        isRunning: false,
        isPaused: false,
        flowTime: 0,
      });
    } else {
      const durationMap = {
        work: (state.settings.pomodoroWorkTime || 25) * 60,
        shortBreak: (state.settings.shortBreakTime || 5) * 60,
        longBreak: (state.settings.longBreakTime || 15) * 60,
      };

      const currentPhaseDuration =
        durationMap[state.timer.currentPhase] || 1500;

      StateManager.updateTimerState({
        isRunning: false,
        isPaused: false,
        timeRemaining: currentPhaseDuration,
        duration: currentPhaseDuration,
      });
    }

    soundService.pause();
  }

  reset() {
    clearInterval(this.timerInterval);
    StateManager.resetTimer();
    soundService.pause();
  }

  _tick() {
    if (state.activeMode === "pomodoro") {
      this._handlePomodoroTick();
    } else {
      this._handleFlowTick();
    }
  }

  _handlePomodoroTick() {
    const newTime = state.timer.timeRemaining - 1;

    if (newTime <= 0) {
      this._onPomodoroComplete();
    } else {
      StateManager.updateTimerState({ timeRemaining: newTime });
    }
  }

  _handleFlowTick() {
    const newFlowTime = (state.timer.flowTime || 0) + 1;
    StateManager.updateTimerState({ flowTime: newFlowTime });
  }

  _onPomodoroComplete() {
    clearInterval(this.timerInterval);

    const isWorkPhase = state.timer.currentPhase === "work";

    const soundToPlay = isWorkPhase
      ? state.settings.pomodoroEndSound || "bell"
      : state.settings.breakEndSound || "chime";

    soundService.playNotificationSound(soundToPlay);

    if (isWorkPhase) {
      const currentTaskId = state.activeTaskId;

      if (currentTaskId) {
        TaskService.incrementCompletedPomodoro(currentTaskId);
      }

      const newSessionCount = (state.timer.pomodoroSessionCount || 0) + 1;
      const workSecs = (state.settings.pomodoroWorkTime || 25) * 60;

      StateManager.addSession({
        type: "pomodoro",
        durationSeconds: workSecs,
      });

      NotificationService.show({
        type: "success",
        message: "Focus session completed! Time for a break.",
        icon: "fa-circle-check",
        iconColor: "text-emerald-500",
        duration: 5000,
      });

      if (state.settings.disableBreaks) {
        StateManager.updateTimerState({
          isRunning: false,
          isPaused: false,
          pomodoroSessionCount: newSessionCount,
          currentPhase: "work",
          timeRemaining: workSecs,
          duration: workSecs,
        });

        if (state.settings.autoStartPomodoros) {
          this.start();
        } else {
          soundService.pause();
        }
        return;
      }

      const interval = state.settings.longBreakInterval || 4;
      const isLongBreak = newSessionCount % interval === 0;
      const nextPhase = isLongBreak ? "longBreak" : "shortBreak";
      const breakMinutes =
        nextPhase === "longBreak"
          ? state.settings.longBreakTime || 15
          : state.settings.shortBreakTime || 5;

      StateManager.updateTimerState({
        isRunning: false,
        isPaused: false,
        pomodoroSessionCount: newSessionCount,
        currentPhase: nextPhase,
        timeRemaining: breakMinutes * 60,
        duration: breakMinutes * 60,
      });

      if (state.settings.autoStartBreaks) {
        this.start();
      } else {
        soundService.pause();
      }
    } else {
      // Break phase completed -> return to Work phase
      const workSecs = (state.settings.pomodoroWorkTime || 25) * 60;
      StateManager.updateTimerState({
        isRunning: false,
        isPaused: false,
        currentPhase: "work",
        timeRemaining: workSecs,
        duration: workSecs,
      });

      NotificationService.show({
        type: "info",
        message: "Break has ended! Ready to focus?",
        icon: "fa-bolt",
        iconColor: "text-brand",
        duration: 5000,
      });

      if (state.settings.autoStartPomodoros) {
        this.start();
      } else {
        soundService.pause();
      }
    }
  }

  /**
   * Manual completion trigger for Flow Mode
   */
  stopAndSaveFlowSession() {
    if (state.activeMode !== "flow" || (state.timer.flowTime || 0) < 10) {
      this.reset();
      return;
    }

    clearInterval(this.timerInterval);

    // Save Flow session
    StateManager.addSession({
      type: "flow",
      durationSeconds: state.timer.flowTime,
    });

    this.reset();
  }
}

export const timerService = new TimerService();
