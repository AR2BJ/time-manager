export const HeaderComponent = {
  render() {
    return `
      <header class="mb-8 flex flex-row gap-4 sm:mb-12 justify-between">
        <div
          class="flex flex-col xs:flex-row items-start xs:items-center gap-1 xs:gap-3 min-w-0 max-w-[70%]"
        >
          <div class="flex items-center gap-3">
            <button
              id="menu-toggle"
              class="hidden h-10 w-10 flex-row items-center justify-center rounded-xl border border-border bg-surface text-color transition cursor-pointer hover:bg-slate-600/10 lg:flex shadow-sm"
            >
              <i class="ti ti-menu-4 text-lg lg:text-xl"></i>
            </button>

            <div
              class="w-10 h-10 lg:hidden flex flex-row justify-center items-center shrink-0"
            >
              <a
                href="/"
                class="w-10 h-10 flex flex-row justify-center items-center"
              >
                <img
                  id="logo"
                  src="/picture/logo.png"
                  class="logo w-10 h-10 justify-center shadow-brand/10"
                  title="Time Manager"
                  alt="Time Manager Logo"
                />
              </a>
            </div>

            <h1
              class="truncate block xs:hidden text-xl font-black tracking-tight text-color sm:text-2xl lg:text-3xl cursor-pointer"
              data-tooltip-title="Time Manager"
            >
              Time Manager
            </h1>
            <h1
              class="truncate hidden xs:block text-xl font-black tracking-tight text-color sm:text-2xl lg:text-3xl"
            >
              Time Manager
            </h1>
          </div>
        </div>

        <div class="hidden lg:flex flex-1 lg:pe-32 items-center justify-center">
          <div
            id="header-clock"
            class="flex items-center gap-3 px-6 py-1 font-bold text-secondary tracking-wide"
          >
            <span
              id="header-current-time"
              class="tabular-nums"
            ></span>
          </div>
        </div>

        <div
          class="flex items-center justify-end gap-2 sm:justify-center shrink-0"
        >
          <button
            id="help-toggle"
            class="flex h-9 w-9 flex-row items-center justify-center rounded-xl border border-border bg-surface text-brand/80 transition cursor-pointer hover:bg-brand/10 sm:h-10 sm:w-10 shadow-sm"
            title="App Guide & Shortcuts (?)"
          >
            <i class="ti ti-help text-lg lg:text-xl"></i>
          </button>

          <button
            id="theme-toggle"
            class="flex h-9 w-9 flex-row items-center justify-center rounded-xl border border-border bg-surface text-color transition cursor-pointer hover:bg-yellow-600/10 sm:h-10 sm:w-10 shadow-sm overflow-hidden group"
            title="Theme Toggle"
          >
            <i
              id="btn-sun"
              class="ti ti-sun text-yellow-500/80 text-lg lg:text-xl transition-transform duration-300 ease-in-out"
            ></i>
          </button>
        </div>
      </header>
    `;
  },
};
