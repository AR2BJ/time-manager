import { generateId } from "@/utils/helpers";

export class ComboboxComponent {
  constructor(container, items = [], options = {}) {
    const defaults = {
      label: "combobox",
      placeholder: "Type and press Enter...",
      itemTitle: "title",
      itemValue: "value",
      itemIcon: "icon",
      isRow: false,
      clearable: true,
      autoSelectFirst: false,
      multiple: true,
      chips: true,
      chipRemovable: true,
      iconClass: "fa-regular fa-list",
      containerClass: "",
      inputClass: "",
      dropdownClass: "",
      chipClass: "",
      clearButtonClass: "",
      onChange: null,
      onClear: null,
    };

    this.options = { ...defaults, ...options };
    this.container =
      typeof container === "string"
        ? document.getElementById(container)
        : container;

    if (!this.container) {
      throw new Error("Combobox: Container element not found!");
    }

    this.allItems = [...items];
    this.filteredItems = [...items];
    this.selectedItems = [];
    this.isOpen = false;
    this.activeIndex = -1;
    this.searchQuery = "";
    this.isDestroyed = false;

    this.render();
    this.bindEvents();

    if (this.options.onChange) this.onChange(this.options.onChange);
    if (this.options.onClear) this.onClear(this.options.onClear);
  }

  render() {
    const uuid = `${generateId().split("-")[0]}-${generateId().split("-")[1]}`;

    this.container.innerHTML = `
      <div class="relative flex flex-col justify-center items-stretch gap-1">
        <div
          class="flex ${
            this.options.isRow ? "flex-row" : "flex-col"
          } justify-center items-stretch"
        >
          ${
            this.options.label
              ? `<label
                  for="combobox-input-${uuid}"
                  class="${this.options.isRow ? "pe-2 hidden sm:flex flex-row justify-center items-center" : "mb-1.5 ps-3 flex flex-row justify-start items-center"} text-xs font-semibold text-secondary"
                >
                  ${this.options.label}${this.options.isRow ? ":" : ""}
                </label>`
              : ""
          }
          <div
            id="combobox-container-${uuid}"
            class="${
              this.options.containerClass
            } relative min-h-10 w-full flex flex-wrap items-center content-start gap-1.5 rounded-xl border border-border bg-surface-2 p-1.75 pe-20 focus-within:border-brand/80 focus-within:ring-1 focus-within:ring-brand/30 transition group cursor-pointer"
          >
            <div
              id="combobox-chips-${uuid}"
              class="hidden flex-wrap gap-1.5"
            ></div>

            <input
              id="combobox-input-${uuid}"
              type="text"
              placeholder="${
                this.options.placeholder
                  ? this.options.placeholder
                  : "Typing and press Enter..."
              }"
              class="${
                this.options.inputClass
              } flex-1 min-w-25 ps-2 pe-16 truncate bg-transparent text-sm text-primary placeholder:text-secondary/70 outline-none pb-0.5 h-7 cursor-text focus:outline-none"
              autocomplete="off"
            />

            <button
              id="combobox-clear-btn-${uuid}"
              type="button"
              class="${
                this.options.clearButtonClass
              } absolute right-10 top-1/2 -translate-y-1/2 bg-brand/20 w-5.5 h-5.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-brand/40 text-muted p-1 items-center justify-center cursor-pointer flex z-10"
              title="Clear all"
            >
              <i class="fa-regular fa-xmark-large text-[8px]"></i>
            </button>

            <button
              type="button"
              id="combobox-arrow-${uuid}"
              class="absolute right-3 top-1/2 -translate-y-1/2 flex text-secondary hover:text-primary transition duration-200 pointer-events-none z-10"
              tabindex="-1"
            >
              <i
                id="combobox-arrow-icon-${uuid}"
                class="fa-regular fa-chevron-down text-xs"
              ></i>
            </button>
          </div>
        </div>

        <div
          id="combobox-dropdown-${uuid}"
          class="${
            this.options.dropdownClass
          } hidden max-h-48 overflow-y-auto rounded-xl border border-border bg-surface shadow-2xl backdrop-blur-md scrollbar-thin scrollbar-thumb-surface-2"
        ></div>
      </div>
    `;

    this.elements = {
      container: this.container.querySelector(`#combobox-container-${uuid}`),
      input: this.container.querySelector(`#combobox-input-${uuid}`),
      clearBtn: this.container.querySelector(`#combobox-clear-btn-${uuid}`),
      arrow: this.container.querySelector(`#combobox-arrow-${uuid}`),
      dropdown: this.container.querySelector(`#combobox-dropdown-${uuid}`),
      chipsContainer: this.container.querySelector(`#combobox-chips-${uuid}`),
    };

    this.updateClearButton();
    this.renderChips();
  }

  bindEvents() {
    const { container, input, dropdown, clearBtn, chipsContainer } =
      this.elements;

    container.addEventListener("click", (e) => {
      e.stopPropagation();
      input.focus();
    });

    input.addEventListener("focus", () => this.handleFocus());
    input.addEventListener("blur", () => {
      setTimeout(() => {
        const activeElement = document.activeElement;
        const dropdownId = this.elements.dropdown.id;
        const isChipButton =
          activeElement?.closest?.(".remove-chip-btn") ||
          activeElement?.closest?.(".combobox-chip");

        const isDropdown = activeElement?.closest?.(`#${dropdownId}`);

        if (!isChipButton && !isDropdown) {
          this.closeDropdown();
        }
      }, 100);
    });

    input.addEventListener("click", (e) => {
      e.stopPropagation();
      this.handleFocus();
    });

    input.addEventListener("input", () => this.handleInput());
    input.addEventListener("keydown", (e) => this.handleKeydown(e));

    clearBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.clearAll();
    });

    chipsContainer?.addEventListener("mousedown", (e) => {
      const removeBtn = e.target.closest(".remove-chip-btn");
      if (removeBtn) {
        e.preventDefault();
      }
    });

    chipsContainer?.addEventListener("click", (e) => {
      const removeBtn = e.target.closest(".remove-chip-btn");
      if (!removeBtn) return;

      e.stopPropagation();
      e.preventDefault();

      const chip = removeBtn.closest(".combobox-chip");
      if (!chip) return;

      const itemText = chip.querySelector(".chip-text")?.textContent;
      const item = this.selectedItems.find(
        (i) => this.getItemText(i) === itemText,
      );

      if (item) {
        this.removeSelectedItem(item);
      }
    });

    dropdown.addEventListener("wheel", (e) => {
      e.stopPropagation();
    });

    this.boundDocumentClick = (e) => {
      if (!this.container.contains(e.target)) {
        this.closeDropdown();
      }
    };
    document.addEventListener("click", this.boundDocumentClick);

    this.boundScroll = (e) => {
      if (
        e.target &&
        e.target instanceof Node &&
        this.elements.dropdown.contains(e.target)
      ) {
        return;
      }
      if (this.isOpen) this.closeDropdown();
    };
    window.addEventListener("scroll", this.boundScroll, true);

    dropdown.addEventListener("mousedown", (e) => e.preventDefault());

    dropdown.addEventListener("click", (e) => {
      const el = e.target.closest(".combobox-item");
      if (!el) return;
      e.stopPropagation();
      e.preventDefault();
      const value = el.getAttribute("data-value");
      if (value === undefined || value === null) return;

      // try to find matching object/item, fallback to creating new
      const found = this.allItems.find(
        (i) => String(this.getItemValue(i)) === String(value),
      );
      if (found) {
        this.selectItem(found);
      } else {
        this.createNewItem(value);
      }
    });

    this.boundResize = () => {
      if (this.isOpen) this.closeDropdown();
    };
    window.addEventListener("resize", this.boundResize);
  }

  updatePosition() {
    if (!this.isOpen || !this.elements) return;

    const rect = this.elements.container.getBoundingClientRect();

    const dropdown = this.elements.dropdown;

    dropdown.style.position = "fixed";
    dropdown.style.top = `${rect.bottom + 4}px`;
    dropdown.style.left = `${rect.left}px`;
    dropdown.style.width = `${rect.width}px`;
    dropdown.style.zIndex = "100";

    dropdown.classList.add(
      "max-h-52",
      "overflow-y-auto",
      "scrollbar-thin",
      "scrollbar-thumb-surface-2",
    );
  }

  handleFocus() {
    if (this.isDestroyed) return;
    this.openDropdown();
  }

  handleInput() {
    if (this.isDestroyed) return;
    this.searchQuery = this.elements.input.value;
    this.filterItems(this.searchQuery);
    this.updateClearButton();

    if (!this.isOpen) {
      this.openDropdown();
    }
  }

  openDropdown() {
    if (this.isOpen || this.isDestroyed) return;

    this.isOpen = true;
    this.filteredItems = [...this.allItems];

    if (this.options.multiple || this.options.chips) {
      this.filteredItems = this.filteredItems.filter(
        (item) => !this.selectedItems.some((s) => this.isEqual(item, s)),
      );
    }

    this.updatePosition();

    this.filterItems(this.searchQuery);
    this.elements.dropdown.classList.remove("hidden");
    this.elements.arrow.classList.add("rotate-180");
    this.activeIndex = -1;
  }

  closeDropdown() {
    if (!this.isOpen || this.isDestroyed) return;

    this.isOpen = false;
    this.elements.dropdown.classList.add("hidden");
    this.elements.arrow.classList.remove("rotate-180");
    this.activeIndex = -1;

    this.updatePosition();
  }

  filterItems(query) {
    const q = query.toLowerCase().trim();

    if (!q) {
      this.filteredItems = [...this.allItems];
    } else {
      this.filteredItems = this.allItems.filter((item) => {
        const text = this.getItemText(item).toLowerCase();
        return text.includes(q);
      });
    }

    if (this.options.multiple || this.options.chips) {
      this.filteredItems = this.filteredItems.filter(
        (item) => !this.selectedItems.some((s) => this.isEqual(item, s)),
      );
    }

    const isAlreadySelected = q
      ? this.selectedItems.some((item) =>
          this.getItemText(item).toLowerCase().includes(q),
        )
      : false;

    this.renderDropdown(this.filteredItems, q, isAlreadySelected);
  }

  renderDropdown(items, query, isAlreadySelected) {
    const dropdown = this.elements.dropdown;

    this.activeIndex = -1;
    this.clearDropdownHighlight();

    if (!items) return;

    let html = "";

    if (items.length > 0) {
      html += items
        .map((item) => {
          const icon = this.getItemIcon(item);
          return `
          <div
            data-value="${this.getItemValue(item)}"
            class="combobox-item px-3.5 py-2 text-xs font-medium text-primary hover:bg-brand/10 hover:text-brand cursor-pointer flex items-center justify-between transition border-b border-border/30 last:border-none"
          >
            <span class="flex items-center gap-1.5">
              <i class="${icon} text-sm"></i>
              ${this.getItemText(item)}
            </span>
            <span class="text-[10px] text-muted"
              >Existing Item</span
            >
          </div>
        `;
        })
        .join("");
    }

    if (isAlreadySelected) {
      this.renderEmptyState(`"${query}" is already added.`);
      return;
    }

    if (query) {
      const isExactMatch = items.some(
        (item) => this.getItemText(item).toLowerCase() === query,
      );
      if (!isExactMatch) {
        html += `
          <div
            data-value="${query}"
            class="combobox-item px-3.5 py-2 text-xs font-medium text-brand/80 hover:bg-brand/15 cursor-pointer flex items-center justify-between transition ${
              items.length > 0 ? "border-t border-border/40" : ""
            }"
          >
            <span class="flex items-center gap-1.5">
              <i class="fa-regular fa-plus text-xs"></i>
              Create "${query}"
            </span>
            <span class="text-[10px] text-brand/80 font-bold"
              >New Items</span
            >
          </div>
        `;
      }
    }

    if (html.length === 0) {
      this.renderEmptyState("No items found");
      return;
    }

    if (!html) {
      this.renderEmptyState(`No matching items found for "${query}"`);
      return;
    }

    dropdown.innerHTML = html;

    if (!dropdown.classList.contains("hidden")) {
      this.updatePosition();
    }
  }

  renderEmptyState(message) {
    this.activeIndex = -1;

    this.clearDropdownHighlight();

    this.elements.dropdown.innerHTML = `
      <div
        class="px-3.5 py-3 text-xs text-muted text-center flex items-center justify-center gap-1 select-none"
      >
        <i class="fa-regular fa-circle-info text-brand/60"></i>
        <span>${message}</span>
      </div>
    `;
  }

  clearDropdownHighlight() {
    const items = Array.from(
      this.elements.dropdown?.querySelectorAll(".combobox-item") || [],
    );

    items.forEach((item) => {
      item.classList.remove("bg-brand/15", "border-brand/20", "text-brand/80");
    });

    this.activeIndex = -1;
  }

  highlightItem(index) {
    const items =
      this.elements.dropdown.querySelectorAll(".combobox-item") || [];

    items.forEach((el, i) => {
      if (i === index) {
        el.classList.add("bg-brand/15", "border-brand/20", "text-brand/80");
      } else {
        el.classList.remove("bg-brand/15", "border-brand/20", "text-brand/80");
      }
    });

    if (index >= 0 && index < items.length) {
      items[index].scrollIntoView({ block: "nearest" });
    }
  }

  selectItem(item) {
    if (this.isDestroyed) return;

    const isSelected = this.selectedItems.some((s) => this.isEqual(s, item));
    if (isSelected) return;

    if (this.options.multiple || this.options.chips) {
      if (isSelected) return;

      this.selectedItems.push(item);
      this.renderChips();
      this.elements.input.value = "";
      this.searchQuery = "";
      this.filterItems("");
      this.updateClearButton();

      if (!this.isOpen) {
        this.openDropdown();
      }
    } else {
      this.selectedItems = [item];
      const text = this.getItemText(item);
      this.elements.input.value = text;
      this.searchQuery = text;
      this.closeDropdown();
      this.updateClearButton();
    }

    this.updatePosition();

    this.emitChange();
  }

  removeSelectedItem(item) {
    if (this.isDestroyed) return;

    if (!this.options.multiple && !this.options.chips) {
      this.clearAll();
      return;
    }

    this.selectedItems = this.selectedItems.filter(
      (s) => !this.isEqual(s, item),
    );

    if (item?.isNew) {
      this.allItems = this.allItems.filter(
        (i) => this.getItemValue(i) !== this.getItemValue(item),
      );
    }

    this.renderChips();
    this.filterItems(this.searchQuery);
    this.updateClearButton();
    this.emitChange();

    if (this.isOpen) {
      this.renderDropdown();
      this.updatePosition();
    }
  }

  renderChips() {
    const { chipsContainer } = this.elements;
    if (!chipsContainer || !this.options.chips) return;

    chipsContainer.innerHTML = "";

    const chipClasses = `${this.options.chipClass} combobox-chip flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-brand/10 text-brand/80 font-medium text-xs border border-brand/20 select-none animate-fadeIn`;

    this.selectedItems.forEach((item) => {
      const chip = document.createElement("span");
      chip.className = chipClasses;
      const icon = this.getItemIcon(item);

      if (this.options.chipRemovable) {
        chip.innerHTML = `
          <span class="flex flex-row justify-center items-center gap-1">
            <i class="${icon} text-xs"></i>
            <span class="chip-text">${this.getItemText(item)}</span>
          </span>
          <button
            type="button"
            class="remove-chip-btn hover:text-red-500 transition cursor-pointer flex items-center justify-center"
          >
            <i class="fa-regular fa-xmark text-[10px]"></i>
          </button>
        `;
      } else {
        chip.innerHTML = `
          <span class="flex flex-row justify-center items-center gap-1">
            <i class="${icon} text-xs"></i>
            ${this.getItemText(item)}
          </span>
        `;
      }

      chipsContainer.appendChild(chip);
    });

    if (this.selectedItems.length > 0) {
      chipsContainer.classList.replace("hidden", "flex");
    } else {
      chipsContainer.classList.replace("flex", "hidden");
    }
  }

  createNewItem(value) {
    if (this.isDestroyed) return;

    const trimmed = value.trim();
    if (!trimmed) return;

    const exists = this.allItems.some(
      (item) => this.getItemText(item).toLowerCase() === trimmed.toLowerCase(),
    );

    if (exists) {
      const existing = this.allItems.find(
        (item) =>
          this.getItemText(item).toLowerCase() === trimmed.toLowerCase(),
      );
      this.selectItem(existing);
      return;
    }

    let newItem;
    const firstItem = this.allItems[0];
    if (firstItem && typeof firstItem === "object" && firstItem !== null) {
      newItem = {
        [this.options.itemTitle]: trimmed,
        [this.options.itemValue]: trimmed,
        isNew: true,
      };
    } else {
      newItem = {
        [this.options.itemTitle]: trimmed,
        [this.options.itemValue]: trimmed,
        isNew: true,
      };
    }

    if (!newItem.isNew) {
      this.allItems.push(newItem);
    }

    this.selectItem(newItem);

    if (this.options.multiple || this.options.chips) {
      this.elements.input.value = "";
      this.searchQuery = "";
      this.filterItems("");
      this.elements.input.focus();
    }
  }

  clearAll() {
    if (this.isDestroyed) return;

    this.selectedItems = [];
    this.elements.input.value = "";
    this.searchQuery = "";
    this.filterItems("");
    this.updateClearButton();
    this.renderChips();
    this.closeDropdown();
    this.emitChange("clear");
  }

  updateClearButton() {
    const { clearBtn, input } = this.elements;
    const hasValue = input.value.length > 0 || this.selectedItems.length > 0;

    clearBtn.classList.toggle("hidden", !hasValue || !this.options.clearable);
  }

  handleKeydown(e) {
    if (this.isDestroyed) return;

    const items = this.elements.dropdown.querySelectorAll(".combobox-item");
    const total = items.length;

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        e.stopPropagation();
        if (this.isOpen && this.activeIndex >= 0 && this.activeIndex < total) {
          const item = this.filteredItems[this.activeIndex];
          if (item) {
            this.selectItem(item);
            if (!this.options.multiple && !this.options.chips) {
              this.closeDropdown();
            }
            return;
          }
        }
        const val = this.elements.input.value.trim();
        if (val) {
          this.createNewItem(val);
          if (!this.options.multiple && !this.options.chips) {
            this.closeDropdown();
          }
        }
        break;

      case ",":
        e.preventDefault();
        e.stopPropagation();
        if (this.isOpen && this.activeIndex >= 0 && this.activeIndex < total) {
          const item = this.filteredItems[this.activeIndex];
          if (item) {
            this.selectItem(item);
            if (!this.options.multiple && !this.options.chips) {
              this.closeDropdown();
            }
            return;
          }
        }
        const value = this.elements.input.value.trim();
        if (value) {
          this.createNewItem(value);
          if (!this.options.multiple && !this.options.chips) {
            this.closeDropdown();
          }
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        if (!this.isOpen) {
          this.openDropdown();
          return;
        }
        if (total > 0) {
          this.activeIndex = (this.activeIndex + 1) % total;
          this.highlightItem(this.activeIndex);
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (!this.isOpen) {
          this.openDropdown();
          return;
        }
        if (total > 0) {
          this.activeIndex = (this.activeIndex - 1 + total) % total;
          this.highlightItem(this.activeIndex);
        }
        break;

      case "Escape":
        e.preventDefault();
        this.closeDropdown();
        this.elements.input.blur();
        break;

      case "Backspace":
        if (
          (this.options.multiple || this.options.chips) &&
          this.elements.input.value === "" &&
          this.selectedItems.length > 0
        ) {
          const last = this.selectedItems[this.selectedItems.length - 1];
          this.removeSelectedItem(last);
        }
        break;

      case "Delete":
        if (
          (this.options.multiple || this.options.chips) &&
          this.elements.input.value === "" &&
          this.selectedItems.length > 0
        ) {
          const first = this.selectedItems[0];
          this.removeSelectedItem(first);
        }
        break;
    }
  }

  getItemText(item) {
    if (typeof item === "string") return item;
    if (item && typeof item === "object") {
      return (
        item[this.options.itemTitle] ||
        item[this.options.itemValue] ||
        String(item)
      );
    }
    return String(item);
  }

  getItemValue(item) {
    if (typeof item === "string") return item;
    if (item && typeof item === "object") {
      return item[this.options.itemValue] !== undefined
        ? item[this.options.itemValue]
        : item[this.options.itemTitle] || item;
    }
    return item;
  }

  getItemIcon(item) {
    if (typeof item === "string") {
      return this.options.iconClass;
    }

    if (item && typeof item === "object") {
      const icon = item[this.options.itemIcon];
      if (icon) {
        return icon;
      }
    }

    return this.options.iconClass;
  }

  isEqual(a, b) {
    if (a === b) return true;
    if (
      typeof a === "object" &&
      typeof b === "object" &&
      a !== null &&
      b !== null
    ) {
      return this.getItemValue(a) === this.getItemValue(b);
    }
    return false;
  }

  isSelected(item) {
    return this.selectedItems.some((s) => this.isEqual(s, item));
  }

  emitChange(type = "change") {
    if (this.isDestroyed) return;

    const values = this.selectedItems.map((item) => this.getItemValue(item));
    const texts = this.selectedItems.map((item) => this.getItemText(item));

    const detail = {
      values:
        this.options.multiple || this.options.chips
          ? values
          : values[0] || null,
      texts:
        this.options.multiple || this.options.chips ? texts : texts[0] || null,
      items: this.selectedItems,
      type: type,
    };

    this.container.dispatchEvent(
      new CustomEvent("combobox-change", { detail }),
    );

    if (type === "change" && this.onChangeCallback) {
      this.onChangeCallback(detail.values, detail.texts, detail.items);
    }

    if (type === "clear" && this.onClearCallback) {
      this.onClearCallback();
    }
  }

  onChange(callback) {
    this.onChangeCallback = callback;
    return this;
  }

  onClear(callback) {
    this.onClearCallback = callback;
    return this;
  }

  getValue() {
    const values = this.selectedItems.map((item) => this.getItemValue(item));
    return this.options.multiple || this.options.chips
      ? values
      : values[0] || null;
  }

  getSelectedItems() {
    return this.selectedItems;
  }

  getSelectedTexts() {
    return this.selectedItems.map((item) => this.getItemText(item));
  }

  setItems(items) {
    if (this.isDestroyed) return;
    this.allItems = [...items];
    this.filteredItems = [...items];
    this.filterItems(this.searchQuery);
    return this;
  }

  setValue(value) {
    if (this.isDestroyed) return;

    const item = this.allItems.find(
      (item) => this.getItemValue(item) === value,
    );

    if (item) {
      this.selectItem(item);
    } else if (!this.options.multiple && !this.options.chips) {
      this.elements.input.value = value;
      this.searchQuery = value;
    }

    return this;
  }

  clear() {
    this.clearAll();
    return this;
  }

  destroy() {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    document.removeEventListener("click", this.boundDocumentClick);
    window.removeEventListener("scroll", this.boundScroll, true);
    window.removeEventListener("resize", this.boundResize);

    this.container.innerHTML = "";

    this.elements = null;
    this.allItems = [];
    this.filteredItems = [];
    this.selectedItems = [];

    return this;
  }
}
