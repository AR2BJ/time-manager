import { TimeCardComponent } from "@/components/shared/time-card.component";

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function renderMonthGrid(currentDate, times) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();

  const startDayOfWeek = (firstDay.getDay() + 1) % 7;
  const todayStr = formatDateKey(new Date());

  const timesMap = new Map();
  times.forEach((t) => {
    if (!t.dueDate) return;
    const key = t.dueDate;
    if (!timesMap.has(key)) timesMap.set(key, []);
    timesMap.get(key).push(t);
  });

  const weekdays = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

  let cellsHtml = "";

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevDayNum = prevMonthLastDay - i;
    cellsHtml += `
      <div class="bg-surface border border-border/30 min-h-12 sm:min-h-28 rounded-xl opacity-50 p-1 sm:p-2 cursor-not-allowed select-none">
        <span class="text-[10px] sm:text-xs font-bold text-tertiary">${prevDayNum}</span>
      </div>
    `;
  }

  for (let day = 1; day <= totalDays; day++) {
    const cellDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const isToday = cellDateStr === todayStr;
    const dayTimes = timesMap.get(cellDateStr) || [];

    cellsHtml += `
      <div 
        class="group flex flex-col justify-between border border-border/70 min-h-12 sm:min-h-28 rounded-lg sm:rounded-xl p-1 sm:p-2 bg-surface hover:border-brand/50 transition cursor-pointer ${isToday ? "ring-2 ring-brand/80 bg-brand/5" : ""}"
        data-calendar-date="${cellDateStr}"
      >
        <div class="flex justify-between items-center mb-0.5 sm:mb-1">
          <span class="text-[10px] sm:text-xs font-black ${isToday ? "text-brand/80" : "text-primary"}">${day}</span>
          ${
            dayTimes.length > 0
              ? `<span class="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.2 rounded bg-brand/10 text-brand/80">${dayTimes.length}</span>`
              : ""
          }
        </div>

        <div class="hidden sm:flex flex-1 flex-col gap-1 overflow-y-auto max-h-20 scrollbar-none">
          ${dayTimes
            .slice(0, 2)
            .map((time) => {
              const priorityStyles = {
                high: "border-red-500/30 bg-red-500/10 text-red-400",
                medium: "border-amber-500/30 bg-amber-500/10 text-amber-400",
                low: "border-lime-500/30 bg-lime-500/10 text-lime-400",
              };
              const pStyle =
                priorityStyles[time.priority] || priorityStyles.low;

              return `
              <div 
                class="text-[10px] font-bold truncate px-1.5 py-0.5 rounded border ${pStyle} transition hover:scale-[1.02]" 
                title="${time.title}"
              >
                ${time.title}
              </div>
            `;
            })
            .join("")}
          ${dayTimes.length > 2 ? `<div class="text-[9px] font-bold text-tertiary ps-1">+${dayTimes.length - 2} more</div>` : ""}
        </div>

        <div class="flex sm:hidden flex-wrap items-center justify-center gap-0.5 mt-auto pt-1">
          ${dayTimes
            .slice(0, 3)
            .map((time) => {
              const priorityDots = {
                high: "bg-red-500",
                medium: "bg-amber-500",
                low: "bg-lime-500",
              };
              const dotBg = priorityDots[time.priority] || priorityDots.low;
              return `<span class="w-1.5 h-1.5 rounded-full ${dotBg}"></span>`;
            })
            .join("")}
          ${dayTimes.length > 3 ? `<span class="w-1 h-1 rounded-full bg-tertiary"></span>` : ""}
        </div>
      </div>
    `;
  }

  const totalRenderedCells = startDayOfWeek + totalDays;
  for (
    let nextDayNum = 1;
    totalRenderedCells + nextDayNum - 1 < (totalRenderedCells > 35 ? 42 : 35);
    nextDayNum++
  ) {
    cellsHtml += `
      <div class="bg-surface border border-border/30 min-h-12 sm:min-h-28 rounded-xl opacity-50 p-1 sm:p-2 cursor-not-allowed select-none">
        <span class="text-[10px] sm:text-xs font-bold text-tertiary">${nextDayNum}</span>
      </div>
    `;
  }

  return `
    <div class="flex flex-col gap-2 sm:gap-3">
      <div class="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs font-bold text-tertiary uppercase tracking-wider">
        ${weekdays.map((w) => `<div>${w}</div>`).join("")}
      </div>
      <div class="grid grid-cols-7 gap-1 sm:gap-2">
        ${cellsHtml}
      </div>
    </div>
  `;
}

export function renderDayList(currentDate, times) {
  const dateStr = formatDateKey(currentDate);
  const dayTimes = times.filter((t) => t.dueDate === dateStr);

  return `
    <div class="flex flex-col gap-4 bg-surface-2 border border-border/80 rounded-2xl p-4 shadow-sm">
      <div class="flex items-center justify-between pb-3 border-b border-border/60">
        <h3 class="text-sm font-bold text-primary flex items-center gap-2">
          Scheduled Times
          <span class="text-xs px-2 py-0.5 rounded bg-brand/10 text-brand/80 font-bold">${dayTimes.length}</span>
        </h3>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        ${
          dayTimes.length > 0
            ? dayTimes.map((time) => TimeCardComponent.render(time)).join("")
            : `
                <div
                  class="col-span-full min-h-20 bg-surface border border-dashed border-border rounded-2xl p-12 text-center"
                >
                  <div
                    class="text-center flex flex-col items-center justify-center gap-3 text-tertiary"
                  >
                    <i
                      class="fa-regular fa-calendar-xmark text-4xl text-brand/60"
                    ></i>
                    <h2 class="text-lg font-bold text-primary">
                      No active times
                    </h2>
                    <p class="text-xs font-semibold">
                      No times scheduled for this date.
                    </p>
                  </div>
                </div>
              `
        }
      </div>
    </div>
  `;
}

export function renderYearHeatmap(currentDate, times) {
  const currentYear = currentDate.getFullYear();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const timesMap = new Map();
  times.forEach((t) => {
    if (!t.dueDate) return;
    timesMap.set(t.dueDate, (timesMap.get(t.dueDate) || 0) + 1);
  });

  const renderMonthDots = (year, monthIndex, isOverflow = false) => {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    let dotsHtml = "";

    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const count = isOverflow ? 0 : timesMap.get(dStr) || 0;

      let color = "bg-surface-4";
      if (!isOverflow) {
        if (count >= 1 && count <= 2) color = "bg-brand/40";
        else if (count >= 3 && count <= 4) color = "bg-brand/70";
        else if (count >= 5) color = "bg-brand/80 shadow-xs shadow-brand/50";
      }

      dotsHtml += `<div class="w-2.5 h-2.5 rounded-xs ${color}" title="${dStr}: ${count} times"></div>`;
    }
    return dotsHtml;
  };

  const currentYearCardsHtml = months
    .map((mName, mIdx) => {
      return `
        <div 
          class="p-3.5 rounded-2xl bg-surface border border-border/80 hover:border-brand/50 transition cursor-pointer flex flex-col gap-2 group"
          data-year-month="${mIdx}"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-primary group-hover:text-brand transition">${mName}</span>
            <i class="fa-regular fa-arrow-right text-[10px] text-tertiary opacity-0 group-hover:opacity-100 transition"></i>
          </div>
          <div class="flex flex-wrap gap-1">
            ${renderMonthDots(currentYear, mIdx, false)}
          </div>
        </div>
      `;
    })
    .join("");

  const nextYear = currentYear + 1;
  const nextYearMonths = ["Jan", "Feb", "Mar"];

  const overflowCardsHtml = nextYearMonths
    .map((mName, mIdx) => {
      return `
        <div 
          class="p-3.5 rounded-2xl bg-surface border border-border/30 opacity-50 select-none cursor-not-allowed flex flex-col gap-2"
          title="${mName} ${nextYear} (Next Year)"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-tertiary">${mName} ${nextYear}</span>
          </div>
          <div class="flex flex-wrap gap-1">
            ${renderMonthDots(nextYear, mIdx, true)}
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <div class="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
      ${currentYearCardsHtml}
      ${overflowCardsHtml}
    </div>
  `;
}
