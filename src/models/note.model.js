import { StateManager, state } from "./state.model.js";

export const NoteModel = {
  getNotes() {
    return state.notes || [];
  },

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
    if (!state.notes) state.notes = [];
    state.notes.push(noteData);
    this.commit();
    return noteData;
  },

  insertAt(noteData, index) {
    if (!state.notes) state.notes = [];
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

  deleteItem(noteId) {
    return this.remove(noteId);
  },

  commit() {
    StateManager.save();
  },

  subscribe(listener) {
    return StateManager.subscribe(listener);
  },

  reset() {
    state.notes = [];
    this.commit();
  },
};
