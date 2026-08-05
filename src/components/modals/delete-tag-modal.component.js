export const TagDeleteModalComponent = {
  render() {
    return `
      <div
        id="tag-delete-modal"
        class="fixed inset-0 z-50 hidden items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      >
        <div class="bg-surface rounded-2xl p-6 max-w-md w-full shadow-xl flex flex-col gap-4">
          <div
            class="w-11 h-11 rounded-xl bg-red-500/10 text-red-500/80 flex items-center justify-center text-xl mx-auto shrink-0"
          >
            <i class="fa-regular fa-trash"></i>
          </div>

          <div class="text-center flex flex-col gap-1">
            <h3 class="text-lg font-bold text-primary">Delete Tag</h3>
            <p id="tag-delete-modal-msg" class="text-sm text-secondary leading-relaxed">
              Are you sure you want to delete this tag?
            </p>
          </div>

          <div class="grid grid-cols-2 gap-3 mt-2">
            <button
              id="cancel-tag-delete"
              class="px-4 py-2.5 rounded-xl bg-surface-3 hover:border-primary text-secondary hover:text-primary! font-medium text-sm transition border border-border cursor-pointer"
            >
              Cancel
            </button>

            <button
              id="confirm-tag-delete"
              class="px-4 py-2.5 rounded-xl bg-red-600/80 hover:bg-red-800/80 text-white font-medium text-sm transition shadow-sm cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    `;
  },
};
