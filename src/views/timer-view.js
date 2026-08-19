import { NoteComponent } from "@/components/features/note/note.component";
import { SoundModel } from "@/models/sound.model.js";
import { SoundPlayerComponent } from "@/components/features/sound/sound-player.component.js";
import { SoundSelectorComponent } from "@/components/features/sound/sound-selector.component.js";
import { StateManager } from "@/models/state.model.js";
import { TimerDisplayComponent } from "@/components/features/timer/timer-display.component";

export class TimerView {
  constructor() {
    this.container = null;
    this.timerDisplay = new TimerDisplayComponent();
    this.soundPlayer = new SoundPlayerComponent();
    this.soundSelector = new SoundSelectorComponent();
    this.note = new NoteComponent();
    this.unsubscribeSound = null;
  }

  render() {
    this.container = document.getElementById("timer-view-container");
    if (!this.container) return;

    this.mountLayout();

    if (!this.unsubscribeSound) {
      this.unsubscribeSound = SoundModel.subscribe(() => {
        this.updateSoundPlayerVisibility();
      });
    }

    return this.container;
  }

  mountLayout() {
    this.container.innerHTML = `
      <section
        id="timer-view"
        class="hidden w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in"
      >
        <div class="w-full grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div class="lg:col-span-4 flex flex-col gap-6">
            <div id="active-task-container"></div>
            <div id="note-slot"></div>
          </div>

          <div id="timer-display-slot"></div>

          <div class="lg:col-span-4 flex flex-col gap-6">
            <div
              class="bg-surface border border-border rounded-3xl p-5 shadow-xs flex flex-col justify-between gap-4"
            >
              <div
                class="flex items-center justify-between pb-3 border-b border-border"
              >
                <span
                  class="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2"
                >
                  <i class="fa-regular fa-headphones text-brand"></i>
                  Soundscape Player
                </span>
              </div>

              <div id="sound-selector-slot"></div>
              <div id="sound-player-slot"></div>
            </div>
            <div id="today-overview-container"></div>
          </div>
        </div>
      </section>
    `;

    const timerSlot = this.container.querySelector("#timer-display-slot");
    if (timerSlot) {
      timerSlot.replaceWith(this.timerDisplay.render());
    }

    const selectorSlot = this.container.querySelector("#sound-selector-slot");
    if (selectorSlot) {
      selectorSlot.appendChild(this.soundSelector.render());
    }

    const noteSlot = this.container.querySelector("#note-slot");
    if (noteSlot) {
      noteSlot.appendChild(this.note.render());
    }

    const playerSlot = this.container.querySelector("#sound-player-slot");
    if (playerSlot) {
      playerSlot.appendChild(this.soundPlayer.render());
    }

    this.updateSoundPlayerVisibility();
    this.bindEvents();
  }

  updateSoundPlayerVisibility() {
    const playerSlot = this.container?.querySelector("#sound-player-slot");
    if (!playerSlot) return;

    const currentSoundId =
      typeof SoundModel.getCurrentSoundId === "function"
        ? SoundModel.getCurrentSoundId()
        : SoundModel.getState().currentSoundId;

    if (!currentSoundId || currentSoundId === "none") {
      playerSlot.classList.add("hidden");
    } else {
      playerSlot.classList.remove("hidden");
    }
  }

  bindEvents() {
    this.container.addEventListener("click", (e) => {
      const modeBtn = e.target.closest("[data-mode]");
      if (modeBtn) {
        const mode = modeBtn.dataset.mode;
        StateManager.setMode(mode);
        return;
      }
    });
  }

  destroy() {
    if (this.unsubscribeSound) this.unsubscribeSound();
    if (this.soundPlayer) this.soundPlayer.destroy();
    if (this.soundSelector) this.soundSelector.destroy();
  }
}
