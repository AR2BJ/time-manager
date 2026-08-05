export const CalendarView = {
  render() {
    return `
      <section
        id="calendar-view"
        class="hidden w-full min-w-0 flex-col gap-6"
      >
        <div
          class="mb-2 flex flex-wrap sm:flex-nowrap w-full justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1
              id="calendar-header-title"
              class="text-lg sm:text-xl font-bold text-primary flex items-center gap-2"
            >
            </h1>
            <p
              id="calendar-header-description"
              class="text-xs sm:text-sm text-secondary mt-1"
            >
            </p>
          </div>

          <div
            class="relative flex flex-col w-full justify-center rounded-xl border border-border bg-surface p-1 xs:flex-row sm:w-fit sm:justify-start"
            role="tablist"
            aria-label="Calendar Mode Switcher"
          >
            <div
              id="calendar-tab-indicator"
              class="absolute top-1 left-1 h-12 w-[calc(100%-8px)] rounded-lg bg-brand/80 transition-all duration-300 xs:h-[calc(100%-8px)] xs:w-20"
            ></div>

            <button
              id="btn-calendar-day"
              role="tab"
              class="relative z-10 flex-1 w-full rounded-t-xl py-2 text-sm font-medium text-secondary transition cursor-pointer text-center xs:w-20 xs:rounded-l-xl xs:rounded-tr-none"
            >
              Day
            </button>

            <button
              id="btn-calendar-month"
              role="tab"
              aria-selected="true"
              class="relative z-10 flex-1 w-full rounded-none py-2 text-sm font-medium text-(--color-btn-primary-text) transition cursor-pointer text-center xs:w-20"
            >
              Month
            </button>

            <button
              id="btn-calendar-year"
              role="tab"
              aria-selected="false"
              class="relative z-10 flex-1 w-full rounded-b-xl py-2 text-sm font-medium text-secondary transition cursor-pointer text-center xs:w-20 xs:rounded-r-xl xs:rounded-bl-none"
            >
              Year
            </button>
          </div>
        </div>

        <div
          class="flex flex-wrap items-center justify-between gap-3 bg-surface-2 border border-border/80 rounded-2xl p-3 sm:p-4 shadow-sm"
        >
          <div
            class="w-full sm:w-auto flex justify-between sm:justify-start items-center gap-1 sm:gap-1.5"
          >
            <button
              id="calendar-btn-today"
              class="px-2 py-1 xs:px-2.5 xs:py-1.5 text-[10px] xs:text-xs font-bold rounded-lg bg-brand/10 text-brand/80 border border-brand/20 hover:bg-brand/20 transition cursor-pointer"
            >
              Today
            </button>

            <h2
              id="calendar-current-label-mobile"
              class="block sm:hidden text-center text-xs xs:text-sm font-extrabold text-primary"
            ></h2>

            <div class="flex flex-row justify-center gap-1 sm:gap-1.5">
              <button
                id="calendar-btn-prev"
                class="w-6 h-6 xs:w-8 xs:h-8 rounded-md xs:rounded-lg bg-surface border border-border flex items-center justify-center text-secondary hover:text-primary transition cursor-pointer"
              >
                <i class="fa-regular fa-chevron-left text-[10px] xs:text-xs"></i>
              </button>

              <button
                id="calendar-btn-next"
                class="w-6 h-6 xs:w-8 xs:h-8 rounded-md xs:rounded-lg bg-surface border border-border flex items-center justify-center text-secondary hover:text-primary transition cursor-pointer"
              >
                <i class="fa-regular fa-chevron-right text-[10px] xs:text-xs"></i>
              </button>
            </div>
          </div>

          <h2
            id="calendar-current-label"
            class="hidden sm:block text-center text-base font-extrabold text-primary"
          ></h2>
        </div>

        <div
          id="calendar-content-container"
          class="w-full"
        ></div>
      </section>
    `;
  },
};
