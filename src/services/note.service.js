import { NoteModel } from "@/models/note.model.js";
import { NotificationService } from "@/services/notification.service.js";

export const NoteService = {
  init() {
    return NoteModel.init();
  },

  addNote(text) {
    const newNote = NoteModel.addItem(text);
    if (newNote) {
      NotificationService.show({
        type: "success",
        message: "Note added.",
        icon: "fa-sticky-note",
        iconColor: "text-emerald-500",
      });
    }
    return newNote;
  },

  removeNote(id) {
    const targetNote = NoteModel.getItems().find((n) => n.id === id);
    if (!targetNote) return;

    NoteModel.deleteItem(id);

    NotificationService.show({
      type: "warning",
      message: "Note removed.",
      icon: "fa-trash-can",
      iconColor: "text-amber-500",
      duration: 5000,
      undoAction: () => {
        NoteModel.addItem(targetNote.text);
      },
    });
  },
};
