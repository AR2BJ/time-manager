import { StateManager, state } from "@/models/state.model.js";
import { generateId, todayISO } from "@/utils/helpers";

import { GlobalLoaderService } from "@/services/loader.service";
import { NotificationService } from "@/services/notification.service.js";
import { SettingsTagController } from "./settings-tag.controller.js";

export const SettingsImportController = {
  init() {
    this.initImportDropzone();
  },

  initImportDropzone() {
    const dropzone = document.getElementById("sett-dropzone");
    const fileInput = document.getElementById("sett-import-file");

    dropzone?.addEventListener("click", () => fileInput?.click());

    dropzone?.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("border-brand/80", "bg-brand/5");
    });

    ["dragleave", "drop"].forEach((event) => {
      dropzone?.addEventListener(event, () => {
        dropzone.classList.remove("border-brand/80", "bg-brand/5");
      });
    });

    dropzone?.addEventListener("drop", (e) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files.length) this.processImportedFile(files[0]);
    });

    fileInput?.addEventListener("change", (e) => {
      if (e.target.files.length) this.processImportedFile(e.target.files[0]);
    });
  },

  processImportedFile(file) {
    const fileName = file.name.toLowerCase();
    let format = "";

    if (file.type === "application/json" || fileName.endsWith(".json"))
      format = "json";
    else if (fileName.endsWith(".md") || fileName.endsWith(".markdown"))
      format = "markdown";
    else if (file.type === "text/csv" || fileName.endsWith(".csv"))
      format = "csv";
    else {
      NotificationService.show({
        type: "error",
        message:
          "Invalid format! Only structural JSON, MD, or CSV files are permitted.",
        icon: "fa-circle-xmark",
        iconColor: "text-red-500/80",
        duration: 5000,
      });
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", (event) => {
      GlobalLoaderService.show(
        `Parsing storage integrity from ${format.toUpperCase()}...`,
      );

      setTimeout(() => {
        try {
          const rawContent = event.target.result;
          let importedTimes = [];
          let importedTags = [];

          if (format === "json") {
            const parsedJson = JSON.parse(rawContent);
            importedTimes = Array.isArray(parsedJson)
              ? parsedJson
              : parsedJson.times || [];
            importedTags = parsedJson.tags || [];
          } else if (format === "markdown") {
            const parsedMd = this.parseMarkdownToTimes(rawContent);
            importedTimes = parsedMd.times || [];
            importedTags = parsedMd.tags || [];
          } else if (format === "csv") {
            const parsedCsv = this.parseCsvToTimes(rawContent);
            importedTimes = parsedCsv.times || [];
            importedTags = parsedCsv.tags || [];
          }

          if (
            !Array.isArray(importedTimes) ||
            (importedTimes.length === 0 && importedTags.length === 0)
          ) {
            throw new Error("No structured data could be extracted.");
          }

          StateManager.save(importedTimes, importedTags);

          state.activeTab = "active";
          state.currentView = "times";

          SettingsTagController.renderTagsList();

          NotificationService.show({
            type: "success",
            message: `Data ledger parsed and synchronized from ${format.toUpperCase()} file.`,
            icon: "fa-circle-check",
            iconColor: "text-emerald-500/80",
            duration: 5000,
          });
        } catch (err) {
          console.error("Parser failure:", err);
          NotificationService.show({
            type: "error",
            message: "Failed to parse structural integrity of the file.",
            icon: "fa-triangle-exclamation",
            iconColor: "text-red-500/80",
            duration: 5000,
          });
        } finally {
          GlobalLoaderService.hide();
        }
      }, 50);
    });

    reader.readAsText(file);
  },

  parseMarkdownToTimes(mdContent) {
    const importedTags = [];
    const times = [];

    const tagSectionMatch = mdContent.match(
      /## 🏷️ TAG REGISTRY([\s\S]*?)(?=---|## 📝 TASKS LIST|$)/,
    );
    if (tagSectionMatch) {
      const tagLines = tagSectionMatch[1].match(
        /- Tag:\s*(.+)\s*\(ID:\s*(.+)\)/g,
      );
      if (tagLines) {
        tagLines.forEach((line) => {
          const match = line.match(/- Tag:\s*(.+)\s*\(ID:\s*(.+)\)/);
          if (match) {
            importedTags.push({
              id: match[2].trim(),
              name: match[1].trim(),
            });
          }
        });
      }
    }

    const timeBlocks = mdContent
      .split(/---\s*\n/)
      .filter((block) => block.includes("## #️⃣"));

    timeBlocks.forEach((block) => {
      const idMatch = block.match(/## #️⃣\s*(.+)/);
      const titleMatch = block.match(/### 🎯\s*(.+)/);
      const descMatch = block.match(
        /- \*\*Description:\*\*\s*([\s\S]*?)(?=\n- \*\*Status:\*\*|$)/,
      );
      const statusMatch = block.match(/- \*\*Status:\*\*\s*(.+)/);
      const priorityMatch = block.match(/- \*\*Priority:\*\*\s*(.+)/);
      const dueDateMatch = block.match(/- \*\*Due Date:\*\*\s*📅\s*(.+)/);
      const estMinutesMatch = block.match(
        /- \*\*Estimated Time:\*\*\s*⏱️\s*(\d+)/,
      );
      const tagsMatch = block.match(/- \*\*Tags:\*\*\s*🏷️\s*(.+)/);
      const createdAtMatch = block.match(/- \*\*Created At:\*\*\s*⏰\s*(.+)/);
      const updatedAtMatch = block.match(/- \*\*Updated At:\*\*\s*🔄\s*(.+)/);
      const completedAtMatch = block.match(
        /- \*\*Completed At:\*\*\s*✅\s*(.+)/,
      );
      const archivedMatch = block.match(/- \*\*Archived:\*\*\s*(.+)/);

      const subtasks = [];
      const subtaskLines = block.match(/- \[(x| )\] (.+)\(ID: (.+)\)/g);
      if (subtaskLines) {
        subtaskLines.forEach((line) => {
          const match = line.match(/- \[(x| )\] (.+)\(ID: (.+)\)/);
          if (match) {
            subtasks.push({
              id: match[3].trim(),
              title: match[2].trim(),
              completed: match[1] === "x",
            });
          }
        });
      }

      if (idMatch && titleMatch) {
        let rawDesc = descMatch ? descMatch[1].trim() : "";
        if (rawDesc === "N/A") rawDesc = "";

        const rawDueDate = dueDateMatch ? dueDateMatch[1].trim() : "";
        const cleanDueDate =
          rawDueDate && rawDueDate !== "None" && rawDueDate !== "null"
            ? rawDueDate
            : null;

        const rawTags = tagsMatch ? tagsMatch[1].trim() : "";
        const tagIds =
          rawTags !== "None" && rawTags
            ? rawTags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [];

        times.push({
          id: idMatch[1].trim(),
          title: titleMatch[1].trim(),
          description: rawDesc,
          status: statusMatch ? statusMatch[1].trim().toLowerCase() : "todo",
          priority: priorityMatch
            ? priorityMatch[1].trim().toLowerCase()
            : "low",
          dueDate: cleanDueDate,
          estimatedMinutes: estMinutesMatch
            ? parseInt(estMinutesMatch[1], 10)
            : 0,
          tags: tagIds,
          createdAt: createdAtMatch ? createdAtMatch[1].trim() : todayISO(),
          updatedAt:
            updatedAtMatch && !updatedAtMatch[1].includes("null")
              ? updatedAtMatch[1].trim()
              : null,
          completedAt:
            completedAtMatch && !completedAtMatch[1].includes("N/A")
              ? completedAtMatch[1].trim()
              : null,
          archived: archivedMatch ? archivedMatch[1].includes("Yes") : false,
          subtasks,
        });
      }
    });

    return { times, tags: importedTags };
  },

  parseCsvToTimes(csvContent) {
    const importedTags = [];
    const times = [];

    const parseCsvLine = (text) => {
      const result = [];
      let cur = "";
      let inQuotes = false;

      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '"') {
          if (inQuotes && text[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (c === "," && !inQuotes) {
          result.push(cur);
          cur = "";
        } else {
          cur += c;
        }
      }
      result.push(cur);
      return result;
    };

    const lines = csvContent.split(/\r?\n/);
    let currentSection = "TASKS";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith("#")) continue;

      if (line === "[TAGS]") {
        currentSection = "TAGS";
        continue;
      } else if (line === "[TASKS]") {
        currentSection = "TASKS";
        continue;
      }

      const cols = parseCsvLine(line);

      if (currentSection === "TAGS") {
        if (cols[0] === "Id" && cols[1] === "Name") continue;
        if (cols.length >= 2 && cols[0] && cols[1]) {
          importedTags.push({ id: cols[0].trim(), name: cols[1].trim() });
        }
      } else if (currentSection === "TASKS") {
        if (cols[0] === "Id" && cols[1] === "Title") continue;
        if (cols.length < 2) continue;

        const [
          id,
          title,
          description,
          status,
          priority,
          dueDate,
          estimatedMinutes,
          tagsRaw,
          createdAt,
          updatedAt,
          completedAt,
          archivedStr,
          subtasksRaw,
        ] = cols;

        const subtasks = [];
        if (subtasksRaw && subtasksRaw.trim()) {
          const stItems = subtasksRaw.split(" | ");

          stItems.forEach((item, idx) => {
            const cleanItem = item.trim();

            const match = cleanItem.match(
              /^\[([X ])\]\s*([^(]+?)\s*\(ID:\s*([^)]+)\)\s*$/,
            );

            if (match) {
              subtasks.push({
                id: match[3].trim(),
                title: match[2].trim(),
                completed: match[1] === "X",
              });
            } else {
              const statusMatch = cleanItem.match(/^\[([X ])\]/);
              const idMatch = cleanItem.match(/\(ID:\s*([^)]+)\)/);

              let title = cleanItem
                .replace(/^\[[X ]\]\s*/, "")
                .replace(/\s*\(ID:\s*[^)]+\)\s*$/, "")
                .trim();

              if (statusMatch) {
                subtasks.push({
                  id: idMatch
                    ? idMatch[1].trim()
                    : `subtask-${Date.now()}-${idx}`,
                  title: title || "Untitled Subtask",
                  completed: statusMatch[1] === "X",
                });
              }
            }
          });
        }

        const cleanDueDate =
          dueDate && dueDate.trim() !== "null" && dueDate.trim() !== ""
            ? dueDate.trim()
            : null;
        const tagIds = tagsRaw
          ? tagsRaw
              .split(";")
              .map((t) => t.trim())
              .filter(Boolean)
          : [];

        times.push({
          id: id ? id.trim() : generateId(),
          title: title ? title.trim() : "Untitled Time",
          description: description ? description.trim() : "",
          status: status ? status.trim().toLowerCase() : "todo",
          priority: priority ? priority.trim().toLowerCase() : "medium",
          dueDate: cleanDueDate,
          estimatedMinutes: estimatedMinutes
            ? parseInt(estimatedMinutes, 10)
            : 0,
          tags: tagIds,
          createdAt:
            createdAt && createdAt.trim() !== "null"
              ? createdAt.trim()
              : todayISO(),
          updatedAt:
            updatedAt && updatedAt.trim() !== "null" ? updatedAt.trim() : null,
          completedAt:
            completedAt && completedAt.trim() !== "null"
              ? completedAt.trim()
              : null,
          archived: archivedStr ? archivedStr.trim() === "Yes" : false,
          subtasks,
        });
      }
    }

    return { times, tags: importedTags };
  },
};
