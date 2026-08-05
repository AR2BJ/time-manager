export const SettingsResetComponent = {
  render() {
    return `
      <div
        id="settings-reset-modal"
        class="fixed inset-0 z-50 hidden items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      >
        <div
          class="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-xl flex flex-col gap-4"
        >
          <div
            class="w-11 h-11 rounded-xl bg-red-500/10 text-red-500/80 flex items-center justify-center text-xl mx-auto"
          >
            <i class="fa-regular fa-triangle-exclamation"></i>
          </div>

          <div class="text-center flex flex-col gap-1">
            <h3 class="text-lg font-bold text-primary">
              Are you absolutely sure?
            </h3>
            <p class="text-sm text-secondary">
              This operations cannot be undone. All your progress will vanish
              instantly.
            </p>
          </div>
          
          <div class="grid grid-cols-2 gap-3 mt-2">
            <button
              id="cancel-settings-reset"
              class="px-4 py-2.5 rounded-xl bg-surface-3 hover:border-primary  text-secondary hover:text-primary! font-medium text-sm transition border border-border cursor-pointer"
            >
              Cancel
            </button>
            
            <button
              id="confirm-settings-reset"
              class="px-4 py-2.5 rounded-xl bg-red-600/80 hover:bg-red-800/80 text-white font-medium text-sm transition shadow-sm cursor-pointer"
            >
              Yes, Wipe Out
            </button>
          </div>
        </div>
      </div>
    `;
  },
};
