import { TaskModel } from "@/models/task.model";

export const TaskModalComponent = {
  render() {
    const tasks = TaskModel.getTasks();

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
                <h3 class="text-base font-bold text-primary">
                  Select Active Task
                </h3>
                <p class="text-xs text-secondary">
                  Choose an existing task, manage, or create a new item.
                </p>
              </div>
            </div>

            <button
              id="close-task-modal"
              type="button"
              class="w-8 h-8 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer"
            >
              <i class="fa-regular fa-xmark text-sm"></i>
            </button>
          </div>

          <form
            id="form-create-task"
            class="pb-4 border-b border-border flex flex-col gap-3 shrink-0"
          >
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label
                  for="input-task-title"
                  class="block text-xs font-semibold text-secondary mb-1 ps-1"
                >
                  Create New Task Title
                </label>
                <input
                  id="input-task-title"
                  type="text"
                  required
                  maxlength="60"
                  placeholder="E.g., Design System Refactoring"
                  class="w-full h-10 rounded-xl bg-surface-2 border border-border px-3 text-xs text-primary placeholder:text-muted focus:outline-none focus:border-brand transition"
                />
              </div>
              <div>
                <label
                  for="input-task-pomo"
                  class="block text-xs font-semibold text-secondary mb-1 ps-1"
                >
                  Est. Pomodoros (Max 20)
                </label>
                <input
                  id="input-task-pomo"
                  type="text"
                  inputmode="numeric"
                  value="1"
                  maxlength="2"
                  class="w-full h-10 rounded-xl bg-surface-2 border border-border px-3 text-xs text-primary focus:outline-none focus:border-brand transition"
                />
              </div>
            </div>

            <div class="flex items-end">
              <button
                type="submit"
                class="w-full h-10 rounded-xl bg-brand hover:bg-(--color-brand-hover) text-white font-semibold text-xs transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                <i class="fa-regular fa-plus"></i> Add & Select
              </button>
            </div>
          </form>

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
                    .map(
                      (t) => `
                        <div
                          data-task-id="${t.id}"
                          class="task-item-row group flex items-center justify-between p-3 rounded-2xl bg-surface-2 border border-border hover:border-brand/40 transition cursor-pointer"
                        >
                          <div class="flex items-center gap-2 min-w-0">
                            <span
                              class="text-xs font-semibold text-primary truncate"
                              >${t.title}</span
                            >
                          </div>

                          <div class="flex items-center gap-2 shrink-0">
                            <span
                              class="text-[10px] font-bold text-brand bg-brand/10 px-2 py-1.25 rounded-md border border-brand/20"
                            >
                              ${
                                t.completedPomodoros || 0
                              }/${t.estimatedPomodoros || 1}
                              Pomo
                            </span>
                            <button
                              type="button"
                              data-delete-task-id="${t.id}"
                              class="btn-delete-task w-7 h-7 rounded-lg bg-surface-2 hover:bg-red-600/10 border border-border flex items-center justify-center hover:cursor-pointer peer transition"
                              title="Delete Task"
                            >
                              <i
                                class="fa-regular fa-trash-can text-red-500/80 text-xs"
                              ></i>
                            </button>
                          </div>
                        </div>
                      `,
                    )
                    .join("")
            }
          </div>
        </div>
      </div>
    `;
  },
};
