import { StateManager, state } from "@/models/state.model.js";
import {
  renderDayList,
  renderMonthGrid,
  renderYearHeatmap,
} from "@/views/calendar/calendar.renderer.js";

export class CalendarController {
  static currentDate = new Date();
  static calendarConfigs = {
    day: {
      title: "Daily Overview",
      description:
        "Detailed breakdown and manageable view of times scheduled for a specific day.",
      icon: "fa-calendar-day",
    },
    month: {
      title: "Monthly Overview",
      description:
        "Visual distribution and workload management of scheduled times across days and weeks.",
      icon: "fa-calendar-week",
    },
    year: {
      title: "Yearly Overview",
      description:
        "High-level visual density map of scheduled times across all months of the year.",
      icon: "fa-calendar-days",
    },
  };

  static init() {
    this.bindEvents();
    this.setupTabIndicatorObserver();

    requestAnimationFrame(() => {
      this.updateTabStyles(state.calendarMode);
      this.updateHeaderData(state.calendarMode);
    });
  }

  static bindEvents() {
    document
      .getElementById("btn-calendar-day")
      ?.addEventListener("click", () => this.switchMode("day"));
    document
      .getElementById("btn-calendar-month")
      ?.addEventListener("click", () => this.switchMode("month"));
    document
      .getElementById("btn-calendar-year")
      ?.addEventListener("click", () => this.switchMode("year"));

    document
      .getElementById("calendar-btn-prev")
      ?.addEventListener("click", () => this.navigate(-1));
    document
      .getElementById("calendar-btn-next")
      ?.addEventListener("click", () => this.navigate(1));
    document
      .getElementById("calendar-btn-today")
      ?.addEventListener("click", () => {
        this.currentDate = new Date();
        this.dispatchRender();
      });
  }

  static navigate(direction) {
    if (state.calendarMode === "day") {
      this.currentDate.setDate(this.currentDate.getDate() + direction);
    } else if (state.calendarMode === "month") {
      this.currentDate.setMonth(this.currentDate.getMonth() + direction);
    } else if (state.calendarMode === "year") {
      this.currentDate.setFullYear(this.currentDate.getFullYear() + direction);
    }
    this.dispatchRender();
  }

  static switchMode(mode) {
    if (state.calendarMode === mode) return;

    StateManager.setCalendarMode(mode);
    this.updateTabStyles(mode);
    this.updateHeaderData(mode);
    this.dispatchRender();
  }

  static updateHeaderData(mode) {
    const titleEl = document.getElementById("calendar-header-title");
    const descEl = document.getElementById("calendar-header-description");
    const config = this.calendarConfigs[mode];

    if (!config) return;

    if (titleEl) {
      titleEl.innerHTML = `<i class="fa-regular ${config.icon} text-brand/80"></i> ${config.title}`;
    }

    if (descEl) {
      descEl.textContent = config.description;
    }
  }

  static updateTabStyles(mode) {
    const indicator = document.getElementById("calendar-tab-indicator");
    const btnDay = document.getElementById("btn-calendar-day");
    const btnMonth = document.getElementById("btn-calendar-month");
    const btnYear = document.getElementById("btn-calendar-year");

    if (!indicator || !btnDay || !btnMonth || !btnYear) return;

    const buttons = [btnDay, btnMonth, btnYear];
    const activeIndex = mode === "day" ? 0 : mode === "month" ? 1 : 2;
    const targetBtn = buttons[activeIndex];

    const buttonWidth =
      targetBtn.offsetWidth || targetBtn.getBoundingClientRect().width;
    if (!buttonWidth) return;

    const isWide = window.matchMedia("(min-width: 375px)").matches;

    if (isWide) {
      let offsetLeft = 4;
      for (let i = 0; i < activeIndex; i++) {
        offsetLeft += buttons[i].offsetWidth;
      }
      indicator.style.width = `${buttonWidth}px`;
      indicator.style.left = `${offsetLeft}px`;
      indicator.style.top = `4px`;
      indicator.style.height = `${targetBtn.offsetHeight}px`;
    } else {
      let offsetTop = 4;
      for (let i = 0; i < activeIndex; i++) {
        offsetTop += buttons[i].offsetHeight;
      }
      indicator.style.height = `${targetBtn.offsetHeight}px`;
      indicator.style.top = `${offsetTop}px`;
      indicator.style.left = `4px`;
      indicator.style.width = `${buttonWidth}px`;
    }

    buttons.forEach((btn, idx) => {
      if (idx === activeIndex) {
        btn.classList.replace(
          "text-secondary",
          "text-(--color-btn-primary-text)",
        );
        btn.setAttribute("aria-selected", "true");
      } else {
        btn.classList.replace(
          "text-(--color-btn-primary-text)",
          "text-secondary",
        );
        btn.setAttribute("aria-selected", "false");
      }
    });
  }

  static setupTabIndicatorObserver() {
    const btnDay = document.getElementById("btn-calendar-day");
    const btnMonth = document.getElementById("btn-calendar-month");
    const btnYear = document.getElementById("btn-calendar-year");

    if (!btnDay || !btnMonth || !btnYear) return;

    if (!window.calendarTabResizeObserver) {
      window.calendarTabResizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          this.updateTabStyles(state.calendarMode);
          this.updateHeaderData(state.calendarMode);
        });
      });
    }

    window.calendarTabResizeObserver.disconnect();
    window.calendarTabResizeObserver.observe(btnDay);
    window.calendarTabResizeObserver.observe(btnMonth);
    window.calendarTabResizeObserver.observe(btnYear);
  }

  static dispatchRender() {
    const container = document.getElementById("calendar-content-container");
    const labelEl = document.getElementById("calendar-current-label");
    const labelElMobile = document.getElementById(
      "calendar-current-label-mobile",
    );
    if (!container) return;

    const activeTimes = StateManager.getTimes().filter(
      (t) => t.status !== "done" && !t.isArchived,
    );

    if (labelEl) {
      if (state.calendarMode === "day") {
        labelEl.textContent = this.currentDate.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      } else if (state.calendarMode === "month") {
        labelEl.textContent = this.currentDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
      } else {
        labelEl.textContent = this.currentDate.getFullYear();
      }
    }
    if (labelElMobile) {
      if (state.calendarMode === "day") {
        labelElMobile.textContent = this.currentDate.toLocaleDateString(
          "en-US",
          {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          },
        );
      } else if (state.calendarMode === "month") {
        labelElMobile.textContent = this.currentDate.toLocaleDateString(
          "en-US",
          {
            month: "long",
            year: "numeric",
          },
        );
      } else {
        labelElMobile.textContent = this.currentDate.getFullYear();
      }
    }

    if (state.calendarMode === "month") {
      container.innerHTML = renderMonthGrid(this.currentDate, activeTimes);

      container.querySelectorAll("[data-calendar-date]").forEach((cell) => {
        cell.addEventListener("click", () => {
          const dateStr = cell.getAttribute("data-calendar-date");
          this.currentDate = new Date(dateStr);
          this.switchMode("day");
        });
      });
    } else if (state.calendarMode === "day") {
      container.innerHTML = renderDayList(this.currentDate, activeTimes);
    } else {
      container.innerHTML = renderYearHeatmap(this.currentDate, activeTimes);

      container.querySelectorAll("[data-year-month]").forEach((card) => {
        card.addEventListener("click", () => {
          const monthIdx = parseInt(card.getAttribute("data-year-month"), 10);
          this.currentDate.setMonth(monthIdx);
          this.switchMode("month");
        });
      });
    }

    requestAnimationFrame(() => {
      this.updateTabStyles(state.calendarMode);
      this.updateHeaderData(state.calendarMode);
    });
  }
}
