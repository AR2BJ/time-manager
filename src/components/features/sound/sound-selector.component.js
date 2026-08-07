import { AutocompleteComponent } from "@/components/ui/autocomplete.component";
import { SoundModel } from "@/models/sound.model.js";
import { soundService } from "@/services/sound.service.js";

export class SoundSelectorComponent {
  constructor() {
    this.container = null;
    this.autocomplete = null;
    this.unsubscribe = null;
    this.isInitialMount = true;
  }

  render() {
    this.container = document.createElement("div");
    this.container.className = "w-full relative dir-rtl";

    this.mountAutocomplete();

    if (typeof SoundModel.subscribe === "function") {
      this.unsubscribe = SoundModel.subscribe(() => this.syncSelectedTrack());
    }

    return this.container;
  }

  mountAutocomplete() {
    const trackList = SoundModel.getTrackList();
    const currentTrack = SoundModel.getCurrentTrack();

    const items = trackList.map((track) => ({
      title: `${track.title} (${track.creator})`,
      value: track.id,
      icon:
        track.type === "youtube" ? "fa-brands fa-youtube" : "fa-solid fa-music",
      raw: track,
    }));

    this.autocomplete = new AutocompleteComponent(this.container, items, {
      label: "Background sound",
      placeholder: "Search and select sound....",
      itemTitle: "title",
      itemValue: "value",
      itemIcon: "icon",
      clearable: false,
      isRow: false,
      onChange: async (val) => {
        if (!val) return;

        if (this.isInitialMount) {
          return;
        }

        const selectedId = Array.isArray(val) ? val[0] : val;

        SoundModel.setSoundTrack(selectedId);
        const updatedTrack = SoundModel.getCurrentTrack();

        if (updatedTrack) {
          await soundService.fetchCoverOnly(updatedTrack);

          if (SoundModel.getState().isPlaying) {
            await soundService.playTrack(updatedTrack);
          }
        }
      },
    });

    if (currentTrack?.id) {
      this.autocomplete.setValue(currentTrack.id);
    }

    setTimeout(() => {
      this.isInitialMount = false;
    }, 0);
  }

  syncSelectedTrack() {
    if (!this.autocomplete) return;
    const currentTrack = SoundModel.getCurrentTrack();
    if (currentTrack?.id && this.autocomplete.getValue() !== currentTrack.id) {
      this.autocomplete.setValue(currentTrack.id);
    }
  }

  destroy() {
    if (typeof this.unsubscribe === "function") {
      this.unsubscribe();
    }
    if (this.autocomplete && typeof this.autocomplete.destroy === "function") {
      this.autocomplete.destroy();
    }
  }
}
