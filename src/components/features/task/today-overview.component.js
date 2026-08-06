import { StateManager } from "@/models/state.model.js";

export const TodayOverviewComponent = {
  render() {
    const { sessionsDone, totalMinutes } = StateManager.getTodayOverview();

    const formattedTime =
      totalMinutes >= 60
        ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
        : `${totalMinutes}m`;

    return `
      <div class="bg-surface border border-border rounded-3xl p-5 shadow-xs">
        <span class="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2 mb-4">
          <i class="fa-regular fa-chart-line text-brand"></i>
          <span>Today's Overview</span>
        </span>

        <div class="grid grid-cols-2 gap-3">
          <div class="p-3.5 rounded-2xl bg-surface-2 border border-border text-center flex flex-col items-center justify-center">
            <span class="block text-2xl font-black text-primary mb-1">${sessionsDone}</span>
            <span class="text-[10px] font-medium text-muted uppercase tracking-wider">Sessions Done</span>
          </div>

          <div class="p-3.5 rounded-2xl bg-surface-2 border border-border text-center flex flex-col items-center justify-center">
            <span class="block text-2xl font-black text-brand mb-1">${formattedTime}</span>
            <span class="text-[10px] font-medium text-muted uppercase tracking-wider">Total Focus</span>
          </div>
        </div>
      </div>
    `;
  },
};
