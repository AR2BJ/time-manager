export const MobileNavComponent = {
  render() {
    return `
      <nav
        class="lg:hidden fixed bottom-0 left-0 right-0 z-300 bg-surface/90 backdrop-blur-2xl border-t border-border shadow-[0_-10px_30px_rgba(0,0,0,0.3)]"
      >
        <div 
          id="mobile-nav-scroll-container"
          class="flex items-center gap-2 xs:gap-6 overflow-x-auto xs:overflow-visible snap-x xs:snap-none snap-mandatory scrollbar-none px-4 xs:px-8 py-2.5 xs:justify-around"
          style="-webkit-overflow-scrolling: touch;"
        >
          <button
            id="mobile-timer"
            class="mobile-nav-btn snap-center shrink-0 flex flex-col items-center justify-center gap-1.5 text-secondary w-[23vw] max-w-21.25 xs:w-auto xs:max-w-none xs:flex-1 py-1"
          >
            <i class="fa-regular fa-list text-xl xs:text-2xl"></i>
            <span class="text-[10px] xs:text-xs font-medium tracking-wide whitespace-nowrap">Times</span>
          </button>

          <button
            id="mobile-analytics"
            class="mobile-nav-btn snap-center shrink-0 flex flex-col items-center justify-center gap-1.5 text-secondary w-[23vw] max-w-21.25 xs:w-auto xs:max-w-none xs:flex-1 py-1"
          >
            <i class="fa-regular fa-chart-line text-xl xs:text-2xl"></i>
            <span class="text-[10px] xs:text-xs font-medium tracking-wide whitespace-nowrap">Analytics</span>
          </button>

          <button
            id="mobile-settings"
            class="mobile-nav-btn snap-center shrink-0 flex flex-col items-center justify-center gap-1.5 text-secondary w-[23vw] max-w-21.25 xs:w-auto xs:max-w-none xs:flex-1 py-1"
          >
            <i class="fa-regular fa-gear text-xl xs:text-2xl"></i>
            <span class="text-[10px] xs:text-xs font-medium tracking-wide whitespace-nowrap">Settings</span>
          </button>
        </div>
      </nav>
    `;
  },
};
