import { StateManager, state } from "@/models/state.model.js";

import { soundService } from "./sound.service.js";

class TimerService {
  constructor() {
    this.timerInterval = null;
  }

  /**
   * Starts or resumes the timer based on the active mode (Pomodoro or Flow)
   */
  start() {
    if (state.timer.isRunning && !state.timer.isPaused) return;

    StateManager.updateTimerState({
      isRunning: true,
      isPaused: false,
    });

    // Start background sound if a track is selected
    if (state.soundPlayer.currentSoundId) {
      const currentTrack = state.soundPlayer.trackList.find(
        (t) => t.id === state.soundPlayer.currentSoundId,
      );
      if (currentTrack && currentTrack.youtubeId) {
        soundService.playTrack(currentTrack.youtubeId);
        StateManager.setSoundPlaying(true);
      }
    }

    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this._tick();
    }, 1000);
  }

  /**
   * Pauses the active timer
   */
  pause() {
    if (!state.timer.isRunning) return;

    clearInterval(this.timerInterval);
    StateManager.updateTimerState({
      isRunning: true,
      isPaused: true,
    });

    soundService.pause();
    StateManager.setSoundPlaying(false);
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
    } else if (state.activeMode === "flow") {
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
    const newFlowTime = state.timer.flowTime + 1;
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
      // Log completed work session
      const durationSecs = state.settings.pomodoroWorkTime * 60;
      StateManager.addSession({
        type: "pomodoro",
        durationSeconds: durationSecs,
      });

      const newSessionCount = state.timer.pomodoroSessionCount + 1;

      // Every 4 pomodoros -> Long Break, otherwise -> Short Break
      const nextPhase = newSessionCount % 4 === 0 ? "longBreak" : "shortBreak";
      const breakMinutes =
        nextPhase === "longBreak"
          ? state.settings.longBreakTime
          : state.settings.shortBreakTime;

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
      const workSecs = state.settings.pomodoroWorkTime * 60;
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
    if (state.activeMode !== "flow" || state.timer.flowTime < 10) {
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
