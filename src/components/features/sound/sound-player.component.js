import { SoundModel } from "@/models/sound.model.js";
import { soundService } from "@/services/sound.service.js";

export class SoundPlayerComponent {
  constructor() {
    this.container = null;
    this.unsubscribe = null;
    this.isVolumeOpen = false;
    this.currentTime = 0;
    this.duration = 0;
    this.progressInterval = null;
    this.isUserSeeking = false;
  }

  render() {
    this.container = document.createElement("div");
    this.container.className = "w-full";
    this.mount();

    if (!this.unsubscribe) {
      this.unsubscribe = SoundModel.subscribe(() => this.updateUI());
    }

    this.startProgressTracker();
    return this.container;
  }

  mount() {
    this.container.innerHTML = `
      <div class="relative w-full bg-surface-2 border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-3 transition-all duration-300">
        
        <!-- Header Controls -->
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 overflow-hidden">
            <div id="player-music-icon-wrapper" class="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0 text-brand">
              <i class="fa-solid fa-music text-lg"></i>
            </div>
            <div class="flex flex-col min-w-0">
              <h4 id="player-track-title" class="text-sm font-bold text-primary truncate">--</h4>
              <div class="flex items-center gap-2 text-xs text-secondary truncate">
                <span id="player-track-creator">--</span>
                <span class="inline-block w-1 h-1 rounded-full bg-border"></span>
                <span id="player-track-type" class="px-1.5 py-0.5 rounded bg-surface-3 text-[10px] font-semibold text-brand tracking-wider">
                  AUDIO
                </span>
              </div>
            </div>
          </div>

          <!-- Volume Controls -->
          <div class="relative">
            <button
              type="button"
              id="btn-volume-popover-toggle"
              class="w-9 h-9 rounded-xl bg-surface hover:bg-surface-3 border border-border text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer"
              title="Volume Control"
            >
              <span id="player-volume-icon-slot" class="pointer-events-none flex items-center justify-center">
                <i class="fa-solid fa-volume-high"></i>
              </span>
            </button>

            <div
              id="volume-popover"
              class="hidden absolute left-1/2 -translate-x-1/2 bottom-12 z-30 flex-col items-center gap-2 p-3 bg-surface border border-border rounded-2xl shadow-xl animate-fade-in w-12"
            >
              <span id="volume-text-val" class="text-[10px] font-bold text-secondary">50%</span>
              <input
                type="range"
                id="volume-slider"
                min="0"
                max="100"
                value="50"
                class="w-24 h-1.5 bg-surface-3 rounded-lg appearance-none cursor-pointer accent-brand -rotate-90 my-10"
              />
              <button
                type="button"
                id="btn-toggle-mute"
                class="text-xs text-secondary hover:text-brand transition cursor-pointer pt-1"
                title="Toggle Mute"
              >
                <span id="popover-mute-icon-slot" class="flex items-center justify-center">
                  <i class="fa-solid fa-volume-high"></i>
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Progress & Timeline Slider -->
        <div class="flex flex-col gap-1 mt-2">
          <input
            type="range"
            id="audio-progress-bar"
            min="0"
            max="100"
            value="0"
            class="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-brand transition-all dir-ltr"
            style="background: linear-gradient(to right, var(--color-brand, #14b8a6) 0%, var(--color-surface-3, #334155) 0%);"
          />
          <!-- Time Display (LTR layout for standard audio players) -->
          <div class="flex items-center justify-between text-[11px] font-mono text-tertiary dir-ltr pt-1">
            <span id="player-current-time">0:00</span>
            <span id="player-total-time">0:00</span>
          </div>
        </div>

        <!-- Action Controls -->
        <div class="flex items-center justify-center gap-4 pt-1">
          <button
            type="button"
            id="btn-player-play-toggle"
            class="w-11 h-11 rounded-full bg-brand hover:bg-brand/90 text-white flex items-center justify-center shadow-md shadow-brand/20 transition cursor-pointer active:scale-95"
            title="Play"
          >
            <span id="btn-play-icon-slot" class="flex items-center justify-center">
              <i class="fa-solid fa-play ms-0.5 text-base"></i>
            </span>
          </button>
        </div>

      </div>
    `;

    this.bindEvents();
    this.updateUI();
  }

  updateUI() {
    if (!this.container) return;

    const state = SoundModel.getState();
    const currentTrack = SoundModel.getCurrentTrack();
    const isPlaying = state.isPlaying;
    const isMuted = state.isMuted;
    const volume = state.volume;

    // Track Metadata
    const titleEl = this.container.querySelector("#player-track-title");
    const creatorEl = this.container.querySelector("#player-track-creator");
    const typeEl = this.container.querySelector("#player-track-type");
    const iconWrapper = this.container.querySelector(
      "#player-music-icon-wrapper",
    );

    if (titleEl)
      titleEl.textContent = currentTrack?.title || "No track selected";
    if (creatorEl)
      creatorEl.textContent = currentTrack?.creator || "Unknown Source";
    if (typeEl)
      typeEl.textContent = (currentTrack?.type || "Audio").toUpperCase();

    if (iconWrapper) {
      iconWrapper.innerHTML = `<i class="fa-solid fa-music text-lg ${
        isPlaying ? "animate-pulse" : ""
      }"></i>`;
    }

    // Play/Pause State
    const playSlot = this.container.querySelector("#btn-play-icon-slot");
    if (playSlot) {
      playSlot.innerHTML = isPlaying
        ? `<i class="fa-solid fa-pause text-base"></i>`
        : `<i class="fa-solid fa-play ms-0.5 text-base"></i>`;
    }

    // Volume Popover State
    const volPopover = this.container.querySelector("#volume-popover");
    if (volPopover) {
      volPopover.classList.toggle("flex", this.isVolumeOpen);
      volPopover.classList.toggle("hidden", !this.isVolumeOpen);
    }

    // Volume Icons
    const volSlot = this.container.querySelector("#player-volume-icon-slot");
    const popoverMuteSlot = this.container.querySelector(
      "#popover-mute-icon-slot",
    );
    const volSlider = this.container.querySelector("#volume-slider");
    const volText = this.container.querySelector("#volume-text-val");

    let volumeIconHtml = `<i class="fa-solid fa-volume-high"></i>`;
    if (isMuted || volume === 0) {
      volumeIconHtml = `<i class="fa-solid fa-volume-xmark text-rose-500"></i>`;
    } else if (volume < 50) {
      volumeIconHtml = `<i class="fa-solid fa-volume-low"></i>`;
    }

    if (volSlot) volSlot.innerHTML = volumeIconHtml;
    if (popoverMuteSlot) {
      popoverMuteSlot.innerHTML = isMuted
        ? `<i class="fa-solid fa-volume-xmark text-rose-500"></i>`
        : `<i class="fa-solid fa-volume-high"></i>`;
    }

    if (volSlider) volSlider.value = isMuted ? 0 : volume;
    if (volText) volText.textContent = `${isMuted ? 0 : volume}%`;

    this.updateProgressBarFill();
  }

  bindEvents() {
    const volToggleBtn = this.container.querySelector(
      "#btn-volume-popover-toggle",
    );
    volToggleBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.isVolumeOpen = !this.isVolumeOpen;
      this.updateUI();
    });

    const volSlider = this.container.querySelector("#volume-slider");
    volSlider?.addEventListener("input", (e) => {
      const vol = Number(e.target.value);
      SoundModel.setVolume(vol);
      soundService.setVolume();
    });

    const muteBtn = this.container.querySelector("#btn-toggle-mute");
    muteBtn?.addEventListener("click", () => {
      SoundModel.toggleMute();
      soundService.setVolume();
    });

    const playBtn = this.container.querySelector("#btn-player-play-toggle");
    playBtn?.addEventListener("click", async () => {
      const state = SoundModel.getState();
      if (state.isPlaying) {
        await soundService.pause();
      } else {
        const currentTrack = SoundModel.getCurrentTrack();
        await soundService.playTrack(currentTrack);
      }
    });

    const progressBar = this.container.querySelector("#audio-progress-bar");

    progressBar?.addEventListener("input", (e) => {
      this.isUserSeeking = true;
      const targetTime = Number(e.target.value);
      const currEl = this.container?.querySelector("#player-current-time");
      if (currEl) currEl.textContent = this.formatDuration(targetTime);
      this.updateProgressBarFill();
    });

    progressBar?.addEventListener("change", (e) => {
      const targetTime = Number(e.target.value);
      this.currentTime = targetTime;
      soundService.seekTo(targetTime);
      this.isUserSeeking = false;
      this.updateProgressBarFill();
    });

    this.onDocumentClick = (e) => {
      if (this.isVolumeOpen && !this.container.contains(e.target)) {
        this.isVolumeOpen = false;
        this.updateUI();
      }
    };
    document.addEventListener("click", this.onDocumentClick);
  }

  updateProgressBarFill() {
    const bar = this.container?.querySelector("#audio-progress-bar");
    if (!bar) return;

    const max = Number(bar.max) || 100;
    const val = Number(bar.value) || 0;
    const percentage = max > 0 ? (val / max) * 100 : 0;

    // Applies filled track color dynamically matching the thumb position
    bar.style.background = `linear-gradient(to right, var(--color-brand, #14b8a6) 0%, var(--color-brand, #14b8a6) ${percentage}%, var(--color-surface-3, #334155) ${percentage}%, var(--color-surface-3, #334155) 100%)`;
  }

  startProgressTracker() {
    if (this.progressInterval) clearInterval(this.progressInterval);

    this.progressInterval = setInterval(() => {
      const state = SoundModel.getState();
      if (state.isPlaying && !this.isUserSeeking) {
        const timeData = soundService.getCurrentTimeData();
        this.currentTime = timeData.currentTime || 0;
        this.duration = timeData.duration || 0;

        const currEl = this.container?.querySelector("#player-current-time");
        const totEl = this.container?.querySelector("#player-total-time");
        const bar = this.container?.querySelector("#audio-progress-bar");

        if (currEl) currEl.textContent = this.formatDuration(this.currentTime);
        if (totEl) totEl.textContent = this.formatDuration(this.duration);

        if (bar) {
          bar.max = this.duration || 100;
          bar.value = this.currentTime || 0;
          this.updateProgressBarFill();
        }
      }
    }, 500);
  }

  formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.progressInterval) clearInterval(this.progressInterval);
    document.removeEventListener("click", this.onDocumentClick);
  }
}
