import { AnalyticsAdapter } from "@/utils/analytics.adapter.js";
import { AnalyticsController } from "@/controllers/analytics.controller.js";
import ApexCharts from "apexcharts";
import { DashboardComponent } from "@/components/features/analytics/dashboard.component.js";

let heatmapChartInstance = null;
let barChartInstance = null;
let priorityChartInstance = null;
let statusChartInstance = null;
let tagChartInstance = null;
let resizeListenerAttached = false;
let activeHeatmapTab = "weekly";

const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Calculates and returns ApexCharts configuration options for Heatmap
 */
function getHeatmapOptions(times, view) {
  const heatmapSeries = AnalyticsAdapter.generateHeatmapSeries(times, view);
  const isDark =
    document.documentElement.classList.contains("dark") ||
    localStorage.getItem("theme") === "dark";
  const axisTextColor = isDark ? "#9ca3af" : "#4b5563";

  const currentTabCounts = heatmapSeries.flatMap((s) => s.data.map((d) => d.y));
  let maxCommit = Math.max(1, ...currentTabCounts);
  if (view === "weekly") {
    maxCommit = Math.max(maxCommit, 4);
  }

  const ranges = AnalyticsAdapter.getColorRanges(view, maxCommit, isDark);

  return {
    series: heatmapSeries,
    chart: {
      id: "lifetime-heatmap",
      type: "heatmap",
      height: 400,
      toolbar: { show: false },
      fontFamily: "inherit",
      animations: {
        enabled: true,
        speed: 250,
      },
    },
    dataLabels: { enabled: false },
    plotOptions: {
      heatmap: {
        radius: view === "weekly" ? 4 : 2,
        cellMargin: view === "weekly" ? 8 : view === "monthly" ? 4 : 2,
        colorScale: { ranges },
      },
    },
    stroke: {
      show: true,
      width: view === "weekly" ? 3 : view === "monthly" ? 2 : 1,
      colors: [isDark ? "#222f47" : "#e2e8f0"],
    },
    xaxis: {
      type: "category",
      labels: {
        show: true,
        style: {
          colors: axisTextColor,
          fontSize: view === "weekly" ? "11px" : "10px",
          fontWeight: 600,
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: axisTextColor,
          fontSize: view === "weekly" ? "11px" : "10px",
          fontWeight: 700,
        },
        offsetX: -5,
      },
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: {
        formatter: (val) => `${val} activity ticks`,
      },
    },
  };
}

/**
 * Updates heatmap chart instance safely with new view settings
 */
export function updateHeatmapChart(times, view) {
  if (!heatmapChartInstance) return;

  const newOptions = getHeatmapOptions(times, view);
  heatmapChartInstance.updateOptions(newOptions, true, true);
}

/**
 * Updates UI active tab indicator sliding animation & active states
 */
export function updateTabStyles(tab) {
  activeHeatmapTab = tab;

  const indicator = document.getElementById("heatmap-tab-indicator");
  const btnWeekly = document.getElementById("view-btn-weekly");
  const btnMonthly = document.getElementById("view-btn-monthly");
  const btnYearly = document.getElementById("view-btn-yearly");
  const switcher = document.getElementById("chart-view-switcher");

  if (!indicator || !btnWeekly || !btnMonthly || !btnYearly || !switcher)
    return;

  syncMobileMenuSelection(tab);

  const buttons = [btnWeekly, btnMonthly, btnYearly];
  const activeButton =
    tab === "monthly" ? btnMonthly : tab === "yearly" ? btnYearly : btnWeekly;

  buttons.forEach((btn) => {
    btn.classList.remove("text-primary", "font-black");
    btn.classList.add("text-secondary");
  });

  activeButton.classList.remove("text-secondary");
  activeButton.classList.add("text-primary", "font-black");

  const switcherRect = switcher.getBoundingClientRect();
  const activeRect = activeButton.getBoundingClientRect();

  if (switcherRect.width > 0 && activeRect.width > 0) {
    const left = activeRect.left - switcherRect.left;
    indicator.style.transform = `translateX(${left - 4}px)`;
    indicator.style.width = `${activeRect.width}px`;
  }
}

function syncMobileMenuSelection(view) {
  const buttons = document.querySelectorAll("#heatmap-mobile-menu [data-view]");

  buttons.forEach((btn) => {
    const isActive = btn.getAttribute("data-view") === view;
    btn.classList.toggle("bg-brand/10", isActive);
    btn.classList.toggle("text-brand/80", isActive);
    btn.classList.toggle("font-bold", isActive);
    btn.classList.toggle("text-secondary", !isActive);
  });
}

/**
 * Binds desktop and mobile view tab click handlers
 */
function bindAnalyticsControls(times) {
  const switcher = document.getElementById("chart-view-switcher");
  if (switcher) {
    switcher.querySelectorAll("[data-view]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const view = e.currentTarget.dataset.view;
        if (view && view !== activeHeatmapTab) {
          updateTabStyles(view);
          updateHeatmapChart(times, view);
        }
      });
    });
  }

  const mobileToggle = document.getElementById("heatmap-mobile-menu-toggle");
  const mobileMenu = document.getElementById("heatmap-mobile-menu");

  if (mobileToggle && mobileMenu) {
    syncMobileMenuSelection(activeHeatmapTab);

    mobileToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      mobileMenu.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        mobileMenu.classList.add("hidden");
      }
    });

    mobileMenu.querySelectorAll("[data-view]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        const view = event.currentTarget.dataset.view;
        if (view && view !== activeHeatmapTab) {
          updateTabStyles(view);
          updateHeatmapChart(times, view);
        }
        mobileMenu.classList.add("hidden");
      });
    });
  }
}

function handleAnalyticsResize() {
  updateTabStyles(activeHeatmapTab);
}

function renderChartEmptyState(chartEl, title, icon, subtitle) {
  if (!chartEl) return;

  chartEl.innerHTML = `
    <div
      class="empty-state-box flex w-full h-full min-h-60 items-center justify-center rounded-2xl border border-dashed border-border/80 bg-surface p-6 text-center"
    >
      <div class="max-w-xs">
        <i class="text-4xl mb-3 fa-regular ${icon} text-brand/60"></i>
        <div
          class="mb-2 text-lg font-semibold text-primary"
        >
          ${title}
        </div>
        <p class="text-sm leading-6 text-secondary">
          ${subtitle}
        </p>
      </div>
    </div>
  `;
}

function renderNoDataState() {
  const emptyStateConfigs = [
    {
      id: "apex-heatmap-chart",
      title: "Activity Heatmap",
      icon: "fa-table-cells",
      subtitle:
        "Add times to see your weekly, monthly, and yearly activity trend.",
    },
    {
      id: "apex-weekday-chart",
      title: "Weekly Activity",
      icon: "fa-calendar-days",
      subtitle:
        "Your time activity by weekday will appear here once data exists.",
    },
    {
      id: "apex-priority-chart",
      title: "Priority Breakdown",
      icon: "fa-chart-pie-simple",
      subtitle: "Add times with priorities to view the distribution.",
    },
    {
      id: "apex-status-chart",
      title: "Status Overview",
      icon: "fa-chart-pie",
      subtitle: "Time status analytics will appear here after you add times.",
    },
    {
      id: "apex-tag-chart",
      title: "Tag Performance",
      icon: "fa-chart-column",
      subtitle: "Tag-based analytics will be shown once you have tagged times.",
    },
    {
      id: "apex-tag-chart-desktop",
      title: "Tag Performance",
      icon: "fa-chart-column",
      subtitle: "Tag-based analytics will be shown once you have tagged times.",
    },
  ];

  emptyStateConfigs.forEach(({ id, title, icon, subtitle }) => {
    const chartEl = document.getElementById(id);
    renderChartEmptyState(chartEl, title, icon, subtitle);
  });
}

/**
 * Main entry point to render all analytics components and charts
 */
export function renderAnalyticsCharts(
  times = [],
  currentHeatmapView = "weekly",
) {
  const dashboard = document.getElementById("dashboard");
  if (!dashboard) return;

  // Cleanup existing chart instances before re-rendering DOM
  if (heatmapChartInstance) {
    heatmapChartInstance.destroy();
    heatmapChartInstance = null;
  }
  if (barChartInstance) {
    barChartInstance.destroy();
    barChartInstance = null;
  }
  if (priorityChartInstance) {
    priorityChartInstance.destroy();
    priorityChartInstance = null;
  }
  if (statusChartInstance) {
    statusChartInstance.destroy();
    statusChartInstance = null;
  }
  if (tagChartInstance) {
    tagChartInstance.destroy();
    tagChartInstance = null;
  }

  // Inject HTML Dashboard template
  dashboard.innerHTML = DashboardComponent.render(times);

  const hasTimes = Array.isArray(times) && times.length > 0;

  if (hasTimes) {
    const chartBox = document.querySelectorAll('[id^="apex"]');
    const HeatmapSwitcher = document.getElementById("chart-view-switcher");
    const mobileHeatmapSwitcher = document.getElementById(
      "heatmap-mobile-menu-toggle",
    );

    chartBox.forEach((chart) => {
      ["px-2", "min-w-200", "md:min-w-full", "overflow-hidden"].forEach((c) =>
        chart.classList.add(c),
      );
    });

    HeatmapSwitcher.classList.replace("sm:hidden", "sm:flex");
    mobileHeatmapSwitcher.classList.replace("hidden", "inline-flex");
  }

  AnalyticsController.init();
  bindAnalyticsControls(times);

  if (!hasTimes) {
    const HeatmapSwitcher = document.getElementById("chart-view-switcher");
    const mobileHeatmapSwitcher = document.getElementById(
      "heatmap-mobile-menu-toggle",
    );

    HeatmapSwitcher.classList.replace("sm:flex", "sm:hidden");
    mobileHeatmapSwitcher.classList.replace("inline-flex", "hidden");

    renderNoDataState();
    requestAnimationFrame(() => {
      updateTabStyles(currentHeatmapView);
    });
    return;
  }

  if (!resizeListenerAttached) {
    window.addEventListener("resize", handleAnalyticsResize);
    resizeListenerAttached = true;
  }

  const isDark =
    document.documentElement.classList.contains("dark") ||
    localStorage.getItem("theme") === "dark";
  const axisTextColor = isDark ? "#e2e8f0" : "#222f47";

  // Build Heatmap Options
  const heatmapOptions = getHeatmapOptions(times, currentHeatmapView);

  // Build Bar Chart Options
  const weekdayCounts = AnalyticsAdapter.generateWeekdayCounts(times);
  const barChartOptions = {
    series: [{ name: "Times Activity", data: weekdayCounts }],
    chart: {
      id: "weekday-bar",
      type: "bar",
      height: 400,
      toolbar: { show: false },
      fontFamily: "inherit",
    },
    colors: ["#10b981"],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        barHeight: "50%",
        dataLabels: { position: "end" },
      },
    },
    dataLabels: {
      enabled: true,
      textAnchor: "end",
      colors: [isDark ? "#e2e8f0" : "#222f47"],
      style: {
        fontSize: "12px",
        fontWeight: "bold",
        colors: [axisTextColor],
      },
      formatter: (val) => val + " checked",
    },
    xaxis: {
      categories: weekdayNames,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: axisTextColor, fontSize: "12px", fontWeight: 700 },
      },
    },
    grid: {
      show: true,
      borderColor: isDark ? "#e5e7eb" : "#bfcbd9",
      strokeDashArray: 4,
    },
    tooltip: { theme: isDark ? "dark" : "light" },
  };

  const priorityCounts = AnalyticsAdapter.generatePriorityCounts(times);
  const priorityChartOptions = {
    series: priorityCounts,
    labels: ["Low", "Medium", "High"],
    chart: {
      id: "priority-donut",
      type: "donut",
      height: 400,
      fontFamily: "inherit",
    },
    colors: ["#9ae600da", "#ffb900da", "#ff6467da"],
    stroke: {
      colors: [isDark ? "#1e293b" : "#ffffff"],
      width: 2,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "0%",
          labels: {
            show: false,
            value: {
              show: false,
            },
          },
        },
      },
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      labels: {
        colors: axisTextColor,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return Math.round(val) + "%";
      },
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: {
        formatter: (val) => `${val} times`,
      },
    },
  };

  const statusCounts = AnalyticsAdapter.generateStatusCounts(times);
  const statusChartOptions = {
    series: statusCounts,
    labels: ["To Do", "In Progress", "Done", "Blocked"],
    chart: {
      id: "status-donut",
      type: "donut",
      height: 400,
      fontFamily: "inherit",
    },
    colors: ["#00bcffda", "#ff8904da", "#00d492da", "#fb64b6da"],
    stroke: {
      colors: [isDark ? "#1e293b" : "#ffffff"],
      width: 2,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "0%",
          labels: {
            show: false,
            value: {
              show: false,
            },
          },
        },
      },
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      labels: {
        colors: axisTextColor,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return Math.round(val) + "%";
      },
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: {
        formatter: (val) => `${val} times`,
      },
    },
  };

  const tagData = AnalyticsAdapter.generateTagAnalytics(times);

  const tagChartOptions = {
    series: [
      {
        name: "Total Times",
        data: tagData.totalSeries,
      },
      {
        name: "Completed Times",
        data: tagData.completedSeries,
      },
    ],
    chart: {
      id: "tag-performance-bar",
      type: "bar",
      height: 400,
      fontFamily: "inherit",
      toolbar: { show: false },
    },
    colors: ["#00bcff", "#10b981"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories:
        tagData.categories.length > 0 ? tagData.categories : ["No Tags"],
      labels: {
        style: {
          colors: axisTextColor,
          fontSize: "12px",
          fontWeight: 600,
        },
        rotateAlways: true,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: axisTextColor, fontSize: "11px" },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      labels: { colors: axisTextColor },
    },
    grid: {
      borderColor: isDark ? "#334155" : "#e2e8f0",
      strokeDashArray: 4,
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: {
        formatter: (val, { seriesIndex, dataPointIndex }) => {
          if (seriesIndex === 1) {
            const rate = tagData.progressRates[dataPointIndex] || 0;
            return `${val} completed (${rate}% rate)`;
          }
          return `${val} times`;
        },
      },
    },
  };

  // Mount ApexCharts
  const heatmapEl = document.getElementById("apex-heatmap-chart");
  const barEl = document.getElementById("apex-weekday-chart");
  const priorityEl = document.getElementById("apex-priority-chart");
  const statusEl = document.getElementById("apex-status-chart");
  const tagEl = document.getElementById("apex-tag-chart");
  const tagDeskEl = document.getElementById("apex-tag-chart-desktop");

  if (heatmapEl) {
    heatmapChartInstance = new ApexCharts(heatmapEl, heatmapOptions);
    heatmapChartInstance.render();
  }

  if (barEl) {
    barChartInstance = new ApexCharts(barEl, barChartOptions);
    barChartInstance.render();
  }

  if (priorityEl) {
    priorityChartInstance = new ApexCharts(priorityEl, priorityChartOptions);
    priorityChartInstance.render();
  }

  if (statusEl) {
    statusChartInstance = new ApexCharts(statusEl, statusChartOptions);
    statusChartInstance.render();
  }

  if (tagEl) {
    tagChartInstance = new ApexCharts(tagEl, tagChartOptions);
    tagChartInstance.render();
  }

  if (tagDeskEl) {
    tagChartInstance = new ApexCharts(tagDeskEl, tagChartOptions);
    tagChartInstance.render();
  }

  // Sync tab slider position in next frame after DOM calculation
  requestAnimationFrame(() => {
    updateTabStyles(currentHeatmapView);
  });
}
