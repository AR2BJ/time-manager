// src/components/features/sound/sound-selector.component.js
import { SoundModel } from "../../../models/sound.model.js";
import { soundService } from "../../../services/sound.service.js";

export class SoundSelectorComponent {
  constructor() {
    this.container = null;
    this.unsubscribe = null;
  }

  render() {
    this.container = document.createElement("div");
    this.container.className = "w-full relative dir-rtl";

    this.update();
    this.unsubscribe = SoundModel.subscribe(() => this.update());
    return this.container;
  }

  update() {
    if (!this.container) return;

    const currentTrack = SoundModel.getCurrentTrack();
    const trackList = SoundModel.soundState.trackList;

    this.container.innerHTML = `
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-medium text-slate-400">Select background sound</label>
        <select 
          id="sound-select-input"
          class="w-full bg-slate-800/80 border border-slate-700/70 text-slate-100 text-sm rounded-xl p-3 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
        >
          ${trackList
            .map(
              (track) => `
            <option value="${track.id}" ${track.id === currentTrack.id ? "selected" : ""}>
              ${track.title} — ${track.creator} (${track.duration}) [${track.type.toUpperCase()}]
            </option>
          `,
            )
            .join("")}
        </select>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const selectEl = this.container.querySelector("#sound-select-input");
    if (selectEl) {
      selectEl.addEventListener("change", (e) => {
        const selectedId = e.target.value;
        const track = SoundModel.soundState.trackList.find(
          (t) => t.id === selectedId,
        );

        if (track) {
          SoundModel.setSoundTrack(selectedId);
          if (SoundModel.soundState.isPlaying) {
            soundService.playTrack(track);
          }
        }
      });
    }
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
  }
}
