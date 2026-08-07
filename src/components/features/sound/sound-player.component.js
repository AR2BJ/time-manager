import { SoundModel } from "@/models/sound.model.js";
import { soundService } from "@/services/sound.service.js";

export class SoundPlayerComponent {
  constructor() {
    this.container = null;
    this.unsubscribe = null;
    this.isVolumeOpen = false;
    this.progressInterval = null;
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
        class="relative w-full bg-surface-2 border border-border rounded-2xl p-3 shadow-sm flex items-center justify-between gap-3 transition-all duration-300"
      >
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <div class="relative w-14 h-14 rounded-xl overflow-hidden bg-surface-3 border border-border shrink-0 group">
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
              <i class="fa-solid fa-music text-lg"></i>
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

          <div class="flex flex-col min-w-0 gap-1">
            <h4
              id="player-track-title"
              class="text-sm font-bold text-primary truncate"
            >
              --
            </h4>
            
            <div class="flex items-center gap-2 text-xs text-secondary truncate">
              <span id="player-track-creator" class="truncate">--</span>
              <span class="inline-block w-1 h-1 rounded-full bg-border shrink-0"></span>
              
              <div class="font-mono text-[11px] text-tertiary dir-ltr flex items-center gap-1 shrink-0">
                <span id="player-current-time">0:00</span>
                <span>/</span>
                <span id="player-total-time">0:00</span>
              </div>
            </div>
          </div>
        </div>

        <div class="relative shrink-0">
          <button
            type="button"
            id="btn-volume-popover-toggle"
            class="w-9 h-9 rounded-xl bg-surface hover:bg-surface-3 border border-border text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer"
            title="Volume Control"
          >
            <span
              id="player-volume-icon-slot"
              class="pointer-events-none flex items-center justify-center"
            >
              <i class="fa-solid fa-volume-high"></i>
            </span>
          </button>

          <div
            id="volume-popover"
            class="hidden absolute left-1/2 -translate-x-1/2 bottom-12 z-30 flex-col items-center gap-2 p-3 bg-surface border border-border rounded-2xl shadow-xl animate-fade-in w-12"
          >
            <span
              id="volume-text-val"
              class="text-[10px] font-bold text-secondary"
            >50%</span>
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
              <span
                id="popover-mute-icon-slot"
                class="flex items-center justify-center"
              >
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

    if (titleEl)
      titleEl.textContent = currentTrack?.title || "No track selected";
    if (creatorEl)
      creatorEl.textContent = currentTrack?.creator || "Unknown Source";

    const coverImg = this.container.querySelector("#player-cover-image");
    const coverFallback = this.container.querySelector(
      "#player-cover-fallback",
    );

    if (currentTrack?.coverUrl) {
      if (coverImg) {
        coverImg.src = currentTrack.coverUrl;
        coverImg.onload = () => {
          coverImg.classList.remove("hidden");
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

    // Dynamic Play/Pause/Loading Icon Handler
    const playSlot = this.container.querySelector("#btn-play-icon-slot");
    if (playSlot) {
      if (isLoading) {
        playSlot.innerHTML = `
          <svg
            viewBox="0 0 16 16"
            height="48"
            width="48"
            class="windows-loading-spinner"
          >
            <circle
              r="7px"
              cy="8px"
              cx="8px"
            ></circle>
          </svg>
        `;
      } else if (isPlaying) {
        playSlot.innerHTML = `<i class="fa-solid fa-pause text-base"></i>`;
      } else {
        playSlot.innerHTML = `<i class="fa-solid fa-play ms-0.5 text-base"></i>`;
      }
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
  }

  bindEvents() {
    const playBtn = this.container.querySelector("#btn-player-play-toggle");
    playBtn?.addEventListener("click", async () => {
      const state = SoundModel.getState();
      if (state.isLoading) return; // Prevent multiple triggers while loading

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
