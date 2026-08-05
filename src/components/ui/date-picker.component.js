import { formatDate, generateId, todayISO } from "@/utils/helpers";

export class DatePickerComponent {
  constructor({
    id = `datepicker-${generateId()}`,
    value = "",
    placeholder = "YYYY-MM-DD",
    background = "surface-2",
    onChange,
  }) {
    this.id = id;
    this.value = value;
    this.placeholder = placeholder;
    this.background = background;
    this.onChange = onChange;

    const today = new Date();
    this.minYear = today.getFullYear();
    this.yearsPerPage = 12;
    this.totalPages = 4;
    this.maxYear = this.minYear + this.yearsPerPage * this.totalPages - 1;

    const initialDate = value ? this._parseLocalDate(value) : new Date();
    let parsedYear = isNaN(initialDate.getTime())
      ? this.minYear
      : initialDate.getFullYear();

    if (parsedYear < this.minYear) parsedYear = this.minYear;
    if (parsedYear > this.maxYear) parsedYear = this.maxYear;

    this.currentYear = parsedYear;
    this.currentMonth = isNaN(initialDate.getTime())
      ? today.getMonth()
      : initialDate.getMonth();

    this.isOpen = false;
    this.viewMode = "days";
    this.yearRangeStart = this.minYear;

    this.monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    this.shortMonthNames = [
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

    this._updatePosition = this._updatePosition.bind(this);
    this._onScrollOrResize = this._handleScrollOrResize.bind(this);
  }

  _parseLocalDate(dateStr) {
    if (!dateStr || !this.isValidDate(dateStr)) return new Date(NaN);
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  render() {
    return `
      <div
        id="${this.id}-container"
        class="relative w-full"
      >
        <div class="relative flex items-center">
          <input
            type="text"
            id="${this.id}"
            value="${this.value}"
            placeholder="${this.placeholder}"
            maxlength="10"
            autocomplete="off"
            class="h-11 w-full rounded-xl border border-border bg-${
              this.background
            } px-4 text-sm text-primary placeholder:text-secondary/70 transition focus:border-brand/80 focus:outline-none"
          />
          <button
            type="button"
            id="${this.id}-calendar-btn"
            class="absolute right-2 p-1.5 pt-1 text-secondary hover:text-primary focus:outline-none hover:scale-110 transition cursor-pointer"
            tabindex="-1"
          >
            <i class="fa-regular fa-calendar text-base"></i>
          </button>
        </div>
      </div>
    `;
  }

  _createPopoverInBody() {
    let popover = document.getElementById(`${this.id}-popover`);
    if (popover) return popover;

    popover = document.createElement("div");
    popover.id = `${this.id}-popover`;
    popover.className =
      "hidden fixed z-100 w-64 p-3 bg-surface border border-border rounded-xl shadow-xl backdrop-blur-md transition-opacity duration-200";

    popover.innerHTML = `
      <div class="flex items-center justify-between mb-3 px-1">
        <button
          type="button"
          id="${this.id}-month-year"
          class="text-xs font-bold text-primary hover:text-brand hover:bg-surface-2 px-2 py-1 rounded-lg transition cursor-pointer select-none"
        ></button>

        <div class="flex items-center gap-1">
          <button
            type="button"
            id="${this.id}-prev-btn"
            class="p-1 text-secondary hover:text-primary hover:bg-surface-2 rounded-md transition cursor-pointer"
          >
            <i class="fa-regular fa-chevron-left text-xs"></i>
          </button>
          <button
            type="button"
            id="${this.id}-next-btn"
            class="p-1 text-secondary hover:text-primary hover:bg-surface-2 rounded-md transition cursor-pointer"
          >
            <i class="fa-regular fa-chevron-right text-xs"></i>
          </button>
        </div>
      </div>

      <div
        id="${this.id}-weekdays-header"
        class="grid grid-cols-7 gap-1 mb-1 text-center"
      >
        <span class="text-[10px] font-semibold text-secondary">Sa</span>
        <span class="text-[10px] font-semibold text-secondary">Su</span>
        <span class="text-[10px] font-semibold text-secondary">Mo</span>
        <span class="text-[10px] font-semibold text-secondary">Tu</span>
        <span class="text-[10px] font-semibold text-secondary">We</span>
        <span class="text-[10px] font-semibold text-secondary">Th</span>
        <span class="text-[10px] font-semibold text-rose-400">Fr</span>
      </div>

      <div id="${this.id}-view-container"></div>

      <div
        class="flex items-center justify-between pt-2 mt-2 border-t border-border/50 text-xs"
      >
        <button
          type="button"
          id="${this.id}-clear-btn"
          class="text-xs text-rose-400 hover:underline transition cursor-pointer"
        >
          Clear
        </button>
        <button
          type="button"
          id="${this.id}-today-btn"
          class="text-xs text-brand hover:underline font-medium transition cursor-pointer"
        >
          Today
        </button>
      </div>
    `;

    document.body.appendChild(popover);
    return popover;
  }

  _updatePosition() {
    if (!this.isOpen) return;
    const input = document.getElementById(this.id);
    const popover = document.getElementById(`${this.id}-popover`);

    if (!input || !popover) return;

    const rect = input.getBoundingClientRect();

    if (rect.width === 0 && rect.height === 0) return;

    const popoverWidth = popover.offsetWidth || 256;

    popover.style.position = "fixed";
    popover.style.top = `${rect.bottom + 6}px`;
    popover.style.left = `${rect.right - popoverWidth}px`;
    popover.style.zIndex = "100";
  }

  _handleScrollOrResize(e) {
    const popover = document.getElementById(`${this.id}-popover`);
    if (e.target === popover || popover?.contains(e.target)) return;

    const input = document.getElementById(this.id);
    if (input) input.blur();

    popover?.classList.add("hidden");
    window.removeEventListener("scroll", this._onScrollOrResize, true);
    window.removeEventListener("resize", this._onScrollOrResize);
    this.isOpen = false;
  }

  _updateNavButtonsState() {
    const prevBtn = document.getElementById(`${this.id}-prev-btn`);
    const nextBtn = document.getElementById(`${this.id}-next-btn`);

    if (!prevBtn || !nextBtn) return;

    let isPrevDisabled = false;
    let isNextDisabled = false;

    if (this.viewMode === "days") {
      isPrevDisabled =
        this.currentYear === this.minYear && this.currentMonth === 0;
      isNextDisabled =
        this.currentYear === this.maxYear && this.currentMonth === 11;
    } else if (this.viewMode === "months") {
      isPrevDisabled = this.currentYear <= this.minYear;
      isNextDisabled = this.currentYear >= this.maxYear;
    } else if (this.viewMode === "years") {
      isPrevDisabled = this.yearRangeStart <= this.minYear;
      isNextDisabled = this.yearRangeStart + this.yearsPerPage > this.maxYear;
    }

    const setDisabledState = (btn, disabled) => {
      if (disabled) {
        btn.classList.add(
          "opacity-20",
          "cursor-not-allowed",
          "pointer-events-none",
        );
        btn.classList.remove(
          "hover:bg-surface-2",
          "hover:text-primary",
          "cursor-pointer",
        );
      } else {
        btn.classList.remove(
          "opacity-20",
          "cursor-not-allowed",
          "pointer-events-none",
        );
        btn.classList.add(
          "hover:bg-surface-2",
          "hover:text-primary",
          "cursor-pointer",
        );
      }
    };

    setDisabledState(prevBtn, isPrevDisabled);
    setDisabledState(nextBtn, isNextDisabled);
  }

  bindEvents() {
    const input = document.getElementById(this.id);
    const calendarBtn = document.getElementById(`${this.id}-calendar-btn`);
    const popover = this._createPopoverInBody();

    const monthYearBtn = document.getElementById(`${this.id}-month-year`);
    const prevBtn = document.getElementById(`${this.id}-prev-btn`);
    const nextBtn = document.getElementById(`${this.id}-next-btn`);
    const clearBtn = document.getElementById(`${this.id}-clear-btn`);
    const todayBtn = document.getElementById(`${this.id}-today-btn`);

    if (!input || !popover) return;

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();

        const formatted = input.value;

        if (formatted.length === 10 && this.isValidDate(formatted)) {
          const [y, m] = formatted.split("-").map(Number);
          if (y >= this.minYear && y <= this.maxYear) {
            this.currentYear = y;
            this.currentMonth = m - 1;
            this.renderCalendar();
            if (this.onChange) this.onChange(formatted);
          }
        }

        togglePopover(false);
        input.blur();
        return;
      }

      if (e.key === "Backspace") {
        const val = input.value;
        const start = input.selectionStart;
        const end = input.selectionEnd;

        if (start === end && start > 0) {
          if (val[start - 1] === "-") {
            e.preventDefault();

            const newVal = val.slice(0, start - 2) + val.slice(start);
            input.value = newVal;

            const newCursorPos = start - 2;
            input.setSelectionRange(newCursorPos, newCursorPos);

            input.dispatchEvent(new Event("input"));
          }
        }
      }
    });

    input.addEventListener("input", (e) => {
      const rawValue = input.value;
      const digits = rawValue.replace(/\D/g, "").slice(0, 8);
      const len = digits.length;

      let formatted = "";
      let newCursorPos = input.selectionStart;

      if (len === 0) {
        formatted = "";
        newCursorPos = 0;
      } else if (len <= 4) {
        formatted = digits;
        if (len === 4 && e.inputType !== "deleteContentBackward") {
          formatted += "-";
          newCursorPos = 5;
        }
      } else if (len <= 6) {
        const year = digits.slice(0, 4);
        const month = digits.slice(4);
        formatted = `${year}-${month}`;

        if (len === 6 && e.inputType !== "deleteContentBackward") {
          formatted += "-";
          newCursorPos = 8;
        }
      } else {
        const year = digits.slice(0, 4);
        const month = digits.slice(4, 6);
        const day = digits.slice(6);
        formatted = `${year}-${month}-${day}`;
      }

      input.value = formatted;
      this.value = formatted;

      if (document.activeElement === input && newCursorPos !== null) {
        input.setSelectionRange(newCursorPos, newCursorPos);
      }

      if (formatted.length === 10 && this.isValidDate(formatted)) {
        const [y, m] = formatted.split("-").map(Number);
        if (y >= this.minYear && y <= this.maxYear) {
          this.currentYear = y;
          this.currentMonth = m - 1;
          this.renderCalendar();
          if (this.onChange) this.onChange(formatted);
        }
      } else if (formatted === "") {
        if (this.onChange) this.onChange("");
      }
    });

    popover.addEventListener("mousedown", (e) => {
      e.preventDefault();
    });

    input.addEventListener("blur", () => {
      togglePopover(false);
    });

    const togglePopover = (show) => {
      this.isOpen = typeof show === "boolean" ? show : !this.isOpen;
      if (this.isOpen) {
        this.viewMode = "days";
        this.renderCalendar();
        popover.classList.remove("hidden");

        this._updatePosition();

        window.addEventListener("scroll", this._onScrollOrResize, true);
        window.addEventListener("resize", this._onScrollOrResize);
      } else {
        popover.classList.add("hidden");

        window.removeEventListener("scroll", this._onScrollOrResize, true);
        window.removeEventListener("resize", this._onScrollOrResize);
      }
    };

    calendarBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      togglePopover();
    });

    input.addEventListener("focus", () => togglePopover(true));

    monthYearBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this.viewMode === "days") {
        this.viewMode = "months";
      } else if (this.viewMode === "months") {
        this.viewMode = "years";
        const offset =
          Math.floor((this.currentYear - this.minYear) / this.yearsPerPage) *
          this.yearsPerPage;
        this.yearRangeStart = this.minYear + offset;
      } else {
        this.viewMode = "days";
      }
      this.renderCalendar();
    });

    prevBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this.viewMode === "days") {
        if (this.currentYear === this.minYear && this.currentMonth === 0)
          return;
        this.currentMonth--;
        if (this.currentMonth < 0) {
          this.currentMonth = 11;
          this.currentYear--;
        }
      } else if (this.viewMode === "months") {
        if (this.currentYear <= this.minYear) return;
        this.currentYear--;
      } else if (this.viewMode === "years") {
        if (this.yearRangeStart <= this.minYear) return;
        this.yearRangeStart -= this.yearsPerPage;
        if (this.yearRangeStart < this.minYear)
          this.yearRangeStart = this.minYear;
      }
      this.renderCalendar();
    });

    nextBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this.viewMode === "days") {
        if (this.currentYear === this.maxYear && this.currentMonth === 11)
          return;
        this.currentMonth++;
        if (this.currentMonth > 11) {
          this.currentMonth = 0;
          this.currentYear++;
        }
      } else if (this.viewMode === "months") {
        if (this.currentYear >= this.maxYear) return;
        this.currentYear++;
      } else if (this.viewMode === "years") {
        if (this.yearRangeStart + this.yearsPerPage > this.maxYear) return;
        this.yearRangeStart += this.yearsPerPage;
      }
      this.renderCalendar();
    });

    clearBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.reset();
      if (this.onChange) this.onChange("");

      if (input) {
        input.blur();
      }
    });

    todayBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      const todayStr = todayISO();

      this.value = todayStr;
      const now = new Date();
      input.value = todayStr;
      this.value = todayStr;
      this.currentYear = now.getFullYear();
      this.currentMonth = now.getMonth();
      this.viewMode = "days";

      if (this.onChange) this.onChange(todayStr);

      if (input) {
        input.value = todayStr;
        input.blur();
      }
    });

    document.addEventListener("click", (e) => {
      const container = document.getElementById(`${this.id}-container`);
      const popoverEl = document.getElementById(`${this.id}-popover`);
      if (
        container &&
        !container.contains(e.target) &&
        popoverEl &&
        !popoverEl.contains(e.target)
      ) {
        togglePopover(false);
      }
    });
  }

  renderCalendar() {
    const monthYearBtn = document.getElementById(`${this.id}-month-year`);
    const weekdaysHeader = document.getElementById(
      `${this.id}-weekdays-header`,
    );
    const viewContainer = document.getElementById(`${this.id}-view-container`);

    if (!monthYearBtn || !viewContainer) return;

    if (this.viewMode === "days") {
      weekdaysHeader?.classList.remove("hidden");
      monthYearBtn.textContent = `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
      this.renderDaysView(viewContainer);
    } else if (this.viewMode === "months") {
      weekdaysHeader?.classList.add("hidden");
      monthYearBtn.textContent = `${this.currentYear} - ${this.maxYear}`;
      this.renderMonthsView(viewContainer);
    } else if (this.viewMode === "years") {
      weekdaysHeader?.classList.add("hidden");
      const endYear = this.yearRangeStart + this.yearsPerPage - 1;
      monthYearBtn.textContent = `${this.yearRangeStart} - ${endYear}`;
      this.renderYearsView(viewContainer);
    }

    this._updateNavButtonsState();
  }

  renderDaysView(container) {
    const nativeFirstDay = new Date(
      this.currentYear,
      this.currentMonth,
      1,
    ).getDay();
    const firstDayIndex = (nativeFirstDay + 1) % 7;

    const totalDays = new Date(
      this.currentYear,
      this.currentMonth + 1,
      0,
    ).getDate();
    const prevMonthTotalDays = new Date(
      this.currentYear,
      this.currentMonth,
      0,
    ).getDate();

    let gridHTML = `<div class="grid grid-cols-7 gap-1">`;
    const todayStr = todayISO();

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = prevMonthTotalDays - i;
      gridHTML += `<div
        class="h-7 w-7 mx-auto flex items-center justify-center text-xs rounded-lg text-secondary/30 pointer-events-none"
      >
        ${day}
      </div>`;
    }

    for (let day = 1; day <= totalDays; day++) {
      const mStr = String(this.currentMonth + 1).padStart(2, "0");
      const dStr = String(day).padStart(2, "0");
      const dateStr = `${this.currentYear}-${mStr}-${dStr}`;

      const dayOfWeek = new Date(
        this.currentYear,
        this.currentMonth,
        day,
      ).getDay();
      const isFriday = dayOfWeek === 5;

      const isSelected = this.value === dateStr;
      const isToday = todayStr === dateStr;

      let classNames =
        "h-7 w-7 mx-auto flex items-center justify-center text-xs rounded-lg cursor-pointer transition-all ";

      if (isSelected) {
        classNames += "bg-brand/80 text-white font-bold shadow-md shadow-brand/20";
      } else if (isToday) {
        classNames +=
          "border border-brand/80 text-brand/80 font-semibold hover:bg-brand/10";
      } else if (isFriday) {
        classNames += "text-rose-400 font-medium hover:bg-rose-500/10";
      } else {
        classNames += "text-primary hover:bg-surface-2";
      }

      gridHTML += `<div
        class="${classNames}"
        data-date="${dateStr}"
      >
        ${day}
      </div>`;
    }

    const totalFilled = firstDayIndex + totalDays;
    const nextDaysNeeded =
      (42 - totalFilled) % 7 === 0 && totalFilled > 35 ? 0 : 42 - totalFilled;

    for (let day = 1; day <= nextDaysNeeded; day++) {
      gridHTML += `<div
        class="h-7 w-7 mx-auto flex items-center justify-center text-xs rounded-lg text-secondary/30 pointer-events-none"
      >
        ${day}
      </div>`;
    }

    gridHTML += `</div>`;
    container.innerHTML = gridHTML;

    container.querySelectorAll("[data-date]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const selectedDate = el.dataset.date;
        const [y, m] = selectedDate.split("-").map(Number);

        this.currentYear = y;
        this.currentMonth = m - 1;
        this.value = selectedDate;

        const input = document.getElementById(this.id);
        if (input) {
          input.value = selectedDate;
          input.blur();
        }

        if (this.onChange) this.onChange(selectedDate);
      });
    });
  }

  renderMonthsView(container) {
    let html = `<div class="grid grid-cols-3 gap-2 py-1"></div>`;

    this.shortMonthNames.forEach((month, idx) => {
      const isCurrentMonth = idx === this.currentMonth;
      let classNames =
        "py-2 text-center text-xs rounded-xl cursor-pointer font-medium transition-all ";

      if (isCurrentMonth) {
        classNames += "bg-brand/15 text-brand/80 font-bold border border-brand/30";
      } else {
        classNames += "text-primary hover:bg-surface-2";
      }

      html += `<div
        class="${classNames}"
        data-month="${idx}"
      >
        ${month}
      </div>`;
    });

    html += `</div>`;
    container.innerHTML = html;

    container.querySelectorAll("[data-month]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        this.currentMonth = parseInt(el.dataset.month, 10);
        this.viewMode = "days";
        this.renderCalendar();
      });
    });
  }

  renderYearsView(container) {
    let html = `<div class="grid grid-cols-3 gap-2 py-1">`;

    for (let i = 0; i < this.yearsPerPage; i++) {
      const year = this.yearRangeStart + i;
      const isCurrentYear = year === this.currentYear;

      let classNames =
        "py-2 text-center text-xs rounded-xl cursor-pointer font-medium transition-all ";

      if (isCurrentYear) {
        classNames += "bg-brand/15 text-brand/80 font-bold border border-brand/30";
      } else {
        classNames += "text-primary hover:bg-surface-2";
      }

      html += `<div
        class="${classNames}"
        data-year="${year}"
      >
        ${year}
      </div>`;
    }

    html += `</div>`;
    container.innerHTML = html;

    container.querySelectorAll("[data-year]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        this.currentYear = parseInt(el.dataset.year, 10);
        this.viewMode = "months";
        this.renderCalendar();
      });
    });
  }

  isValidDate(dateString) {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false;
    const [y, m, d] = dateString.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    return (
      dateObj.getFullYear() === y &&
      dateObj.getMonth() === m - 1 &&
      dateObj.getDate() === d
    );
  }

  reset() {
    this.value = "";

    const input = document.getElementById(this.id);
    if (input) input.value = "";

    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth();
    this.viewMode = "days";

    this.renderCalendar();
  }
}
