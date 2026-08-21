import { generateId, todayISO } from "@/utils/helpers.js";

import { NoteModel } from "@/models/note.model.js";
import { NotificationService } from "@/services/notification.service.js";

export const NoteService = {
  getNotes() {
    return NoteModel.getNotes();
  },

  addNote(text) {
    if (!text || !text.trim()) {
      NotificationService.show({
        type: "warning",
        message: "Please write something before adding a note",
        icon: "fa-pencil",
        iconColor: "text-amber-500",
        duration: 3000,
      });
      return null;
    }

    const allNotes = this.getNotes();
    const isDuplicate = allNotes.some(
      (n) => n.text.trim().toLowerCase() === text.trim().toLowerCase(),
    );
    if (isDuplicate) {
      NotificationService.show({
        type: "error",
        message: "A note with this text already exists",
        icon: "fa-triangle-exclamation",
        iconColor: "text-red-500/80",
        duration: 4000,
      });
      return null;
    }

    const newNote = {
      id: generateId(),
      text: text.trim(),
      createdAt: todayISO(),
    };

    const createdNote = NoteModel.insert(newNote);

    if (createdNote) {
      NotificationService.show({
        type: "success",
        message: "Note added successfully",
        icon: "fa-sticky-note",
        iconColor: "text-emerald-500",
      });
      window.dispatchEvent(new CustomEvent("notesChanged"));
    }

    return createdNote;
  },

  deleteNote(noteId) {
    const result = NoteModel.remove(noteId);
    if (!result) return null;

    const { deletedNote, index } = result;

    NotificationService.show({
      type: "error",
      message: `Note "${deletedNote.text}" removed`,
      undoAction: () => {
        this.restoreNote(deletedNote, index);
      },
    });

    window.dispatchEvent(new CustomEvent("notesChanged"));

    return result;
  },

  restoreNote(note, index) {
    if (!note) return;
    NoteModel.insertAt(note, index);
    window.dispatchEvent(new CustomEvent("notesChanged"));
  },

  restoreNotes(notes) {
    if (!Array.isArray(notes)) return;
    NoteModel.setItems(notes);
    window.dispatchEvent(new CustomEvent("notesChanged"));
  },
};
