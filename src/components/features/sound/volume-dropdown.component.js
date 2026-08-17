import { SoundModel, soundState } from "@/models/sound.model.js";

import { soundService } from "@/services/sound.service.js";

export class VolumeDropdownComponent {
  constructor() {
    this.container = null;
    this.isOpen = false;
    this.unsubscribe = null;
    this.VOLUME_STEP = 5;
    this.onOutsideClick = this.onOutsideClick.bind(this);
  }

  render() {
    this.container = document.createElement("div");
    this.container.className = "relative inline-block text-right dir-rtl";

    this.update();
    this.bindEvents();

    if (typeof SoundModel.subscribe === "function") {
      this.unsubscribe = SoundModel.subscribe(() => this.update());
    }

    return this.container;
  }

  updateSliderFill(inputEl, val) {
    if (!inputEl) return;
    const percentage = Math.max(0, Math.min(100, Number(val)));
    inputEl.style.background = `linear-gradient(to right, var(--color-brand, #00bba7) ${percentage}%, var(--color-surface-3, #334155) ${percentage}%)`;
  }

  update() {
    if (!this.container) return;

    const volume = soundState?.volume ?? 50;
    const isMuted = soundState?.isMuted ?? false;
    const currentVal = isMuted ? 0 : volume;

    let iconHtml = "";
    let buttonColorClass = "text-slate-400 hover:text-slate-200";

    if (isMuted || volume === 0) {
      buttonColorClass = "text-brand hover:opacity-80";
      iconHtml = `<i class="fa-solid fa-volume-xmark text-brand"></i>`;
    } else if (volume <= 33) {
      iconHtml = `<i class="fa-solid fa-volume-low"></i>`;
    } else if (volume <= 66) {
      iconHtml = `<i class="fa-solid fa-volume"></i>`;
    } else {
      iconHtml = `<i class="fa-solid fa-volume-high"></i>`;
    }

    this.container.innerHTML = `
      <button 
        type="button" 
        id="vol-toggle-btn"
        class="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 transition-colors duration-200 ${buttonColorClass} focus:outline-none cursor-pointer flex items-center justify-center min-w-9 min-h-9"
        title="${isMuted ? "Sound is muted" : `Volume: ${volume}%`}"
      >
        ${iconHtml}
      </button>

      <div 
        id="vol-dropdown-panel"
        class="absolute bottom-full left-0 mb-2 w-36 p-3 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-xl backdrop-blur-md transition-all duration-200 transform origin-bottom-left z-50 ${
          this.isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }"
      >
        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center text-xs text-slate-400 font-medium">
            <span>Volume</span>
            <span id="vol-percentage-text">${currentVal}%</span>
          </div>
          
          <input 
            type="range" 
            id="vol-range-input" 
            min="0" 
            max="100" 
            step="5"
            value="${currentVal}" 
            class="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            aria-label="Volume Slider"
          />

          <button 
            type="button" 
            id="vol-mute-btn"
            class="mt-1 text-xs py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            ${isMuted ? "Unmute" : "Mute"}
          </button>
        </div>
      </div>
    `;

    const rangeInput = this.container.querySelector("#vol-range-input");
    this.updateSliderFill(rangeInput, currentVal);
  }

  bindEvents() {
    this.container.addEventListener("click", (e) => {
      const toggleBtn = e.target.closest("#vol-toggle-btn");
      if (toggleBtn) {
        this.isOpen = !this.isOpen;
        this.update();
        return;
      }

      const muteBtn = e.target.closest("#vol-mute-btn");
      if (muteBtn) {
        if (typeof SoundModel.toggleMute === "function") {
          SoundModel.toggleMute();
        }
        if (typeof soundService?.setVolume === "function") {
          soundService.setVolume(soundState.isMuted ? 0 : soundState.volume);
        }
        return;
      }
    });

    this.container.addEventListener("input", (e) => {
      if (e.target.id === "vol-range-input") {
        const val = Number(e.target.value);
        this.updateSliderFill(e.target, val);
        if (typeof SoundModel.setVolume === "function") {
          SoundModel.setVolume(val);
        }
        if (typeof soundService?.setVolume === "function") {
          soundService.setVolume(val);
        }
      }
    });

    this.container.addEventListener("keydown", (e) => {
      if (
        e.target.id === "vol-range-input" &&
        ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"].includes(e.key)
      ) {
        e.preventDefault();
        const currentVol = soundState?.volume ?? 50;
        let targetVol = currentVol;

        if (e.key === "ArrowUp" || e.key === "ArrowRight") {
          targetVol = Math.min(100, currentVol + this.VOLUME_STEP);
        } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
          targetVol = Math.max(0, currentVol - this.VOLUME_STEP);
        }

        if (typeof SoundModel.setVolume === "function") {
          SoundModel.setVolume(targetVol);
        }
        if (typeof soundService?.setVolume === "function") {
          soundService.setVolume();
        }
      }
    });

    document.removeEventListener("click", this.onOutsideClick);
    document.addEventListener("click", this.onOutsideClick);
  }

  onOutsideClick(e) {
    if (this.isOpen && this.container && !this.container.contains(e.target)) {
      this.isOpen = false;
      this.update();
    }
  }

  destroy() {
    if (typeof this.unsubscribe === "function") {
      this.unsubscribe();
    }
    document.removeEventListener("click", this.onOutsideClick);
  }
}
