import { state } from "@/models/state.model.js";

export const TimeCardComponent = {
  render(time, options = {}) {
    const { headerExtraHtml = "", footerExtraHtml = "" } = options;

    const statusAccent =
      {
        todo: "bg-sky-500",
        in_progress: "bg-amber-500",
        done: "bg-emerald-500",
        blocked: "bg-rose-500",
      }[time.status] || "bg-sky-500";

    const priorityStyles = {
      low: "border-lime-500/20 bg-lime-500/10 text-lime-500/80",
      medium: "border-amber-500/20 bg-amber-500/10 text-amber-500/80",
      high: "border-red-500/20 bg-red-500/10 text-red-500/80",
    };
    const priorityClass = priorityStyles[time.priority] || priorityStyles.low;

    const matchedTags = state.tags.filter((t) => time.tags?.includes(t.id));
    const visibleTag = matchedTags[0];

    return `
      <div
        class="group relative w-full min-h-31 flex flex-col justify-between p-2 rounded-xl bg-surface hover:bg-surface-2 border border-border/60 hover:border-brand/40 transition-all duration-200 shadow-sm overflow-hidden"
      >
        <div class="absolute top-0 left-0 bottom-0 w-1 ${statusAccent}"></div>

        <div
          class="pe-1 ps-1.5 flex flex-col justify-between h-full w-full min-w-0"
        >
          <div>
            <div class="flex items-center justify-between gap-1 mb-1.5 min-w-0">
              <div class="flex items-center gap-1 min-w-0 truncate">
                <span
                  class="text-[9px] font-extrabold uppercase tracking-wider text-secondary truncate"
                >
                  ${(time.status || "todo").replace("_", " ")}
                </span>
                <span
                  class="inline-flex items-center rounded border px-1 py-0.2 text-[8px] uppercase font-bold tracking-wider ${priorityClass} shrink-0"
                >
                  ${time.priority || "low"}
                </span>
              </div>

              <div class="shrink-0">${headerExtraHtml}</div>
            </div>

            <h4
              class="block lg:hidden text-xs font-bold text-primary group-hover:text-brand transition-colors truncate mb-1 cursor-pointer"
              data-tooltip-title="${time.title}"
            >
              ${time.title}
            </h4>
            <h4
              class="hidden lg:block text-xs font-bold text-primary group-hover:text-brand transition-colors truncate mb-1"
              title="${time.title}"
            >
              ${time.title}
            </h4>

            ${
              time.description
                ? `<p
                    class="block xl:hidden text-[11px] text-tertiary truncate font-normal mb-1.5 cursor-pointer"
                    data-tooltip-title="${time.description}"
                  >
                    ${time.description}
                  </p>
                  <p
                    class="hidden xl:block text-[11px] text-tertiary truncate font-normal mb-1.5"
                    title="${time.description}"
                  >
                    ${time.description}
                  </p>`
                : ""
            }
          </div>

          <div
            class="flex items-center justify-between pt-2 mt-1 border-t border-border/40 text-[10px] text-secondary gap-1.5 w-full min-w-0 shrink-0"
          >
            ${
              footerExtraHtml
                ? `<div
                    class="shrink-0 font-medium text-[10px] text-secondary/90"
                  >
                    ${footerExtraHtml}
                  </div>`
                : ""
            }

            <div
              class="${
                footerExtraHtml
                  ? "flex justify-end"
                  : "w-full flex justify-between"
              } items-center gap-1.5 shrink-0 min-w-0"
            >
              ${
                time.dueDate
                  ? `
                    <span
                      class="text-[10px] text-tertiary font-medium flex items-center gap-0.5 whitespace-nowrap shrink-0"
                    >
                      <i class="fa-regular fa-clock text-[10px]"></i>
                      ${time.dueDate}
                    </span>
                  `
                  : ""
              }
              ${
                matchedTags.length > 0
                  ? `
                      <div class="flex items-center gap-1 shrink-0">
                        <span
                          class="hidden sm:inline-flex text-[10px] bg-surface-3/40 text-secondary p-0.5 rounded border border-border/40 whitespace-nowrap truncate items-center gap-1"
                          title="${visibleTag.name}"
                        >
                          <i class="fa-regular fa-tags"></i>
                          ${visibleTag.name}
                        </span>

                        ${
                          matchedTags.length > 1
                            ? `<span
                                class="hidden sm:inline-flex text-[10px] bg-surface-3/60 hover:bg-surface-2 text-secondary p-0.5 rounded border border-border/40 font-mono font-bold cursor-pointer"
                                data-tooltip-title="${matchedTags
                                  .slice(1)
                                  .map((t) => t.name)
                                  .join(", ")}"
                              >
                                +${matchedTags.length - 1}
                              </span>`
                            : ""
                        }

                        <span
                          class="sm:hidden inline-flex text-[10px] bg-surface-3/60 hover:bg-surface-2 text-secondary p-0.5 rounded border border-border/40 font-mono font-bold cursor-pointer items-center gap-0.5"
                          data-tooltip-title="${matchedTags
                            .map((t) => t.name)
                            .join(", ")}"
                        >
                          <i class="fa-regular fa-tags"></i>
                          +${matchedTags.length}
                        </span>
                      </div>
                    `
                  : ""
              }
            </div>
          </div>
        </div>
      </div>
    `;
  },
};
