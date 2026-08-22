import { TaskService } from "@/services/task.service.js";

export const ActiveTaskCardComponent = {
  render() {
    const activeTask = TaskService.getActiveTask();
    const allTasks = TaskService.getTasks();
    const hasTasks = allTasks.some((t) => t.status !== "done") && allTasks > 0;

    if (!activeTask) {
      const buttonText = hasTasks ? "Select" : "Create";
      const boxTitle = hasTasks
        ? "Select or create task..."
        : "Create a task...";
      const boxSubtitle = hasTasks
        ? "Link sessions to monitor progress."
        : "Add your first task to start tracking.";

      return `
        <div class="bg-surface border border-border rounded-3xl p-5 shadow-xs">
          <div class="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border">
            <div 
              class="flex items-center gap-2 min-w-0 flex-1 cursor-pointer xs:pointer-events-none xs:cursor-default"
              data-tooltip-title="Active Focus Task"
            >
              <i class="fa-regular fa-bullseye-arrow text-brand shrink-0"></i>
              <span class="text-xs font-bold uppercase tracking-wider text-muted truncate">
                Active Focus Task
              </span>
            </div>
            <button 
              id="btn-select-task" 
              class="shrink-0 rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-secondary hover:text-color hover:bg-surface-3 transition cursor-pointer"
            >
              ${buttonText}
            </button>
          </div>
          
          <div 
            id="box-empty-task"
            class="p-3.5 rounded-2xl bg-surface-2 border border-dashed border-border cursor-pointer hover:border-brand/50 transition text-center"
          >
            <p class="text-sm font-semibold text-color mb-1">${boxTitle}</p>
            <p class="text-[11px] text-muted">${boxSubtitle}</p>
          </div>
        </div>
      `;
    }

    const completed = activeTask.completedFocusUnits || 0;
    const estimated = activeTask.estimatedFocusUnits || 1;
    const progressPercent = Math.min(
      Math.round((completed / estimated) * 100),
      100,
    );

    return `
      <div class="bg-surface border border-border rounded-3xl p-5 shadow-xs">
        <div class="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border">
          <div 
            class="flex items-center gap-2 min-w-0 flex-1 cursor-pointer xs:pointer-events-none xs:cursor-default"
            data-tooltip-title="Active Focus Task"
          >
            <i class="fa-regular fa-bullseye-arrow text-brand shrink-0"></i>
            <span class="text-xs font-bold uppercase tracking-wider text-muted truncate">
              Active Focus Task
            </span>
          </div>
          <button 
            id="btn-select-task" 
            class="shrink-0 rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-secondary hover:text-color hover:bg-surface-3 transition cursor-pointer"
          >
            Select
          </button>
        </div>

        <div class="p-3.5 rounded-2xl bg-surface-2 border border-border">
          <div class="flex items-center justify-between gap-3 mb-3">
            <h4 class="text-sm font-semibold text-color truncate min-w-0 flex-1">${activeTask.title}</h4>
            <span class="shrink-0 text-[11px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-md border border-brand/20">
              ${completed}/${estimated} Units
            </span>
          </div>

          <div class="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
            <div 
              class="h-full bg-brand transition-all duration-300" 
              style="width: ${progressPercent}%"
            ></div>
          </div>
        </div>
      </div>
    `;
  },
};
