import { NoteModel } from "@/models/note.model.js";

export const NoteComponent = {
  render() {
    const items = NoteModel.getItems();

    return `
      <div
        class="bg-surface border border-border rounded-3xl p-5 shadow-xs flex flex-col gap-3"
      >
        <div
          class="flex items-center justify-between gap-3 pb-2 border-b border-border"
        >
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <i class="ti ti-bulb text-brand shrink-0"></i>
            <span
              class="text-xs font-bold uppercase tracking-wider text-muted truncate"
            >
              Focus Quick Notes
            </span>
          </div>
          <span
            class="shrink-0 rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-secondary"
          >
            ${items.length} items
          </span>
        </div>

        <div class="relative flex items-center gap-2">
          <input
            id="note-input"
            type="text"
            placeholder="Catch a distraction or idea..."
            class="w-full bg-surface-2 border border-border/80 rounded-xl p-2.5 pe-20 text-xs text-color truncate placeholder:text-muted/60 focus:outline-none focus:border-brand/60 transition-colors"
            autocomplete="off"
          />
          <button
            id="btn-submit-note"
            class="absolute right-0 p-2.5 rounded-e-xl bg-brand/10 text-brand/80 transition hover:bg-brand/20 font-semibold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <i class="ti ti-plus pb-0.5"></i> Add
          </button>
        </div>

        <div
          class="flex flex-col gap-1.5 max-h-52 overflow-y-auto pe-1 scrollbar-thin"
        >
          ${
            items.length === 0
              ? ` <div class="w-full h-full min-h-40 sm:min-h-30 lg:min-h-20 overflow-y-auto scrollbar-thumb-surface-2 scrollbar-thin bg-surface-2 rounded-2xl border border-dashed border-border p-4 text-center flex flex-col justify-center items-center">
                  <div class="h-full flex flex-col justify-center items-center">
                    <div class="text-2xl">
                      <i class="ti ti-note text-brand/60"></i>
                    </div>
                    <p class="mt-1 text-secondary max-w-sm mx-auto text-xs">
                      No quick notes yet.
                    </p>
                  </div>
                </div>`
              : items
                  .map(
                    (item) => `
                      <div
                        data-id="${item.id}"
                        class="group flex items-center justify-between gap-2 p-2 rounded-xl bg-surface-2 border border-border/60 hover:border-border transition-all"
                      >
                        <span class="text-xs text-color font-normal leading-snug wrap-break-word flex-1 ps-1">
                          ${this.escapeHtml(item.text)}
                        </span>

                        <button
                          data-action="delete"
                          class="delete-btn w-7 h-7 rounded-md bg-surface-2 hover:bg-red-600/10 border border-border flex items-center justify-center hover:cursor-pointer lg:opacity-0 group-hover:opacity-100 transition"
                        >
                          <i class="ti ti-trash text-red-500/80 text-sm"></i>
                        </button>
                      </div>
                    `,
                  )
                  .join("")
          }
        </div>
      </div>
    `;
  },

  escapeHtml(str) {
    return (str || "").replace(/[&<>"']/g, (m) => {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      }[m];
    });
  },
};
