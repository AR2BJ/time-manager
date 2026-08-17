import { NoteService } from "@/services/note.service.js";

export const NoteController = {
  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Form submission for adding a new note
    const noteForm = document.getElementById("form-add-note");
    if (noteForm) {
      noteForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("input-note-text");
        if (!input || !input.value.trim()) return;

        const createdNote = NoteService.addNote(input.value.trim());
        if (createdNote) {
          input.value = "";
        }
      });
    }

    // Event delegation for deleting notes
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
};
