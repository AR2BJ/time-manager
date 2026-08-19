import {
  renderAnalyticsCharts,
  updateHeatmapChart,
  updateTabStyles,
} from "@/views/analytics/analytics.renderer.js";

import { StateManager } from "@/models/state.model";

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

    window.addEventListener("pomodoroCompleted", () => {
      const state = StateManager.getState();
      if (state.currentView === "analytics") {
        renderAnalyticsCharts(state.sessions, currentHeatmapView);
      }
    });
  },

  handleTabSwitch(tab) {
    if (tab === currentHeatmapView) return;
    currentHeatmapView = tab;

    updateTabStyles(tab);

    const { sessions } = StateManager.getState();
    updateHeatmapChart(sessions, tab);
  },

  dispatchRender(sessions) {
    renderAnalyticsCharts(sessions, currentHeatmapView);
  },
};
