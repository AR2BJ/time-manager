export const MobileNavComponent = {
  render() {
    return `
      <nav
        class="lg:hidden fixed bottom-0 left-0 right-0 z-300 flex justify-around items-center bg-surface/90 backdrop-blur-2xl border-t border-border px-6 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]"
      >
        <button
          id="mobile-timer"
          class="mobile-nav-btn flex flex-col items-center justify-center gap-2 text-secondary"
        >
          <i class="ti ti-clock text-2xl"></i>
          <span
            class="text-xs font-medium tracking-wide"
            >Timer</span
          >
        </button>

        <button
          id="mobile-analytics"
          class="mobile-nav-btn flex flex-col items-center justify-center gap-2 text-secondary"
        >
          <i class="ti ti-chart-line text-2xl"></i>
          <span
            class="text-xs font-medium tracking-wide"
            >Analytics</span
          >
        </button>

        <button
          id="mobile-settings"
          class="mobile-nav-btn flex flex-col items-center justify-center gap-2 text-secondary"
        >
          <i class="ti ti-settings text-2xl"></i>
          <span
            class="text-xs font-medium tracking-wide"
            >Settings</span
          >
        </button>
      </nav>
    `;
  },
};
