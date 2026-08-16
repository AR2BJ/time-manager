export const MobileNavComponent = {
  render() {
    return `
      <nav
        class="lg:hidden fixed bottom-0 left-0 right-0 z-300 flex justify-around items-center bg-surface/90 backdrop-blur-2xl border-t border-border px-6 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]"
      >
        <button
          id="mobile-timer"
          class="mobile-nav-btn snap-center shrink-0 flex flex-col items-center justify-center gap-1.5 text-secondary w-[23vw] max-w-21.25 xs:w-auto xs:max-w-none xs:flex-1 py-1"
        >
          <i class="fa-regular fa-clock text-xl xs:text-2xl"></i>
          <span
            class="text-[10px] xs:text-xs font-medium tracking-wide whitespace-nowrap"
            >Timer</span
          >
        </button>

        <button
          id="mobile-analytics"
          class="mobile-nav-btn snap-center shrink-0 flex flex-col items-center justify-center gap-1.5 text-secondary w-[23vw] max-w-21.25 xs:w-auto xs:max-w-none xs:flex-1 py-1"
        >
          <i class="fa-regular fa-chart-line text-xl xs:text-2xl"></i>
          <span
            class="text-[10px] xs:text-xs font-medium tracking-wide whitespace-nowrap"
            >Analytics</span
          >
        </button>

        <button
          id="mobile-settings"
          class="mobile-nav-btn snap-center shrink-0 flex flex-col items-center justify-center gap-1.5 text-secondary w-[23vw] max-w-21.25 xs:w-auto xs:max-w-none xs:flex-1 py-1"
        >
          <i class="fa-regular fa-gear text-xl xs:text-2xl"></i>
          <span
            class="text-[10px] xs:text-xs font-medium tracking-wide whitespace-nowrap"
            >Settings</span
          >
        </button>
      </nav>
    `;
  },
};
