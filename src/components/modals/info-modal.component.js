const HELP_SHORTCUTS = [
  {
    category: "Navigation",
    items: [
      {
        label: "Go to Times View",
        icon: "fa-rectangle-history",
        keys: [["Shift"], ["T"]],
      },
      {
        label: "Go to Analytics Dashboard",
        icon: "fa-chart-mixed",
        keys: [["Shift"], ["A"]],
      },
      {
        label: "Go to Calendar View",
        icon: "fa-calendar",
        keys: [["Shift"], ["C"]],
      },
      {
        label: "Go to Matrix Priorities",
        icon: "fa-table-cells",
        keys: [["Shift"], ["M"]],
      },
      {
        label: "Go to App Settings",
        icon: "fa-sliders",
        keys: [["Shift"], ["S"]],
      },
    ],
  },
  {
    category: "Quick Actions",
    items: [
      {
        label: "Scrolling To Top",
        icon: "fa-chevron-square-up",
        keys: [["Alt"], ["B"]],
      },
      {
        label: "Collapse / Expand Time Form",
        icon: "fa-square-minus",
        keys: [["Alt"], ["C"]],
      },
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
    ],
  },
  {
    category: "Filters & Global",
    items: [
      {
        label: "Quick Search / Filter",
        icon: "fa-magnifying-glass",
        keys: [["/"]],
      },
      {
        label: "Switch Tab View (Active / Completed / Archived)",
        icon: "fa-eye",
        keys: [["Alt"], ["A", "D", "X"]],
      },
      {
        label: "Switch Chart View (Weekly / Monthly / Yearly)",
        icon: "fa-chart-line",
        keys: [["Alt"], ["1 - 3"]],
      },
      {
        label: "Switch Calendar View (Daily / Monthly / Yearly)",
        icon: "fa-calendar-days",
        keys: [["Alt"], ["1 - 3"]],
      },
      {
        label: "Switch Matrix View (Eisenhower / ABCD)",
        icon: "fa-table-cells",
        keys: [["Alt"], ["1", "2"]],
      },
      {
        label: "Quick Tags Select (Times View)",
        icon: "fa-filter",
        keys: [["0 - ∞"]],
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
    return Object.entries(HELP_SHORTCUTS)
      .map(
        ([_, group]) => `
          <div
            class="text-xs font-bold text-brand/80 uppercase tracking-wider mt-4 first:mt-0 mb-1.5 ps-1"
          >
            ${group.category}
          </div>
          ${group.items
            .map(
              (item) => `
                <div
                  class="flex items-center justify-between p-2.5 sm:p-3 bg-surface-2/60 border border-border/50 rounded-xl hover:border-border transition gap-2"
                >
                  <span
                    data-tooltip-title="${item.label}"
                    class="text-xs sm:text-sm font-semibold text-secondary block md:hidden items-center gap-2 truncate cursor-pointer"
                  >
                    <i class="fa-regular ${item.icon} text-muted"></i>
                    ${item.label}
                  </span>
                  <span
                    class="text-xs sm:text-sm font-semibold text-secondary hidden md:flex items-center gap-2"
                  >
                    <i class="fa-regular ${item.icon} text-muted"></i>
                    ${item.label}
                  </span>
                  <div class="flex items-center gap-1 shrink-0">
                    ${item.keys
                      .map(
                        (keyGroup) => `
                          <div class="flex items-center gap-0.5">
                            ${keyGroup
                              .map(
                                (key) =>
                                  `<kbd
                                    class="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-xs font-mono font-bold text-primary bg-surface border border-border shadow-2xs rounded-md"
                                    >${key}</kbd
                                  >`,
                              )
                              .join(
                                '<span class="text-[9px] font-bold text-muted/60"><i class="fa-regular fa-slash-forward"></i></span>',
                              )}
                          </div>
                        `,
                      )
                      .join(
                        '<span class="text-[9px] font-bold text-muted/60"><i class="fa-regular fa-plus"></i></span>',
                      )}
                  </div>
                </div>
              `,
            )
            .join("")}
        `,
      )
      .join("");
  },

  render() {
    return `
      <div
        id="help-modal"
        class="min-h-screen fixed inset-0 z-50 hidden items-center justify-center animate-fade-in p-3 sm:p-4 md:p-6"
      >
        <div
          id="help-modal-backdrop"
          class="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        ></div>

        <div
          class="relative w-full max-w-2xl bg-surface border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl transition-all scale-95 flex flex-col max-h-[75dvh] md:max-h-[80dvh] h-auto"
        >
          <div
            class="flex justify-between items-center mb-4 sm:mb-5 border-b border-border pb-3 sm:pb-4 shrink-0"
          >
            <div class="flex items-center gap-2.5 sm:gap-3">
              <div
                class="w-10 h-10 sm:w-11 sm:h-11 rounded-lg lg:rounded-xl bg-brand/10 text-brand/80 flex items-center justify-center text-xl sm:text-2xl shrink-0"
              >
                <i class="fa-regular fa-square-terminal"></i>
              </div>
              <div>
                <h3 class="text-sm sm:text-base font-bold text-primary">
                  Time Manager Help Center
                </h3>
                <p
                  class="text-[11px] sm:text-xs text-secondary max-w-50 sm:max-w-none"
                >
                  Time editing tips and shortcuts.
                </p>
              </div>
            </div>
            <button
              id="close-help-modal"
              class="w-8 h-8 sm:w-9 sm:h-9 rounded-lg lg:rounded-xl bg-surface-2 hover:bg-red-600/10 border border-border text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer shrink-0"
            >
              <i class="fa-regular fa-xmark text-sm sm:text-base"></i>
            </button>
          </div>

          <div
            class="flex flex-wrap sm:flex-nowrap border-b md:border-b-0 border-border/60 p-1 bg-surface-2 rounded-xl mb-4 sm:mb-5 shrink-0 gap-1.5"
          >
            <button
              id="tab-help-safeguard"
              class="w-full md:flex-1 text-center py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg bg-brand/30 text-primary border border-brand/40 transition cursor-pointer"
            >
              <i class="fa-regular fa-list-check me-1.5"></i> Time Guide
            </button>
            <button
              id="tab-help-shortcuts"
              class="w-full md:flex-1 text-center py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg text-secondary hover:text-primary transition cursor-pointer"
            >
              <i class="fa-regular fa-keyboard me-1.5"></i> Keyboard Shortcuts
            </button>
          </div>

          <div
            class="flex-1 overflow-y-auto pe-1 sm:pe-2 scroll-smooth scrollbar-thin scrollbar-thumb-surface-2 min-h-0"
            id="help-modal-content"
          >
            <div
              id="content-help-safeguard"
              class="flex flex-col gap-3 sm:gap-3.5"
            >
              <div
                class="p-3.5 sm:p-4 bg-brand/5 border border-brand/10 rounded-xl sm:rounded-2xl"
              >
                <h4
                  class="text-xs sm:text-sm font-bold text-brand/80 uppercase tracking-wide flex items-center gap-2"
                >
                  <i class="fa-regular fa-layer-group"></i> Subtasks & Progress
                </h4>
                <p
                  class="text-xs sm:text-sm text-secondary mt-1.5 leading-relaxed"
                >
                  Break complex times into actionable subtasks inside the Edit
                  Modal. Track completion progress dynamically as subtasks are
                  marked done.
                </p>
              </div>

              <div
                class="p-3.5 sm:p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl sm:rounded-2xl"
              >
                <h4
                  class="text-xs sm:text-sm font-bold text-emerald-500/80 uppercase tracking-wide flex items-center gap-2"
                >
                  <i class="fa-regular fa-tags"></i> Dynamic Tags & Combobox
                </h4>
                <p
                  class="text-xs sm:text-sm text-secondary mt-1.5 leading-relaxed"
                >
                  Organize times using tags. Press
                  <kbd
                    class="px-1.5 py-0.5 text-[10px] bg-surface border border-border rounded font-mono shadow-2xs"
                    >Enter</kbd
                  >
                  or
                  <kbd
                    class="px-1.5 py-0.5 text-[10px] bg-surface border border-border rounded font-mono shadow-2xs"
                    >,</kbd
                  >
                  to confirm a new tag, or select existing tags from the smart
                  combobox dropdown.
                </p>
              </div>

              <div
                class="p-3.5 sm:p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl sm:rounded-2xl"
              >
                <h4
                  class="text-xs sm:text-sm font-bold text-amber-500/80 uppercase tracking-wide flex items-center gap-2"
                >
                  <i class="fa-regular fa-bolt"></i> Quick Modal Actions
                </h4>
                <p
                  class="text-xs sm:text-sm text-secondary mt-1.5 leading-relaxed"
                >
                  Inside open modals, press
                  <kbd
                    class="px-1.5 py-0.5 text-[10px] bg-surface border border-border rounded font-mono shadow-2xs"
                    >Ctrl + Enter</kbd
                  >
                  to quickly execute save/delete actions, or
                  <kbd
                    class="px-1.5 py-0.5 text-[10px] bg-surface border border-border rounded font-mono shadow-2xs"
                    >Esc</kbd
                  >
                  to dismiss.
                </p>
              </div>
            </div>

            <div
              id="content-help-shortcuts"
              class="hidden space-y-2.5 sm:space-y-3 overflow-y-auto pe-1"
            >
              ${InfoModalComponent.renderShortcutsData()}
            </div>
          </div>

          <div
            class="flex justify-end mt-3 sm:mt-4 shrink-0 border-t border-border pt-3 sm:pt-4"
          >
            <button
              id="btn-close-help"
              class="w-full sm:w-auto px-6 py-2.5 text-xs sm:text-sm rounded-lg lg:rounded-xl bg-brand/80 text-white font-semibold hover:bg-brand/50 transition cursor-pointer shadow-lg shadow-brand/10"
            >
              Got it, Thanks!
            </button>
          </div>
        </div>
      </div>
    `;
  },
};
