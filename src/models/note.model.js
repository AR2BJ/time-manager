import { StateManager, state } from "./state.model.js";

export const NoteModel = {
  getNotes() {
    return state.notes || [];
  },

  // Legacy Alias for getNotes
  getItems() {
    return this.getNotes();
  },

  getById(noteId) {
    const targetIdStr = String(noteId);
    return (
      (state.notes || []).find((n) => String(n.id) === targetIdStr) || null
    );
  },

  setItems(items = []) {
    state.notes = Array.isArray(items) ? [...items] : [];
    this.commit();
  },

  insert(noteData) {
    if (!state.notes) {
      state.notes = [];
    }
    state.notes.push(noteData);
    this.commit();
    return noteData;
  },

  insertAt(noteData, index) {
    if (!state.notes) {
      state.notes = [];
    }
    state.notes.splice(index, 0, noteData);
    this.commit();
  },

  remove(noteId) {
    const targetIdStr = String(noteId);
    const index = (state.notes || []).findIndex(
      (n) => String(n.id) === targetIdStr,
    );
    if (index === -1) return null;

    const [deletedNote] = state.notes.splice(index, 1);
    this.commit();
    return { deletedNote, index };
  },

  // Legacy Alias for remove
  deleteItem(noteId) {
    return this.remove(noteId);
  },

  // ==========================================
  // STATE SYNC & BACKWARD COMPATIBILITY API
  // ==========================================
  commit() {
    StateManager.save();
    StateManager.notify();
  },

  saveAndNotify() {
    this.commit();
  },

  notify() {
    StateManager.notify();
  },

  subscribe(listener) {
    return StateManager.subscribe(listener);
  },

  reset() {
    state.notes = [];
    this.commit();
  },
};
