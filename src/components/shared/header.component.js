export const HeaderComponent = {
  render() {
    return `
      <header class="mb-8 flex flex-row gap-4 sm:mb-12 justify-between">
        <div class="flex min-w-0 items-center gap-3">
          <button
            id="menu-toggle"
            class="hidden h-10 w-10 flex-row items-center justify-center rounded-xl border border-border bg-surface text-primary transition cursor-pointer hover:bg-slate-600/10 lg:flex shadow-sm"
          >
            <i class="fa-regular fa-bars"></i>
          </button>

          <div
            class="w-10 h-10 lg:hidden flex flex-row justify-center items-center"
          >
            <a href="/">
              <img
                id="logo"
                src="/picture/logo.png"
                class="logo h-full justify-center shadow-brand/10"
                title="Time Manager"
                alt="Time Manager Logo"
              />
            </a>
          </div>

          <h1
            class="truncate block xs:hidden text-xl font-bold tracking-tight text-primary sm:text-2xl lg:text-3xl cursor-pointer"
            data-tooltip-title="Time Manager"
          >
            Time Manager
          </h1>
          <h1
            class="truncate hidden xs:block text-xl font-bold tracking-tight text-primary sm:text-2xl lg:text-3xl"
          >
            Time Manager
          </h1>
        </div>

        <div class="flex items-center justify-end gap-2 sm:justify-center">
          <button
            id="help-toggle"
            class="flex h-9 w-9 flex-row items-center justify-center rounded-xl border border-border bg-surface text-brand/80 transition cursor-pointer hover:bg-brand/10 sm:h-10 sm:w-10 shadow-sm"
            title="App Guide & Shortcuts (?)"
          >
            <i class="fa-regular fa-circle-question text-lg"></i>
          </button>

          <button
            id="theme-toggle"
            class="flex h-9 w-9 flex-row items-center justify-center rounded-xl border border-border bg-surface text-primary transition cursor-pointer hover:bg-yellow-600/10 sm:h-10 sm:w-10 shadow-sm"
            title="Theme Toggle"
          >
            <i class="fa-regular fa-sun text-yellow-500/80"></i>
          </button>
        </div>
      </header>
    `;
  },
};
