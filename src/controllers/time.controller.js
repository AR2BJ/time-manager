import { StateManager, state } from "@/models/state.model.js";
import { clearOpenSubtimesState, openSubtimesState } from "@/utils/helpers.js";

import { AnalyticsController } from "./analytics.controller.js";
import { AnalyticsView } from "@/views/analytics-view.js";
import { AutocompleteComponent } from "@/components/ui/autocomplete.component.js";
import { CalendarController } from "./calendar.controller.js";
import { CalendarView } from "@/views/calendar-view.js";
import { DeleteModalsComponent } from "@/components/modals/delete-modals.component.js";
import { DesktopNavComponent } from "@/components/layout/desktop-nav.component.js";
import { EditModalsComponent } from "@/components/modals/edit-modals.component.js";
import { GlobalLoaderService } from "@/services/loader.service.js";
import { HeaderComponent } from "@/components/shared/header.component.js";
import { InfoModalComponent } from "@/components/modals/info-modal.component.js";
import { MatrixController } from "./matrix.controller.js";
import { MatrixView } from "@/views/matrix-view.js";
import { MobileNavComponent } from "@/components/layout/mobile-nav.component.js";
import { SettingsArchiveController } from "./settings/settings-archive.controller.js";
import { SettingsController } from "./settings.controller.js";
import { SettingsTagController } from "./settings/settings-tag.controller.js";
import { SettingsViewComponent } from "@/components/features/settings/settings-view.component.js";
import { TimeActionController } from "./times/time-action.controller.js";
import { TimeFormController } from "./times/time-form.controller.js";
import { TimesView } from "@/views/times-view.js";
import { renderTagFilterBar } from "@/views/times/tag-bar.renderer.js";
import { renderTimeList } from "@/views/times/time-list.renderer.js";

export const TimeController = {
  init() {
    StateManager.init();
    this.renderComponent();

    this.initFilterAutocompletes();

    this.refreshUI();

    TimeFormController.init(this);
    TimeActionController.init(this);

    SettingsArchiveController.runAutoArchivePipeline();

    this.bindStaticEvents();
    this.bindMenuToggle();
    this.bindActionMenuToggle();
    this.setupTabIndicatorObserver();

    requestAnimationFrame(() => {
      this.updateTabStyles(state.activeTab);
    });
  },

  initFilterAutocompletes() {
    const dateWrapper = document.getElementById(
      "date-filter-autocomplete-wrapper",
    );
    const sortWrapper = document.getElementById("sort-autocomplete-wrapper");

    if (dateWrapper) {
      const dateOptions = [
        {
          value: "all",
          title: "All Dates",
          icon: "fa-regular fa-calendar text-emerald-400",
        },
        {
          value: "overdue",
          title: "Overdue",
          icon: "fa-regular fa-clock text-rose-400",
        },
        {
          value: "today",
          title: "Today",
          icon: "fa-regular fa-calendar-day text-brand/80",
        },
        {
          value: "this_week",
          title: "This Week",
          icon: "fa-regular fa-calendar-week text-amber-400",
        },
        {
          value: "no_date",
          title: "No Due Date",
          icon: "fa-regular fa-calendar-xmark text-slate-400",
        },
      ];

      this.dateFilterAutocomplete = new AutocompleteComponent(
        dateWrapper,
        dateOptions,
        {
          label: "Date",
          isRow: true,
          placeholder: "Select Date...",
          itemTitle: "title",
          itemValue: "value",
          itemIcon: "icon",
          containerClass: "min-h-8!",
          inputClass: "h-5! pb-0! w-full lg:w-36 text-xs sm:text-sm",
          onChange: (selectedVal) => {
            GlobalLoaderService.show("Filtering times by date...");
            setTimeout(() => {
              try {
                StateManager.setDateFilter(selectedVal);
                this.refreshUI();
              } finally {
                GlobalLoaderService.hide();
              }
            }, 100);
          },
        },
      );

      // Set initial value
      if (state.dateFilter) {
        this.dateFilterAutocomplete.setValue(state.dateFilter);
      }
    }

    if (sortWrapper) {
      const sortOptions = [
        {
          value: "priority",
          title: "Priority",
          icon: "fa-regular fa-arrow-down-short-wide text-brand/80",
        },
        {
          value: "dueDate",
          title: "Due Date",
          icon: "fa-regular fa-calendar text-emerald-400",
        },
        {
          value: "status",
          title: "Status",
          icon: "fa-regular fa-bar-progress text-amber-400",
        },
        {
          value: "createdAt",
          title: "Date Created",
          icon: "fa-regular fa-clock text-rose-400",
        },
        {
          value: "title",
          title: "Title (A-Z)",
          icon: "fa-regular fa-arrow-down-a-z text-indigo-400",
        },
      ];

      this.sortAutocomplete = new AutocompleteComponent(
        sortWrapper,
        sortOptions,
        {
          label: "Sort",
          isRow: true,
          placeholder: "Sort By...",
          itemTitle: "title",
          itemValue: "value",
          itemIcon: "icon",
          containerClass: "min-h-8!",
          inputClass: "h-5! pb-0! w-full lg:w-36 text-xs sm:text-sm",
          onChange: (selectedVal) => {
            GlobalLoaderService.show("Sorting times...");
            setTimeout(() => {
              try {
                StateManager.setSortBy(selectedVal);
                this.refreshUI();
              } finally {
                GlobalLoaderService.hide();
              }
            }, 100);
          },
        },
      );

      // Set initial value
      if (state.sortBy) {
        this.sortAutocomplete.setValue(state.sortBy);
      }
    }
  },

  renderComponent() {
    const renderMap = {
      "header-container": HeaderComponent.render,
      "desktop-nav-container": DesktopNavComponent.render,
      "mobile-nav-container": MobileNavComponent.render,
      "times-view-container": TimesView.render,
      "analytics-view-container": AnalyticsView.render,
      "calendar-view-container": CalendarView.render,
      "matrix-view-container": MatrixView.render,
      "settings-view-container": SettingsViewComponent.render,
      "help-modal-container": InfoModalComponent.render,
      "edit-modals-container": EditModalsComponent.render,
      "delete-modals-container": DeleteModalsComponent.render,
    };

    Object.entries(renderMap).forEach(([id, renderFn]) => {
      const container = document.getElementById(id);
      if (container && typeof renderFn === "function") {
        container.innerHTML = renderFn();
      }
    });
  },

  refreshUI() {
    const allTimes = StateManager.getTimes();
    const filteredTimes = StateManager.getFilteredTimes();

    renderTimeList(filteredTimes, state.activeTab);

    AnalyticsController.dispatchRender(allTimes);
    MatrixController.dispatchRender();
    CalendarController.dispatchRender();
    this.updateNavigationDOM();

    TimeFormController.refreshUI();
    SettingsTagController.renderTagsList();

    renderTagFilterBar();
  },

  bindMenuToggle() {
    const menuToggle = document.getElementById("menu-toggle");
    const desktopNav = document.getElementById("desktop-nav");
    const app = document.getElementById("app");

    let isMenuOpen = false;

    menuToggle?.addEventListener("click", () => {
      isMenuOpen = !isMenuOpen;
      if (isMenuOpen) {
        desktopNav?.classList.replace(
          "-translate-x-[calc(100%+2rem)]",
          "translate-x-0",
        );
        app?.classList.replace("lg:ps-8", "lg:ps-30");
      } else {
        desktopNav?.classList.replace(
          "translate-x-0",
          "-translate-x-[calc(100%+2rem)]",
        );
        app?.classList.replace("lg:ps-30", "lg:ps-8");
      }
    });
  },

  bindActionMenuToggle() {
    document.addEventListener("click", (e) => {
      const toggleBtn = e.target.closest(".dropdown-toggle-btn");

      if (toggleBtn) {
        e.stopPropagation();
        const container = toggleBtn.closest(".dropdown-container");
        const menu = container?.querySelector(".dropdown-menu");

        document.querySelectorAll(".dropdown-menu").forEach((m) => {
          if (m !== menu) m.classList.add("hidden");
        });

        menu?.classList.toggle("hidden");
        return;
      }

      if (!e.target.closest(".dropdown-container")) {
        document
          .querySelectorAll(".dropdown-menu")
          .forEach((m) => m.classList.add("hidden"));
      }
    });
  },

  bindStaticEvents() {
    const tagFilterBtn = document.getElementById("time-filter-scroll");

    if (tagFilterBtn) {
      tagFilterBtn.addEventListener("click", (e) => {
        const btn = e.target.closest(".tag-filter-btn");
        if (!btn) return;

        const selectedTag = btn.dataset.tag;
        StateManager.setSelectedTag(selectedTag);
        this.refreshUI();
      });
    }

    const sortSelect = document.getElementById("time-sort-select");
    if (sortSelect) {
      sortSelect.value = state.sortBy || "priority";

      sortSelect.addEventListener("change", (e) => {
        GlobalLoaderService.show("Sorting times...");

        setTimeout(() => {
          try {
            StateManager.setSortBy(e.target.value);
            this.refreshUI();
          } finally {
            GlobalLoaderService.hide();
          }
        }, 100);
      });
    }

    const dateFilterSelect = document.getElementById("time-date-filter-select");
    if (dateFilterSelect) {
      dateFilterSelect.value = state.dateFilter || "all";

      dateFilterSelect.addEventListener("change", (e) => {
        GlobalLoaderService.show("Filtering times by date...");

        setTimeout(() => {
          try {
            StateManager.setDateFilter(e.target.value);
            this.refreshUI();
          } finally {
            GlobalLoaderService.hide();
          }
        }, 100);
      });
    }

    const toggleFormBtn = document.getElementById("btn-toggle-time-form");
    const formContainer = document.getElementById("time-form-container");
    const formChevron = document.getElementById("form-chevron");

    if (toggleFormBtn && formContainer && formChevron) {
      toggleFormBtn.addEventListener("click", () => {
        const isHidden = formContainer.classList.contains("hidden");
        if (isHidden) {
          formContainer.classList.replace("hidden", "flex");
          formChevron.classList.add("rotate-180");
        } else {
          formContainer.classList.replace("flex", "hidden");
          formChevron.classList.remove("rotate-180");
        }
      });
    }

    const searchInput = document.getElementById("search-times");
    const clearBtn = document.getElementById("clear-search-btn");
    const searchContainer = searchInput?.closest(".group\\/search");

    if (searchInput) {
      searchInput.value = state.searchQuery || "";

      const evaluateSearchState = () => {
        const hasValue = searchInput.value.trim().length > 0;
        const isHovered = searchContainer?.matches(":hover");

        if (hasValue && isHovered) {
          if (clearBtn) {
            clearBtn.classList.replace("hidden", "flex");
            requestAnimationFrame(() => {
              clearBtn.classList.remove("opacity-0", "scale-75");
              clearBtn.classList.add("opacity-100", "scale-100");
            });
          }
        } else if (clearBtn) {
          clearBtn.classList.remove("opacity-100", "scale-100");
          clearBtn.classList.add("opacity-0", "scale-75");

          setTimeout(() => {
            if (
              !searchInput.value.trim().length ||
              !searchContainer?.matches(":hover")
            ) {
              clearBtn.classList.replace("flex", "hidden");
            }
          }, 200);
        }
      };

      searchInput.addEventListener("input", (e) => {
        GlobalLoaderService.show("Searching times...");

        setTimeout(() => {
          try {
            StateManager.setSearchQuery(e.target.value);
            this.refreshUI();
            evaluateSearchState();
          } finally {
            GlobalLoaderService.hide();
          }
        }, 100);
      });

      searchContainer?.addEventListener("mouseenter", evaluateSearchState);
      searchContainer?.addEventListener("mouseleave", evaluateSearchState);

      clearBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        GlobalLoaderService.show("Clearing search...");

        setTimeout(() => {
          try {
            searchInput.value = "";
            StateManager.setSearchQuery("");

            setTimeout(() => searchInput.focus(), 100);

            this.refreshUI();
            evaluateSearchState();
          } finally {
            GlobalLoaderService.hide();
          }
        }, 100);
      });
    }

    const activeBtn = document.getElementById("tab-active");
    const completedBtn = document.getElementById("tab-completed");
    const archivedBtn = document.getElementById("tab-archived");

    const handleTabClick = (targetTab, loaderText) => {
      if (state.activeTab === targetTab) return;

      GlobalLoaderService.show(loaderText);

      setTimeout(() => {
        try {
          this.handleTabSwitch(targetTab);
        } finally {
          GlobalLoaderService.hide();
        }
      }, 30);
    };

    activeBtn?.addEventListener("click", () =>
      handleTabClick("active", "Switching to Active Times..."),
    );
    completedBtn?.addEventListener("click", () =>
      handleTabClick("completed", "Loading Completed Times..."),
    );
    archivedBtn?.addEventListener("click", () =>
      handleTabClick("archived", "Loading Archived Times..."),
    );

    const navButtons = ["times", "analytics", "calendar", "matrix", "settings"];
    navButtons.forEach((v) => {
      const desktopBtn = document.getElementById(`nav-${v}`);
      const mobileBtn = document.getElementById(`mobile-${v}`);

      const handleNav = () => {
        if (state.currentView === v) return;

        GlobalLoaderService.show(`Navigating...`);

        setTimeout(() => {
          try {
            StateManager.setView(v);

            clearOpenSubtimesState();

            navButtons.forEach((nav) => {
              const dEl = document.getElementById(`nav-${nav}`);
              const mEl = document.getElementById(`mobile-${nav}`);
              dEl?.classList.replace("text-brand/80", "text-secondary");
              mEl?.classList.replace("text-brand/80", "text-secondary");
            });

            desktopBtn?.classList.replace("text-secondary", "text-brand/80");
            mobileBtn?.classList.replace("text-secondary", "text-brand/80");

            this.refreshUI();
          } finally {
            GlobalLoaderService.hide();
          }
        }, 30);
      };

      desktopBtn?.addEventListener("click", handleNav);
      mobileBtn?.addEventListener("click", handleNav);
    });

    const timeListContainer = document.getElementById("time-list");

    timeListContainer?.addEventListener("click", (e) => {
      const toggleBtn = e.target.closest(".toggle-subtimes-btn");
      if (!toggleBtn) return;

      const timeId = toggleBtn.dataset.timeId;
      const container = document.getElementById(`subtimes-container-${timeId}`);
      const chevron = toggleBtn.querySelector(".subtime-chevron");

      if (container) {
        const isHidden = container.classList.contains("hidden");

        if (isHidden) {
          container.classList.remove("hidden");
          chevron?.classList.add("rotate-180");
          openSubtimesState.add(timeId);
        } else {
          container.classList.add("hidden");
          chevron?.classList.remove("rotate-180");
          openSubtimesState.delete(timeId);
        }
      }
    });

    const helpToggle = document.getElementById("help-toggle");
    const helpModal = document.getElementById("help-modal");
    const closeHelpModal = document.getElementById("close-help-modal");
    const btnCloseHelp = document.getElementById("btn-close-help");
    const helpBackdrop = document.getElementById("help-modal-backdrop");

    const openHelp = (defaultTab = "safeguard") => {
      if (helpModal) helpModal.classList.replace("hidden", "flex");

      // Function to switch tabs inside the help modal
      const switchHelpTab = (tabName) => {
        const btnSafeguard = document.getElementById("tab-help-safeguard");
        const btnShortcuts = document.getElementById("tab-help-shortcuts");
        const contentSafeguard = document.getElementById(
          "content-help-safeguard",
        );
        const contentShortcuts = document.getElementById(
          "content-help-shortcuts",
        );

        if (
          !btnSafeguard ||
          !btnShortcuts ||
          !contentSafeguard ||
          !contentShortcuts
        )
          return;

        if (tabName === "safeguard") {
          // Safeguard Active State
          btnSafeguard.className =
            "w-full md:flex-1 text-center py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg bg-brand/30 text-primary border border-brand/40 transition cursor-pointer";
          btnShortcuts.className =
            "w-full md:flex-1 text-center py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg text-secondary hover:text-primary border border-transparent transition cursor-pointer";

          contentSafeguard.classList.remove("hidden");
          contentSafeguard.classList.add("flex");
          contentShortcuts.classList.add("hidden");
        } else if (tabName === "shortcuts") {
          // Shortcuts Active State
          btnShortcuts.className =
            "w-full md:flex-1 text-center py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg bg-brand/30 text-primary border border-brand/40 transition cursor-pointer";
          btnSafeguard.className =
            "w-full md:flex-1 text-center py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg text-secondary hover:text-primary border border-transparent transition cursor-pointer";

          contentShortcuts.classList.remove("hidden");
          contentSafeguard.classList.add("hidden");
          contentSafeguard.classList.remove("flex");
        }
      };

      // Set initial tab state upon opening
      switchHelpTab(defaultTab);

      // Bind click listeners for help modal tabs
      const btnSafeguard = document.getElementById("tab-help-safeguard");
      const btnShortcuts = document.getElementById("tab-help-shortcuts");

      if (btnSafeguard && !btnSafeguard.dataset.bound) {
        btnSafeguard.addEventListener("click", () =>
          switchHelpTab("safeguard"),
        );
        btnSafeguard.dataset.bound = "true";
      }

      if (btnShortcuts && !btnShortcuts.dataset.bound) {
        btnShortcuts.addEventListener("click", () =>
          switchHelpTab("shortcuts"),
        );
        btnShortcuts.dataset.bound = "true";
      }

      document.body.classList.add("overflow-hidden");
    };

    const closeHelp = () => {
      if (helpModal) helpModal.classList.replace("flex", "hidden");
      document.body.classList.remove("overflow-hidden");
    };

    helpToggle?.addEventListener("click", openHelp);
    closeHelpModal?.addEventListener("click", closeHelp);
    btnCloseHelp?.addEventListener("click", closeHelp);
    helpBackdrop?.addEventListener("click", closeHelp);

    const scrollTopBtn = document.getElementById("scroll-to-top-btn");

    if (scrollTopBtn) {
      let isVisible = false;
      let hideTimeout;

      window.addEventListener("scroll", () => {
        const scrollThreshold = 600;

        if (window.scrollY > scrollThreshold) {
          if (!isVisible) {
            isVisible = true;
            clearTimeout(hideTimeout);
            scrollTopBtn.classList.replace("hidden", "flex");
            requestAnimationFrame(() => {
              scrollTopBtn.classList.remove("opacity-0", "scale-75");
              scrollTopBtn.classList.add("opacity-100", "scale-100");
            });
          }
        } else {
          if (isVisible) {
            isVisible = false;
            requestAnimationFrame(() => {
              scrollTopBtn.classList.remove("opacity-100", "scale-100");
              scrollTopBtn.classList.add("opacity-0", "scale-75");
            });

            hideTimeout = setTimeout(() => {
              if (!isVisible) {
                scrollTopBtn.classList.replace("flex", "hidden");
              }
            }, 200);
          }
        }
      });

      scrollTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    if (window.currentThemeListener) {
      document.removeEventListener("themeChanged", window.currentThemeListener);
    }
    window.currentThemeListener = () => {
      const allTimes = StateManager.getTimes();
      AnalyticsController.dispatchRender(allTimes);
    };
    document.addEventListener("themeChanged", window.currentThemeListener);
  },

  handleTabSwitch(tab) {
    clearOpenSubtimesState();
    StateManager.setTab(tab);
    this.updateTabStyles(tab);
    this.refreshUI();
  },

  toggleModal(modalId, show) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    if (show) {
      modal.classList.replace("hidden", "flex");
      document.body.classList.add("overflow-hidden");
    } else {
      modal.classList.replace("flex", "hidden");
      document.body.classList.remove("overflow-hidden");
    }
  },

  updateNavigationDOM() {
    const views = ["times", "analytics", "calendar", "matrix", "settings"];
    const currentView = state.currentView;

    views.forEach((v) => {
      const el = document.getElementById(`${v}-view`);
      if (el) {
        if (currentView === v) el.classList.replace("hidden", "flex");
        else el.classList.replace("flex", "hidden");
      }

      const desktopBtn = document.getElementById(`nav-${v}`);
      const mobileBtn = document.getElementById(`mobile-${v}`);

      if (currentView === v) {
        desktopBtn?.classList.replace("text-secondary", "text-brand/80");
        desktopBtn?.classList.add("shadow-brand/10", "active");
        mobileBtn?.classList.replace("text-secondary", "text-brand/80");
        mobileBtn?.classList.add("active");
      } else {
        desktopBtn?.classList.replace("text-brand/80", "text-secondary");
        desktopBtn?.classList.remove("shadow-brand/10", "active");
        mobileBtn?.classList.replace("text-brand/80", "text-secondary");
        mobileBtn?.classList.remove("active");
      }
    });

    requestAnimationFrame(() => {
      if (currentView === "times") {
        this.updateTabStyles(state.activeTab);
      }
      if (currentView === "matrix") {
        MatrixController.updateTabStyles(state.matrixMode);
      }
      if (currentView === "calendar") {
        MatrixController.updateTabStyles(state.calendarMode);
      }
    });
  },

  setupTabIndicatorObserver() {
    const activeBtn = document.getElementById("tab-active");
    const completedBtn = document.getElementById("tab-completed");
    const archivedBtn = document.getElementById("tab-archived");

    if (!activeBtn || !completedBtn || !archivedBtn) return;

    if (!window.timeTabResizeObserver) {
      window.timeTabResizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          this.updateTabStyles(state.activeTab);
        });
      });
    }

    window.timeTabResizeObserver.disconnect();
    window.timeTabResizeObserver.observe(activeBtn);
    window.timeTabResizeObserver.observe(completedBtn);
    window.timeTabResizeObserver.observe(archivedBtn);
  },

  updateTabStyles(tab) {
    const indicator = document.getElementById("tab-indicator");
    const activeBtn = document.getElementById("tab-active");
    const completedBtn = document.getElementById("tab-completed");
    const archivedBtn = document.getElementById("tab-archived");

    if (!indicator || !activeBtn || !completedBtn || !archivedBtn) return;

    const buttons = [activeBtn, completedBtn, archivedBtn];
    const activeIndex = { active: 0, completed: 1, archived: 2 }[tab] ?? 0;
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
      } else {
        btn.classList.replace(
          "text-(--color-btn-primary-text)",
          "text-secondary",
        );
      }
    });
  },
};
