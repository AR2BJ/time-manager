import { NoteModel } from "@/models/note.model.js";
import { NoteService } from "@/services/note.service.js";

export class NoteComponent {
  constructor() {
    this.container = null;
    this.unsubscribe = null;
  }

  render() {
    this.container = document.createElement("div");
    this.container.className =
      "bg-surface border border-border rounded-3xl p-5 shadow-xs flex flex-col gap-3";

    this.updateUI();

    this.bindEvents();
    this.bindExternalUpdates();

    return this.container;
  }

  updateUI() {
    if (!this.container) return;

    const items = NoteModel.getItems();

    const inputEl = this.container?.querySelector("#note-input");
    const currentFocus = document.activeElement === inputEl;
    const currentValue = inputEl ? inputEl.value : "";

    this.container.innerHTML = `
      <div
        class="flex items-center justify-between gap-3 pb-2 border-b border-border"
      >
        <div 
          class="flex items-center gap-2 min-w-0 flex-1 cursor-pointer sm:pointer-events-none sm:cursor-default"
          data-tooltip-title="Focus Quick Notes"
        >
          <i class="fa-regular fa-lightbulb text-brand shrink-0"></i>
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

      <form
        id="note-form"
        class="relative flex items-center gap-2"
      >
        <input
          type="text"
          id="note-input"
          placeholder="Catch a distraction or idea..."
          class="w-full bg-surface-2 border border-border/80 rounded-xl p-2.5 pe-20 text-xs text-primary truncate placeholder:text-muted/60 focus:outline-none focus:border-brand/60 transition-colors"
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
                        class="delete-btn w-6 h-6 rounded-md bg-surface-2 hover:bg-red-600/10 border border-border flex items-center justify-center hover:cursor-pointer lg:opacity-0 group-hover:opacity-100 transition"
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

    const newInput = this.container?.querySelector("#note-input");
    if (newInput && currentFocus) {
      newInput.value = currentValue;
      newInput.focus();
    }
  }

  bindEvents() {
    this.container.addEventListener("submit", (e) => {
      if (e.target.id === "note-form") {
        e.preventDefault();
        const input = this.container.querySelector("#note-input");
        if (input && input.value.trim()) {
          NoteService.addNote(input.value);
          input.value = "";
          this.updateUI();
        }
      }
    });

    this.container.addEventListener("click", (e) => {
      const deleteBtn = e.target.closest('[data-action="delete"]');
      const itemEl = e.target.closest("[data-id]");

      if (deleteBtn && itemEl) {
        NoteService.deleteNote(itemEl.dataset.id);
        this.updateUI();
      }
    });
  }

  bindExternalUpdates() {
    window.addEventListener("notesChanged", () => {
      this.updateUI();
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
