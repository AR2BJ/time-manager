import { ConfirmModalComponent } from "@/components/modals/confirm-modal.component.js";
import { InfoModalComponent } from "@/components/modals/info-modal.component";
import { TaskController } from "./task.controller";
import { TaskModalComponent } from "@/components/modals/task-modal.component.js";
import { TaskService } from "@/services/task.service.js";

export const ModalController = {
  confirmCallback: null,
  editingTask: null,

  init() {
    this.bindGlobalTriggers();
    this.bindKeyboardShortcuts();
  },

  bindGlobalTriggers() {
    // Task Modal & Help Modal Triggers from UI
    document.addEventListener("click", (e) => {
      const btnSelect = e.target.closest("#btn-select-task");
      const boxEmpty = e.target.closest("#box-empty-task");
      const helpToggle = e.target.closest("#help-toggle");

      if (btnSelect || boxEmpty) {
        this.openTaskModal();
      }

      if (helpToggle) {
        this.openHelpModal();
      }
    });
  },

  // ==========================================
  // KEYBOARD SHORTCUTS ENGINE
  // ==========================================
  bindKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      const isConfirmOpen = Boolean(
        document.getElementById("confirm-modal-wrapper"),
      );
      const isTaskOpen = Boolean(document.getElementById("task-modal-wrapper"));
      const isHelpOpen = Boolean(document.getElementById("help-modal-wrapper"));

      // 1. ESC KEY: Blur Active Element & Close Modals
      if (e.key === "Escape") {
        if (
          document.activeElement &&
          typeof document.activeElement.blur === "function"
        ) {
          document.activeElement.blur();
        }

        if (isConfirmOpen) {
          e.preventDefault();
          this.closeConfirmModal();
          return;
        }

        if (isTaskOpen) {
          e.preventDefault();
          this.closeTaskModal();
          return;
        }

        if (isHelpOpen) {
          e.preventDefault();
          this.closeHelpModal();
          return;
        }
      }

      // 2. CTRL/CMD + ENTER: Submit / Confirm Action
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (isConfirmOpen) {
          e.preventDefault();
          if (typeof this.confirmCallback === "function") {
            this.confirmCallback();
          }
          this.closeConfirmModal();
          return;
        }

        if (isTaskOpen) {
          e.preventDefault();
          const taskForm = document.querySelector(
            "#task-modal-wrapper #form-task-action",
          );
          if (taskForm) {
            taskForm.requestSubmit();
          }
          return;
        }
      }
    });
  },

  openTaskModal(editingTask = null) {
    this.editingTask = editingTask;

    let modalWrapper = document.getElementById("task-modal-wrapper");

    if (modalWrapper) {
      modalWrapper.innerHTML = TaskModalComponent.render(editingTask);
    } else {
      modalWrapper = document.createElement("div");
      modalWrapper.id = "task-modal-wrapper";
      modalWrapper.innerHTML = TaskModalComponent.render(editingTask);
      document.body.appendChild(modalWrapper);
    }

    // Auto Focus on Title Input for Seamless UX
    const titleInput = modalWrapper.querySelector("#input-task-title");
    if (titleInput) {
      setTimeout(() => titleInput.focus(), 50);
    }

    this.bindTaskModalEvents(modalWrapper);
  },

  closeTaskModal() {
    const wrapper = document.getElementById("task-modal-wrapper");
    if (wrapper) {
      wrapper.remove();
    }
    this.editingTask = null;
  },

  bindTaskModalEvents(wrapper) {
    // 1. Validation for Pomodoro Input Field (Strict max 20, digits only)
    const unitInput = wrapper.querySelector("#input-task-focus-units");
    if (unitInput) {
      unitInput.addEventListener("input", (e) => {
        let val = e.target.value.replace(/\D/g, "");

        if (val !== "") {
          let num = parseInt(val, 10);
          if (num > 20) num = 20;
          if (num < 1) num = 1;
          val = String(num);
        }

        e.target.value = val;
      });

      unitInput.addEventListener("blur", (e) => {
        if (!e.target.value.trim() || parseInt(e.target.value, 10) < 1) {
          e.target.value = "1";
        }
      });
    }

    // 2. Close Modal & Cancel Edit
    const closeBtn = wrapper.querySelector("#close-task-modal");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeTaskModal());
    }

    const backdrop = wrapper.querySelector("#task-modal-backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", () => this.closeTaskModal());
    }

    const cancelBtn = wrapper.querySelector("#btn-cancel-edit");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.openTaskModal(null));
    }

    // 3. Edit & Delete Tasks (Event Delegation)
    wrapper.addEventListener("click", (e) => {
      const btnEdit = e.target.closest(".btn-edit-task");
      if (btnEdit) {
        e.preventDefault();
        e.stopPropagation();

        const taskId = btnEdit.dataset.editTaskId;
        const targetTask = TaskService.getTasks().find(
          (t) => String(t.id) === String(taskId),
        );

        if (targetTask) {
          this.openTaskModal(targetTask);
        }
        return;
      }

      const btnDelete = e.target.closest(".btn-delete-task");
      if (btnDelete) {
        e.preventDefault();
        e.stopPropagation();

        const taskId = btnDelete.dataset.deleteTaskId;

        TaskController.deleteTask(taskId);
        return;
      }

      const taskItem = e.target.closest(".task-item-row");
      if (taskItem) {
        const isDone = taskItem.dataset.isDone === "true";

        // Ignore clicks on completed tasks
        if (isDone) return;

        const taskId = taskItem.dataset.taskId;
        TaskService.setActiveTask(taskId);
        this.closeTaskModal();
      }
    });

    // 4. Submit Action (Create / Update)
    const submitBtn = wrapper.querySelector("#btn-submit-task");
    if (submitBtn) {
      submitBtn.replaceWith(submitBtn.cloneNode(true));
      const freshSubmitBtn = wrapper.querySelector("#btn-submit-task");

      freshSubmitBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const titleInput = wrapper.querySelector("#input-task-title");
        const unitVal = Number(unitInput?.value) || 1;

        if (this.editingTask) {
          const success = TaskController.updateTask(
            this.editingTask.id,
            titleInput ? titleInput.value.trim() : "",
            unitVal,
          );
          if (success) {
            this.closeTaskModal();
          }
        } else {
          const newTask = TaskController.createTask(
            titleInput ? titleInput.value.trim() : "",
            unitVal,
          );
          if (newTask) {
            TaskService.setActiveTask(newTask.id);
            this.closeTaskModal();
          }
        }
      });
    }

    const titleInput = wrapper.querySelector("#input-task-title");
    if (titleInput) {
      titleInput.addEventListener("keydown", (e) => {
        // Ctrl+Enter یا Cmd+Enter
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();

          const submitButton = wrapper.querySelector("#btn-submit-task");
          if (submitButton) {
            submitButton.click();
          }
        }
      });
    }
  },

  refreshTaskModal() {
    const isModalOpen = Boolean(document.getElementById("task-modal-wrapper"));
    if (isModalOpen) {
      this.openTaskModal(this.editingTask);
    }
  },

  // ==========================================
  // HELP MODAL LOGIC (Dynamic Body Injection)
  // ==========================================
  openHelpModal() {
    this.closeHelpModal();

    const helpWrapper = document.createElement("div");
    helpWrapper.id = "help-modal-wrapper";
    helpWrapper.innerHTML = InfoModalComponent.render();
    document.body.appendChild(helpWrapper);

    this.bindHelpModalEvents(helpWrapper);
  },

  closeHelpModal() {
    const wrapper = document.getElementById("help-modal-wrapper");
    if (wrapper) {
      wrapper.remove();
    }
  },

  bindHelpModalEvents(wrapper) {
    const modalEl = wrapper.querySelector("#help-modal");
    if (modalEl) {
      modalEl.classList.replace("hidden", "flex");
    }

    wrapper.addEventListener("click", (e) => {
      if (
        e.target.closest("#close-help-modal") ||
        e.target.closest("#btn-close-help") ||
        e.target.closest("#help-modal-backdrop")
      ) {
        this.closeHelpModal();
      }

      // Tab Switching Logic inside Help Modal
      const btnSafeguard = e.target.closest("#tab-help-safeguard");
      const btnShortcuts = e.target.closest("#tab-help-shortcuts");

      if (btnSafeguard || btnShortcuts) {
        const tabSafeguard = wrapper.querySelector("#tab-help-safeguard");
        const tabShortcuts = wrapper.querySelector("#tab-help-shortcuts");
        const contentSafeguard = wrapper.querySelector(
          "#content-help-safeguard",
        );
        const contentShortcuts = wrapper.querySelector(
          "#content-help-shortcuts",
        );

        if (btnSafeguard) {
          tabSafeguard.className =
            "flex-1 py-2 text-xs font-bold rounded-lg bg-brand text-white transition cursor-pointer";
          tabShortcuts.className =
            "flex-1 py-2 text-xs font-bold rounded-lg text-secondary hover:text-color transition cursor-pointer";
          contentSafeguard.classList.remove("hidden");
          contentShortcuts.classList.add("hidden");
        } else {
          tabShortcuts.className =
            "flex-1 py-2 text-xs font-bold rounded-lg bg-brand text-white transition cursor-pointer";
          tabSafeguard.className =
            "flex-1 py-2 text-xs font-bold rounded-lg text-secondary hover:text-color transition cursor-pointer";
          contentShortcuts.classList.remove("hidden");
          contentSafeguard.classList.add("hidden");
        }
      }
    });
  },

  // ==========================================
  // CONFIRM MODAL LOGIC (Dynamic Body Injection)
  // ==========================================
  openConfirm({ title, message, onConfirm }) {
    this.closeConfirmModal();

    const confirmWrapper = document.createElement("div");
    confirmWrapper.id = "confirm-modal-wrapper";
    confirmWrapper.innerHTML = ConfirmModalComponent.render({ title, message });
    document.body.appendChild(confirmWrapper);

    this.confirmCallback = onConfirm;
    this.bindConfirmModalEvents(confirmWrapper);
  },

  closeConfirmModal() {
    const wrapper = document.getElementById("confirm-modal-wrapper");
    if (wrapper) {
      wrapper.remove();
    }
    this.confirmCallback = null;
  },

  bindConfirmModalEvents(wrapper) {
    wrapper.addEventListener("click", (e) => {
      // Cancel / Backdrop click
      if (
        e.target.closest("#btn-cancel-confirm") ||
        e.target.closest("#confirm-modal-backdrop")
      ) {
        e.preventDefault();
        e.stopPropagation();
        this.closeConfirmModal();
        return;
      }

      // Action Confirm click
      if (e.target.closest("#btn-action-confirm")) {
        e.preventDefault();
        e.stopPropagation();

        if (typeof this.confirmCallback === "function") {
          this.confirmCallback();
        }
        this.closeConfirmModal();
      }
    });
  },
};
