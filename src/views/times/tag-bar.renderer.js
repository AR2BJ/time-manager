import { StateManager, state } from "@/models/state.model.js";

export function renderTagFilterBar() {
  const scrollContainer = document.getElementById("time-filter-scroll");
  if (!scrollContainer) return;

  const globalTags = StateManager.getTags() || [];

  const sortedTags = [...globalTags].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const selectedTag = state.selectedTag;

  if (!sortedTags.length) state.selectedTag = "all";

  let html = `
    <button
      data-tag="all"
      class="tag-filter-btn h-8 shrink-0 whitespace-nowrap rounded-lg px-3.5 text-xs font-semibold transition cursor-pointer ${
        selectedTag === "all"
          ? "bg-brand/80 text-white shadow-brand/10 shadow-sm"
          : "bg-surface border border-border text-secondary hover:text-primary hover:bg-surface-2"
      }"
    >
      All Times
    </button>
  `;

  sortedTags.forEach((tag) => {
    const isSelected = selectedTag === tag.id;

    html += `
      <button
        data-tag="${tag.id}"
        class="tag-filter-btn h-8 shrink-0 whitespace-nowrap rounded-lg px-3.5 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
          isSelected
            ? "bg-brand/80 text-white shadow-brand/10 shadow-sm"
            : "bg-surface border border-border text-secondary hover:text-primary hover:bg-surface-2"
        }"
      >
        <span class="flex flex-row justify-center items-center gap-1">
          <i
            class="fa-regular fa-tag ${
              isSelected ? "text-white" : "text-brand/70"
            } text-xs"
          ></i>
          ${tag.name}
        </span>
      </button>
    `;
  });

  scrollContainer.innerHTML = html;
}
