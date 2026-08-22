import { StateManager } from "@/models/state.model.js";

export const TodayOverviewComponent = {
  getRealOverview() {
    const state = StateManager.getState();
    const todaySessions = StateManager.getTodaySessions();

    const sessionsDone = todaySessions.length;
    const totalSeconds = todaySessions.reduce(
      (acc, s) => acc + (s.durationSeconds || 0),
      0,
    );
    const totalMinutes = Math.round(totalSeconds / 60);

    let streak = 0;
    const allSessions = [...state.sessions].sort((a, b) => {
      if (a.completedAt > b.completedAt) return -1;
      if (a.completedAt < b.completedAt) return 1;
      return 0;
    });

    if (allSessions.length > 0) {
      const todayStr = new Date().toISOString().split("T")[0];

      let checkDate = todayStr;

      if (sessionsDone === 0) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        checkDate = yesterday.toISOString().split("T")[0];
      }

      let currentCheckDate = new Date(checkDate);

      while (true) {
        const dateStr = currentCheckDate.toISOString().split("T")[0];

        const hasSessionOnDate = allSessions.some(
          (s) => s.completedAt === dateStr,
        );

        if (hasSessionOnDate) {
          streak++;
          currentCheckDate.setDate(currentCheckDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    const goalPercent = Math.min(100, Math.round((sessionsDone / 4) * 100));

    return {
      sessionsDone,
      totalMinutes,
      currentStreak: streak,
      goalPercent,
    };
  },

  render() {
    const data = this.getRealOverview();

    const {
      sessionsDone = 0,
      totalMinutes = 0,
      currentStreak = 0,
      goalPercent = 0,
    } = data;

    const formattedTime =
      totalMinutes >= 60
        ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
        : `${totalMinutes}m`;

    return `
      <div class="bg-surface border border-border rounded-3xl p-5 shadow-xs flex flex-col gap-4">
        <span class="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-2">
          <i class="fa-regular fa-chart-line text-brand"></i>
          <span>Today's Overview</span>
        </span>

        <div class="grid grid-cols-2 gap-3">
          <div class="p-3.5 rounded-2xl bg-surface-2 border border-border text-center flex flex-col items-center justify-center">
            <span class="block text-2xl font-black text-color mb-0.5">${sessionsDone}</span>
            <span class="text-[10px] font-semibold text-muted uppercase tracking-wider">Sessions Done</span>
          </div>

          <div class="p-3.5 rounded-2xl bg-surface-2 border border-border text-center flex flex-col items-center justify-center">
            <span class="block text-2xl font-black text-brand mb-0.5">${formattedTime}</span>
            <span class="text-[10px] font-semibold text-muted uppercase tracking-wider">Total Focus</span>
          </div>

          <div class="p-3.5 rounded-2xl bg-surface-2 border border-border text-center flex flex-col items-center justify-center">
            <span class="text-2xl font-black text-amber-500 mb-0.5 flex items-center gap-1">
              <i class="fa-solid fa-fire text-xs"></i>${currentStreak}
            </span>
            <span class="text-[10px] font-semibold text-muted uppercase tracking-wider">Day Streak</span>
          </div>

          <div class="p-3.5 rounded-2xl bg-surface-2 border border-border text-center flex flex-col items-center justify-center">
            <span class="block text-2xl font-black text-emerald-500 mb-0.5">${goalPercent}%</span>
            <span class="text-[10px] font-semibold text-muted uppercase tracking-wider">Daily Target</span>
          </div>

        </div>
      </div>
    `;
  },
};
