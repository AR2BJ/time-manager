import { NoteService } from "@/services/note.service.js";

export const NoteController = {
  init() {
    this.bindEvents();
    this.bindNoteEvents();
  },

  bindEvents() {
    document.addEventListener("click", (e) => {
      const btnDelete = e.target.closest(".btn-delete-note");
      if (btnDelete) {
        e.preventDefault();
        const noteId = btnDelete.dataset.noteId;
        if (noteId) {
          NoteService.deleteNote(noteId);
        }
      }
    });
  },

  bindNoteEvents() {
    window.addEventListener("deleteNote", (e) => {
      const noteId = e.detail.id;
      if (noteId) {
        NoteService.deleteNote(noteId);
      }
    });

    window.addEventListener("submitNote", (e) => {
      const text = e.detail.text;
      this.submitNote(text);
    });
  },

  submitNote(text) {
    NoteService.addNote(text.trim());
  },
};
