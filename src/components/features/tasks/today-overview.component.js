import { StateManager } from "@/models/state.model.js";

export const TodayOverviewComponent = {
  render() {
    const overviewData = StateManager.getTodayOverview() || {};
    const {
      sessionsDone = 0,
      totalMinutes = 0,
      currentStreak = 0,
      dailyGoalSessions = 4,
    } = overviewData;

    const formattedTime =
      totalMinutes >= 60
        ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
        : `${totalMinutes}m`;

    const goalPercent = Math.min(
      100,
      Math.round((sessionsDone / (dailyGoalSessions || 1)) * 100),
    );

    return `
      <div class="bg-surface border border-border rounded-3xl p-5 shadow-xs flex flex-col gap-4">
        <span class="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2">
          <i class="fa-regular fa-chart-line text-brand"></i>
          <span>Today's Overview</span>
        </span>

        <div class="grid grid-cols-2 gap-3">
          <div class="p-3.5 rounded-2xl bg-surface-2 border border-border text-center flex flex-col items-center justify-center">
            <span class="block text-2xl font-black text-primary mb-0.5 font-mono">${sessionsDone}</span>
            <span class="text-[10px] font-semibold text-muted uppercase tracking-wider">Sessions Done</span>
          </div>

          <div class="p-3.5 rounded-2xl bg-surface-2 border border-border text-center flex flex-col items-center justify-center">
            <span class="block text-2xl font-black text-brand mb-0.5 font-mono">${formattedTime}</span>
            <span class="text-[10px] font-semibold text-muted uppercase tracking-wider">Total Focus</span>
          </div>

          <div class="p-3.5 rounded-2xl bg-surface-2 border border-border text-center flex flex-col items-center justify-center">
            <span class="text-2xl font-black text-amber-500 mb-0.5 font-mono flex items-center gap-1">
              <i class="fa-solid fa-fire text-xs"></i>${currentStreak}
            </span>
            <span class="text-[10px] font-semibold text-muted uppercase tracking-wider">Day Streak</span>
          </div>

          <div class="p-3.5 rounded-2xl bg-surface-2 border border-border text-center flex flex-col items-center justify-center">
            <span class="block text-2xl font-black text-emerald-500 mb-0.5 font-mono">${goalPercent}%</span>
            <span class="text-[10px] font-semibold text-muted uppercase tracking-wider">Daily Target</span>
          </div>

        </div>
      </div>
    `;
  },
};
