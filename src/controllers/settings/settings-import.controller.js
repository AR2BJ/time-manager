import { StateManager, state } from "@/models/state.model.js";
import { formatDate, generateId } from "@/utils/helpers.js";

import { GlobalLoaderService } from "@/services/loader.service.js";
import { NotificationService } from "@/services/notification.service.js";

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
        message: "Invalid format! Only JSON, MD, or CSV files are permitted.",
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
          let importedTasks = [];
          let importedSessions = [];

          if (format === "json") {
            const parsedJson = JSON.parse(rawContent);
            importedTasks = parsedJson.tasks || [];
            importedSessions = parsedJson.sessions || [];
          } else if (format === "markdown") {
            const parsedMd = this.parseMarkdownToState(rawContent);
            importedTasks = parsedMd.tasks;
            importedSessions = parsedMd.sessions;
          } else if (format === "csv") {
            const parsedCsv = this.parseCsvToState(rawContent);
            importedTasks = parsedCsv.tasks;
            importedSessions = parsedCsv.sessions;
          }

          if (
            !Array.isArray(importedTasks) &&
            !Array.isArray(importedSessions)
          ) {
            throw new Error("Invalid payload structure.");
          }

          state.tasks = importedTasks;
          state.sessions = importedSessions;
          StateManager.save();
          StateManager.notify();

          NotificationService.show({
            type: "success",
            message: `Data ledger synchronized successfully.`,
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

  parseMarkdownToState(mdContent) {
    const tasks = [];
    const sessions = [];

    const taskBlocks = mdContent
      .split(/---\s*\n/)
      .filter((block) => block.includes("## #️⃣"));
    taskBlocks.forEach((block) => {
      const idMatch = block.match(/## #️⃣\s*(.+)/);
      const titleMatch = block.match(/### 🎯\s*(.+)/);
      const statusMatch = block.match(/- \*\*Status:\*\*\s*(.+)/);
      const estMatch = block.match(/- \*\*Estimated Pomodoros:\*\*\s*(\d+)/);
      const compMatch = block.match(/- \*\*Completed Pomodoros:\*\*\s*(\d+)/);
      const createdAtMatch = block.match(/- \*\*Created At:\*\*\s*(.+)/);

      if (idMatch && titleMatch) {
        tasks.push({
          id: idMatch[1].trim(),
          title: titleMatch[1].trim(),
          status: statusMatch ? statusMatch[1].trim() : "todo",
          estimatedPomodoros: estMatch ? parseInt(estMatch[1], 10) : 1,
          completedPomodoros: compMatch ? parseInt(compMatch[1], 10) : 0,
          createdAt: createdAtMatch
            ? createdAtMatch[1].trim()
            : formatDate(new Date()),
        });
      }
    });

    const sessionSection = mdContent.split("## ⏱️ SESSIONS")[1];
    if (sessionSection) {
      const sessionLines = sessionSection.match(/- \*\*ID:\*\*\s*(.+)/g);
      sessionLines?.forEach((line) => {
        const match = line.match(
          /- \*\*ID:\*\*\s*(.+?)\s*\|\s*\*\*Task:\*\*\s*(.+?)\s*\(Task ID:\s*(.+?)\)\s*\|\s*\*\*Type:\*\*\s*(.+?)\s*\|\s*\*\*Duration:\*\*\s*(\d+)s\s*\|\s*\*\*Completed At:\*\*\s*(.+)/,
        );
        if (match) {
          sessions.push({
            id: match[1].trim(),
            taskTitle: match[2].trim(),
            taskId: match[3].trim() === "N/A" ? null : match[3].trim(),
            type: match[4].trim(),
            durationSeconds: parseInt(match[5], 10) || 0,
            completedAt: match[6].trim(),
          });
        }
      });
    }

    return { tasks, sessions };
  },

  parseCsvToState(csvContent) {
    const tasks = [];
    const sessions = [];

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

      if (line === "[TASKS]") {
        currentSection = "TASKS";
        continue;
      } else if (line === "[SESSIONS]") {
        currentSection = "SESSIONS";
        continue;
      }

      const cols = parseCsvLine(line);

      if (currentSection === "TASKS") {
        if (cols[0] === "Id" && cols[1] === "Title") continue;
        if (cols.length >= 2) {
          tasks.push({
            id: cols[0] ? cols[0].trim() : generateId(),
            title: cols[1] ? cols[1].trim() : "Untitled Task",
            status: cols[2] ? cols[2].trim() : "todo",
            estimatedPomodoros: cols[3] ? parseInt(cols[3], 10) : 1,
            completedPomodoros: cols[4] ? parseInt(cols[4], 10) : 0,
            createdAt: cols[5] ? cols[5].trim() : formatDate(new Date()),
          });
        }
      } else if (currentSection === "SESSIONS") {
        if (cols[0] === "Id" && cols[1] === "Task ID") continue;
        if (cols.length >= 2) {
          sessions.push({
            id: cols[0] ? cols[0].trim() : generateId(),
            taskId:
              cols[1] && cols[1].trim() !== "null" ? cols[1].trim() : null,
            taskTitle: cols[2] ? cols[2].trim() : "Untitled",
            type: cols[3] ? cols[3].trim() : "pomodoro",
            durationSeconds: cols[4] ? parseInt(cols[4], 10) : 0,
            completedAt: cols[5] ? cols[5].trim() : formatDate(new Date()),
          });
        }
      }
    }

    return { tasks, sessions };
  },
};
