import { NotificationService } from "@/services/notification.service.js";
import { StateManager } from "@/models/state.model.js";
import { TimeController } from "../time.controller.js";
import { generateId } from "@/utils/helpers";

export const SettingsTagController = {
  pendingDeleteTagId: null,

  init() {
    this.renderTagsList();
    this.initTagDeleteModalEvents();
    this.bindTagEvents();
  },

  bindTagEvents() {
    // Add tag
    document
      .getElementById("sett-add-tag-btn")
      ?.addEventListener("click", () => this.handleAddTag());

    document
      .getElementById("sett-new-tag-input")
      ?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.handleAddTag();
        }
      });

    this.bindTagListActions();
  },

  renderTagsList() {
    const container = document.getElementById("sett-tags-list");
    if (!container) return;

    const tags = StateManager.getTags() || [];
    const times = StateManager.getTimes() || [];

    if (tags.length === 0) {
      container.innerHTML = `
        <div
          class="w-full h-full min-h-40 sm:min-h-30 lg:min-h-20 overflow-y-auto scrollbar-thumb-surface-2 scrollbar-thin bg-surface-2 rounded-2xl border border-dashed border-border p-4 text-center flex flex-col justify-center items-center"
        >
          <div class="h-full flex flex-col justify-center items-center">
            <div class="text-3xl">
              <i class="fa-regular fa-tags text-brand/60"></i>
            </div>
            <p class="mt-3 text-secondary max-w-sm mx-auto text-sm">
              No tags defined yet.
            </p>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = tags
      .map((tag) => {
        const usageCount = times.filter(
          (time) => Array.isArray(time.tags) && time.tags.includes(tag.id),
        ).length;

        return `
          <div
            data-tag-id="${tag.id}"
            class="flex flex-col xs:flex-row items-center justify-start xs:justify-between gap-2 p-2 rounded-xl bg-surface-2 border border-border/80 transition"
          >
            <div class="flex items-center gap-1 min-w-0 flex-1 ps-1">
              <i class="fa-regular fa-tag text-brand/80 text-sm"></i>
              <input
                type="text"
                value="${(tag.name || "").replace(/"/g, "&quot;")}"
                data-action="edit-tag-name"
                class="tag-name-input bg-transparent rounded-lg p-1 text-xs sm:text-sm font-medium text-primary outline-none border border-transparent transition w-full truncate"
                readonly
              />
            </div>
            <div class="w-full xs:w-fit flex items-center gap-1 shrink-0">
              <div
                class="min-w-0 sm:min-w-20 flex items-center gap-1 px-1.5 py-1 sm:py-1.75 rounded-md sm:rounded-lg bg-surface border border-border text-[9px] sm:text-xs font-semibold text-secondary"
                title="Used in ${usageCount} time${usageCount === 1 ? "" : "s"}"
              >
                <i class="fa-regular fa-list-check text-[9px] sm:text-xs text-brand/80"></i>
                <span>${usageCount} ${usageCount <= 1 ? "time" : "times"}</span>
              </div>
              <button
                data-action="toggle-edit"
                class="edit-btn flex h-6 w-6 sm:w-8 sm:h-8 items-center justify-center rounded-md sm:rounded-lg border border-border bg-surface hover:bg-brand/10 hover:cursor-pointer transition"
                title="Edit tag name"
              >
                <i
                  class="fa-regular fa-pen-to-square text-xs text-brand/80"
                ></i>
              </button>
              <button
                data-action="delete-tag"
                class="delete-btn flex h-6 w-6 sm:w-8 sm:h-8 items-center justify-center rounded-md sm:rounded-lg border border-border bg-surface hover:bg-red-600/10 hover:cursor-pointer transition"
              >
                <i class="fa-regular fa-trash-can text-red-500/80 text-xs"></i>
              </button>
            </div>
          </div>
        `;
      })
      .join("");
  },

  handleAddTag() {
    const input = document.getElementById("sett-new-tag-input");
    if (!input) return;

    const name = input.value.trim();
    if (!name) {
      NotificationService.show({
        type: "error",
        message: "Tag name cannot be empty.",
        duration: 5000,
      });
      return;
    }

    const currentTags = StateManager.getTags() || [];
    const exists = currentTags.some(
      (t) => t.name.toLowerCase() === name.toLowerCase(),
    );

    if (exists) {
      NotificationService.show({
        type: "error",
        message: "A tag with this name already exists.",
        duration: 5000,
      });
      return;
    }

    const newTag = {
      id: generateId(),
      name,
    };

    const updatedTags = [...currentTags, newTag];
    StateManager.save(StateManager.getTimes(), updatedTags);

    input.value = "";
    this.renderTagsList();
    TimeController.refreshUI();

    NotificationService.show({
      type: "success",
      message: `Tag "${name}" created successfully.`,
      icon: "fa-check",
      duration: 5000,
    });
  },

  bindTagListActions() {
    const container = document.getElementById("sett-tags-list");
    if (!container) return;

    container.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;

      const tagCard = btn.closest("[data-tag-id]");
      if (!tagCard) return;

      const tagId = tagCard.dataset.tagId;
      const action = btn.dataset.action;
      const nameInput = tagCard.querySelector(".tag-name-input");

      if (action === "toggle-edit") {
        const isReadonly = nameInput.hasAttribute("readonly");
        if (isReadonly) {
          nameInput.removeAttribute("readonly");
          nameInput.classList.replace("bg-transparent", "bg-surface");
          nameInput.classList.add("focus:border-brand/50", "ps-2");
          nameInput.focus();
          nameInput.select();
          btn.setAttribute("title", "Save tag name");
          btn.innerHTML = `<i class="fa-regular fa-floppy-disk text-xs text-brand/80"></i>`;
        } else {
          this.handleSaveTagEdit(tagId, nameInput.value, btn, nameInput);
        }
      } else if (action === "delete-tag") {
        this.handleDeleteTag(tagId);
      }
    });

    container.addEventListener("keydown", (e) => {
      if (
        e.ctrlKey &&
        e.key === "Enter" &&
        e.target.classList.contains("tag-name-input")
      ) {
        e.preventDefault();
        const tagCard = e.target.closest("[data-tag-id]");
        const tagId = tagCard?.dataset.tagId;
        const btn = tagCard?.querySelector('[data-action="toggle-edit"]');
        if (tagId && btn) {
          this.handleSaveTagEdit(tagId, e.target.value, btn, e.target);
        }
      }
    });
  },

  handleSaveTagEdit(tagId, newNameRaw, btn, nameInput) {
    const newName = newNameRaw.trim();
    if (!newName) {
      NotificationService.show({
        type: "error",
        message: "Tag name cannot be empty.",
        duration: 5000,
      });
      return;
    }

    const currentTags = StateManager.getTags() || [];
    const tag = currentTags.find((t) => t.id === tagId);

    if (tag) {
      tag.name = newName;
      StateManager.save(StateManager.getTimes(), currentTags);

      nameInput.setAttribute("readonly", "true");
      btn.innerHTML = `<i class="fa-regular fa-pen-to-square text-xs"></i>`;

      this.renderTagsList();
      TimeController.refreshUI();

      NotificationService.show({
        type: "success",
        message: "Tag updated successfully.",
        icon: "fa-check",
        duration: 5000,
      });
    }
  },

  initTagDeleteModalEvents() {
    const cancelBtn = document.getElementById("cancel-tag-delete");
    const confirmBtn = document.getElementById("confirm-tag-delete");

    cancelBtn?.addEventListener("click", () => this.closeTagDeleteModal());
    confirmBtn?.addEventListener("click", () => this.executeDeleteTag());

    document.addEventListener("keydown", (e) => {
      const modal = document.getElementById("tag-delete-modal");
      if (!modal || modal.classList.contains("hidden")) return;

      if (e.key === "Escape") {
        e.preventDefault();
        this.closeTagDeleteModal();
      }

      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        this.executeDeleteTag();
      }
    });
  },

  openTagDeleteModal(tagId) {
    const currentTags = StateManager.getTags() || [];
    const targetTag = currentTags.find((t) => t.id === tagId);
    if (!targetTag) return;

    const currentTimes = StateManager.getTimes() || [];
    const usageCount = currentTimes.filter(
      (time) => Array.isArray(time.tags) && time.tags.includes(tagId),
    ).length;

    this.pendingDeleteTagId = tagId;

    const modal = document.getElementById("tag-delete-modal");
    const msgEl = document.getElementById("tag-delete-modal-msg");

    if (msgEl) {
      if (usageCount > 0) {
        msgEl.innerHTML = `Are you sure you want to delete <strong class="text-primary">"<i class="fa-regular fa-tag text-sm me-1"></i>${targetTag.name}"</strong>? <br/><br/> It is currently used in <span class="text-red-500 font-semibold">${usageCount} time(s)</span>.`;
      } else {
        msgEl.innerHTML = `Are you sure you want to delete <strong class="text-primary">"<i class="fa-regular fa-tag text-sm me-1"></i>${targetTag.name}"</strong>?`;
      }
    }

    modal?.classList.replace("hidden", "flex");
    document.body.classList.add("overflow-hidden");
  },

  closeTagDeleteModal() {
    const modal = document.getElementById("tag-delete-modal");
    if (!modal) return;

    modal.classList.replace("flex", "hidden");
    document.body.classList.remove("overflow-hidden");
    this.pendingDeleteTagId = null;
  },

  handleDeleteTag(tagId) {
    this.openTagDeleteModal(tagId);
  },

  executeDeleteTag() {
    const tagId = this.pendingDeleteTagId;
    if (!tagId) return;

    const currentTags = StateManager.getTags() || [];
    const targetTag = currentTags.find((t) => t.id === tagId);

    if (!targetTag) {
      this.closeTagDeleteModal();
      return;
    }

    const updatedTags = currentTags.filter((t) => t.id !== tagId);

    const currentTimes = StateManager.getTimes() || [];
    const updatedTimes = currentTimes.map((time) => {
      if (Array.isArray(time.tags) && time.tags.includes(tagId)) {
        return {
          ...time,
          tags: time.tags.filter((id) => id !== tagId),
        };
      }
      return time;
    });

    StateManager.save(updatedTimes, updatedTags);
    this.closeTagDeleteModal();

    this.renderTagsList();
    TimeController.refreshUI();

    NotificationService.show({
      type: "error",
      message: `Tag "${targetTag.name}" deleted.`,
      icon: "fa-tag",
      duration: 5000,
      undoAction: () => {
        const restoredTags = [...updatedTags, targetTag];
        StateManager.save(currentTimes, restoredTags);
        this.renderTagsList();
        TimeController.refreshUI();

        NotificationService.show({
          type: "success",
          message: `Tag "${targetTag.name}" restored.`,
          icon: "fa-check",
          duration: 5000,
        });
      },
    });
  },
};
