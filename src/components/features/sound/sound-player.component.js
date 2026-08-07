import { SoundModel, soundState } from "@/models/sound.model.js";

import { VolumeDropdownComponent } from "./volume-dropdown.component.js";
import { soundService } from "@/services/sound.service.js";

export class SoundPlayerComponent {
  constructor() {
    this.container = null;
    this.volumeDropdown = new VolumeDropdownComponent();
    this.unsubscribe = null;
  }

  render() {
    this.container = document.createElement("div");
    this.container.className =
      "w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-sm";

    this.update();
    this.bindEvents();

    this.unsubscribe = SoundModel.subscribe(() => this.update());
    return this.container;
  }

  update() {
    if (!this.container) return;

    const track = SoundModel.getCurrentTrack();
    const { isPlaying } = soundState;

    this.container.innerHTML = `
      <div class="flex items-center justify-between gap-4 dir-rtl">
        <div class="flex items-center gap-3 min-w-0">
          <button 
            type="button"
            id="sound-play-toggle-btn"
            class="shrink-0 w-11 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20 transition-all duration-200 active:scale-95"
            title="${isPlaying ? "Stop" : "Play"}"
          >
            ${
              isPlaying
                ? `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`
                : `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`
            }
          </button>

          <div class="flex flex-col min-w-0 text-right">
            <span class="text-sm font-semibold text-slate-100 truncate">
              ${track.title}
            </span>
            <div class="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span class="truncate">${track.creator}</span>
              <span>•</span>
              <span class="px-1.5 py-0.5 rounded bg-slate-700/60 text-[10px] text-slate-300 font-mono">
                ${track.duration}
              </span>
              <span class="px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 text-[10px] uppercase tracking-wider font-semibold">
                ${track.type}
              </span>
            </div>
          </div>
        </div>

        <div id="volume-dropdown-slot" class="shrink-0"></div>
      </div>
    `;

    const slot = this.container.querySelector("#volume-dropdown-slot");
    if (slot) {
      slot.appendChild(this.volumeDropdown.render());
    }
  }

  bindEvents() {
    this.container.addEventListener("click", (e) => {
      const playBtn = e.target.closest("#sound-play-toggle-btn");
      if (playBtn) {
        const { isPlaying } = soundState;
        if (isPlaying) {
          soundService.pause();
        } else {
          soundService.playTrack(SoundModel.getCurrentTrack());
        }
      }
    });
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.volumeDropdown) this.volumeDropdown.destroy();
  }
}
