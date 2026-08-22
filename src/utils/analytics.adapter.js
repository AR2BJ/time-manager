import { formatDate } from "./helpers.js";

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

function getSessionActivityMap(sessions) {
  const map = {};

  sessions.forEach((session) => {
    if (session.completedAt) {
      const dateIso = session.completedAt;
      map[dateIso] = (map[dateIso] || 0) + 1;
    }
  });

  return map;
}

export const AnalyticsAdapter = {
  generateHeatmapSeries(sessions = [], view = "weekly") {
    let startDate = new Date();
    if (sessions.length > 0) {
      const validDates = sessions
        .map((s) => (s.completedAt ? new Date(s.completedAt).getTime() : null))
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

    const globalActivityMap = getSessionActivityMap(sessions);

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

  generateWeekdayCounts(sessions = []) {
    const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];

    sessions.forEach((session) => {
      if (session.completedAt) {
        const dayIndex = new Date(session.completedAt).getDay();
        if (dayIndex >= 0 && dayIndex <= 6) {
          weekdayCounts[dayIndex]++;
        }
      }
    });

    return weekdayCounts;
  },

  getColorRanges(view, maxVal = 10, isDark = false) {
    const safeMax = Math.max(maxVal, 1);

    if (view === "yearly") {
      return [
        { from: 0, to: 0, color: isDark ? "#1f2937" : "#e2e8f0", name: "none" },
        {
          from: 1,
          to: Math.ceil(safeMax * 0.2),
          color: isDark ? "#10b981" : "#93f3d3",
          name: "low",
        },
        {
          from: Math.ceil(safeMax * 0.2) + 1,
          to: Math.ceil(safeMax * 0.5),
          color: isDark ? "#09704e" : "#72a795",
          name: "medium",
        },
        {
          from: Math.ceil(safeMax * 0.5) + 1,
          to: safeMax,
          color: "#053d2a",
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
          color: isDark ? "#10b981" : "#93f3d3",
          name: "low",
        },
        {
          from: step + 1,
          to: step * 2,
          color: isDark ? "#09704e" : "#72a795",
          name: "medium",
        },
        {
          from: step * 2 + 1,
          to: safeMax,
          color: "#053d2a",
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
