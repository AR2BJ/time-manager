import {
  calculateSubtimeProgress,
  getDaysRemaining,
  isOverdue,
} from "@/utils/helpers.js";

import { state } from "@/models/state.model";

export const DashboardComponent = {
  render(times = []) {
    const activeTimes = times.filter((t) => !t.archived);
    const archivedTimes = times.filter((t) => t.archived);

    const totalTimesCount = times.length;
    const activeCount = activeTimes.length;
    const archivedCount = archivedTimes.length;

    // Time Status Breakdown
    const completedTimes = activeTimes.filter((t) => t.status === "done");
    const completedCount = completedTimes.length;

    const BlockedCount = activeTimes.filter(
      (t) => t.status === "blocked",
    ).length;

    const overdueCount = activeTimes.filter((t) =>
      isOverdue(t.dueDate, t.status),
    ).length;

    // Subtimes Aggregation
    let totalSubtimes = 0;
    let completedSubtimes = 0;

    activeTimes.forEach((t) => {
      if (Array.isArray(t.subtimes) && t.subtimes.length > 0) {
        totalSubtimes += t.subtimes.length;
        completedSubtimes += t.subtimes.filter((st) => st.completed).length;
      }
    });

    const subtimeRate =
      totalSubtimes > 0
        ? Math.round((completedSubtimes / totalSubtimes) * 100)
        : 0;

    const overallCompletionRate =
      activeCount > 0 ? Math.round((completedCount / activeCount) * 100) : 0;

    // Extract Top Tags Count for Analytic Insight
    const tagCounts = {};
    activeTimes.forEach((time) => {
      (state.tags.filter((t) => time.tags.includes(t.id)) || []).forEach(
        (tag) => {
          tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
        },
      );
    });

    const sortedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topTag = sortedTags.length > 0 ? sortedTags[0] : ["None", 0];
    const topTagPercentage =
      activeCount > 0 ? Math.round((topTag[1] / activeCount) * 100) : 0;

    const criticalTimes = activeTimes.filter(
      (t) => t.status !== "done" && t.priority === "high",
    );
    const criticalCount = criticalTimes.length;

    const nearDeadlineCritical = criticalTimes.filter((t) => {
      if (!t.dueDate) return false;
      const days = getDaysRemaining(t.dueDate);
      return days >= 0 && days <= 2;
    }).length;

    const unscheduledCount = activeTimes.filter(
      (t) => t.status !== "done" && !t.dueDate,
    ).length;
    const unscheduledRate =
      activeCount > 0 ? Math.round((unscheduledCount / activeCount) * 100) : 0;

    const blockedRatio =
      activeCount > 0 ? Math.round((BlockedCount / activeCount) * 100) : 0;

    return `
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full col-span-full"
      >
        <div
          class="col-span-2 md:col-span-1 relative overflow-hidden bg-surface-2 border border-border/70 hover:-translate-y-1 hover:border-yellow-500/30 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between min-h-36 group"
        >
          <i
            class="fa-solid fa-triangle-exclamation absolute -right-4 -bottom-6 text-[10rem] text-yellow-500 opacity-[0.04] dark:opacity-[0.06] rotate-15 pointer-events-none group-hover:scale-110 group-hover:rotate-5 transition-transform duration-500"
          ></i>
          <div class="flex items-center justify-between z-10">
            <span
              class="text-xs font-bold text-secondary uppercase tracking-wider"
            >
              Priority Risk
            </span>
            <span
              class="text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                criticalCount > 0
                  ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse"
                  : "bg-surface text-secondary"
              }"
            >
              ${
                nearDeadlineCritical > 0
                  ? `${nearDeadlineCritical} Due Soon`
                  : "At Risk"
              }
            </span>
          </div>
          <div class="z-10 mt-3">
            <div
              class="text-3xl font-black ${
                criticalCount > 0 ? "text-yellow-400" : "text-primary"
              } tracking-tight"
            >
              ${criticalCount}
            </div>
            <p class="text-[11px] text-secondary/80 font-medium mt-1">
              High/Critical active items
            </p>
          </div>
        </div>

        <div
          class="col-span-2 md:col-span-1 relative overflow-hidden bg-surface-2 border border-border/70 hover:-translate-y-1 hover:border-purple-500/30 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between min-h-36 group"
        >
          <i
            class="fa-solid fa-layer-group absolute -right-4 -bottom-6 text-[10rem] text-purple-500 opacity-[0.04] dark:opacity-[0.06] rotate-20 pointer-events-none group-hover:scale-110 group-hover:rotate-10 transition-transform duration-500"
          ></i>
          <div class="flex items-center justify-between z-10">
            <span
              class="text-xs font-bold text-secondary uppercase tracking-wider"
              >Total Times</span
            >
            <span
              class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20"
              >${activeCount} Active</span
            >
          </div>
          <div class="z-10 mt-3">
            <div class="text-3xl font-black text-primary tracking-tight">
              ${totalTimesCount}
            </div>
            <p class="text-[11px] text-secondary/80 font-medium mt-1">
              Total execution units across all states
            </p>
          </div>
        </div>

        <div
          class="col-span-2 md:col-span-1 relative overflow-hidden bg-surface-2 border border-border/70 hover:-translate-y-1 hover:border-emerald-500/30 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between min-h-36 group"
        >
          <i
            class="fa-solid fa-circle-check absolute -right-4 -bottom-6 text-[10rem] text-emerald-500 opacity-[0.04] dark:opacity-[0.06] rotate-15 pointer-events-none group-hover:scale-110 group-hover:rotate-5 transition-transform duration-500"
          ></i>
          <div class="flex items-center justify-between z-10">
            <span
              class="text-xs font-bold text-secondary uppercase tracking-wider"
              >Completion Rate</span
            >
            <span
              class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              >${completedCount}/${activeCount} Done</span
            >
          </div>
          <div class="z-10 mt-3">
            <div class="text-3xl font-black text-primary tracking-tight">
              ${overallCompletionRate}%
            </div>
            <div
              class="w-1/4 h-1.5 bg-surface rounded-full overflow-hidden mt-2"
            >
              <div
                class="h-full bg-emerald-500 transition-all duration-500"
                style="width: ${overallCompletionRate}%"
              ></div>
            </div>
          </div>
        </div>

        <div
          class="col-span-2 md:col-span-1 relative overflow-hidden bg-surface-2 border border-border/70 hover:-translate-y-1 hover:border-orange-500/30 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between min-h-36 group"
        >
          <i
            class="fa-solid fa-alarm-exclamation absolute -right-4 -bottom-6 text-[10rem] text-orange-500 opacity-[0.04] dark:opacity-[0.06] rotate-15 pointer-events-none group-hover:scale-110 group-hover:rotate-5 transition-transform duration-500"
          ></i>
          <div class="flex items-center justify-between z-10">
            <span
              class="text-xs font-bold text-secondary uppercase tracking-wider"
              >Overdue Times</span
            >
            <span
              class="text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                overdueCount > 0
                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/20 animate-pulse"
                  : "bg-surface text-secondary"
              }"
            >
              ${overdueCount > 0 ? "Action Needed" : "All Clear"}
            </span>
          </div>
          <div class="z-10 mt-3">
            <div
              class="text-3xl font-black ${
                overdueCount > 0 ? "text-orange-400" : "text-primary"
              } tracking-tight"
            >
              ${overdueCount}
            </div>
            <p class="text-[11px] text-secondary/80 font-medium mt-1">
              ${
                overdueCount > 0
                  ? "Requires immediate attention"
                  : "No overdue deadlines"
              }
            </p>
          </div>
        </div>

        <div
          class="col-span-2 md:col-span-1 relative overflow-hidden bg-surface-2 border border-border/70 hover:-translate-y-1 hover:border-indigo-500/30 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between min-h-36 group"
        >
          <i
            class="fa-solid fa-list-check absolute -right-4 -bottom-6 text-[10rem] text-indigo-500 opacity-[0.04] dark:opacity-[0.06] rotate-15 pointer-events-none group-hover:scale-110 group-hover:rotate-5 transition-transform duration-500"
          ></i>
          <div class="flex items-center justify-between z-10">
            <span
              class="text-xs font-bold text-secondary uppercase tracking-wider"
              >Subtime Velocity</span
            >
            <span
              class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
              >${completedSubtimes}/${totalSubtimes} Units</span
            >
          </div>
          <div class="z-10 mt-3">
            <div class="text-3xl font-black text-primary tracking-tight">
              ${subtimeRate}%
            </div>
            <p class="text-[11px] text-secondary/80 font-medium mt-1">
              Micro-execution lifecycle progress
            </p>
          </div>
        </div>

        <div
          class="col-span-2 md:col-span-1 relative overflow-hidden bg-surface-2 border border-border/70 hover:-translate-y-1 hover:border-blue-500/30 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between min-h-36 group"
        >
          <i
            class="fa-solid fa-calendar-xmark absolute -right-4 -bottom-6 text-[10rem] text-blue-500 opacity-[0.04] dark:opacity-[0.06] rotate-15 pointer-events-none group-hover:scale-110 group-hover:rotate-5 transition-transform duration-500"
          ></i>
          <div class="flex items-center justify-between z-10">
            <span
              class="text-xs font-bold text-secondary uppercase tracking-wider"
              >Unscheduled Rate</span
            >
            <span
              class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20"
              >${unscheduledRate}% Backlog</span
            >
          </div>
          <div class="z-10 mt-3">
            <div class="text-3xl font-black text-primary tracking-tight">
              ${unscheduledCount}
            </div>
            <p class="text-[11px] text-secondary/80 font-medium mt-1">
              Active times without target deadline
            </p>
          </div>
        </div>

        <div
          class="col-span-2 md:col-span-1 relative overflow-hidden bg-surface-2 border border-border/70 hover:-translate-y-1 hover:border-red-500/30 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between min-h-36 group"
        >
          <i
            class="fa-solid fa-ban absolute -right-4 -bottom-6 text-[10rem] text-red-500 opacity-[0.04] dark:opacity-[0.06] rotate-15 pointer-events-none group-hover:scale-110 group-hover:rotate-5 transition-transform duration-500"
          ></i>
          <div class="flex items-center justify-between z-10">
            <span
              class="text-xs font-bold text-secondary uppercase tracking-wider"
              >Blocked Ratio</span
            >
            <span
              class="text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                BlockedCount > 0
                  ? "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse"
                  : "bg-surface text-secondary"
              }"
            >
              ${blockedRatio}% Bottleneck
            </span>
          </div>
          <div class="z-10 mt-3">
            <div
              class="text-3xl font-black ${
                BlockedCount > 0 ? "text-red-400" : "text-primary"
              } tracking-tight"
            >
              ${BlockedCount}
            </div>
            <p class="text-[11px] text-secondary/80 font-medium mt-1">
              Impeded times requiring resolution
            </p>
          </div>
        </div>

        <div
          class="col-span-2 md:col-span-1 relative overflow-hidden bg-surface-2 border border-border/70 hover:-translate-y-1 hover:border-brand/30 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between min-h-36 group"
        >
          <i
            class="fa-solid fa-tags absolute -right-4 -bottom-6 text-[10rem] text-brand/80 opacity-[0.04] dark:opacity-[0.06] rotate-15 pointer-events-none group-hover:scale-110 group-hover:rotate-5 transition-transform duration-500"
          ></i>
          <div class="flex items-center justify-between z-10">
            <span
              class="text-xs font-bold text-secondary uppercase tracking-wider"
              >Domain Focus</span
            >
            <span
              class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-brand/10 text-brand/80 border border-brand/20"
              >${topTagPercentage}% Concentration</span
            >
          </div>
          <div class="z-10 mt-3">
            <div
              class="text-2xl font-black text-brand/80 tracking-tight truncate max-w-45"
              title="${topTag[0]}"
            >
              <i class="fa-regular fa-tag text-base me-2"></i>${topTag[0]}
            </div>
            <p class="text-[11px] text-secondary/80 font-medium mt-1">
              Leading focus area (${topTag[1]} times)
            </p>
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
                  class="text-lg font-bold text-primary flex items-center gap-2"
                >
                  <i class="fa-regular fa-chart-network text-brand/80 text-xl"></i>
                  Sprint & Execution Heatmap
                </h4>
                <p class="text-xs text-secondary mt-1">
                  Time density velocity tracking across defined execution
                  windows.
                </p>
              </div>

              <div class="relative flex items-center justify-end">
                <button
                  id="heatmap-mobile-menu-toggle"
                  class="sm:hidden inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-surface text-secondary hover:text-primary transition shadow-sm cursor-pointer"
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
                class="text-lg font-bold text-primary flex items-center gap-2"
              >
                <i
                  class="fa-regular fa-chart-simple text-amber-400 text-xl"
                ></i>
                Distribution Trends
              </h4>
              <p class="text-xs text-secondary mt-1">
                Execution pattern mapped by days of week.
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
          class="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-3 gap-6 w-full col-span-2 sm:col-span-full mt-2"
        >
          <div
            class="col-span-4 lg:col-span-2 xl:col-span-1 bg-surface-2 border border-border/70 rounded-2xl p-6 flex flex-col justify-between"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <h4
                  class="text-lg font-bold text-primary flex items-center gap-2"
                >
                  <i
                    class="fa-regular fa-arrow-down-small-big text-amber-400 text-xl"
                  ></i>
                  Priority Breakdown
                </h4>
                <p class="text-xs text-secondary mt-1">
                  Proportional distribution of active times classified by
                  severity tier.
                </p>
              </div>
              <span
                class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0"
              >
                3 Levels
              </span>
            </div>

            <div
              class="w-full mt-6 overflow-x-auto scrollbar-thin scrollbar-thumb-surface"
            >
              <div
                id="apex-priority-chart"
                class="w-full"
              ></div>
            </div>
          </div>

          <div
            class="bg-surface-2 border border-border/70 rounded-2xl p-6 hidden xl:flex flex-col justify-between"
          >
            <div
              class="flex flex-wrap sm:flex-nowrap sm:items-center justify-between gap-4"
            >
              <div>
                <h4
                  class="text-lg font-bold text-primary flex items-center gap-2"
                >
                  <i class="fa-regular fa-tags text-sky-400 text-xl"></i>
                  Tag Velocity
                </h4>
                <p class="text-xs text-secondary mt-1">
                  Tag usage frequency vs completion rate.
                </p>
              </div>
            </div>

            <div
              class="w-full mt-6 overflow-x-auto scrollbar-thin scrollbar-thumb-surface"
            >
              <div
                id="apex-tag-chart"
                class="w-full"
              ></div>
            </div>
          </div>

          <div
            class="col-span-4 lg:col-span-2 xl:col-span-1 bg-surface-2 border border-border/70 rounded-2xl p-6 flex flex-col justify-between"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <h4
                  class="text-lg font-bold text-primary flex items-center gap-2"
                >
                  <i
                    class="fa-regular fa-bar-progress text-emerald-400 text-xl"
                  ></i>
                  Status Breakdown
                </h4>
                <p class="text-xs text-secondary mt-1">
                  Lifecycle stage mapping showing time allocation across
                  execution states.
                </p>
              </div>
              <span
                class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0"
              >
                4 States
              </span>
            </div>

            <div
              class="w-full mt-6 overflow-x-auto scrollbar-thin scrollbar-thumb-surface"
            >
              <div
                id="apex-status-chart"
                class="w-full"
              ></div>
            </div>
          </div>

          <div
            class="col-span-4 bg-surface-2 border border-border/70 rounded-2xl p-6 xl:hidden flex flex-col justify-center"
          >
            <div
              class="flex flex-wrap sm:flex-nowrap sm:items-center justify-between gap-4"
            >
              <div>
                <h4
                  class="text-lg font-bold text-primary flex items-center gap-2"
                >
                  <i class="fa-regular fa-tags text-sky-400 text-xl"></i>
                  Tag Velocity
                </h4>
                <p class="text-xs text-secondary mt-1">
                  Tag usage frequency vs completion rate.
                </p>
              </div>
            </div>

            <div
              class="w-full mt-6 overflow-x-auto scrollbar-thin scrollbar-thumb-surface"
            >
              <div
                id="apex-tag-chart-desktop"
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
                  class="text-lg font-bold text-primary flex items-center gap-2"
                >
                  <i class="fa-regular fa-sliders text-brand/80 text-xl"></i>
                  Time-Level Execution & Subtime Progress
                </h4>
                <p class="text-xs text-secondary/80 mt-0.5 font-medium">
                  Granular view of active work items, subtime ratios, and
                  milestone health.
                </p>
              </div>
              <span
                class="text-xs text-center font-semibold px-2.5 py-1 rounded-lg bg-surface border border-border text-secondary self-center sm:self-auto w-full sm:w-auto"
              >
                ${activeCount} Active Tracked (${archivedCount} Archived)
              </span>
            </div>

            <div class="mt-6 space-y-3">
              ${
                times.length === 0
                  ? `
                      <div
                        class="min-h-80 bg-surface border border-dashed border-border rounded-2xl p-16 text-center"
                      >
                        <div class="text-6xl mb-6">
                          <i
                            class="fa-regular fa-clipboard-list-check text-brand/60"
                          ></i>
                        </div>
                        <h2 class="text-2xl font-bold text-primary">
                          No active times
                        </h2>
                        <p class="mt-3 text-secondary max-w-sm mx-auto">
                          You're all caught up! Create a new time to get
                          started.
                        </p>
                      </div>
                    `
                  : times
                      .map((time) => {
                        const subtimeInfo = calculateSubtimeProgress(
                          time.subtimes,
                        );
                        const daysRemaining = getDaysRemaining(time.dueDate);
                        const overdue = isOverdue(time.dueDate, time.status);
                        const isDone = time.status === "done";
                        const absDays = Math.abs(daysRemaining);

                        const subtimeProgressColor =
                          subtimeInfo.percentage === 100
                            ? "bg-emerald-500/80"
                            : subtimeInfo.percentage <= 65 &&
                                subtimeInfo.percentage >= 35
                              ? "bg-amber-500/80"
                              : subtimeInfo.percentage <= 35 &&
                                  subtimeInfo.percentage > 0
                                ? "bg-red-500/80"
                                : subtimeInfo.percentage === 0
                                  ? "bg-slate-500/80"
                                  : "bg-brand/80";

                        const subtimePercentColor =
                          subtimeInfo.percentage === 100
                            ? "text-emerald-500/80"
                            : subtimeInfo.percentage <= 65 &&
                                subtimeInfo.percentage >= 35
                              ? "text-amber-500/80"
                              : subtimeInfo.percentage <= 35 &&
                                  subtimeInfo.percentage > 0
                                ? "text-red-500/80"
                                : subtimeInfo.percentage === 0
                                  ? "text-slate-500/80"
                                  : "text-brand/80";

                        let dueBadge = `<span class="text-secondary/60"
                          >No due date</span
                        >`;
                        if (time.dueDate) {
                          if (isDone) {
                            dueBadge = `
                              <span class="text-emerald-400 font-semibold">
                                <i class="fa-regular fa-calendar-check me-1"></i
                                >Completed (${time.dueDate})
                              </span>
                            `;
                          } else if (overdue || daysRemaining < 0) {
                            dueBadge = `
                              <span class="text-red-400 font-bold">
                                <i class="fa-regular fa-clock me-1"></i>Overdue
                                (${absDays}d ago)
                              </span>
                            `;
                          } else if (daysRemaining === 0) {
                            dueBadge = `
                              <span class="text-amber-400 font-bold">
                                <i class="fa-regular fa-clock me-1"></i>Due
                                Today
                              </span>
                            `;
                          } else {
                            dueBadge = `
                              <span class="text-secondary">
                                <i class="fa-regular fa-calendar me-1"></i
                                >${daysRemaining}d left
                              </span>
                            `;
                          }
                        }

                        const priorityBadgeStyles = {
                          low: "bg-lime-500/10 text-lime-400 border-lime-500/20",
                          medium:
                            "bg-amber-500/10 text-amber-400 border-amber-500/20",
                          high: "bg-red-500/10 text-red-400 border-red-500/20",
                        };

                        const statusBadgeStyles = {
                          todo: "bg-sky-500/10 text-sky-400 border-sky-500/20",
                          in_progress:
                            "bg-orange-500/10 text-orange-400 border-orange-500/20",
                          done: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                          blocked:
                            "bg-pink-500/10 text-pink-400 border-pink-500/20",
                        };

                        return `
                          <div
                            class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface/80 hover:bg-surface p-4 rounded-xl border border-border/40 transition"
                          >
                            <div class="flex flex-col gap-1.5 min-w-0 flex-1">
                              <div class="flex items-center gap-2 flex-wrap">
                                <span
                                  class="inline-flex items-center rounded px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider border ${
                                    statusBadgeStyles[time.status] ||
                                    statusBadgeStyles.todo
                                  }"
                                >
                                  ${(time.status || "todo").replace("_", " ")}
                                </span>

                                ${
                                  time.priority
                                    ? `
                                        <span
                                          class="inline-flex items-center rounded px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider border ${
                                            priorityBadgeStyles[
                                              time.priority
                                            ] || priorityBadgeStyles.low
                                          }"
                                        >
                                          ${time.priority}
                                        </span>
                                      `
                                    : ""
                                }
                                ${
                                  time.archived
                                    ? `<span
                                        class="inline-flex items-center rounded px-2 py-0.5 text-[9px] uppercase font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                        >Archived</span
                                      >`
                                    : ""
                                }
                              </div>

                              <h5
                                data-tooltip-title="${time.title}"
                                class="sm:hidden block text-sm font-bold text-primary truncate cursor-pointer"
                              >
                                ${time.title}
                              </h5>
                              <h5
                                class="hidden sm:flex text-sm font-bold text-primary"
                              >
                                ${time.title}
                              </h5>

                              ${
                                time.description
                                  ? `<p
                                        class="block md:hidden text-[11px] text-tertiary line-clamp-1 font-normal mb-2 truncate leading-tight cursor-pointer"
                                        data-tooltip-title="${time.description}"
                                      >
                                        ${time.description}
                                      </p>
                                      <p
                                        class="hidden md:flex text-[11px] text-tertiary line-clamp-1 font-normal mb-2 leading-tight"
                                        title="${time.description}"
                                      >
                                        ${time.description}
                                      </p>`
                                  : ""
                              }

                              <div
                                class="flex items-center gap-4 text-[11px] text-secondary/80 font-medium flex-wrap"
                              >
                                <span>${dueBadge}</span>
                                ${
                                  time.tags?.length
                                    ? `
                                        <div
                                          class="flex flex-wrap items-center gap-1"
                                        >
                                          ${state.tags
                                            .filter((t) =>
                                              time.tags.includes(t.id),
                                            )
                                            .map(
                                              (tag) => `
                                                <span
                                                  class="text-[9px] bg-surface-3/40 text-secondary px-1.5 py-0.5 rounded border border-border/40 whitespace-nowrap flex flex-row justify-center items-center gap-1"
                                                >
                                                  <i
                                                    class="fa-regular fa-tags"
                                                  ></i>
                                                  ${tag.name}
                                                </span>
                                              `,
                                            )
                                            .join("")}
                                        </div>
                                      `
                                    : ""
                                }
                              </div>
                            </div>

                            <div
                              class="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 border-border/40 pt-3 lg:pt-0 shrink-0"
                            >
                              <div class="flex flex-col gap-1 w-full sm:w-48">
                                <div
                                  class="flex flex-wrap sm:flex-nowrap justify-between items-center text-[11px]"
                                >
                                  <span class="text-secondary font-medium"
                                    >Subtimes</span
                                  >
                                  <span
                                    class="font-mono font-bold ${subtimePercentColor}"
                                    >${subtimeInfo.completedCount}/${subtimeInfo.totalCount}
                                    (${subtimeInfo.percentage}%)</span
                                  >
                                </div>
                                <div
                                  class="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden"
                                >
                                  <div
                                    class="h-full ${subtimeProgressColor} transition-all duration-300"
                                    style="width: ${subtimeInfo.percentage}%"
                                  ></div>
                                </div>
                              </div>

                              <div class="text-left sm:text-right">
                                <span
                                  class="text-[10px] text-secondary/60 block uppercase font-bold"
                                  >Created</span
                                >
                                <span
                                  class="text-xs font-mono font-medium text-primary"
                                  >${time.createdAt || "N/A"}</span
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
      </div>
    `;
  },
};
