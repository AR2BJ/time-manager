const TOOLTIP_ID = "time-mobile-tooltip";

function removeTooltip() {
  const existing = document.getElementById(TOOLTIP_ID);
  if (existing) existing.remove();
}

function createTooltip(text) {
  removeTooltip();

  const tooltip = document.createElement("div");
  tooltip.id = TOOLTIP_ID;
  tooltip.className =
    "max-w-70 fixed z-50 flex justify-center items-center rounded-lg border border-white/10 bg-slate-900/95 px-2.5 py-1.5 text-[11px] font-medium leading-5 text-white shadow-xl pointer-events-none";
  tooltip.innerHTML = `<span class="max-w-full wrap-break-word">${text}</span>`;

  document.body.appendChild(tooltip);
  return tooltip;
}

function positionTooltip(target, tooltip) {
  const rect = target.getBoundingClientRect();
  const width = tooltip.offsetWidth || 180;
  let left = Math.min(rect.left, window.innerWidth - width - 12);
  left = Math.max(12, left);

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${rect.bottom + 8}px`;
}

function showTooltip(target) {
  const title = target?.dataset?.tooltipTitle;
  if (!title) return;

  const tooltip = createTooltip(title);
  positionTooltip(target, tooltip);

  const onScroll = () => {
    removeTooltip();
    window.removeEventListener("scroll", onScroll, { passive: true });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  setTimeout(removeTooltip, 3000);
}

function findTooltipTarget(element) {
  return element.closest("[data-tooltip-title]");
}

function handleClick(event) {
  const target = findTooltipTarget(event.target);
  if (target) showTooltip(target);
}

function handleKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  const target = findTooltipTarget(event.target);
  if (!target) return;

  event.preventDefault();
  showTooltip(target);
}

export const TooltipController = {
  init() {
    this.unbind();
    this.bind();
  },

  bind(root = document.body) {
    const container =
      typeof root === "string" ? document.querySelector(root) : root;
    if (!container) return;

    container.addEventListener("click", handleClick);
    container.addEventListener("keydown", handleKeydown);
  },

  unbind(root = document.body) {
    const container =
      typeof root === "string" ? document.querySelector(root) : root;
    if (!container) return;

    container.removeEventListener("click", handleClick);
    container.removeEventListener("keydown", handleKeydown);
  },
};
