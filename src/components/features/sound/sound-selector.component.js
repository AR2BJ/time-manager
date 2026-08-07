import { SoundModel, soundState } from "@/models/sound.model.js";

import { soundService } from "@/services/sound.service.js";

export class SoundSelectorComponent {
  constructor() {
    this.container = null;
    this.unsubscribe = null;
  }

  render() {
    this.container = document.createElement("div");
    this.container.className = "w-full relative dir-rtl";

    this.update();

    if (typeof SoundModel.subscribe === "function") {
      this.unsubscribe = SoundModel.subscribe(() => this.update());
    }

    return this.container;
  }

  update() {
    if (!this.container) return;

    // Defensive State Retrieval & Encapsulation API Check
    const currentTrack =
      typeof SoundModel.getCurrentTrack === "function"
        ? SoundModel.getCurrentTrack()
        : null;

    // Access trackList safely via Model API or optional chaining fallback
    const trackList =
      SoundModel.getTrackList?.() ||
      SoundModel.soundState?.trackList ||
      SoundModel.state?.trackList ||
      [];

    const currentTrackId = currentTrack?.id || "";

    this.container.innerHTML = `
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-medium text-slate-400">Select background sound</label>
        <select 
          id="sound-select-input"
          class="w-full bg-slate-800/80 border border-slate-700/70 text-slate-100 text-sm rounded-xl p-3 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
        >
          ${
            trackList.length > 0
              ? trackList
                  .map(
                    (track) => `
                <option value="${track.id}" ${track.id === currentTrackId ? "selected" : ""}>
                  ${track.title} — ${track.creator} (${track.duration}) [${track.type ? track.type.toUpperCase() : "AUDIO"}]
                </option>
              `,
                  )
                  .join("")
              : `<option value="" disabled selected>No tracks available</option>`
          }
        </select>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const selectEl = this.container.querySelector("#sound-select-input");
    if (!selectEl) return;

    selectEl.addEventListener("change", (e) => {
      const selectedId = e.target.value;
      const trackList =
        SoundModel.getTrackList?.() || SoundModel.soundState?.trackList || [];

      const track = trackList.find((t) => t.id === selectedId);

      if (track) {
        if (typeof SoundModel.setSoundTrack === "function") {
          SoundModel.setSoundTrack(selectedId);
        }

        const isPlaying = soundState.isPlaying
        if (isPlaying && soundService?.playTrack) {
          soundService.playTrack(track);
        }
      }
    });
  }

  destroy() {
    if (typeof this.unsubscribe === "function") {
      this.unsubscribe();
    }
  }
}
