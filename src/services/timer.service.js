import { StateManager, state } from "@/models/state.model.js";

import { SoundModel } from "@/models/sound.model.js";
import { soundService } from "./sound.service.js";

class TimerService {
  constructor() {
    this.timerInterval = null;
  }

  /**
   * Safe initialization from stored state
   */
  initFromSavedState() {
    if (state.timer?.isRunning && !state.timer?.isPaused) {
      StateManager.updateTimerState({ isPaused: true, isRunning: false });
    }
  }

  /**
   * Starts or resumes the timer based on the active mode (Pomodoro or Flow)
   */
  start() {
    if (state.timer.isRunning && !state.timer.isPaused) return;

    StateManager.updateTimerState({ isRunning: true, isPaused: false });

    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this._tick();
    }, 1000);
  }

  /**
   * Pauses the active timer
   */
  pause() {
    clearInterval(this.timerInterval);
    StateManager.updateTimerState({ isRunning: false, isPaused: true });

    soundService.pause();
    SoundModel.setPlaying(false);
  }

  /**
   * Stops active timer and handles transitions based on active mode
   */
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
    SoundModel.setPlaying(false);
  }

  /**
   * Resets timer back to default settings for current mode
   */
  reset() {
    clearInterval(this.timerInterval);
    StateManager.resetTimer();
    soundService.pause();
    StateManager.setSoundPlaying(false);
  }

  /**
   * Internal tick handler called every second
   * @private
   */
  _tick() {
    if (state.activeMode === "pomodoro") {
      this._handlePomodoroTick();
    } else {
      this._handleFlowTick();
    }
  }

  /**
   * Handles 1-second decrement for Pomodoro
   * @private
   */
  _handlePomodoroTick() {
    const newTime = state.timer.timeRemaining - 1;

    if (newTime <= 0) {
      this._onPomodoroComplete();
    } else {
      StateManager.updateTimerState({ timeRemaining: newTime });
    }
  }

  /**
   * Handles 1-second increment for Flow Mode
   * @private
   */
  _handleFlowTick() {
    const newFlowTime = (state.timer.flowTime || 0) + 1;
    StateManager.updateTimerState({ flowTime: newFlowTime });
  }

  /**
   * Triggered when a Pomodoro phase ends
   * @private
   */
  _onPomodoroComplete() {
    clearInterval(this.timerInterval);

    const isWorkPhase = state.timer.currentPhase === "work";

    if (isWorkPhase) {
      const newSessionCount = (state.timer.pomodoroSessionCount || 0) + 1;
      const interval = state.settings.longBreakInterval || 4;

      const isLongBreak = newSessionCount % interval === 0;
      const nextPhase = isLongBreak ? "longBreak" : "shortBreak";
      const breakMinutes =
        nextPhase === "longBreak"
          ? state.settings.longBreakTime
          : state.settings.shortBreakTime;

      StateManager.addSession({
        type: "pomodoro",
        durationSeconds: (state.settings.pomodoroWorkTime || 25) * 60,
      });

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

      if (state.settings.autoStartPomodoros) {
        this.start();
      }
    }

    soundService.pause();
    StateManager.setSoundPlaying(false);
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
