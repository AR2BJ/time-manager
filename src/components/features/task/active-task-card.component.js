import { StateManager } from "@/models/state.model.js";

export const ActiveTaskCardComponent = {
  render() {
    const activeTask = StateManager.getActiveTask();

    if (!activeTask) {
      return `
        <div class="bg-surface border border-border rounded-3xl p-5 shadow-xs">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <span class="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2">
              <i class="fa-regular fa-bullseye-arrow text-brand"></i>
              <span>Active Focus Task</span>
            </span>
            <button 
              id="btn-change-task" 
              class="rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-secondary hover:text-primary hover:bg-surface-3 transition cursor-pointer"
            >
              Select
            </button>
          </div>
          
          <div 
            id="box-empty-task"
            class="p-3.5 rounded-2xl bg-surface-2 border border-dashed border-border cursor-pointer hover:border-brand/50 transition text-center"
          >
            <p class="text-sm font-semibold text-primary mb-1">Select or create task...</p>
            <p class="text-[11px] text-muted">Link sessions to monitor progress.</p>
          </div>
        </div>
      `;
    }

    const completed = activeTask.completedPomodoros || 0;
    const estimated = activeTask.estimatedPomodoros || 1;
    const progressPercent = Math.min(
      Math.round((completed / estimated) * 100),
      100,
    );

    return `
      <div class="bg-surface border border-border rounded-3xl p-5 shadow-xs">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <span class="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2">
            <i class="fa-regular fa-bullseye-arrow text-brand"></i>
            <span>Active Focus Task</span>
          </span>
          <button 
            id="btn-change-task" 
            class="rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-secondary hover:text-primary hover:bg-surface-3 transition cursor-pointer"
          >
            Change
          </button>
        </div>

        <div class="p-3.5 rounded-2xl bg-surface-2 border border-border">
          <div class="flex items-center justify-between gap-3 mb-3">
            <h4 class="text-sm font-semibold text-primary truncate">${activeTask.title}</h4>
            <span class="shrink-0 text-[11px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-md border border-brand/20">
              ${completed}/${estimated} Pomo
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
