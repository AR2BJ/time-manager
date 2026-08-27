export const NotificationService = {
  show({
    type,
    message,
    duration = 5000,
    undoAction = null,
    icon = null,
    iconColor = "",
    actionButton = null,
    closable = true,
  }) {
    const container = document.getElementById("notification-container");
    if (!container) return;

    const typeClassMap = {
      success:
        "border border-emerald-500/20 bg-emerald-500/10 text-emerald-800/80 dark:text-emerald-400",
      error:
        "border border-red-500/20 bg-red-500/10 text-red-800/80 dark:text-red-400",
      warning:
        "border border-amber-500/20 bg-amber-500/10 text-amber-800/80 dark:text-amber-400",
      info: "border border-brand/20 bg-brand/10 text-brand/80 dark:text-brand",
    };
    const typeTimerMap = {
      success: "bg-emerald-400/20 text-emerald-800/80 dark:text-emerald-400",
      error: "bg-red-400/20 text-red-800/80 dark:text-red-400",
      warning: "bg-amber-400/20 text-amber-800/80 dark:text-amber-400",
      info: "bg-brand/20 text-brand/80 dark:text-brand",
    };
    const typeUndoMap = {
      success: "bg-emerald-400/20 hover:bg-emerald-500/20",
      error: "bg-red-400/20 hover:bg-red-500/20",
      warning: "bg-amber-400/20 hover:bg-amber-500/20",
      info: "bg-brand/20 hover:bg-brand/20",
    };
    const typeIconColorMap = {
      success: "text-emerald-500",
      error: "text-red-500",
      warning: "text-amber-500",
      info: "text-brand/80",
    };
    const typeTextColorMap = {
      success: "text-emerald-800/80 dark:text-emerald-500",
      error: "text-red-800/80 dark:text-red-500",
      warning: "text-amber-800/80 dark:text-amber-500",
      info: "text-brand/80 dark:text-brand",
    };
    const typeCloseBgMap = {
      success: "bg-emerald-600/60",
      error: "bg-red-600/60",
      warning: "bg-amber-600/60",
      info: "bg-brand/60",
    };
    const typeCloseBorderMap = {
      success: "border-emerald-600/60",
      error: "border-red-600/60",
      warning: "border-amber-600/60",
      info: "border-brand/60",
    };
    const typeCloseTextMap = {
      success: "text-white",
      error: "text-white",
      warning: "text-white",
      info: "text-white",
    };

    const toastTextClass = typeTextColorMap[type] || "text-emerald-500/80";
    const toastTimerClass = typeTimerMap[type] || "bg-emerald-700/20";
    const toastUndoClass =
      typeUndoMap[type] || "bg-emerald-400/20 hover:emerald-500/20";
    const toastTypeClass = typeClassMap[type] || "border-border bg-surface/95";
    const toastIconColor =
      iconColor || typeIconColorMap[type] || "text-emerald-500";
    const closeBgClass = typeCloseBgMap[type] || "bg-gray-600";
    const closeBorderClass = typeCloseBorderMap[type] || "border-gray-600";
    const closeTextClass = typeCloseTextMap[type] || "text-white";

    const toast = document.createElement("div");
    toast.className = `animate-slide-up ${toastTypeClass} backdrop-blur-md
    rounded-2xl px-5 py-3.5 shadow-2xl flex flex-row justify-between
    items-center gap-4 transition-all duration-300 transform w-full relative
    group`;

    const countdownId = `toast-cd-${Math.random().toString(36).slice(2, 11)}`;

    const iconHTML = icon
      ? `<i class="fa-regular ${icon} ${toastIconColor} text-lg"></i>`
      : "";

    toast.innerHTML = `
      <div class="flex items-center gap-3 text-secondary">
        ${
          undoAction
            ? `<span
                id="${countdownId}"
                class="text-xs ${toastTimerClass} px-1.5 py-0.5 rounded"
                >${duration / 1000}s</span
              >`
            : iconHTML
        }
        <span class="${toastTextClass} text-sm font-medium">${message}</span>
      </div>
    `;

    if (closable) {
      const closeBtn = document.createElement("button");
      closeBtn.className = `absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex flex-row justify-center items-center 
        ${closeBgClass} ${closeBorderClass} border-2
        flex items-center justify-center
        transition-all duration-200 hover:scale-110 active:scale-95
        shadow-lg
        ${closeTextClass}
        focus:outline-none
        opacity-0 group-hover:opacity-100 group-hover:cursor-pointer
        pointer-events-none group-hover:pointer-events-auto`;
      closeBtn.setAttribute("aria-label", "Close notification");
      closeBtn.innerHTML = `<i class="fa-regular fa-xmark text-xs"></i>`;

      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.removeToast(toast);
      });

      toast.appendChild(closeBtn);
    }

    if (undoAction) {
      const undoBtn = document.createElement("button");
      undoBtn.className = `h-8 px-3 transition flex items-center justify-center gap-1 cursor-pointer rounded-lg ${toastUndoClass} text-sm font-medium`;

      undoBtn.innerHTML = `<i class="fa-regular fa-rotate-left text-xs"></i><span class="text-xs font-semibold">Undo</span>`;

      undoBtn.addEventListener("click", () => {
        undoAction();
        this.removeToast(toast);
      });
      toast.appendChild(undoBtn);
    }

    if (actionButton) {
      const actionBtn = document.createElement("button");
      actionBtn.className = `min-w-fit h-8 px-3 transition flex items-center justify-center gap-1 cursor-pointer rounded-lg ${toastUndoClass} text-sm font-medium`;
      actionBtn.innerHTML = `<i class="fa-regular ${actionButton.icon || "fa-arrow-right"} text-xs"></i><span class="text-xs font-semibold">${actionButton.text || "Action"}</span>`;

      actionBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (typeof actionButton.onClick === "function") {
          actionButton.onClick();
        }
        this.removeToast(toast);
      });
      toast.appendChild(actionBtn);
    }

    container.appendChild(toast);

    let remainingTime = duration;
    let countdownInterval = null;
    let autoDeleteTimer = null;

    const triggerClear = () => {
      if (countdownInterval) clearInterval(countdownInterval);
      if (autoDeleteTimer) clearTimeout(autoDeleteTimer);
      this.removeToast(toast);
    };

    if (undoAction) {
      const countdownEl = toast.querySelector(`#${countdownId}`);
      countdownInterval = setInterval(() => {
        remainingTime -= 1000;

        if (remainingTime <= 0) {
          triggerClear();
          return;
        }

        if (countdownEl) {
          countdownEl.textContent = `${remainingTime / 1000}s`;
        }
      }, 1000);
    }

    autoDeleteTimer = setTimeout(() => {
      triggerClear();
    }, duration);

    toast.dataset.timerId = autoDeleteTimer;
  },

  removeToast(toast) {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 100);
  },
};
