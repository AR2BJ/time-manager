export const GlobalLoaderService = {
  _isInitialized: false,

  init() {
    if (this._isInitialized || document.getElementById("global-glass-overlay"))
      return;

    const overlayHTML = `
      <div
        id="global-glass-overlay"
        class="fixed inset-0 z-200 flex items-center justify-center bg-background/50 backdrop-blur-xl opacity-0 pointer-events-none transition-opacity duration-300 ease-in-out"
      >
        <div
          class="flex flex-col items-center gap-15 p-8 rounded-3xl transform scale-95 transition-transform duration-300 backdrop-blur-xl"
          id="global-loader-modal"
        >
          <div class="relative flex items-center justify-center">
            <div class="loader">
              <span class="hour"></span>
              <span class="min"></span>
              <span class="circel"></span>
            </div>
          </div>

          <div class="flex flex-col items-center gap-1 text-center">
            <h3
              class="text-base sm:text-lg font-bold text-color tracking-tight"
            >
              System Processing
            </h3>
            <p
              id="global-loader-msg"
              class="text-xs sm:text-sm text-secondary font-medium max-w-62.5"
            >
              Please wait while operations complete...
            </p>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", overlayHTML);
    this._isInitialized = true;
  },

  show(message = "Executing heavy operations...") {
    this.init();

    const overlay = document.getElementById("global-glass-overlay");
    const modal = document.getElementById("global-loader-modal");
    const msgEl = document.getElementById("global-loader-msg");

    if (msgEl) msgEl.textContent = message;

    document.body.classList.add("overflow-hidden");

    overlay.classList.remove("opacity-0", "pointer-events-none");
    overlay.classList.add("opacity-100", "pointer-events-auto");

    modal.classList.remove("scale-95");
    modal.classList.add("scale-100");
  },

  hide() {
    const overlay = document.getElementById("global-glass-overlay");
    const modal = document.getElementById("global-loader-modal");
    if (!overlay) return;

    document.body.classList.remove("overflow-hidden");

    overlay.classList.remove("opacity-100", "pointer-events-auto");
    overlay.classList.add("opacity-0", "pointer-events-none");

    modal.classList.remove("scale-100");
    modal.classList.add("scale-95");
  },
};
