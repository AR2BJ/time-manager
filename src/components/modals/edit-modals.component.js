export const EditModalsComponent = {
  render() {
    return `
      <div
        id="edit-modal"
        class="fixed inset-0 z-50 hidden items-end lg:items-center justify-center p-0 lg:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      >
        <div
          class="bg-surface xs:rounded-t-3xl lg:rounded-2xl p-4 lg:p-6 max-w-3xl w-full h-dvh xs:h-[96.5dvh] sm:h-[95dvh] lg:h-auto lg:max-h-screen shadow-2xl flex flex-col border border-border overflow-hidden"
        >
          <div
            class="flex items-center justify-between border-b border-border pb-4 shrink-0"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-10 h-10 lg:w-11 lg:h-11 rounded-xl lg:rounded-2xl bg-brand/10 text-brand/80 flex items-center justify-center text-base lg:text-lg shrink-0"
              >
                <i class="fa-regular fa-pen-to-square"></i>
              </div>
              <div class="min-w-0">
                <h3
                  class="text-sm lg:text-base font-bold text-primary truncate"
                >
                  Edit Time Details
                </h3>
                <p
                  class="text-[11px] w-40 xs:w-auto lg:text-xs text-secondary truncate"
                >
                  Update time attributes and manage subtimes.
                </p>
              </div>
            </div>

            <button
              id="cancel-edit-modal"
              type="button"
              class="w-8 h-8 lg:w-9 lg:h-9 rounded-lg lg:rounded-xl bg-surface-2 hover:bg-red-600/10 border border-border text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer shrink-0"
            >
              <i class="fa-regular fa-xmark text-sm"></i>
            </button>
          </div>

          <div
            id="edit-accordion-group"
            class="flex-1 min-h-0 flex flex-col gap-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-surface-2 pe-1"
          >
            <div
              class="accordion-item flex flex-col rounded-2xl border border-border/60 bg-surface-2/60 overflow-hidden shrink-0 transition-all duration-300"
            >
              <button
                type="button"
                class="accordion-header w-full p-3.5 lg:p-4 border-b border-border flex items-center justify-between text-left cursor-pointer hover:bg-surface-2/80 transition"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-9 w-9 lg:h-10 lg:w-10 self-start shrink-0 items-center justify-center rounded-lg lg:rounded-xl bg-brand/10 text-brand/80"
                  >
                    <i
                      class="fa-regular fa-file-lines text-sm lg:text-base"
                    ></i>
                  </div>
                  <div>
                    <h4 class="text-xs lg:text-sm font-semibold text-primary">
                      Basic Information
                    </h4>
                    <p class="text-[10px] lg:text-xs leading-4 text-secondary">
                      Set the core time details and timeline.
                    </p>
                  </div>
                </div>
                <i
                  class="accordion-icon fa-regular fa-chevron-up text-secondary text-xs lg:text-sm transition-transform duration-200"
                ></i>
              </button>

              <div class="accordion-content p-3.5 lg:p-4">
                <div class="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
                  <div class="lg:col-span-2">
                    <label
                      for="edit-time-title"
                      class="mb-1.5 block ps-3 text-xs font-semibold text-secondary"
                    >
                      Title <span class="text-red-700">*</span>
                    </label>
                    <input
                      id="edit-time-title"
                      type="text"
                      placeholder="E.g., Implement OAuth2 authentication flow"
                      class="h-10 lg:h-11 w-full rounded-xl bg-surface border border-border px-3.5 text-xs lg:text-sm text-primary placeholder:text-secondary/70 outline-none focus:border-brand/80 transition"
                    />
                  </div>

                  <div class="lg:col-span-1">
                    <label
                      for="edit-time-duedate"
                      class="mb-1.5 block ps-3 text-xs font-semibold text-secondary"
                    >
                      Due Date
                    </label>
                    <div id="edit-datepicker-container"></div>
                  </div>
                </div>

                <div class="mt-3.5">
                  <label
                    for="edit-time-desc"
                    class="mb-1.5 block ps-3 text-xs font-semibold text-secondary"
                  >
                    Description
                  </label>
                  <textarea
                    id="edit-time-desc"
                    rows="2"
                    placeholder="Add detailed acceptance criteria or execution notes..."
                    class="w-full scrollbar-thin scrollbar-thumb-surface rounded-xl bg-surface border border-border p-3 text-xs lg:text-sm text-primary placeholder:text-secondary/70 outline-none focus:border-brand/80 transition resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <div
              class="accordion-item flex flex-col rounded-2xl border border-border/60 bg-surface-2/60 overflow-hidden shrink-0 transition-all duration-300"
            >
              <button
                type="button"
                class="accordion-header w-full p-3.5 lg:p-4 border-b border-border flex items-center justify-between text-left cursor-pointer hover:bg-surface-2/80 transition"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-9 w-9 lg:h-10 lg:w-10 shrink-0 self-start items-center justify-center rounded-lg lg:rounded-xl bg-brand/10 text-brand/80"
                  >
                    <i class="fa-regular fa-sliders text-sm lg:text-base"></i>
                  </div>
                  <div>
                    <h4 class="text-xs lg:text-sm font-semibold text-primary">
                      Priority & Organization
                    </h4>
                    <p class="text-[10px] lg:text-xs leading-4 text-secondary">
                      Adjust priority, status, and labels.
                    </p>
                  </div>
                </div>
                <i
                  class="accordion-icon fa-regular fa-chevron-down text-secondary text-xs lg:text-sm transition-transform duration-200"
                ></i>
              </button>

              <div class="accordion-content hidden p-3.5 lg:p-4">
                <div class="w-full relative">
                  <div id="edit-time-tags-container"></div>
                </div>

                <div class="grid grid-cols-1 gap-3.5 lg:grid-cols-2 mt-3.5">
                  <div class="w-full">
                    <div id="edit-priority-wrapper"></div>
                  </div>

                  <div class="w-full">
                    <div id="edit-status-wrapper"></div>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="accordion-item flex flex-col rounded-2xl border border-border/60 bg-surface-2/60 overflow-hidden shrink-0 transition-all duration-300"
            >
              <button
                type="button"
                class="accordion-header w-full p-3.5 lg:p-4 border-b border-border flex items-center justify-between text-left cursor-pointer hover:bg-surface-2/80 transition"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-9 w-9 lg:h-10 lg:w-10 shrink-0 self-start items-center justify-center rounded-lg lg:rounded-xl bg-brand/10 text-brand/80"
                  >
                    <i
                      class="fa-regular fa-list-check text-sm lg:text-base"
                    ></i>
                  </div>
                  <div>
                    <h4 class="text-xs lg:text-sm font-semibold text-primary">
                      Subtimes Management
                    </h4>
                    <p class="text-[10px] lg:text-xs leading-4 text-secondary">
                      Add and track execution steps.
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2 lg:gap-3">
                  <span
                    id="subtime-progress-badge"
                    class="text-[10px] lg:text-xs font-mono text-secondary px-2 lg:px-3 py-1 rounded-lg bg-surface border border-border shrink-0"
                  >
                    0/0 Done
                  </span>
                  <i
                    class="accordion-icon fa-regular fa-chevron-down text-secondary text-xs lg:text-sm transition-transform duration-200"
                  ></i>
                </div>
              </button>

              <div
                class="accordion-content hidden p-3.5 lg:p-4 flex-col gap-3.5"
              >
                <div
                  class="w-full flex relative items-center gap-2 rounded-xl border border-border bg-surface"
                >
                  <input
                    id="new-subtime-input"
                    type="text"
                    placeholder="Add a new subtime item..."
                    class="w-full h-10 lg:h-11 flex-1 rounded-xl bg-transparent px-3.5 pe-23 text-xs lg:text-sm text-primary placeholder:text-secondary/70 outline-none focus:border-brand/80 transition"
                  />
                  <button
                    id="add-subtime-btn"
                    type="button"
                    class="w-20 h-10 lg:h-11 absolute right-0 px-3.5 rounded-e-xl bg-brand/10 text-brand/80 transition hover:bg-brand/20 font-semibold text-xs lg:text-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <i class="fa-regular fa-plus"></i> Add
                  </button>
                </div>

                <div
                  id="edit-subtimes-list"
                  class="w-full"
                ></div>
              </div>
            </div>

            <div
              class="grid grid-cols-2 lg:hidden gap-3 pt-3 border-t border-border shrink-0 w-full bg-surface"
            >
              <button
                id="cancel-edit-mobile"
                type="button"
                class="h-10 lg:h-11 rounded-lg lg:rounded-xl bg-surface-2 hover:border-primary text-secondary hover:text-primary font-medium text-xs lg:text-sm transition border border-border cursor-pointer flex items-center justify-center"
              >
                Cancel
              </button>

              <button
                id="confirm-edit-mobile"
                type="button"
                class="h-10 lg:h-11 rounded-lg lg:rounded-xl bg-brand/80 hover:bg-brand text-white font-medium text-xs lg:text-sm transition shadow-md shadow-brand/10 cursor-pointer flex items-center justify-center gap-2"
              >
                <i class="fa-regular fa-check"></i> Save Changes
              </button>
            </div>
          </div>

          <div
            class="lg:grid grid-cols-2 hidden gap-3 pt-3 border-t border-border shrink-0 w-full bg-surface"
          >
            <button
              id="cancel-edit"
              type="button"
              class="h-10 lg:h-11 rounded-lg lg:rounded-xl bg-surface-2 hover:border-primary text-secondary hover:text-primary font-medium text-xs lg:text-sm transition border border-border cursor-pointer flex items-center justify-center"
            >
              Cancel
            </button>

            <button
              id="confirm-edit"
              type="button"
              class="h-10 lg:h-11 rounded-lg lg:rounded-xl bg-brand/80 hover:bg-brand text-white font-medium text-xs lg:text-sm transition shadow-md shadow-brand/10 cursor-pointer flex items-center justify-center gap-2"
            >
              <i class="fa-regular fa-check"></i> Save Changes
            </button>
          </div>
        </div>
      </div>
    `;
  },
};
