import { NoteService } from "@/services/note.service.js";

export const NoteController = {
  init() {
    this.bindEvents();
  },

  bindEvents() {
    document.addEventListener("click", (e) => {
      const noteSlot = e.target.closest("#note-slot");
      if (!noteSlot) return;

      const addBtn = e.target.closest("#btn-submit-note");
      if (addBtn) {
        e.preventDefault();
        this.handleAddNote(noteSlot);
        return;
      }

      const deleteBtn = e.target.closest('[data-action="delete"]');
      if (deleteBtn) {
        e.preventDefault();
        const itemEl = deleteBtn.closest("[data-id]");
        if (itemEl && itemEl.dataset.id) {
          NoteService.deleteNote(itemEl.dataset.id);
        }
      }
    });

    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        const input = e.target.closest("#note-input");
        if (input) {
          e.preventDefault();
          const noteSlot = input.closest("#note-slot");
          if (noteSlot) {
            this.handleAddNote(noteSlot);
            input.focus();
          }
        }
      }
    });
  },

  handleAddNote(noteSlot) {
    const input = noteSlot.querySelector("#note-input");
    if (!input) return;

    const text = input.value.trim();
    if (text) {
      NoteService.addNote(text);
    }
  },
};
