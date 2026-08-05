export const MatrixView = {
  render() {
    return `
      <section
        id="matrix-view"
        class="hidden w-full min-w-0 flex-col gap-6"
      >
        <div class="mb-2 flex flex-wrap sm:flex-nowrap w-full justify-between items-start md:items-center gap-4">
          <div>
            <h1
              id="matrix-header-title"
              class="text-lg sm:text-xl font-bold text-primary flex items-center gap-2"
            >
            </h1>
            <p 
              id="matrix-header-description" 
              class="text-xs sm:text-sm text-secondary mt-1"
            >
            </p>
          </div>
        
          <div
            class="relative flex flex-col w-full justify-center rounded-xl border border-border bg-surface p-1 xs:flex-row sm:w-fit sm:justify-start"
            role="tablist"
            aria-label="Prioritization Mode Switcher"
          >
            <div
              id="matrix-tab-indicator"
              class="absolute top-1 left-1 h-12 w-[calc(100%-8px)] rounded-lg bg-brand/80 transition-all duration-300 xs:h-[calc(100%-8px)] xs:w-27"
            ></div>

            <button
              id="btn-matrix-eisenhower"
              role="tab"
              class="relative z-10 flex-1 w-full rounded-t-xl py-2 text-sm font-medium text-(--color-btn-primary-text) transition cursor-pointer text-center xs:w-27 xs:rounded-l-xl xs:rounded-tr-none"
            >
              Eisenhower
            </button>

            <button
              id="btn-matrix-abcde"
              role="tab"
              aria-selected="false"
              class="relative z-10 flex-1 w-full rounded-none py-2 text-sm font-medium text-secondary transition cursor-pointer text-center xs:w-27"
            >
              ABCDE
            </button>
          </div>
        </div>

        <div
          id="matrix-content-container"
          class="w-full"
        ></div>
      </section>
    `;
  },
};
