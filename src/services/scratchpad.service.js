import { ScratchpadModel } from "@/models/scratchpad.model.js";

export const ScratchpadService = {
  init() {
    return ScratchpadModel.init();
  },

  addNote(text) {
    return ScratchpadModel.addItem(text);
  },

  removeNote(id) {
    ScratchpadModel.deleteItem(id);
  },
};
