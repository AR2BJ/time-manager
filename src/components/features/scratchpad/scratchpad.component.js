import { ScratchpadModel } from "@/models/scratchpad.model.js";
import { ScratchpadService } from "@/services/scratchpad.service.js";

export class ScratchpadComponent {
  constructor() {
    this.container = null;
    this.unsubscribe = null;
  }

  render() {
    ScratchpadService.init();

    this.container = document.createElement("div");
    this.container.className =
      "bg-surface border border-border rounded-3xl p-5 shadow-xs flex flex-col gap-3";

    this.updateUI();

    if (!this.unsubscribe) {
      this.unsubscribe = ScratchpadModel.subscribe(() => this.updateUI());
    }

    this.bindEvents();
    return this.container;
  }

  updateUI() {
    if (!this.container) return;

    const items = ScratchpadModel.getItems();

    this.container.innerHTML = `
      <div
        class="flex items-center justify-between pb-2 border-b border-border"
      >
        <span
          class="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2"
        >
          <i class="fa-regular fa-lightbulb text-brand"></i>
          Focus Quick Notes
        </span>
        <span
          class="rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-secondary hover:text-primary hover:bg-surface-3"
        >
          ${items.length} items
        </span>
      </div>

      <form
        id="scratchpad-form"
        class="relative flex items-center gap-2"
      >
        <input
          type="text"
          id="scratchpad-input"
          placeholder="Catch a distraction or idea..."
          class="flex-1 bg-surface-2 border border-border/80 rounded-xl p-2.5 text-xs text-primary placeholder:text-muted/60 focus:outline-none focus:border-brand/60 transition-colors"
          autocomplete="off"
        />
        <button
          type="submit"
          class="absolute right-0 p-2.5 rounded-e-xl bg-brand/10 text-brand/80 transition hover:bg-brand/20 font-semibold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <i class="fa-regular fa-plus"></i> Add
        </button>
      </form>

      <div
        class="flex flex-col gap-1.5 max-h-52 overflow-y-auto pe-1 scrollbar-thin"
      >
        ${
          items.length === 0
            ? ` <div
                class="w-full h-full min-h-40 sm:min-h-30 lg:min-h-20 overflow-y-auto scrollbar-thumb-surface-2 scrollbar-thin bg-surface-2 rounded-2xl border border-dashed border-border p-4 text-center flex flex-col justify-center items-center"
              >
                <div class="h-full flex flex-col justify-center items-center">
                  <div class="text-2xl">
                    <i class="fa-regular fa-sticky-note text-brand/60"></i>
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
                      <span
                        class="text-xs text-primary font-normal leading-snug wrap-break-word flex-1 ps-1"
                      >
                        ${this.escapeHtml(item.text)}
                      </span>

                      <button
                        data-action="delete"
                        class="delete-btn w-6 h-6 rounded-md bg-surface-2 hover:bg-red-600/10 border border-border flex items-center justify-center hover:cursor-pointer opacity-0 group-hover:opacity-100 transition"
                      >
                        <i
                          class="fa-regular fa-trash-can text-red-500/80 text-xs"
                        ></i>
                      </button>
                    </div>
                  `,
                )
                .join("")
        }
      </div>
    `;
  }

  bindEvents() {
    this.container.addEventListener("submit", (e) => {
      if (e.target.id === "scratchpad-form") {
        e.preventDefault();
        const input = this.container.querySelector("#scratchpad-input");
        if (input && input.value.trim()) {
          ScratchpadService.addNote(input.value);
          input.value = "";
          input.focus();
        }
      }
    });

    this.container.addEventListener("click", (e) => {
      const deleteBtn = e.target.closest('[data-action="delete"]');
      const itemEl = e.target.closest("[data-id]");

      if (deleteBtn && itemEl) {
        ScratchpadService.removeNote(itemEl.dataset.id);
      }
    });
  }

  escapeHtml(str) {
    return str.replace(/[&<>"']/g, (m) => {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      }[m];
    });
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
  }
}
