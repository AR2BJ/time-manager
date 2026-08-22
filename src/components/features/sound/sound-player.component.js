import { SoundModel } from "@/models/sound.model.js";
import { soundService } from "@/services/sound.service.js";

export class SoundPlayerComponent {
  constructor() {
    this.container = null;
    this.unsubscribe = null;
    this.isVolumeOpen = false;
    this.progressInterval = null;
    this.VOLUME_STEP = 5;
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
      <div
        class="relative w-full bg-surface-2 border border-border rounded-2xl p-3 sm:p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 transition-all duration-300"
      >
        <!-- Top Container for Mobile / Left Container for Desktop -->
        <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto min-w-0 flex-1">
          <!-- Cover Art & Play Action -->
          <div class="relative w-16 h-16 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-surface-3 border border-border shrink-0 group">
            <img 
              id="player-cover-image" 
              src="" 
              alt="Cover" 
              class="w-full h-full object-cover hidden"
            />
            <div 
              id="player-cover-fallback" 
              class="w-full h-full flex items-center justify-center text-brand bg-brand/10"
            >
            </div>

            <button
              type="button"
              id="btn-player-play-toggle"
              class="absolute inset-0 bg-black/40 hover:bg-black/55 text-white flex items-center justify-center transition cursor-pointer"
              title="Play / Pause"
            >
              <span id="btn-play-icon-slot" class="flex items-center justify-center">
                <i class="fa-solid fa-play ms-0.5 text-base"></i>
              </span>
            </button>
          </div>

          <!-- Metadata & Duration Section -->
          <div class="flex flex-col items-center text-center sm:items-start sm:text-left min-w-0 flex-1 w-full gap-1">
            <h4
              id="player-track-title"
              class="text-xs sm:text-sm font-bold text-color truncate w-full cursor-pointer sm:pointer-events-none sm:cursor-default"
              data-tooltip-title="No track selected"
            >
              --
            </h4>
            
            <div class="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 w-full justify-center sm:justify-start min-w-0">
              <span 
                id="player-track-creator" 
                class="text-[11px] sm:text-xs text-secondary truncate max-w-full cursor-pointer sm:pointer-events-none sm:cursor-default"
                data-tooltip-title="Unknown Source"
              >
                --
              </span>

              <span class="hidden sm:inline-block w-1 h-1 rounded-full bg-border shrink-0"></span>

              <div class="text-[10px] sm:text-[11px] text-tertiary dir-ltr flex items-center gap-0.5 shrink-0">
                <span id="player-current-time">0:00</span>
                <span class="opacity-60">/</span>
                <span id="player-total-time">0:00</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Inline Volume (Mobile Layout) -->
        <div class="flex sm:hidden items-center gap-2.5 w-full pt-2 border-t border-border/40">
          <button
            type="button"
            class="btn-toggle-mute text-secondary hover:text-color transition shrink-0 cursor-pointer"
            title="Toggle Mute"
          >
            <span class="inline-volume-icon flex items-center justify-center text-xs">
              <i class="fa-solid fa-volume-high"></i>
            </span>
          </button>

          <input
            type="range"
            class="volume-slider-input w-full h-1.5 bg-surface-3 rounded-lg appearance-none cursor-pointer accent-brand"
            min="0"
            max="100"
            step="5"
            value="50"
            aria-label="Volume Slider"
          />

          <span class="volume-text-val text-[10px] text-tertiary w-7 text-right shrink-0">
            50%
          </span>
        </div>

        <!-- Popover Volume (Desktop Layout) -->
        <div class="hidden sm:flex relative shrink-0">
          <button
            type="button"
            id="btn-volume-popover-toggle"
            class="w-9 h-9 rounded-xl bg-surface hover:bg-surface-3 border border-border text-secondary hover:text-color flex items-center justify-center transition cursor-pointer"
            title="Volume Control"
          >
            <span
              id="player-volume-icon-slot"
              class="pointer-events-none flex items-center justify-center text-sm"
            >
              <i class="fa-solid fa-volume-high"></i>
            </span>
          </button>

          <div
            id="volume-popover"
            class="hidden absolute left-1/2 -translate-x-1/2 bottom-12 z-30 flex-col items-center gap-2 p-3 bg-surface border border-border rounded-2xl shadow-xl animate-fade-in w-12"
          >
            <span
              class="volume-text-val text-[10px] font-bold text-secondary"
            >50%</span>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value="50"
              class="volume-slider-input w-24 h-1.5 bg-surface-3 rounded-lg appearance-none cursor-pointer accent-brand -rotate-90 my-10"
              aria-label="Volume Slider"
            />
            <button
              type="button"
              class="btn-toggle-mute text-xs text-secondary hover:text-brand transition cursor-pointer pt-1"
              title="Toggle Mute"
            >
              <span class="popover-mute-icon-slot flex items-center justify-center">
                <i class="fa-solid fa-volume-high"></i>
              </span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.updateUI();
  }

  updateSliderFill(volInput, val) {
    if (!volInput) return;
    const percentage = Math.max(0, Math.min(100, Number(val)));
    volInput.style.background = `linear-gradient(to right, var(--color-brand, #00bba7) ${percentage}%, var(--color-surface-3, #334155) ${percentage}%)`;
  }

  updateUI() {
    if (!this.container) return;

    const state = SoundModel.getState();
    const currentTrack = SoundModel.getCurrentTrack();
    const isPlaying = state.isPlaying;
    const isLoading = state.isLoading;
    const isMuted = state.isMuted;
    const volume = state.volume;

    // Track Metadata
    const titleEl = this.container.querySelector("#player-track-title");
    const creatorEl = this.container.querySelector("#player-track-creator");

    const trackTitle = currentTrack?.title || "No track selected";
    const trackCreator = currentTrack?.creator || "Unknown Source";

    if (titleEl) {
      titleEl.textContent = trackTitle;
      titleEl.dataset.tooltipTitle = trackTitle;
    }
    if (creatorEl) {
      creatorEl.textContent = trackCreator;
      creatorEl.dataset.tooltipTitle = trackCreator;
    }

    const coverImg = this.container.querySelector("#player-cover-image");
    const coverFallback = this.container.querySelector(
      "#player-cover-fallback",
    );

    if (currentTrack?.coverUrl) {
      if (coverImg) {
        coverImg.classList.add(
          "transition-opacity",
          "duration-500",
          "opacity-0",
        );
        coverImg.src = currentTrack.coverUrl;

        coverImg.onload = () => {
          coverImg.classList.remove("hidden");
          requestAnimationFrame(() => {
            coverImg.classList.remove("opacity-0");
            coverImg.classList.add("opacity-100");
          });
          coverFallback?.classList.add("hidden");
        };

        coverImg.onerror = () => {
          coverImg.classList.add("hidden");
          coverFallback?.classList.remove("hidden");
        };
      }
    } else {
      coverImg?.classList.add("hidden");
      coverFallback?.classList.remove("hidden");
    }

    // Dynamic Play/Pause/Loading State
    const playSlot = this.container.querySelector("#btn-play-icon-slot");
    if (playSlot) {
      if (isLoading) {
        playSlot.innerHTML = `
          <svg viewBox="0 0 16 16" height="48" width="48" class="windows-loading-spinner">
            <circle r="7px" cy="8px" cx="8px"></circle>
          </svg>
        `;
      } else if (isPlaying) {
        playSlot.innerHTML = `<i class="fa-solid fa-pause text-base"></i>`;
      } else {
        playSlot.innerHTML = `<i class="fa-solid fa-play ms-0.5 text-base"></i>`;
      }
    }

    // Volume UI Sync (Both Mobile & Desktop Inputs)
    const volPopover = this.container.querySelector("#volume-popover");
    if (volPopover) {
      volPopover.classList.toggle("flex", this.isVolumeOpen);
      volPopover.classList.toggle("hidden", !this.isVolumeOpen);
    }

    // 3 Volume Levels (Low, Medium, High) + Mute State
    let volumeIconHtml = `<i class="fa-solid fa-volume-high"></i>`;
    if (isMuted || volume === 0) {
      volumeIconHtml = `<i class="fa-solid fa-volume-xmark text-brand"></i>`;
    } else if (volume <= 33) {
      volumeIconHtml = `<i class="fa-solid fa-volume-low"></i>`;
    } else if (volume <= 66) {
      volumeIconHtml = `<i class="fa-solid fa-volume"></i>`;
    } else {
      volumeIconHtml = `<i class="fa-solid fa-volume-high"></i>`;
    }

    const volSlot = this.container.querySelector("#player-volume-icon-slot");
    if (volSlot) volSlot.innerHTML = volumeIconHtml;

    this.container
      .querySelectorAll(".popover-mute-icon-slot, .inline-volume-icon")
      .forEach((el) => {
        el.innerHTML = volumeIconHtml;
      });

    const currentDisplayVol = isMuted ? 0 : volume;

    this.container
      .querySelectorAll(".volume-slider-input")
      .forEach((slider) => {
        slider.value = currentDisplayVol;
        this.updateSliderFill(slider, currentDisplayVol);
      });

    this.container.querySelectorAll(".volume-text-val").forEach((textEl) => {
      textEl.textContent = `${currentDisplayVol}%`;
    });
  }

  bindEvents() {
    const playBtn = this.container.querySelector("#btn-player-play-toggle");
    playBtn?.addEventListener("click", async () => {
      const state = SoundModel.getState();
      if (state.isLoading) return;

      if (state.isPlaying) {
        await soundService.pause();
      } else {
        const currentTrack = SoundModel.getCurrentTrack();
        await soundService.playTrack(currentTrack);
      }
    });

    const volToggleBtn = this.container.querySelector(
      "#btn-volume-popover-toggle",
    );
    volToggleBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.isVolumeOpen = !this.isVolumeOpen;
      this.updateUI();
    });

    this.container
      .querySelectorAll(".volume-slider-input")
      .forEach((slider) => {
        // Change volume on range input adjustment
        slider.addEventListener("input", (e) => {
          const vol = Number(e.target.value);
          SoundModel.setVolume(vol);
          soundService.setVolume();
        });

        // Keyboard shortcuts for ArrowUp, ArrowDown, ArrowRight, ArrowLeft
        slider.addEventListener("keydown", (e) => {
          if (
            ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"].includes(e.key)
          ) {
            e.preventDefault();
            const currentVol = SoundModel.getState().volume;
            let targetVol = currentVol;

            if (e.key === "ArrowUp" || e.key === "ArrowRight") {
              targetVol = Math.min(100, currentVol + this.VOLUME_STEP);
            } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
              targetVol = Math.max(0, currentVol - this.VOLUME_STEP);
            }

            SoundModel.setVolume(targetVol);
            soundService.setVolume();
          }
        });
      });

    this.container.querySelectorAll(".btn-toggle-mute").forEach((muteBtn) => {
      muteBtn.addEventListener("click", () => {
        SoundModel.toggleMute();
        soundService.setVolume();
      });
    });

    this.onDocumentClick = (e) => {
      if (this.isVolumeOpen && !this.container.contains(e.target)) {
        this.isVolumeOpen = false;
        this.updateUI();
      }
    };
    document.addEventListener("click", this.onDocumentClick);
  }

  startProgressTracker() {
    if (this.progressInterval) clearInterval(this.progressInterval);

    this.progressInterval = setInterval(() => {
      const state = SoundModel.getState();
      if (state.isPlaying) {
        const timeData = soundService.getCurrentTimeData();
        const currEl = this.container?.querySelector("#player-current-time");
        const totEl = this.container?.querySelector("#player-total-time");

        if (currEl)
          currEl.textContent = this.formatDuration(timeData.currentTime);
        if (totEl) totEl.textContent = this.formatDuration(timeData.duration);
      }
    }, 500);
  }

  formatDuration(seconds) {
    if (!seconds || isNaN(seconds) || seconds < 0) return "0:00";

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const formattedM = h > 0 && m < 10 ? `0${m}` : `${m}`;
    const formattedS = s < 10 ? `0${s}` : `${s}`;

    return h > 0
      ? `${h}:${formattedM}:${formattedS}`
      : `${formattedM}:${formattedS}`;
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.progressInterval) clearInterval(this.progressInterval);
    document.removeEventListener("click", this.onDocumentClick);
  }
}
