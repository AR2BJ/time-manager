import { generateId, todayISO } from "@/utils/helpers.js";

import { NoteModel } from "@/models/note.model.js";
import { NotificationService } from "@/services/notification.service.js";

export const NoteService = {
  getNotes() {
    return NoteModel.getNotes();
  },

  addNote(text) {
    if (!text || !text.trim()) return null;

    const newNote = {
      id: generateId(),
      text: text.trim(),
      createdAt: todayISO(),
    };

    const createdNote = NoteModel.insert(newNote);

    if (createdNote) {
      NotificationService.show({
        type: "success",
        message: "Note added successfully.",
        icon: "fa-sticky-note",
        iconColor: "text-emerald-500",
      });
    }

    return createdNote;
  },

  deleteNote(noteId) {
    const result = NoteModel.remove(noteId);
    if (!result) return null;

    const { deletedNote, index } = result;

    NotificationService.show({
      type: "error",
      message: `Note "${deletedNote.text}" removed.`,
      undoAction: () => {
        this.restoreNote(deletedNote, index);
      },
    });

    return result;
  },

  restoreNote(note, index) {
    if (!note) return;
    NoteModel.insertAt(note, index);
  },
};
