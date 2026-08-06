import { ConfirmModalComponent } from "@/components/modals/confirm-modal.component.js";
import { InfoModalComponent } from "@/components/modals/info-modal.component";
import { TaskModalComponent } from "@/components/modals/task-modal.component.js";
import { TaskModel } from "@/models/task.model";

export const ModalController = {
  confirmCallback: null,

  init() {
    this.bindGlobalTriggers();
    this.bindKeyboardShortcuts();
  },

  bindGlobalTriggers() {
    // Task Modal & Help Modal Triggers from UI
    document.addEventListener("click", (e) => {
      const btnChange = e.target.closest("#btn-change-task");
      const boxEmpty = e.target.closest("#box-empty-task");
      const helpToggle = e.target.closest("#help-toggle");

      if (btnChange || boxEmpty) {
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
            "#task-modal-wrapper #form-create-task",
          );
          if (taskForm) {
            taskForm.requestSubmit();
          }
          return;
        }
      }
    });
  },

  // ==========================================
  // TASK MODAL LOGIC (Dynamic Body Injection)
  // ==========================================
  openTaskModal() {
    this.closeTaskModal();

    const modalWrapper = document.createElement("div");
    modalWrapper.id = "task-modal-wrapper";
    modalWrapper.innerHTML = TaskModalComponent.render();
    document.body.appendChild(modalWrapper);

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
  },

  bindTaskModalEvents(wrapper) {
    // 1. Validation for Pomodoro Input Field (Strict max 20, digits only)
    const pomoInput = wrapper.querySelector("#input-task-pomo");
    if (pomoInput) {
      pomoInput.addEventListener("input", (e) => {
        let val = e.target.value.replace(/\D/g, ""); // Remove non-digit characters

        if (val !== "") {
          let num = parseInt(val, 10);
          if (num > 20) num = 20;
          if (num < 1) num = 1;
          val = String(num);
        }

        e.target.value = val;
      });

      pomoInput.addEventListener("blur", (e) => {
        if (!e.target.value.trim() || parseInt(e.target.value, 10) < 1) {
          e.target.value = "1";
        }
      });
    }

    // 2. Dynamic Event Handling
    wrapper.addEventListener("click", (e) => {
      // Close Modal
      if (
        e.target.closest("#close-task-modal") ||
        e.target.closest("#task-modal-backdrop")
      ) {
        this.closeTaskModal();
        return;
      }

      // Direct Delete Action (No Confirmation required)
      const btnDelete = e.target.closest(".btn-delete-task");
      if (btnDelete) {
        e.preventDefault();
        e.stopPropagation();

        const taskId = btnDelete.dataset.deleteTaskId;
        const currentActiveTask = TaskModel.getActiveTask();

        if (
          currentActiveTask &&
          String(currentActiveTask.id) === String(taskId)
        ) {
          TaskModel.setActiveTaskId(null);
        }

        TaskModel.deleteTask(taskId);

        this.openTaskModal();
        return;
      }

      // Select Task Action
      const taskRow = e.target.closest(".task-item-row");
      if (taskRow) {
        const taskId = taskRow.dataset.taskId;
        TaskModel.setActiveTaskId(taskId);
        this.closeTaskModal();
      }
    });

    // 3. Form Submit Logic
    const form = wrapper.querySelector("#form-create-task");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const titleInput = wrapper.querySelector("#input-task-title");
        const pomoVal = Number(pomoInput?.value) || 1;

        if (titleInput && titleInput.value.trim()) {
          const newTask = TaskModel.addTask(titleInput.value.trim(), pomoVal);
          if (newTask) {
            TaskModel.setActiveTaskId(newTask.id);
          }
          this.closeTaskModal();
        }
      });
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
            "flex-1 py-2 text-xs font-bold rounded-lg text-secondary hover:text-primary transition cursor-pointer";
          contentSafeguard.classList.remove("hidden");
          contentShortcuts.classList.add("hidden");
        } else {
          tabShortcuts.className =
            "flex-1 py-2 text-xs font-bold rounded-lg bg-brand text-white transition cursor-pointer";
          tabSafeguard.className =
            "flex-1 py-2 text-xs font-bold rounded-lg text-secondary hover:text-primary transition cursor-pointer";
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
