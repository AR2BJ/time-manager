const NOTE_STORAGE_KEY = "tm_focus_note_items";

export class NoteModel {
  static items = [];
  static listeners = new Set();

  static init() {
    try {
      const raw = localStorage.getItem(NOTE_STORAGE_KEY);
      this.items = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Failed to load notes:", e);
      this.items = [];
    }
    return this.items;
  }

  static getItems() {
    return this.items;
  }

  static addItem(text) {
    if (!text || !text.trim()) return null;

    const newItem = {
      id: crypto.randomUUID(),
      text: text.trim(),
      createdAt: Date.now(),
    };

    this.items.unshift(newItem);
    this.saveAndNotify();
    return newItem;
  }

  static deleteItem(id) {
    this.items = this.items.filter((item) => item.id !== id);
    this.saveAndNotify();
  }

  static saveAndNotify() {
    try {
      localStorage.setItem(SCRATCHPAD_STORAGE_KEY, JSON.stringify(this.items));
    } catch (e) {
      console.error("Failed to save notes:", e);
    }
    this.notify();
  }

  static subscribe(listener) {
    if (typeof listener === "function") {
      this.listeners.add(listener);
    }
    return () => this.listeners.delete(listener);
  }

  static notify() {
    this.listeners.forEach((listener) => listener(this.items));
  }
}
