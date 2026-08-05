import {
  renderAnalyticsCharts,
  updateHeatmapChart,
  updateTabStyles,
} from "@/views/analytics/analytics.renderer.js";

import { StateManager } from "@/models/state.model.js";

let currentHeatmapView = "weekly";

export const AnalyticsController = {
  init() {
    this.bindStaticEvents();
  },

  bindStaticEvents() {
    const switcher = document.getElementById("chart-view-switcher");
    if (!switcher) return;

    ["view-btn-weekly", "view-btn-monthly", "view-btn-yearly"].forEach((id) => {
      const btn = document.getElementById(id);
      if (!btn) return;

      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      const viewType = id.replace("view-btn-", "");
      newBtn.addEventListener("click", () => this.handleTabSwitch(viewType));
    });
  },

  handleTabSwitch(tab) {
    if (tab === currentHeatmapView) return;
    currentHeatmapView = tab;

    updateTabStyles(tab);

    const times = StateManager.getTimes();
    updateHeatmapChart(times, tab);
  },

  dispatchRender(times) {
    renderAnalyticsCharts(times, currentHeatmapView);
  },
};
