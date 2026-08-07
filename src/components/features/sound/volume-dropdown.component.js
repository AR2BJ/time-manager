import { SoundModel, soundState } from "@/models/sound.model.js";

import { soundService } from "@/services/sound.service.js";

export class VolumeDropdownComponent {
  constructor() {
    this.container = null;
    this.isOpen = false;
    this.unsubscribe = null;
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

  update() {
    if (!this.container) return;

    const volume = soundState?.volume ?? 50;
    const isMuted = soundState?.isMuted ?? false;

    let iconSvg = "";
    let buttonColorClass = "text-slate-400 hover:text-slate-200";

    if (isMuted || volume === 0) {
      buttonColorClass = "text-rose-500 hover:text-rose-400";
      iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>`;
    } else if (volume < 50) {
      iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>`;
    } else {
      iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>`;
    }

    this.container.innerHTML = `
      <button 
        type="button" 
        id="vol-toggle-btn"
        class="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 transition-colors duration-200 ${buttonColorClass} focus:outline-none cursor-pointer"
        title="${isMuted ? "Sound is muted" : `Volume: ${volume}%`}"
      >
        ${iconSvg}
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
            <span id="vol-percentage-text">${isMuted ? "0%" : `${volume}%`}</span>
          </div>
          
          <input 
            type="range" 
            id="vol-range-input" 
            min="0" 
            max="100" 
            value="${isMuted ? 0 : volume}" 
            class="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
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
        if (typeof SoundModel.setVolume === "function") {
          SoundModel.setVolume(val);
        }
        if (typeof soundService?.setVolume === "function") {
          soundService.setVolume(val);
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
