export const defaultTrackList = [
  {
    id: "rain-stream",
    title: "صدای باران و جنگل",
    creator: "Ambient Sound",
    duration: "پیوسته",
    type: "audio",
    sourceId:
      "https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=rain-and-thunder-113217.mp3",
  },
  {
    id: "brown-noise",
    title: "نویز قهوه‌ای (Brown Noise)",
    creator: "Focus Audio",
    duration: "پیوسته",
    type: "audio",
    sourceId:
      "https://cdn.pixabay.com/download/audio/2021/08/09/audio_a405ef7d22.mp3?filename=relaxing-mountains-rivers-streams-running-water-18178.mp3",
  },
  {
    id: "aparat-relaxing-rain",
    title: "صدای باران و طبیعت (آپارات)",
    creator: "Relax channel",
    duration: "۲ ساعت",
    type: "aparat",
    sourceId: "v83x9n0",
  },
];

export const soundState = {
  isPlaying: false,
  isMuted: false,
  currentSoundId: "rain-forest",
  volume: 50,
  previousVolume: 50,
  trackList: [...defaultTrackList],
};

const listeners = new Set();

export const SoundModel = {
  init(savedSettings = {}) {
    if (savedSettings.lastSelectedSoundId) {
      soundState.currentSoundId = savedSettings.lastSelectedSoundId;
    }
    if (typeof savedSettings.volume === "number") {
      soundState.volume = savedSettings.volume;
      soundState.previousVolume = savedSettings.volume;
    }
    if (typeof savedSettings.isMuted === "boolean") {
      soundState.isMuted = savedSettings.isMuted;
    }
    return soundState;
  },

  subscribe(listener) {
    if (typeof listener === "function") {
      listeners.add(listener);
    }
    return () => listeners.delete(listener);
  },

  notify() {
    listeners.forEach((listener) => listener(soundState));
  },

  getCurrentTrack() {
    return (
      soundState.trackList.find((t) => t.id === soundState.currentSoundId) ||
      soundState.trackList[0]
    );
  },

  setPlaying(isPlaying) {
    soundState.isPlaying = isPlaying;
    this.notify();
  },

  setSoundTrack(soundId) {
    soundState.currentSoundId = soundId;
    this.notify();
  },

  setVolume(volume) {
    const numericVol = Math.max(0, Math.min(100, Number(volume)));
    soundState.volume = numericVol;
    if (numericVol > 0) {
      soundState.isMuted = false;
      soundState.previousVolume = numericVol;
    } else {
      soundState.isMuted = true;
    }
    this.notify();
  },

  toggleMute() {
    if (soundState.isMuted) {
      soundState.isMuted = false;
      soundState.volume = soundState.previousVolume || 50;
    } else {
      soundState.previousVolume = soundState.volume;
      soundState.isMuted = true;
      soundState.volume = 0;
    }
    this.notify();
  },
};
