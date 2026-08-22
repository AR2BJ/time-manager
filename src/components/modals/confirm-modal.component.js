export const ConfirmModalComponent = {
  render({ title, message } = {}) {
    return `
      <div
        id="confirm-modal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      >
        <div
          id="confirm-modal-backdrop"
          class="absolute inset-0 cursor-pointer"
        ></div>

        <div
          class="relative w-full max-w-sm bg-surface border border-border rounded-3xl p-5 shadow-2xl flex flex-col text-center"
        >
          <div class="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 mx-auto flex items-center justify-center text-xl mb-3 shrink-0">
            <i id="confirm-modal-icon" class="fa-regular fa-triangle-exclamation"></i>
          </div>

          <h3 id="confirm-modal-title" class="text-base font-bold text-color mb-1">
            ${title || "Are you sure?"}
          </h3>

          <p id="confirm-modal-message" class="text-xs text-secondary mb-5 leading-relaxed">
            ${message || "This action cannot be undone."}
          </p>

          <div class="grid grid-cols-2 gap-2.5">
            <button
              id="btn-cancel-confirm"
              type="button"
              class="h-10 rounded-xl bg-surface-2 border border-border text-secondary hover:text-color font-semibold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-action-confirm"
              type="button"
              class="h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-xs transition cursor-pointer shadow-sm"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    `;
  },
};
