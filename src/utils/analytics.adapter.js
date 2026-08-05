import { formatDate } from "./helpers.js";
import { state } from "@/models/state.model.js";

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = [
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

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Extracts daily activity counters mapped by ISO date strings (YYYY-MM-DD)
 * using time creation dates and completed subtimes/statuses.
 */
function getActivityMap(times) {
  const map = {};

  times.forEach((time) => {
    // Increment activity for creation date
    if (time.createdAt) {
      const createdIso = time.createdAt.split("T")[0];
      map[createdIso] = (map[createdIso] || 0) + 1;
    }

    // Increment activity for completed subtimes if timestamp exists or default to createdAt
    if (Array.isArray(time.subtimes)) {
      time.subtimes.forEach((st) => {
        if (st.completed) {
          const dateKey = st.completedAt
            ? st.completedAt.split("T")[0]
            : time.createdAt
              ? time.createdAt.split("T")[0]
              : null;
          if (dateKey) {
            map[dateKey] = (map[dateKey] || 0) + 1;
          }
        }
      });
    }
  });

  return map;
}

export const AnalyticsAdapter = {
  generateHeatmapSeries(times = [], view = "weekly") {
    const activeTimes = times.filter((t) => !t.archived);

    let startDate = new Date();
    if (activeTimes.length > 0) {
      const validDates = activeTimes
        .map((t) => (t.createdAt ? new Date(t.createdAt).getTime() : null))
        .filter((time) => time && !isNaN(time));

      if (validDates.length > 0) {
        startDate = new Date(Math.min(...validDates));
      } else {
        startDate.setDate(startDate.getDate() - 90);
      }
    } else {
      startDate.setDate(startDate.getDate() - 90);
    }
    startDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const globalActivityMap = getActivityMap(times);

    // WEEKLY VIEW
    if (view === "weekly") {
      const startSunday = new Date(startDate);
      startSunday.setDate(startDate.getDate() - startSunday.getDay());
      const totalWeeksToShow = 12;

      return weekdayNames.map((dayName, dayIdx) => {
        const rowData = [];
        for (let w = 0; w < totalWeeksToShow; w++) {
          const currentTarget = new Date(startSunday);
          currentTarget.setDate(startSunday.getDate() + w * 7 + dayIdx);

          const isoStr = formatDate(currentTarget);
          const count =
            currentTarget < startDate || currentTarget > today
              ? 0
              : globalActivityMap[isoStr] || 0;

          const monthName = currentTarget.toLocaleString("en-US", {
            month: "short",
          });

          rowData.push({ x: `${monthName} W${w + 1}`, y: count });
        }
        return { name: dayName, data: rowData };
      });
    }

    // MONTHLY VIEW
    if (view === "monthly") {
      const startMonth = startDate.getMonth();
      const startYear = startDate.getFullYear();
      const endMonth = today.getMonth();
      const endYear = today.getFullYear();

      const activeMonthsRange = [];
      let curY = startYear;
      let curM = startMonth;

      while (curY < endYear || (curY === endYear && curM <= endMonth)) {
        activeMonthsRange.push({
          year: curY,
          month: curM,
          name: monthNames[curM],
        });
        curM++;
        if (curM > 11) {
          curM = 0;
          curY++;
        }
      }

      while (activeMonthsRange.length < 6) {
        let last = activeMonthsRange[activeMonthsRange.length - 1];
        let nextM = last.month + 1;
        let nextY = last.year;
        if (nextM > 11) {
          nextM = 0;
          nextY++;
        }
        activeMonthsRange.push({
          year: nextY,
          month: nextM,
          name: monthNames[nextM],
        });
      }

      const weekLabels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];

      return weekLabels.map((weekLabel, weekIdx) => {
        const rowData = activeMonthsRange.map((mInfo) => {
          let weeklyTicks = 0;
          const daysInMonth = getDaysInMonth(mInfo.year, mInfo.month);

          const startDay = weekIdx * 7 + 1;
          const endDay = Math.min(startDay + 6, daysInMonth);

          if (startDay <= daysInMonth) {
            for (let d = startDay; d <= endDay; d++) {
              const targetDate = new Date(mInfo.year, mInfo.month, d);
              if (targetDate >= startDate && targetDate <= today) {
                const isoStr = formatDate(targetDate);
                if (globalActivityMap[isoStr]) {
                  weeklyTicks += globalActivityMap[isoStr];
                }
              }
            }
          }

          return { x: `${mInfo.name} ${mInfo.year}`, y: weeklyTicks };
        });

        return { name: weekLabel, data: rowData };
      });
    }

    // YEARLY VIEW
    if (view === "yearly") {
      const startYear = startDate.getFullYear();
      const endYear = today.getFullYear();
      const yearsRange = [];
      for (let y = startYear; y <= endYear; y++) {
        yearsRange.push(y);
      }

      return yearsRange.map((year) => {
        const rowData = monthNames.map((monthName, mIdx) => {
          let monthlyTotalTicks = 0;
          const daysInMonth = getDaysInMonth(year, mIdx);

          for (let d = 1; d <= daysInMonth; d++) {
            const targetDate = new Date(year, mIdx, d);
            if (targetDate >= startDate && targetDate <= today) {
              const isoStr = formatDate(targetDate);
              if (globalActivityMap[isoStr]) {
                monthlyTotalTicks += globalActivityMap[isoStr];
              }
            }
          }

          return { x: monthName, y: monthlyTotalTicks };
        });

        return { name: String(year), data: rowData };
      });
    }

    return [];
  },

  generateWeekdayCounts(times = []) {
    const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];

    times.forEach((time) => {
      if (time.createdAt) {
        const dayIndex = new Date(time.createdAt).getDay();
        if (dayIndex >= 0 && dayIndex <= 6) {
          weekdayCounts[dayIndex]++;
        }
      }
    });

    return weekdayCounts;
  },

  generatePriorityCounts(times = []) {
    const counts = {
      low: 0,
      medium: 0,
      high: 0,
    };

    const activeTimes = times.filter((t) => !t.archived);

    activeTimes.forEach((time) => {
      const priority = (time.priority || "low").toLowerCase();
      if (priority === "high") {
        counts.high++;
      } else if (priority === "medium") {
        counts.medium++;
      } else {
        counts.low++;
      }
    });

    return [counts.low, counts.medium, counts.high];
  },

  generateStatusCounts(times = []) {
    const counts = {
      todo: 0,
      in_progress: 0,
      done: 0,
      blocked: 0,
    };

    const activeTimes = times.filter((t) => !t.archived);

    activeTimes.forEach((time) => {
      const status = time.status || "todo";
      if (counts.hasOwnProperty(status)) {
        counts[status]++;
      } else {
        counts.todo++;
      }
    });

    return [counts.todo, counts.in_progress, counts.done, counts.blocked];
  },

  generateTagAnalytics(times = []) {
    const activeTimes = times.filter((t) => !t.archived);
    const tagStats = {};

    activeTimes.forEach((time) => {
      const tags = state.tags.filter((t) => time.tags.includes(t.id)) || [];
      const isDone = time.status === "done";

      tags.forEach((tag) => {
        if (!tagStats[tag.name]) {
          tagStats[tag.name] = { total: 0, completed: 0 };
        }
        tagStats[tag.name].total += 1;
        if (isDone) {
          tagStats[tag.name].completed += 1;
        }
      });
    });

    const sorted = Object.entries(tagStats)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 6);

    const categories = sorted.map(([tag]) => tag);
    const totalSeries = sorted.map(([, stats]) => stats.total);
    const completedSeries = sorted.map(([, stats]) => stats.completed);
    const progressRates = sorted.map(([, stats]) =>
      stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
    );

    return {
      categories,
      totalSeries,
      completedSeries,
      progressRates,
      hasTags: categories.length > 0,
    };
  },

  getColorRanges(view, maxVal = 10, isDark = false) {
    const safeMax = Math.max(maxVal, 1);

    if (view === "yearly") {
      return [
        { from: 0, to: 0, color: isDark ? "#1f2937" : "#e2e8f0", name: "none" },
        {
          from: 1,
          to: Math.ceil(safeMax * 0.2),
          color: isDark ? "#064e3b" : "#dcfae9",
          name: "low",
        },
        {
          from: Math.ceil(safeMax * 0.2) + 1,
          to: Math.ceil(safeMax * 0.5),
          color: isDark ? "#047857" : "#9be9a8",
          name: "medium",
        },
        {
          from: Math.ceil(safeMax * 0.5) + 1,
          to: safeMax,
          color: "#10b981",
          name: "high",
        },
      ];
    }

    if (view === "monthly") {
      const step = Math.max(1, Math.ceil(safeMax / 4));
      return [
        { from: 0, to: 0, color: isDark ? "#111827" : "#f3f4f6", name: "none" },
        {
          from: 1,
          to: step,
          color: isDark ? "#064e3b" : "#dcfae9",
          name: "low",
        },
        {
          from: step + 1,
          to: step * 2,
          color: isDark ? "#047857" : "#9be9a8",
          name: "medium",
        },
        {
          from: step * 2 + 1,
          to: safeMax,
          color: "#10b981",
          name: "high",
        },
      ];
    }

    return [
      { from: 0, to: 0, color: isDark ? "#1f2937" : "#e2e8f0", name: "none" },
      { from: 1, to: safeMax, color: "#10b981", name: "active" },
    ];
  },
};
