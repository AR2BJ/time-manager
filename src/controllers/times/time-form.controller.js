import {
  generateId,
  mapTagIdsToObjects,
  processTagPipeline,
  todayISO,
} from "@/utils/helpers";

import { AutocompleteComponent } from "@/components/ui/autocomplete.component";
import { ComboboxComponent } from "@/components/ui/combobox.component";
import { DatePickerComponent } from "@/components/ui/date-picker.component";
import { GlobalLoaderService } from "@/services/loader.service";
import { NotificationService } from "@/services/notification.service.js";
import { StateManager } from "@/models/state.model.js";
import { TimeService } from "@/services/time.service.js";

let pendingDeleteId = null;
let pendingEditId = null;

// Combobox instances
let createTimeCombobox = null;
let editTimeCombobox = null;

// DatePicker instances
let createDatePicker = null;
let editDatePicker = null;

// Autocomplete instances (Create Form)
let createPriorityAutocomplete = null;
let createStatusAutocomplete = null;

// Autocomplete instances (Edit Form)
let editPriorityAutocomplete = null;
let editStatusAutocomplete = null;

let currentModalSubtimes = [];

const PRIORITY_OPTIONS = [
  {
    title: "Low Priority",
    value: "low",
    icon: "fa-solid fa-flag text-lime-400",
  },
  {
    title: "Medium Priority",
    value: "medium",
    icon: "fa-solid fa-flag text-amber-400",
  },
  {
    title: "High Priority",
    value: "high",
    icon: "fa-solid fa-flag text-red-400",
  },
];

const STATUS_OPTIONS = [
  {
    title: "To Do",
    value: "todo",
    icon: "fa-regular fa-square text-sky-400",
  },
  {
    title: "In Progress",
    value: "in_progress",
    icon: "fa-regular fa-arrow-progress text-orange-400",
  },
  {
    title: "Done",
    value: "done",
    icon: "fa-regular fa-square-check text-emerald-400",
  },
  {
    title: "Blocked",
    value: "blocked",
    icon: "fa-regular fa-ban text-pink-400",
  },
];

export function setPendingDeleteId(id) {
  pendingDeleteId = id;
}

export function setPendingEditId(id) {
  pendingEditId = id;
  if (id) {
    TimeFormController.populateEditModal(id);
  }
}

export const TimeFormController = {
  init(mainController) {
    this.mainController = mainController;

    const existingGlobalTags = StateManager.getTags() || [];

    const createTagsContainer = document.getElementById("time-tags-container");
    if (createTagsContainer) {
      createTimeCombobox = new ComboboxComponent(
        createTagsContainer,
        existingGlobalTags,
        {
          label: "Tags",
          placeholder: "Type and select tags...",
          iconClass: "fa-regular fa-tag text-brand/80",
          itemTitle: "name",
          itemValue: "id",
          multiple: true,
          chips: true,
        },
      );
    }

    this.setupDatePicker("create");
    this.setupCreateAutocompletes();
    this.bindFormEvents();
    this.bindSubtimeEvents();
    this.bindAccordionEvents();
  },

  refreshUI() {
    if (createTimeCombobox) {
      const updatedGlobalTags = StateManager.getTags() || [];
      createTimeCombobox.setItems(updatedGlobalTags);
      editTimeCombobox?.setItems(updatedGlobalTags);
    }
  },

  setupCreateAutocompletes() {
    const priorityWrapper = document.getElementById("create-priority-wrapper");
    const statusWrapper = document.getElementById("create-status-wrapper");

    if (priorityWrapper) {
      createPriorityAutocomplete = new AutocompleteComponent(
        priorityWrapper,
        PRIORITY_OPTIONS,
        {
          label: "Priority Level",
          placeholder: "Select Priority...",
          itemTitle: "title",
          itemValue: "value",
          itemIcon: "icon",
        },
      );

      createPriorityAutocomplete.setValue("low");
    }

    if (statusWrapper) {
      createStatusAutocomplete = new AutocompleteComponent(
        statusWrapper,
        STATUS_OPTIONS,
        {
          label: "Time Status",
          placeholder: "Select Status...",
          itemTitle: "title",
          itemValue: "value",
          itemIcon: "icon",
        },
      );
      // Set default value
      createStatusAutocomplete.setValue("todo");
    }
  },

  populateEditModal(timeId) {
    if (editTimeCombobox) {
      editTimeCombobox.destroy();
      editTimeCombobox = null;
    }
    if (editPriorityAutocomplete) {
      editPriorityAutocomplete.destroy();
      editPriorityAutocomplete = null;
    }
    if (editStatusAutocomplete) {
      editStatusAutocomplete.destroy();
      editStatusAutocomplete = null;
    }

    this.resetAccordionToFirstItem();

    const times = StateManager.getTimes();
    const time = times.find((t) => t.id === timeId);

    if (!time) return;

    const titleInput = document.getElementById("edit-time-title");
    const descInput = document.getElementById("edit-time-desc");

    if (titleInput) titleInput.value = time.title || "";
    if (descInput) descInput.value = time.description || "";

    const priorityWrapper = document.getElementById("edit-priority-wrapper");
    const statusWrapper = document.getElementById("edit-status-wrapper");

    if (priorityWrapper) {
      editPriorityAutocomplete = new AutocompleteComponent(
        priorityWrapper,
        PRIORITY_OPTIONS,
        {
          label: "Priority Level",
          placeholder: "Select Priority...",
          itemTitle: "title",
          itemValue: "value",
          itemIcon: "icon",
        },
      );
      if (time.priority) {
        editPriorityAutocomplete.setValue(time.priority);
      }
    }

    if (statusWrapper) {
      editStatusAutocomplete = new AutocompleteComponent(
        statusWrapper,
        STATUS_OPTIONS,
        {
          label: "Time Status",
          placeholder: "Select Status...",
          itemTitle: "title",
          itemValue: "value",
          itemIcon: "icon",
        },
      );
      if (time.status) {
        editStatusAutocomplete.setValue(time.status);
      }
    }

    const globalTags = StateManager.getTags() || [];

    const editTagsContainer = document.getElementById(
      "edit-time-tags-container",
    );
    if (editTagsContainer) {
      editTimeCombobox = new ComboboxComponent(editTagsContainer, globalTags, {
        label: "Tags",
        placeholder: "Type and select tags...",
        iconClass: "fa-regular fa-tag text-brand/80",
        itemTitle: "name",
        itemValue: "id",
        multiple: true,
        chips: true,
      });

      if (Array.isArray(time.tags)) {
        const selectedTagObjects = mapTagIdsToObjects(time.tags, globalTags);
        selectedTagObjects.forEach((tagObj) => {
          editTimeCombobox.selectItem(tagObj);
        });
      }
    }

    this.setupDatePicker("edit", time.dueDate || "");

    currentModalSubtimes = (
      time.subtimes ? JSON.parse(JSON.stringify(time.subtimes)) : []
    ).map((subtime) => ({
      ...subtime,
      isEditing: false,
    }));
    this.renderModalSubtimes();
  },

  renderModalSubtimes() {
    const container = document.getElementById("edit-subtimes-list");
    const badge = document.getElementById("subtime-progress-badge");

    if (!container) return;

    const total = currentModalSubtimes.length;
    const completedCount = currentModalSubtimes.filter(
      (s) => s.completed,
    ).length;

    if (badge) {
      badge.textContent = `${completedCount}/${total} Done`;
    }

    if (total === 0) {
      container.innerHTML = `
        <div
          class="w-full h-full min-h-55 sm:min-h-50 lg:min-h-45 overflow-y-auto scrollbar-thumb-surface-2 scrollbar-thin bg-surface rounded-2xl border border-dashed border-border/70 p-4 text-center flex flex-col justify-center items-center"
        >
          <div class="h-full flex flex-col justify-center items-center">
            <div class="text-3xl">
              <i class="fa-regular fa-list-check text-brand/80"></i>
            </div>
            <p class="mt-3 text-secondary max-w-sm mx-auto text-sm">
              No subtimes defined yet.
            </p>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div
        class="w-full h-full max-h-55 sm:max-h-50 lg:max-h-48 overflow-y-auto scrollbar-thumb-surface-2 scrollbar-thin bg-surface rounded-2xl border border-border/60 p-2.5 flex flex-col justify-start gap-2.5"
      >
        ${currentModalSubtimes
          .map(
            (subtime) => `
              <div
                data-subtime-id="${subtime.id}"
                class="subtime-item flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-surface-2 p-1 shadow-sm transition"
              >
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <input
                    type="text"
                    data-action="edit-text"
                    data-tooltip-title="${subtime.title}"
                    value="${(subtime.title ?? "").replace(/"/g, "&quot;")}"
                    class="subtime-title-input flex sm:hidden truncate text-sm text-primary mx-3 bg-transparent outline-none w-full border-b min-h-7 py-1 cursor-pointer ${
                      subtime.isEditing
                        ? "border-brand/50"
                        : "border-transparent"
                    } ${subtime.completed ? "line-through text-muted" : ""}"
                    ${subtime.isEditing ? "" : "readonly"}
                  />
                  <input
                    type="text"
                    data-action="edit-text"
                    value="${(subtime.title ?? "").replace(/"/g, "&quot;")}"
                    class="subtime-title-input hidden sm:flex text-sm text-primary mx-3 bg-transparent outline-none w-full border-b min-h-7 py-1 ${
                      subtime.isEditing
                        ? "border-brand/50"
                        : "border-transparent"
                    } ${subtime.completed ? "line-through text-muted" : ""}"
                    ${subtime.isEditing ? "" : "readonly"}
                  />
                </div>

                <div class="flex items-center gap-1 shrink-0">
                  <button
                    data-action="edit"
                    class="edit-btn flex h-8 w-8 sm:w-10 sm:h-10 items-center justify-center rounded-lg sm:rounded-xl border border-border bg-surface hover:bg-brand/10 hover:cursor-pointer transition"
                    title="${
                      subtime.isEditing ? "Save changes" : "Edit subtime"
                    }"
                  >
                    <i
                      class="fa-regular ${
                        subtime.isEditing
                          ? "fa-floppy-disk"
                          : "fa-pen-to-square"
                      } text-blue-500/80 text-base"
                    ></i>
                  </button>

                  <button
                    data-action="delete"
                    class="delete-btn flex h-8 w-8 sm:w-10 sm:h-10 items-center justify-center rounded-lg sm:rounded-xl border border-border bg-surface hover:bg-red-600/10 hover:cursor-pointer transition"
                  >
                    <i
                      class="fa-regular fa-trash-can text-red-500/80 text-base"
                    ></i>
                  </button>
                </div>
              </div>
            `,
          )
          .join("")}
      </div>
    `;
  },

  bindSubtimeEvents() {
    const addSubtimeBtn = document.getElementById("add-subtime-btn");
    const newSubtimeInput = document.getElementById("new-subtime-input");
    const container = document.getElementById("edit-subtimes-list");

    const handleAddSubtime = () => {
      if (!newSubtimeInput) return;
      const title = newSubtimeInput.value.trim();
      if (!title) return;

      currentModalSubtimes.push({
        id: generateId(),
        title,
        completed: false,
      });

      newSubtimeInput.value = "";
      this.renderModalSubtimes();
    };

    addSubtimeBtn?.addEventListener("click", handleAddSubtime);
    newSubtimeInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddSubtime();
      }
    });

    container?.addEventListener("click", (e) => {
      const target = e.target.closest("[data-action]");
      if (!target) return;

      const subtimeCard = target.closest("[data-subtime-id]");
      if (!subtimeCard) return;

      const subtimeId = subtimeCard.dataset.subtimeId;
      const action = target.dataset.action;

      if (action === "delete") {
        const index = currentModalSubtimes.findIndex((s) => s.id === subtimeId);
        if (index === -1) return;

        const removedSubtime = currentModalSubtimes[index];

        currentModalSubtimes.splice(index, 1);
        this.renderModalSubtimes();

        NotificationService.show({
          type: "error",
          message: `Subtime "${removedSubtime.title}" deleted`,
          duration: 5000,
          undoAction: () => {
            GlobalLoaderService.show("Re-instating deleted record...");
            setTimeout(() => {
              try {
                currentModalSubtimes.splice(index, 0, removedSubtime);
                this.renderModalSubtimes();
              } finally {
                GlobalLoaderService.hide();
              }
            }, 30);
          },
        });
      } else if (action === "edit") {
        const subtime = currentModalSubtimes.find((s) => s.id === subtimeId);
        if (subtime) {
          subtime.isEditing = !subtime.isEditing;
          this.renderModalSubtimes();

          if (subtime.isEditing) {
            requestAnimationFrame(() => {
              const input = container?.querySelector(
                `[data-subtime-id="${subtimeId}"] .subtime-title-input`,
              );
              input?.focus();
              input?.select();
            });
          }
        }
      } else if (action === "toggle") {
        const subtime = currentModalSubtimes.find((s) => s.id === subtimeId);
        if (subtime) {
          subtime.completed = !subtime.completed;
          this.renderModalSubtimes();
        }
      }
    });

    container?.addEventListener("input", (e) => {
      if (e.target.dataset.action === "edit-text") {
        const subtimeCard = e.target.closest("[data-subtime-id]");
        if (!subtimeCard) return;

        const subtimeId = subtimeCard.dataset.subtimeId;
        const subtime = currentModalSubtimes.find((s) => s.id === subtimeId);
        if (subtime) {
          subtime.title = e.target.value;
        }
      }
    });
  },

  bindFormEvents() {
    const titleInput = document.getElementById("time-title-input");
    const descInput = document.getElementById("time-desc-input");
    const addBtn = document.getElementById("add-time-btn");

    const handleAddTime = () => {
      const title = titleInput?.value.trim();
      const description = descInput?.value.trim() || "";

      const priority = createPriorityAutocomplete
        ? createPriorityAutocomplete.getValue()
        : "low";
      const status = createStatusAutocomplete
        ? createStatusAutocomplete.getValue()
        : "todo";
      const dueDate = createDatePicker ? createDatePicker.value : null;

      const rawComboboxItems = createTimeCombobox
        ? createTimeCombobox.getSelectedItems()
        : [];
      const currentGlobalTags = StateManager.getTags() || [];

      const { assignedTagIds, updatedGlobalTags } = processTagPipeline(
        rawComboboxItems,
        currentGlobalTags,
      );

      if (!title) {
        NotificationService.show({
          type: "error",
          message: "Time title cannot be empty.",
          icon: "fa-triangle-exclamation",
          duration: 5000,
        });
        return;
      }

      GlobalLoaderService.show(`Creating time "${title}"...`);

      setTimeout(() => {
        try {
          const currentTimes = StateManager.getTimes();

          const newTimePayload = {
            id: generateId(),
            title,
            description,
            dueDate,
            priority,
            status,
            tags: assignedTagIds,
            subtimes: [],
            archived: false,
            createdAt: todayISO(),
          };

          const updatedTimes = TimeService
            ? TimeService.createTime(currentTimes, newTimePayload)
            : [newTimePayload, ...currentTimes];

          StateManager.save(updatedTimes, updatedGlobalTags);

          if (titleInput) titleInput.value = "";
          if (descInput) descInput.value = "";

          createPriorityAutocomplete?.setValue("low");
          createStatusAutocomplete?.setValue("todo");
          createTimeCombobox?.clear();
          createDatePicker?.reset();

          this.mainController.refreshUI();

          NotificationService.show({
            type: "success",
            message: `Time "${title}" created successfully!`,
            icon: "fa-check",
            duration: 5000,
          });
        } catch (error) {
          NotificationService.show({
            type: "error",
            message: error.message || "Failed to create time",
            icon: "fa-triangle-exclamation",
            duration: 5000,
          });
        } finally {
          GlobalLoaderService.hide();
        }
      }, 30);
    };

    addBtn?.addEventListener("click", handleAddTime);

    titleInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleAddTime();
      }
    });

    document.addEventListener("keydown", (e) => {
      const deleteModal = document.getElementById("delete-modal");
      const editModal = document.getElementById("edit-modal");

      const deleteOpen =
        deleteModal && !deleteModal.classList.contains("hidden");
      const editOpen = editModal && !editModal.classList.contains("hidden");

      if (!deleteOpen && !editOpen) return;

      if (e.key === "Escape") {
        if (deleteOpen) this.mainController.toggleModal("delete-modal", false);
        if (editOpen) this.mainController.toggleModal("edit-modal", false);
      }

      if (e.key === "Enter" && e.ctrlKey) {
        if (deleteOpen) this.executeDelete();
        if (editOpen) this.executeEdit();
      }
    });

    const addClick = (id, cb) =>
      document.getElementById(id)?.addEventListener("click", cb);

    // Modal Delete Actions
    addClick("confirm-delete-btn", () => this.executeDelete());
    addClick("confirm-delete", () => this.executeDelete());
    addClick("cancel-delete-btn", () =>
      this.mainController.toggleModal("delete-modal", false),
    );
    addClick("cancel-delete", () =>
      this.mainController.toggleModal("delete-modal", false),
    );

    // Modal Edit Actions
    addClick("confirm-edit", () => this.executeEdit());
    addClick("cancel-edit", () =>
      this.mainController.toggleModal("edit-modal", false),
    );

    // Modal Mobile Edit Actions
    addClick("confirm-edit-mobile", () => this.executeEdit());
    addClick("cancel-edit-mobile", () =>
      this.mainController.toggleModal("edit-modal", false),
    );
    addClick("cancel-edit-modal", () =>
      this.mainController.toggleModal("edit-modal", false),
    );
  },

  bindAccordionEvents() {
    const accordionGroup = document.getElementById("edit-accordion-group");
    if (!accordionGroup) return;

    accordionGroup.addEventListener("click", (e) => {
      const header = e.target.closest(".accordion-header");
      if (!header) return;

      const currentItem = header.closest(".accordion-item");
      const currentContent = currentItem.querySelector(".accordion-content");

      if (!currentContent.classList.contains("hidden")) return;

      const allItems = accordionGroup.querySelectorAll(".accordion-item");
      const currentIndex = Array.from(allItems).indexOf(currentItem);

      allItems.forEach((item, index) => {
        const content = item.querySelector(".accordion-content");
        const icon = item.querySelector(".accordion-icon");
        const itemHeader = item.querySelector(".accordion-header");

        if (index === currentIndex) {
          content.classList.remove("hidden");

          if (index === 2) {
            content.classList.add("flex");
          } else {
            content.classList.remove("flex");
          }
        } else {
          content.classList.add("hidden");
          content.classList.remove("flex");
        }

        itemHeader?.classList.toggle("border-b", index === currentIndex);
        icon?.classList.toggle("fa-chevron-up", index === currentIndex);
        icon?.classList.toggle("fa-chevron-down", index !== currentIndex);
      });
    });
  },

  resetAccordionToFirstItem() {
    const accordionGroup = document.getElementById("edit-accordion-group");
    if (!accordionGroup) return;

    const items = accordionGroup.querySelectorAll(".accordion-item");
    items.forEach((item, index) => {
      const header = item.querySelector(".accordion-header");
      const content = item.querySelector(".accordion-content");
      const icon = item.querySelector(".accordion-icon");

      if (index === 0) {
        content.classList.remove("hidden");
        header.classList.add("border-b");
        if (icon) {
          icon.classList.remove("fa-chevron-down");
          icon.classList.add("fa-chevron-up");
        }
      } else {
        content.classList.add("hidden");
        header.classList.remove("border-b");
        if (icon) {
          icon.classList.remove("fa-chevron-up");
          icon.classList.add("fa-chevron-down");
        }
      }
    });
  },

  executeDelete() {
    const id = pendingDeleteId;
    if (!id) return;

    const currentTimes = StateManager.getTimes();
    const timeToDelete = currentTimes.find((h) => h.id === id);

    if (timeToDelete) {
      const capturedTime = { ...timeToDelete };

      GlobalLoaderService.show(
        `Purging "${capturedTime.title}" from database layers...`,
      );

      setTimeout(() => {
        try {
          const updated = TimeService.deleteTime(currentTimes, id);
          StateManager.save(updated);
          this.mainController.toggleModal("delete-modal", false);
          pendingDeleteId = null;
          this.mainController.refreshUI();

          NotificationService.show({
            type: "error",
            message: `Deleted "${capturedTime.title}"`,
            duration: 5000,
            undoAction: () => {
              GlobalLoaderService.show("Re-instating deleted record...");
              setTimeout(() => {
                try {
                  const latestTimes = StateManager.getTimes();
                  StateManager.save([capturedTime, ...latestTimes]);
                  this.mainController.refreshUI();
                } finally {
                  GlobalLoaderService.hide();
                }
              }, 30);
            },
          });
        } finally {
          GlobalLoaderService.hide();
        }
      }, 30);
    }
  },

  executeEdit() {
    const titleInput = document.getElementById("edit-time-title");
    const descInput = document.getElementById("edit-time-desc");

    if (!pendingEditId || !titleInput) return;

    const newTitle = titleInput.value.trim();
    if (!newTitle) {
      NotificationService.show({
        type: "error",
        message: "Time title cannot be empty.",
        icon: "fa-triangle-exclamation",
        duration: 5000,
      });
      return;
    }

    const updatedDueDate = editDatePicker ? editDatePicker.value : null;
    const updatedPriority = editPriorityAutocomplete
      ? editPriorityAutocomplete.getValue()
      : "low";
    const updatedStatus = editStatusAutocomplete
      ? editStatusAutocomplete.getValue()
      : "todo";

    const rawComboboxItems = editTimeCombobox
      ? editTimeCombobox.getSelectedItems()
      : [];
    const currentGlobalTags = StateManager.getTags() || [];

    const { assignedTagIds, updatedGlobalTags } = processTagPipeline(
      rawComboboxItems,
      currentGlobalTags,
    );

    GlobalLoaderService.show("Updating time record...");

    setTimeout(() => {
      try {
        const currentTimes = StateManager.getTimes();

        const updatedTimeData = {
          title: newTitle,
          description: descInput?.value.trim() || "",
          dueDate: updatedDueDate,
          priority: updatedPriority,
          status: updatedStatus,
          tags: assignedTagIds,
          subtimes: currentModalSubtimes,
        };

        const updated = TimeService.editTime
          ? TimeService.editTime(currentTimes, pendingEditId, updatedTimeData)
          : currentTimes.map((time) =>
              time.id === pendingEditId
                ? { ...time, ...updatedTimeData }
                : time,
            );

        StateManager.save(updated, updatedGlobalTags);
        this.mainController.toggleModal("edit-modal", false);

        // Clean up instances
        if (editTimeCombobox) {
          editTimeCombobox.destroy();
          editTimeCombobox = null;
        }
        if (editPriorityAutocomplete) {
          editPriorityAutocomplete.destroy();
          editPriorityAutocomplete = null;
        }
        if (editStatusAutocomplete) {
          editStatusAutocomplete.destroy();
          editStatusAutocomplete = null;
        }
        if (editDatePicker) {
          editDatePicker = null;
        }

        pendingEditId = null;
        currentModalSubtimes = [];

        this.mainController.refreshUI();
        this.refreshUI();

        NotificationService.show({
          type: "success",
          message: `Time "${newTitle}" updated successfully!`,
          icon: "fa-check",
          duration: 5000,
        });
      } catch (error) {
        NotificationService.show({
          type: "error",
          message: error.message || "Failed to update time",
          icon: "fa-triangle-exclamation",
          duration: 5000,
        });
      } finally {
        GlobalLoaderService.hide();
      }
    }, 30);
  },

  setupDatePicker(action, initialValue = "") {
    if (action === "create") {
      const container = document.getElementById("create-datepicker-container");
      if (!container) return;

      createDatePicker = new DatePickerComponent({
        id: "time-duedate-input",
        value: initialValue,
        placeholder: "YYYY-MM-DD",
      });

      container.innerHTML = createDatePicker.render();
      createDatePicker.bindEvents();
    } else {
      const container = document.getElementById("edit-datepicker-container");
      if (!container) return;

      editDatePicker = new DatePickerComponent({
        id: "edit-time-duedate",
        value: initialValue,
        placeholder: "YYYY-MM-DD",
        background: "surface",
      });

      container.innerHTML = editDatePicker.render();
      editDatePicker.bindEvents();
    }
  },
};
