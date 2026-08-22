import { formatDate, formatTime, todayISO } from "@/utils/helpers.js";

export const DashboardComponent = {
  render(sessions) {
    const totalSessions = sessions.length;
    const totalFocusSeconds = sessions.reduce(
      (acc, s) => acc + (s.durationSeconds || 0),
      0,
    );
    const totalFocusMinutes = Math.round(totalFocusSeconds / 60);
    const totalFocusHours = Math.floor(totalFocusMinutes / 60);
    const formattedTotalFocus =
      totalFocusHours > 0
        ? `${totalFocusHours}h ${totalFocusMinutes % 60}m`
        : `${totalFocusMinutes}m`;

    let currentStreak = 0;
    if (sessions.length > 0) {
      const today = todayISO();
      let checkDate = new Date(today);

      const hasTodaySession = sessions.some((s) => s.completedAt === today);
      if (!hasTodaySession) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      while (true) {
        const dateStr = formatDate(checkDate);
        const hasSession = sessions.some((s) => s.completedAt === dateStr);

        if (hasSession) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    const pomoSessions = sessions.filter((s) => s.type === "pomodoro");
    const totalPomos = pomoSessions.length;
    const totalPomoMinutes = pomoSessions.reduce(
      (acc, s) => acc + s.durationSeconds / 60,
      0,
    );
    const avgPomoLength =
      totalPomos > 0 ? Math.round(totalPomoMinutes / totalPomos) : 0;

    const today = todayISO();
    const todaySessions = sessions.filter((s) => s.completedAt === today);
    const todayTotalSeconds = todaySessions.reduce(
      (acc, s) => acc + (s.durationSeconds || 0),
      0,
    );

    return `
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full col-span-full"
      >
        <div
          class="relative overflow-hidden bg-surface-2 border border-border/70 hover:-translate-y-1 hover:border-brand/30 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between min-h-36 group"
        >
          <i
            class="fa-solid fa-clock absolute -right-4 -bottom-6 text-[10rem] text-brand/80 opacity-[0.04] dark:opacity-[0.06] rotate-15 pointer-events-none group-hover:scale-110 group-hover:rotate-5 transition-transform duration-500"
          ></i>
          <div class="flex items-center justify-between z-10">
            <span
              class="text-xs font-bold text-secondary uppercase tracking-wider"
              >Total Sessions</span
            >
            <span
              class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-brand/10 text-brand/80 border border-brand/20"
              >${totalSessions} Logs</span
            >
          </div>
          <div class="z-10 mt-3">
            <div class="text-3xl font-black text-brand tracking-tight">
              ${totalSessions}
            </div>
            <p class="text-[11px] text-secondary/80 font-medium mt-1">
              Focus intervals completed
            </p>
          </div>
        </div>

        <div
          class="relative overflow-hidden bg-surface-2 border border-border/70 hover:-translate-y-1 hover:border-emerald-500/30 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between min-h-36 group"
        >
          <i
            class="fa-solid fa-hourglass-half absolute -right-4 -bottom-6 text-[10rem] text-emerald-500 opacity-[0.04] dark:opacity-[0.06] rotate-15 pointer-events-none group-hover:scale-110 group-hover:rotate-5 transition-transform duration-500"
          ></i>
          <div class="flex items-center justify-between z-10">
            <span
              class="text-xs font-bold text-secondary uppercase tracking-wider"
              >Total Focus</span
            >
            <span
              class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              >${formattedTotalFocus}</span
            >
          </div>
          <div class="z-10 mt-3">
            <div class="text-3xl font-black text-emerald-400 tracking-tight">
              ${formattedTotalFocus}
            </div>
            <p class="text-[11px] text-secondary/80 font-medium mt-1">
              Cumulative focused time
            </p>
          </div>
        </div>

        <div
          class="relative overflow-hidden bg-surface-2 border border-border/70 hover:-translate-y-1 hover:border-amber-500/30 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between min-h-36 group"
        >
          <i
            class="fa-solid fa-fire absolute -right-4 -bottom-6 text-[10rem] text-yellow-500 opacity-[0.04] dark:opacity-[0.06] rotate-15 pointer-events-none group-hover:scale-110 group-hover:rotate-5 transition-transform duration-500"
          ></i>
          <div class="flex items-center justify-between z-10">
            <span
              class="text-xs font-bold text-secondary uppercase tracking-wider"
              >Current Streak</span
            >
            <span
              class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
              >${currentStreak} Days</span
            >
          </div>
          <div class="z-10 mt-3">
            <div class="text-3xl font-black text-yellow-400 tracking-tight">
              ${currentStreak}
            </div>
            <p class="text-[11px] text-secondary/80 font-medium mt-1">
              Consecutive active days
            </p>
          </div>
        </div>

        <div
          class="relative overflow-hidden bg-surface-2 border border-border/70 hover:-translate-y-1 hover:border-indigo-500/30 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between min-h-36 group"
        >
          <i
            class="fa-solid fa-list-check absolute -right-4 -bottom-6 text-[10rem] text-indigo-500 opacity-[0.04] dark:opacity-[0.06] rotate-15 pointer-events-none group-hover:scale-110 group-hover:rotate-5 transition-transform duration-500"
          ></i>
          <div class="flex items-center justify-between z-10">
            <span
              class="text-xs font-bold text-secondary uppercase tracking-wider"
              >Pomodoros Completed</span
            >
            <span
              class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
              >${totalPomos} Logs</span
            >
          </div>
          <div class="z-10 mt-3">
            <div class="text-3xl font-black text-indigo-400 tracking-tight">
              ${totalPomos}
            </div>
            <p class="text-[11px] text-secondary/80 font-medium mt-1">
              Completed focus intervals
            </p>
          </div>
        </div>

        <div
          class="relative overflow-hidden bg-surface-2 border border-border/70 hover:-translate-y-1 hover:border-purple-500/30 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between min-h-36 group"
        >
          <i
            class="fa-solid fa-stopwatch absolute -right-4 -bottom-6 text-[10rem] text-purple-500 opacity-[0.04] dark:opacity-[0.06] rotate-15 pointer-events-none group-hover:scale-110 group-hover:rotate-5 transition-transform duration-500"
          ></i>
          <div class="flex items-center justify-between z-10">
            <span
              class="text-xs font-bold text-secondary uppercase tracking-wider"
              >Avg. Pomodoro</span
            >
            <span
              class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20"
              >${totalPomos} Done</span
            >
          </div>
          <div class="z-10 mt-3">
            <div class="text-3xl font-black text-purple-400 tracking-tight">
              ${avgPomoLength}m
            </div>
            <p class="text-[11px] text-secondary/80 font-medium mt-1">
              Average session length
            </p>
          </div>
        </div>

        <div
          class="relative overflow-hidden bg-surface-2 border border-border/70 hover:-translate-y-1 hover:border-rose-500/30 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between min-h-36 group"
        >
          <i
            class="fa-solid fa-calendar-star absolute -right-4 -bottom-6 text-[10rem] text-rose-500 opacity-[0.04] dark:opacity-[0.06] rotate-15 pointer-events-none group-hover:scale-110 group-hover:rotate-5 transition-transform duration-500"
          ></i>
          <div class="flex items-center justify-between z-10">
            <span
              class="text-xs font-bold text-secondary uppercase tracking-wider"
              >Peak Day</span
            >
          </div>
          <div class="z-10 mt-3">
            <div class="text-3xl font-black text-rose-400 tracking-tight">
              ${(() => {
                const days = Array(7).fill(0);
                sessions.forEach((s) => {
                  const day = new Date(s.completedAt).getDay();
                  if (!isNaN(day)) days[day]++;
                });
                const max = Math.max(...days);
                const idx = days.indexOf(max);
                return max > 0
                  ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][idx]
                  : "&#8210";
              })()}
            </div>
            <p class="text-[11px] text-secondary/80 font-medium mt-1">
              Most productive day
            </p>
          </div>
        </div>

        <div
          class="relative overflow-hidden bg-surface-2 border border-border/70 hover:-translate-y-1 hover:border-sky-500/30 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between min-h-36 group"
        >
          <i
            class="fa-solid fa-calendar-day absolute -right-4 -bottom-6 text-[10rem] text-sky-500 opacity-[0.04] dark:opacity-[0.06] rotate-15 pointer-events-none group-hover:scale-110 group-hover:rotate-5 transition-transform duration-500"
          ></i>
          <div class="flex items-center justify-between z-10">
            <span
              class="text-xs font-bold text-secondary uppercase tracking-wider"
              >Today's Sessions</span
            >
            <span
              class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20"
              >${todaySessions.length} Logs</span
            >
          </div>
          <div class="z-10 mt-3">
            <div class="text-3xl font-black text-sky-400 tracking-tight">
              ${formatTime(todayTotalSeconds)}
            </div>
            <p class="text-[11px] text-secondary/80 font-medium mt-1">
              Total focus today
            </p>
          </div>
        </div>

        <div
          class="relative overflow-hidden bg-surface-2 border border-border/70 hover:-translate-y-1 hover:border-orange-500/30 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between min-h-36 group"
        >
          <i
            class="fa-solid fa-arrow-right-arrow-left absolute -right-4 -bottom-6 text-[10rem] text-orange-500 opacity-[0.04] dark:opacity-[0.06] rotate-15 pointer-events-none group-hover:scale-110 group-hover:rotate-5 transition-transform duration-500"
          ></i>
          <div class="flex items-center justify-between z-10">
            <span
              class="text-xs font-bold text-secondary uppercase tracking-wider"
              >Mode Ratio</span
            >
          </div>
          <div class="z-10 mt-3">
            <div class="text-3xl font-black text-orange-400 tracking-tight">
              ${(() => {
                const p = sessions.filter((s) => s.type === "pomodoro").length;
                const f = sessions.filter((s) => s.type === "flow").length;
                const t = p + f;
                if (t === 0) return "0/0";
                return `${Math.round((p / t) * 100)}% / ${Math.round((f / t) * 100)}%`;
              })()}
            </div>
            <p class="text-[11px] text-secondary/80 font-medium mt-1">
              Pomodoro / Flow split
            </p>
          </div>
        </div>
      </div>

      <div
        class="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full col-span-2 sm:col-span-full mt-4"
      >
        <div
          class="lg:col-span-2 bg-surface-2 border border-border/70 rounded-2xl p-6 flex flex-col justify-between"
        >
          <div
            class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"
          >
            <div>
              <h4
                class="text-lg font-bold text-color flex items-center gap-2"
              >
                <i class="fa-regular fa-chart-network text-brand/80 text-xl"></i>
                Activity Heatmap
              </h4>
              <p class="text-xs text-secondary mt-1">
                Session density across defined time windows.
              </p>
            </div>

            <div class="relative flex items-center justify-end">
              <button
                id="heatmap-mobile-menu-toggle"
                class="sm:hidden inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-surface text-secondary hover:text-color transition shadow-sm cursor-pointer"
                aria-label="Open view menu"
              >
                <i class="fa-regular fa-ellipsis-vertical text-lg"></i>
              </button>

              <div
                id="heatmap-mobile-menu"
                class="hidden absolute right-0 top-full mt-2 w-44 rounded-2xl border border-border bg-surface-2 shadow-lg z-20 overflow-hidden"
              >
                <button
                  data-view="weekly"
                  class="w-full px-4 py-2.5 text-left text-xs font-medium text-secondary hover:bg-surface"
                >
                  Weekly
                </button>
                <button
                  data-view="monthly"
                  class="w-full px-4 py-2.5 text-left text-xs font-medium text-secondary hover:bg-surface"
                >
                  Monthly
                </button>
                <button
                  data-view="yearly"
                  class="w-full px-4 py-2.5 text-left text-xs font-medium text-secondary hover:bg-surface"
                >
                  Yearly
                </button>
              </div>

              <div
                id="chart-view-switcher"
                class="hidden sm:flex relative overflow-hidden rounded-xl border border-border/80 bg-surface p-1 isolation-auto"
              >
                <div
                  id="heatmap-tab-indicator"
                  class="absolute top-1 left-1 h-[calc(100%-8px)] w-24 rounded-lg bg-brand/80 transition-all duration-300 ease-out z-0 shadow-sm"
                ></div>

                <button
                  data-view="weekly"
                  id="view-btn-weekly"
                  class="relative z-10 w-24 py-1.5 text-xs font-bold text-secondary transition cursor-pointer text-center"
                >
                  Weekly
                </button>
                <button
                  data-view="monthly"
                  id="view-btn-monthly"
                  class="relative z-10 w-24 py-1.5 text-xs font-bold text-secondary transition cursor-pointer text-center"
                >
                  Monthly
                </button>
                <button
                  data-view="yearly"
                  id="view-btn-yearly"
                  class="relative z-10 w-24 py-1.5 text-xs font-bold text-secondary transition cursor-pointer text-center"
                >
                  Yearly
                </button>
              </div>
            </div>
          </div>

          <div
            class="w-full mt-6 overflow-x-auto scrollbar-thin scrollbar-thumb-surface"
          >
            <div
              id="apex-heatmap-chart"
              class="w-full"
            ></div>
          </div>
        </div>

        <div
          class="bg-surface-2 border border-border/70 rounded-2xl p-6 flex flex-col justify-between"
        >
          <div>
            <h4
              class="text-lg font-bold text-color flex items-center gap-2"
            >
              <i
                class="fa-regular fa-chart-simple text-amber-400 text-xl"
              ></i>
               Weekly Distribution
            </h4>
            <p class="text-xs text-secondary mt-1">
              Session pattern mapped by day of week.
            </p>
          </div>

          <div
            class="w-full mt-6 overflow-x-auto scrollbar-thin scrollbar-thumb-surface"
          >
            <div
              id="apex-weekday-chart"
              class="w-full"
            ></div>
          </div>
        </div>
      </div>

      <div
        class="w-full col-span-2 sm:col-span-full mt-4 bg-surface-2 rounded-2xl"
      >
        <div class="w-full col-span-full bg-surface-2 rounded-2xl p-6">
          <div
            class="flex flex-wrap sm:flex-nowrap sm:items-center justify-between gap-2"
          >
            <div>
              <h4
                class="text-lg font-bold text-color flex items-center gap-2"
              >
                <i class="fa-regular fa-clock text-brand/80 text-xl"></i>
                Session History
              </h4>
              <p class="text-xs text-secondary/80 mt-0.5 font-medium">
                Detailed log of your recent focus sessions.
              </p>
            </div>
            <span
              class="text-xs text-center font-semibold px-2.5 py-1 rounded-lg bg-surface border border-border text-secondary self-center sm:self-auto w-full sm:w-auto"
            >
              ${totalSessions} Total Sessions
            </span>
          </div>

          <div class="mt-6 space-y-3">
            ${
              sessions.length === 0
                ? `
                    <div
                      class="min-h-80 bg-surface border border-dashed border-border rounded-2xl p-16 text-center"
                    >
                      <div class="text-6xl mb-6">
                        <i
                          class="fa-regular fa-clock text-brand/60"
                        ></i>
                      </div>
                      <h2 class="text-2xl font-bold text-color">
                        No sessions yet
                      </h2>
                      <p class="mt-3 text-secondary max-w-sm mx-auto">
                        Complete a Pomodoro or Flow session to see your history here!
                      </p>
                    </div>
                  `
                : sessions
                    .map((session) => {
                      const formattedDuration = formatTime(
                        session.durationSeconds || 0,
                      );

                      const typeBadgeStyles = {
                        pomodoro: "bg-brand/10 text-brand border-brand/20",
                        flow: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                      };

                      return `
                        <div
                          class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface/80 hover:bg-surface p-4 rounded-xl border border-border/40 transition"
                        >
                          <div class="flex flex-col gap-1.5 min-w-0 flex-1">
                            <div class="flex items-center gap-2 flex-wrap">
                              <span
                                class="inline-flex items-center rounded px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider border ${
                                  typeBadgeStyles[session.type] ||
                                  typeBadgeStyles.pomodoro
                                }"
                              >
                                ${session.type === "pomodoro" ? "Pomodoro" : "Flow"}
                              </span>
                              
                              <span
                                class="text-[9px] text-secondary/80 font-medium border border-border/40 px-2 py-0.5 rounded bg-surface-2/50"
                              >
                                ${formattedDuration}
                              </span>
                            </div>

                            <div class="flex items-center gap-2 text-[13px] font-bold text-color">
                              ${session.taskTitle}
                            </div>

                            <div
                              class="flex items-center gap-4 text-[11px] text-secondary/80 font-medium flex-wrap"
                            >
                              <span>
                                <i class="fa-regular fa-calendar me-1 text-brand/80"></i>
                                ${session.completedAt}
                              </span>
                            </div>
                          </div>

                          <div
                            class="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 border-border/40 pt-3 lg:pt-0 shrink-0"
                          >
                            <div class="text-left sm:text-right">
                              <span
                                class="text-[10px] text-secondary/60 block uppercase font-bold"
                                >Completed</span
                              >
                              <span
                                class="text-xs font-mono font-medium text-color"
                                >${session.completedAt}</span
                              >
                            </div>
                          </div>
                        </div>
                      `;
                    })
                    .join("")
            }
          </div>
        </div>
      </div>
    `;
  },
};
