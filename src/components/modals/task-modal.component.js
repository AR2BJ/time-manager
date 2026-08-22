import { TaskService } from "@/services/task.service.js";

export const TaskModalComponent = {
  render(editingTask = null) {
    const tasks = TaskService.getTasks();
    const activeTask = TaskService.getActiveTask();
    const activeTaskId = activeTask ? String(activeTask.id) : null;

    const isEditing = Boolean(editingTask);

    return `
      <div
        id="task-modal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      >
        <div
          id="task-modal-backdrop"
          class="absolute inset-0 cursor-pointer"
        ></div>

        <div
          class="relative w-full max-w-xl bg-surface border border-border rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85dvh]"
        >
          <div
            class="flex items-center justify-between border-b border-border pb-4 mb-4 shrink-0"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center text-base shrink-0"
              >
                <i class="fa-regular fa-bullseye-arrow"></i>
              </div>
              <div>
                <h3 class="text-base font-bold text-color">
                  ${isEditing ? "Edit Task" : "Select Active Task"}
                </h3>
                <p class="text-xs text-secondary">
                  ${
                    isEditing
                      ? "Update task details below."
                      : "Choose an existing task, manage, or create a new item."
                  }
                </p>
              </div>
            </div>

            <button
              id="close-task-modal"
              type="button"
              class="w-8 h-8 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-secondary hover:text-color flex items-center justify-center transition cursor-pointer"
            >
              <i class="fa-regular fa-xmark text-sm"></i>
            </button>
          </div>

          <div class="pb-4 border-b border-border flex flex-col gap-3 shrink-0">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label
                  for="input-task-title"
                  class="block text-xs font-semibold text-secondary mb-1 ps-1"
                >
                  ${isEditing ? "Task Title" : "Create New Task Title"}
                </label>
                <input
                  id="input-task-title"
                  type="text"
                  maxlength="60"
                  value="${isEditing ? editingTask.title : ""}"
                  placeholder="E.g., Design System Refactoring"
                  class="w-full h-10 rounded-xl bg-surface-2 border border-border px-3 text-xs text-color placeholder:text-muted focus:outline-none focus:border-brand transition"
                />
              </div>
              <div>
                <label
                  for="input-task-focus-units"
                  class="block text-xs font-semibold text-secondary mb-1 ps-1"
                >
                  Est. Units (Max 20)
                </label>
                <input
                  id="input-task-focus-units"
                  type="text"
                  inputmode="numeric"
                  value="${isEditing ? editingTask.estimatedFocusUnits : "1"}"
                  maxlength="2"
                  class="w-full h-10 rounded-xl bg-surface-2 border border-border px-3 text-xs text-color focus:outline-none focus:border-brand transition"
                />
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                id="btn-submit-task"
                type="button"
                class="flex-1 h-10 rounded-xl bg-brand hover:bg-(--color-brand-hover) text-white font-semibold text-xs transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                ${
                  isEditing
                    ? `<i class="fa-regular fa-check"></i> Save Changes`
                    : `<i class="fa-regular fa-plus"></i> Add & Select`
                }
              </button>

              ${
                isEditing
                  ? `<button
                      id="btn-cancel-edit"
                      type="button"
                      class="h-10 px-4 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-secondary text-xs font-semibold transition cursor-pointer"
                     >
                       Cancel
                     </button>`
                  : ""
              }
            </div>
          </div>

          <div
            class="flex-1 overflow-y-auto mt-4 pe-1 space-y-2 max-h-48 scrollbar-thin scrollbar-thumb-surface-2"
          >
            ${
              tasks.length === 0
                ? `<div
                    class="w-full h-full min-h-40 sm:min-h-30 lg:min-h-20 overflow-y-auto scrollbar-thumb-surface-2 scrollbar-thin bg-surface-2 rounded-2xl border border-dashed border-border p-4 text-center flex flex-col justify-center items-center"
                  >
                    <div
                      class="h-full flex flex-col justify-center items-center"
                    >
                      <div class="text-3xl">
                        <i class="fa-regular fa-clipboard-list-check text-brand/60"></i>
                      </div>
                      <p class="mt-3 text-secondary max-w-sm mx-auto text-sm">
                        No task defined yet.
                      </p>
                    </div>
                  </div>`
                : tasks
                    .map((t) => {
                      const isActive = String(t.id) === activeTaskId;
                      const isDone = t.status === "done";

                      return `
                        <div
                          data-task-id="${t.id}"
                          data-is-done="${isDone}"
                          class="task-item-row group flex items-center justify-between p-3 rounded-2xl transition border ${
                            isDone
                              ? "bg-surface-2/60 border-border cursor-not-allowed select-none"
                              : isActive
                                ? "bg-brand/5 border-brand/60 shadow-xs cursor-pointer"
                                : "bg-surface-2 border-border hover:border-brand/40 cursor-pointer"
                          }"
                        >
                          <div
                            class="flex items-center gap-2.5 min-w-0 ${
                              isDone ? "opacity-50 pointer-events-none" : ""
                            }"
                          >
                            ${
                              isActive
                                ? `<span
                                    class="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center text-[10px] shrink-0 shadow-xs"
                                  >
                                    <i class="fa-solid fa-check"></i>
                                  </span>`
                                : ""
                            }
                            <span
                              class="text-xs font-semibold truncate ${
                                isActive ? "text-brand font-bold" : "text-color"
                              } ${isDone ? "line-through text-muted" : ""}"
                            >
                              ${t.title}
                            </span>
                          </div>

                          <div class="flex items-center gap-2 shrink-0">
                            <span
                              class="text-[10px] font-bold ${
                                isDone
                                  ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                                  : isActive
                                    ? "text-brand bg-brand/15 border-brand/30"
                                    : "text-brand bg-brand/10 border-brand/20"
                              } px-2 py-1.25 rounded-md border ${
                                isDone ? "opacity-50" : ""
                              }"
                            >
                              ${
                                isDone
                                  ? "Completed"
                                  : `${t.completedFocusUnits || 0}/${t.estimatedFocusUnits || 1} Units`
                              }
                            </span>

                            ${
                              !isDone
                                ? `
                                    <button
                                      type="button"
                                      data-edit-task-id="${t.id}"
                                      class="btn-edit-task w-7 h-7 rounded-lg bg-surface-2 hover:bg-blue-600/10 border border-border flex items-center justify-center hover:cursor-pointer transition text-secondary"
                                      title="Edit Task"
                                    >
                                      <i
                                        class="fa-regular fa-pen-to-square text-blue-500/80 text-xs"
                                      ></i>
                                    </button>
                                  `
                                : ""
                            }

                            <button
                              type="button"
                              data-delete-task-id="${t.id}"
                              class="btn-delete-task w-7 h-7 rounded-lg bg-surface-2 hover:bg-red-600/10 border border-border flex items-center justify-center hover:cursor-pointer transition"
                              title="Delete Task"
                            >
                              <i
                                class="fa-regular fa-trash-can text-red-500/80 text-xs"
                              ></i>
                            </button>
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
