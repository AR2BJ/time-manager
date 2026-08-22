import { NoteModel } from "@/models/note.model.js";

export class NoteComponent {
  constructor() {
    this.container = null;
    this.unsubscribe = null;
    this.shouldResetInput = false;
  }

  render() {
    this.container = document.createElement("div");
    this.container.className =
      "bg-surface border border-border rounded-3xl p-5 shadow-xs flex flex-col gap-3";

    this.updateUI();
    this.bindExternalUpdates();
    this.bindEvents();

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
          class="flex items-center gap-2 min-w-0 flex-1"
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
          <i class="fa-regular fa-plus"></i> Add
        </button>
      </div>

      <div class="flex flex-col gap-1.5 max-h-52 overflow-y-auto pe-1 scrollbar-thin">
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
                        class="text-xs text-color font-normal leading-snug wrap-break-word flex-1 ps-1"
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
      if (this.shouldResetInput) {
        newInput.value = "";
        this.shouldResetInput = false;
      } else {
        newInput.value = currentValue;
      }
      newInput.focus();
    }
  }

  bindExternalUpdates() {
    window.addEventListener("notesChanged", () => {
      this.updateUI();
    });
  }

  bindEvents() {
    this.container.addEventListener("click", (e) => {
      const deleteBtn = e.target.closest('[data-action="delete"]');
      const itemEl = e.target.closest("[data-id]");

      if (deleteBtn && itemEl) {
        window.dispatchEvent(
          new CustomEvent("deleteNote", { detail: { id: itemEl.dataset.id } }),
        );
        return;
      }

      const addBtn = e.target.closest("#btn-submit-note");
      if (addBtn) {
        e.preventDefault();
        e.stopPropagation();

        const input = this.container.querySelector("#note-input");
        if (input) {
          this.shouldResetInput = true;
          window.dispatchEvent(
            new CustomEvent("submitNote", { detail: { text: input.value } }),
          );
        }
      }
    });

    this.container.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        const input = this.container.querySelector("#note-input");
        if (document.activeElement === input) {
          e.preventDefault();
          e.stopPropagation();

          const addBtn = this.container.querySelector("#btn-submit-note");
          if (addBtn) {
            this.shouldResetInput = true;
            addBtn.click();
          }
        }
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
