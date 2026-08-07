import { AutocompleteComponent } from "@/components/ui/autocomplete.component";
import { SoundModel } from "@/models/sound.model.js";
import { soundService } from "@/services/sound.service.js";

export class SoundSelectorComponent {
  constructor() {
    this.container = null;
    this.autocomplete = null;
    this.unsubscribe = null;
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
    const trackList =
      SoundModel.getTrackList?.() || SoundModel.soundState?.trackList || [];
    const currentTrack = SoundModel.getCurrentTrack();

    const items = trackList.map((track) => ({
      title: `${track.title} (${track.creator})`,
      value: track.id,
      icon:
        track.type === "youtube" ? "fa-brands fa-youtube" : "fa-solid fa-music",
      raw: track,
    }));

    this.autocomplete = new AutocompleteComponent(this.container, items, {
      label: "انتخاب صوت پس‌زمینه",
      placeholder: "جستجو و انتخاب صوت...",
      itemTitle: "title",
      itemValue: "value",
      itemIcon: "icon",
      clearable: false,
      isRow: false,
      onChange: (val) => {
        if (!val) return;
        const selectedId = Array.isArray(val) ? val[0] : val;

        SoundModel.setSoundTrack(selectedId);
        const updatedTrack = SoundModel.getCurrentTrack();

        if (SoundModel.soundState?.isPlaying) {
          soundService.playTrack(updatedTrack);
        }
      },
    });

    if (currentTrack?.id) {
      this.autocomplete.setValue(currentTrack.id);
    }
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
