const HELP_SHORTCUTS = [
  {
    category: "Timer & Modes",
    items: [
      {
        label: "Switch to Pomodoro Mode",
        icon: "fa-stopwatch",
        keys: [["Alt"], ["P"]],
      },
      {
        label: "Switch to Flow Mode",
        icon: "fa-water",
        keys: [["Alt"], ["F"]],
      },
      {
        label: "Start / Pause Timer",
        icon: "fa-play-pause",
        keys: [["Space"]],
      },
    ],
  },
  {
    category: "Navigation",
    items: [
      {
        label: "Go to Timer View",
        icon: "fa-clock",
        keys: [["Shift"], ["T"]],
      },
      {
        label: "Go to Analytics View",
        icon: "fa-chart-line",
        keys: [["Shift"], ["A"]],
      },
      {
        label: "Go to Setting View",
        icon: "fa-cog",
        keys: [["Shift"], ["S"]],
      },
    ],
  },
  {
    category: "Quick Actions",
    items: [
      {
        label: "Toggle Dark/Light Theme",
        icon: "fa-circle-half-stroke",
        keys: [["Alt"], ["T"]],
      },
      {
        label: "Toggle Navigation Menu",
        icon: "fa-bars",
        keys: [["Alt"], ["N"]],
      },
      {
        label: "Open Reset Data Modal",
        icon: "fa-arrow-rotate-left",
        keys: [["Alt"], ["R"]],
      },
      {
        label: "Close Active Modal / Blur Input",
        icon: "fa-xmark",
        keys: [["Esc"]],
      },
      {
        label: "Toggle This Help Center",
        icon: "fa-circle-question",
        keys: [["?"]],
      },
    ],
  },
];

export const InfoModalComponent = {
  renderShortcutsData() {
    return HELP_SHORTCUTS.map(
      (group) => `
        <div class="text-[11px] font-bold text-brand uppercase tracking-wider mt-4 first:mt-0 mb-2 ps-1">
          ${group.category}
        </div>
        <div class="space-y-2">
          ${group.items
            .map(
              (item) => `
                <div class="flex items-center justify-between p-2.5 bg-surface-2 border border-border rounded-xl">
                  <span class="text-xs font-semibold text-secondary flex items-center gap-2">
                    <i class="fa-regular ${item.icon} text-muted"></i>
                    ${item.label}
                  </span>
                  <div class="flex items-center gap-1 shrink-0">
                    ${item.keys
                      .map(
                        (keyGroup) => `
                          <div class="flex items-center gap-1">
                            ${keyGroup
                              .map(
                                (key) =>
                                  `<kbd class="px-2 py-0.5 text-[10px] font-mono font-bold text-primary bg-surface border border-border rounded-md shadow-2xs">${key}</kbd>`,
                              )
                              .join("")}
                          </div>
                        `,
                      )
                      .join('<span class="text-[10px] text-muted">+</span>')}
                  </div>
                </div>
              `,
            )
            .join("")}
        </div>
      `,
    ).join("");
  },

  render() {
    return `
      <div
        id="help-modal"
        class="fixed inset-0 z-50 hidden items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      >
        <div
          id="help-modal-backdrop"
          class="absolute inset-0 cursor-pointer"
        ></div>

        <div
          class="relative w-full max-w-xl bg-surface border border-border rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85dvh] overflow-hidden"
        >
          <div class="flex justify-between items-center mb-4 pb-3 border-b border-border shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center text-lg shrink-0">
                <i class="fa-regular fa-circle-question"></i>
              </div>
              <div>
                <h3 class="text-base font-bold text-primary">Time Manager Guide</h3>
                <p class="text-xs text-secondary">Shortcuts and workflow overview.</p>
              </div>
            </div>
            <button
              id="close-help-modal"
              type="button"
              class="w-8 h-8 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer"
            >
              <i class="fa-regular fa-xmark text-sm"></i>
            </button>
          </div>

          <div class="flex border-b border-border p-1 bg-surface-2 rounded-xl mb-4 shrink-0 gap-1.5">
            <button
              id="tab-help-safeguard"
              class="flex-1 py-2 text-xs font-bold rounded-lg bg-brand text-white transition cursor-pointer"
            >
              <i class="fa-regular fa-compass me-1.5"></i> Workflow Guide
            </button>
            <button
              id="tab-help-shortcuts"
              class="flex-1 py-2 text-xs font-bold rounded-lg text-secondary hover:text-primary transition cursor-pointer"
            >
              <i class="fa-regular fa-keyboard me-1.5"></i> Shortcuts
            </button>
          </div>

          <div class="flex-1 overflow-y-auto pe-1 scrollbar-thin scrollbar-thumb-surface-2" id="help-modal-content">
            <div id="content-help-safeguard" class="space-y-3">
              <div class="p-4 bg-surface-2 border border-border rounded-2xl">
                <h4 class="text-xs font-bold text-brand uppercase tracking-wider flex items-center gap-2 mb-1.5">
                  <i class="fa-regular fa-stopwatch"></i> Pomodoro Technique
                </h4>
                <p class="text-xs text-secondary leading-relaxed">
                  Focus on tasks in scheduled intervals (default 25m) followed by short breaks to maintain peak mental productivity.
                </p>
              </div>

              <div class="p-4 bg-surface-2 border border-border rounded-2xl">
                <h4 class="text-xs font-bold text-brand uppercase tracking-wider flex items-center gap-2 mb-1.5">
                  <i class="fa-regular fa-water"></i> Flow Mode
                </h4>
                <p class="text-xs text-secondary leading-relaxed">
                  Work uninterrupted without strict countdown timers. Ideal for deep work continuous productivity sessions.
                </p>
              </div>
            </div>

            <div id="content-help-shortcuts" class="hidden">
              ${InfoModalComponent.renderShortcutsData()}
            </div>
          </div>

          <div class="flex justify-end mt-4 pt-3 border-t border-border shrink-0">
            <button
              id="btn-close-help"
              type="button"
              class="w-full sm:w-auto px-5 py-2 text-xs font-bold rounded-xl bg-brand text-white hover:bg-(--color-brand-hover) transition cursor-pointer"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      </div>
    `;
  },
};
