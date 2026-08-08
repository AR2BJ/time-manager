import { NoteModel } from "@/models/note.model.js";

export const NoteService = {
  init() {
    return NoteModel.init();
  },

  addNote(text) {
    return NoteModel.addItem(text);
  },

  removeNote(id) {
    NoteModel.deleteItem(id);
  },
};
