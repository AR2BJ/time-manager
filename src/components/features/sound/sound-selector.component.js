import { AutocompleteComponent } from "@/components/ui/autocomplete.component";
import { SoundModel } from "@/models/sound.model.js";
import { soundService } from "@/services/sound.service.js";

export class SoundSelectorComponent {
  constructor() {
    this.container = null;
    this.autocomplete = null;
    this.unsubscribe = null;
    this.isSilentUpdating = false;
  }

  render() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    this.container = document.createElement("div");
    this.container.className = "w-full relative dir-rtl";

    this.mountAutocomplete();

    if (typeof SoundModel.subscribe === "function") {
      this.unsubscribe = SoundModel.subscribe(() => this.syncSelectedTrack());
    }

    return this.container;
  }

  mountAutocomplete() {
    const trackList = SoundModel.getTrackList() || [];
    const currentSoundId = SoundModel.getCurrentSoundId();

    const noneOption = {
      title: "None (No Sound)",
      value: "none",
      icon: "fa-solid fa-volume-xmark",
      raw: { id: "none", title: "None" },
    };

    const mappedTracks = trackList.map((track) => ({
      title: `${track.title} (${track.creator})`,
      value: track.id,
      icon:
        track.type === "youtube" ? "fa-brands fa-youtube" : "fa-solid fa-music",
      raw: track,
    }));

    const items = [noneOption, ...mappedTracks];

    this.autocomplete = new AutocompleteComponent(this.container, items, {
      label: "Background sound",
      placeholder: "Search and select sound....",
      itemTitle: "title",
      itemValue: "value",
      itemIcon: "icon",
      clearable: false,
      isRow: false,
      onChange: async (payload) => {
        if (this.isSilentUpdating) return;

        const selectedId = this.extractValue(payload);

        if (!selectedId || selectedId === "none") {
          SoundModel.setSoundTrack("none");
          await soundService.stopAll();
          return;
        }

        SoundModel.setSoundTrack(selectedId);
        const activeTrack = SoundModel.getCurrentTrack();

        if (activeTrack) {
          await soundService.fetchCoverOnly(activeTrack);

          if (SoundModel.getState().isPlaying) {
            await soundService.playTrack(activeTrack);
          }
        }
      },
    });

    this.setValueSilently(currentSoundId);
  }

  extractValue(payload) {
    if (!payload) return null;
    if (typeof payload === "string") return payload;
    if (Array.isArray(payload)) {
      const item = payload[0];
      return typeof item === "object" && item !== null
        ? item.value || item.id
        : item;
    }
    if (typeof payload === "object") return payload.value || payload.id || null;
    return null;
  }

  setValueSilently(value) {
    if (!this.autocomplete) return;
    this.isSilentUpdating = true;

    if (typeof this.autocomplete.setValue === "function") {
      this.autocomplete.setValue(value, false);
    }

    this.isSilentUpdating = false;
  }

  syncSelectedTrack() {
    if (!this.autocomplete) return;
    const currentSoundId = SoundModel.getCurrentSoundId();

    if (this.autocomplete.getValue() !== currentSoundId) {
      this.setValueSilently(currentSoundId);
    }
  }

  destroy() {
    if (typeof this.unsubscribe === "function") {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    if (this.autocomplete && typeof this.autocomplete.destroy === "function") {
      this.autocomplete.destroy();
      this.autocomplete = null;
    }
  }
}
