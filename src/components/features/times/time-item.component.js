import {
  calculateSubtimeProgress,
  getDaysRemaining,
  isOverdue,
  openSubtimesState,
} from "@/utils/helpers.js";

import { state } from "@/models/state.model";

export const TimeItemComponent = {
  render(time) {
    const isCompleted = time.status === "done";
    const isArchived = time.archived;

    const overdue = isOverdue(time.dueDate, time.status);
    const daysRemaining = getDaysRemaining(time.dueDate);

    let dueDateBadge = "";
    if (time.dueDate) {
      const absDays = Math.abs(daysRemaining);

      if (isCompleted) {
        dueDateBadge = `
      <span class="inline-flex items-center gap-1 rounded-md border border-border bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
        <i class="fa-regular fa-calendar-check"></i> ${time.dueDate}
      </span>
    `;
      } else if (overdue || daysRemaining < 0) {
        dueDateBadge = `
      <span class="inline-flex items-center gap-1 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-500 ${isArchived ? "" : "animate-pulse"}">
        <i class="fa-regular fa-clock"></i> Overdue (${absDays}d ago)
      </span>
    `;
      } else if (daysRemaining === 0) {
        dueDateBadge = `
      <span class="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500">
        <i class="fa-regular fa-clock"></i> Due Today
      </span>
    `;
      } else {
        dueDateBadge = `
      <span class="inline-flex items-center gap-1 rounded-md border border-border bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-secondary">
        <i class="fa-regular fa-calendar-day"></i> Due in ${daysRemaining}d
      </span>
    `;
      }
    }

    const priorityStyles = {
      low: "border-lime-500/20 bg-lime-500/10 text-lime-500/80",
      medium: "border-amber-500/20 bg-amber-500/10 text-amber-500/80",
      high: "border-red-500/20 bg-red-500/10 text-red-500/80",
    };
    const priorityClass = priorityStyles[time.priority] || priorityStyles.low;

    const statusStyles = {
      todo: "border-sky-500/20 bg-sky-500/10 text-sky-500/80",
      in_progress: "border-orange-500/20 bg-orange-500/10 text-orange-500/80",
      done: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500/80",
      blocked: "border-pink-500/20 bg-pink-500/10 text-pink-500/80",
    };
    const statusClass = statusStyles[time.status] || statusStyles.todo;

    const subtimeProgress = calculateSubtimeProgress(time.subtimes);
    const hasSubtimes =
      Array.isArray(time.subtimes) && time.subtimes.length > 0;

    const subtimeProgressColor =
      subtimeProgress.percentage === 100
        ? "bg-emerald-500/80"
        : subtimeProgress.percentage <= 65 && subtimeProgress.percentage >= 35
          ? "bg-amber-500/80"
          : subtimeProgress.percentage <= 35 && subtimeProgress.percentage > 0
            ? "bg-red-500/80"
            : subtimeProgress.percentage === 0
              ? "bg-slate-500/80"
              : "bg-brand/80";

    const subtimePercentColor =
      subtimeProgress.percentage === 100
        ? "text-emerald-500/80"
        : subtimeProgress.percentage <= 65 && subtimeProgress.percentage >= 35
          ? "text-amber-500/80"
          : subtimeProgress.percentage <= 35 && subtimeProgress.percentage > 0
            ? "text-red-500/80"
            : subtimeProgress.percentage === 0
              ? "text-slate-500/80"
              : "text-brand/80";

    const actionButtonClass = isArchived
      ? "restore-btn hover:bg-emerald-600/10"
      : "archive-btn hover:bg-amber-600/10";
    const actionTooltip = isArchived ? "Restore" : "Archive";
    const actionIcon = isArchived
      ? "fa-arrow-rotate-left text-emerald-500/80"
      : "fa-box-archive text-amber-500/80";

    const checkTooltip = isCompleted ? "Uncheck Time" : "Check Time";
    const isExpanded = openSubtimesState.has(time.id);

    return `
      <div
        data-id="${time.id}"
        class="time-item group relative flex flex-col gap-4 p-3 md:p-4 rounded-xl bg-surface-2/40 hover:bg-surface-2/60 transition-all"
      >
        <div
          class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div
            class="flex flex-wrap sm:flex-nowrap justify-start items-start gap-3 min-w-0 flex-1"
          >
            <div class="relative shrink-0">
              ${
                isArchived
                  ? ""
                  : `
                      <button
                        data-id="${time.id}"
                        class="toggle-btn w-9 h-9 shrink-0 rounded-lg border-2 flex items-center justify-center transition peer hover:cursor-pointer ${
                          isCompleted
                            ? "bg-brand/80 border-brand/80 text-(--color-btn-primary-text) shadow-lg shadow-brand/20"
                            : "border-border text-secondary hover:border-brand/80 hover:text-brand/80"
                        }"
                      >
                        <i
                          class="fa-regular ${
                            isCompleted
                              ? "fa-check text-sm md:text-base font-bold"
                              : "fa-square text-sm"
                          }"
                        ></i>
                      </button>
                    `
              }
              <div
                class="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-surface-2 text-xs text-primary opacity-0 cursor-default peer-hover:opacity-100 transition z-10 whitespace-nowrap pointer-events-none border border-border/60"
              >
                ${checkTooltip}
              </div>
            </div>

            <div class="flex flex-col min-w-0 w-full gap-1.5 pe-12">
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  class="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider ${priorityClass}"
                >
                  ${time.priority || "low"}
                </span>

                <span
                  class="inline-flex items-center rounded-md border ${statusClass} px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider"
                >
                  ${(time.status || "todo").replace("_", " ")}
                </span>

                ${dueDateBadge}
                ${(state.tags.filter((t) => time.tags.includes(t.id)) || [])
                  .map(
                    (tag) => `
                      <span
                        class="inline-flex items-center gap-1 rounded-md border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-secondary tracking-wider"
                      >
                        <i class="fa-regular fa-tag"></i>
                        ${tag.name}
                      </span>
                    `,
                  )
                  .join("")}
              </div>

              <h2
                class="text-sm lg:text-base font-bold mt-2 text-primary tracking-tight leading-snug wrap-break-word ${
                  isCompleted ? "line-through opacity-60" : ""
                }"
              >
                ${time.title}
              </h2>

              ${
                time.description
                  ? `<p
                      class="text-xs lg:text-sm text-secondary/90 leading-relaxed wrap-break-word"
                    >
                      ${time.description}
                    </p>`
                  : ""
              }

              <div class="flex items-center gap-3 mt-2 text-[11px] lg:text-xs text-muted">
                <span
                  ><i class="fa-regular fa-clock me-1"></i>Created
                  ${time.createdAt}</span
                >
                ${
                  time.completedAt
                    ? `<span class="text-emerald-500/80"
                        ><i class="fa-regular fa-circle-check me-1"></i
                        >Completed ${time.completedAt}</span
                      >`
                    : ""
                }
              </div>

              ${
                time.updatedAt
                  ? `<div
                      class="flex items-center gap-3 mt-1 text-[11px] lg:text-xs italic text-secondary"
                    >
                      <span
                        ><i class="fa-regular fa-calendar-lines-pen  me-1"></i
                        >Updated ${time.updatedAt}</span
                      >
                    </div>`
                  : ""
              }
            </div>
          </div>

          <div
            class="absolute top-3 right-3 md:static flex self-start md:top-auto md:right-auto z-20 shrink-0"
          >
            <div class="hidden md:flex items-center gap-2">
              <div class="relative">
                <button
                  data-id="${time.id}"
                  class="${actionButtonClass} w-9 h-9 rounded-lg bg-surface-2 border border-border flex items-center justify-center hover:cursor-pointer peer transition"
                >
                  <i class="fa-regular ${actionIcon} text-base"></i>
                </button>
                <div
                  class="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-surface-2 text-xs text-primary opacity-0 cursor-default peer-hover:opacity-100 transition z-10"
                >
                  ${actionTooltip}
                </div>
              </div>

              <div class="relative">
                <button
                  data-id="${time.id}"
                  class="edit-btn w-9 h-9 rounded-lg bg-surface-2 hover:bg-blue-600/10 border border-border flex items-center justify-center hover:cursor-pointer peer transition"
                >
                  <i
                    class="fa-regular fa-pen-to-square text-blue-500/80 text-base"
                  ></i>
                </button>
                <div
                  class="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-surface-2 text-xs text-primary opacity-0 cursor-default peer-hover:opacity-100 transition z-10 whitespace-nowrap pointer-events-none border border-border/60"
                >
                  Edit
                </div>
              </div>

              <div class="relative">
                <button
                  data-id="${time.id}"
                  class="delete-btn w-9 h-9 rounded-lg bg-surface-2 hover:bg-red-600/10 border border-border flex items-center justify-center hover:cursor-pointer peer transition"
                >
                  <i
                    class="fa-regular fa-trash-can text-red-500/80 text-base"
                  ></i>
                </button>
                <div
                  class="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-surface-2 text-xs text-primary opacity-0 cursor-default peer-hover:opacity-100 transition z-10 whitespace-nowrap pointer-events-none border border-border/60"
                >
                  Delete
                </div>
              </div>
            </div>

            <div class="flex md:hidden relative dropdown-container">
              <button
                data-id="${time.id}"
                class="dropdown-toggle-btn h-9 w-9 rounded-lg border border-border text-secondary hover:text-primary hover:bg-surface flex items-center justify-center transition shadow-sm cursor-pointer"
              >
                <i class="fa-regular fa-ellipsis-vertical text-lg"></i>
              </button>

              <div
                data-id="${time.id}"
                class="dropdown-menu absolute right-0 mt-1.5 w-45 rounded-xl border border-border bg-surface p-1 shadow-xl hidden z-30 flex-col gap-0.5"
              >
                <button
                  data-id="${time.id}"
                  class="${
                    isArchived ? "restore-btn" : "archive-btn"
                  } flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium border-0 bg-transparent text-secondary hover:text-primary hover:bg-surface-2 transition cursor-pointer"
                >
                  <i class="fa-regular ${actionIcon} text-xs"></i>
                  <span>${isArchived ? "Restore Time" : "Archive Time"}</span>
                </button>

                <button
                  data-id="${time.id}"
                  class="edit-btn flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium border-0 bg-transparent text-secondary hover:text-primary hover:bg-surface-2 transition cursor-pointer"
                >
                  <i
                    class="fa-regular fa-pen-to-square text-xs text-blue-500/80"
                  ></i>
                  <span>Edit Title</span>
                </button>

                <div class="my-0.5 border-t border-border/40"></div>

                <button
                  data-id="${time.id}"
                  class="delete-btn flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium border-0 bg-transparent text-red-500/80 hover:bg-red-500/5 transition cursor-pointer"
                >
                  <i class="fa-regular fa-trash-can text-xs"></i>
                  <span>Delete Permanently</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        ${
          hasSubtimes
            ? `
                <div class="mt-2 border-t border-border/60 pt-2">
                  <button
                    type="button"
                    data-time-id="${time.id}"
                    class="toggle-subtimes-btn w-full flex flex-wrap sm:flex-nowrap items-center justify-between gap-5 p-2 rounded-md hover:bg-surface-3/40 transition cursor-pointer group/sub-hdr text-left"
                  >
                    <div
                      class="w-full sm:w-fit flex justify-center xs:justify-start items-center gap-2"
                    >
                      <i class="fa-regular fa-list-check text-brand/80"></i>
                      <span
                        class="text-[11px] sm:text-xs font-bold text-secondary group-hover/sub-hdr:text-primary transition"
                      >
                        Subtimes
                        (${subtimeProgress.completedCount}/${subtimeProgress.totalCount})
                      </span>
                    </div>

                    <div class="w-full sm:w-fit flex items-center gap-3">
                      <div
                        class="w-full sm:w-32 h-1.5 rounded-full bg-surface-2 overflow-hidden"
                      >
                        <div
                          class="h-full ${subtimeProgressColor} transition-all duration-300"
                          style="width: ${subtimeProgress.percentage}%"
                        ></div>
                      </div>

                      <span
                        class="text-[11px] font-mono font-bold ${subtimePercentColor}"
                        >${subtimeProgress.percentage}%</span
                      >

                      <div
                        class="subtime-chevron w-5 h-5 rounded-md flex items-center justify-center text-secondary group-hover/sub-hdr:text-primary transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }"
                      >
                        <i class="fa-regular fa-chevron-down text-xs"></i>
                      </div>
                    </div>
                  </button>

                  <div
                    id="subtimes-container-${time.id}"
                    class="subtimes-dropdown-body ${
                      isExpanded ? "" : "hidden"
                    } animate-slide-down space-y-1.5 pt-2 ps-1 pe-1"
                  >
                    ${time.subtimes
                      .map(
                        (st) => `
                      <div
                        class="flex items-center justify-between gap-1 group/st rounded-lg p-2 hover:bg-surface-2/60 border border-transparent hover:border-border/50 transition cursor-pointer"
                      >
                        <div
                          class="relative flex flex-row justify-start items-center gap-2 shrink-0 min-w-0 flex-1"
                        >
                          ${
                            isArchived
                              ? ""
                              : `
                          <button
                            type="button"
                            data-time-id="${time.id}"
                            data-subtime-id="${st.id}"
                            class="subtime-toggle w-6 h-6 shrink-0 rounded-md border-2 flex items-center justify-center transition peer hover:cursor-pointer ${
                              st.completed
                                ? "bg-brand/80 border-brand/80 text-(--color-btn-primary-text) shadow-lg shadow-brand/20"
                                : "border-border text-secondary hover:border-brand/80 hover:text-brand/80"
                            }"
                          >
                            <i class="fa-regular ${st.completed ? "fa-check text-xs md:text-sm font-bold" : "fa-square text-[10px]"}"></i>
                          </button>
              `
                          }

                          <span
                            data-time-id="${time.id}"
                            data-subtime-id="${st.id}"
                            class="subtime-toggle text-sm text-primary truncate ${
                              st.completed ? "line-through opacity-50" : ""
                            }"
                          >
                            ${st.title}
                          </span>
                        </div>
                      </div>
                    `,
                      )
                      .join("")}
                  </div>
                </div>
              `
            : ""
        }
      </div>
    `;
  },
};
