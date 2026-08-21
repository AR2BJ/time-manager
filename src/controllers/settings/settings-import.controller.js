import { StateManager, state } from "@/models/state.model.js";
import { generateId, todayISO } from "@/utils/helpers.js";

import { GlobalLoaderService } from "@/services/loader.service.js";
import { NoteService } from "@/services/note.service";
import { NotificationService } from "@/services/notification.service.js";
import { SoundModel } from "@/models/sound.model.js";
import { TimerController } from "../timer.controller";

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
        message: "Invalid format! Only JSON, MD, or CSV files are permitted",
        icon: "fa-triangle-exclamation",
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
          let importedNotes = [];
          let importedSettings = null;
          let importedActiveTaskId = null;
          let importedActiveMode = "pomodoro";
          let importedTimerState = {};

          if (format === "json") {
            const parsedJson = JSON.parse(rawContent);
            importedTasks = parsedJson.tasks || [];
            importedSessions = parsedJson.sessions || [];
            importedNotes = parsedJson.notes || [];
            importedSettings = parsedJson.settings || null;
            importedActiveTaskId = parsedJson.activeTaskId || null;
            importedActiveMode = parsedJson.activeMode || "pomodoro";
            importedTimerState = parsedJson.timer || {};
          } else if (format === "markdown") {
            const parsedMd = this.parseMarkdownToState(rawContent);
            importedTasks = parsedMd.tasks;
            importedSessions = parsedMd.sessions;
            importedNotes = parsedMd.notes;
            importedSettings = parsedMd.settings;
            importedActiveTaskId = parsedMd.activeTaskId;
            importedActiveMode = parsedMd.activeMode;
            importedTimerState = parsedMd.timer;
          } else if (format === "csv") {
            const parsedCsv = this.parseCsvToState(rawContent);
            importedTasks = parsedCsv.tasks;
            importedSessions = parsedCsv.sessions;
            importedNotes = parsedCsv.notes;
            importedSettings = parsedCsv.settings;
            importedActiveTaskId = parsedCsv.activeTaskId;
            importedActiveMode = parsedCsv.activeMode;
            importedTimerState = parsedCsv.timer;
          }

          if (
            !Array.isArray(importedTasks) &&
            !Array.isArray(importedSessions) &&
            !Array.isArray(importedNotes)
          ) {
            throw new Error("Invalid payload structure.");
          }

          state.tasks = importedTasks;
          state.sessions = importedSessions;
          state.activeMode = importedActiveMode || "pomodoro";

          // Validate and apply activeTaskId
          const hasActiveTask = importedTasks.some(
            (t) => String(t.id) === String(importedActiveTaskId),
          );
          if (hasActiveTask) {
            state.activeTaskId = String(importedActiveTaskId);
          } else {
            const fallbackTask = importedTasks.find((t) => t.status !== "done");
            state.activeTaskId = fallbackTask ? String(fallbackTask.id) : null;
          }

          if (importedSettings) {
            StateManager.updateSettings(importedSettings);
            if (importedSettings.currentSoundId) {
              SoundModel.setSoundTrack(importedSettings.currentSoundId);
            }
            if (typeof importedSettings.volume === "number") {
              SoundModel.setVolume(importedSettings.volume);
            }
          }

          // Restore timer state metadata
          if (importedTimerState) {
            StateManager.updateTimerState({
              pomodoroSessionCount:
                Number(importedTimerState.pomodoroSessionCount) || 0,
              currentPhase: importedTimerState.currentPhase || "work",
            });
          }

          StateManager.setView("timer");
          TimerController.refreshUI();

          StateManager.save();
          StateManager.notify();

          NoteService.restoreNotes(importedNotes);

          NotificationService.show({
            type: "success",
            message: `Data ledger synchronized successfully`,
            icon: "fa-circle-check",
            iconColor: "text-emerald-500/80",
            duration: 5000,
          });
        } catch (err) {
          console.error("Parser failure:", err);
          NotificationService.show({
            type: "error",
            message: "Failed to parse structural integrity of the file",
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
    const notes = [];
    const settings = {};
    let activeTaskId = null;
    let activeMode = "pomodoro";
    const timer = {};

    const settingsSection =
      mdContent.split("## ⚙️ SETTINGS & STATE")[1] ||
      mdContent.split("## ⚙️ SETTINGS")[1];
    if (settingsSection) {
      const getVal = (label) => {
        const match = settingsSection.match(
          new RegExp(`- \\*\\*${label}:\\*\\*\\s*(.+)`),
        );
        return match ? match[1].trim() : null;
      };

      const rawActiveTask = getVal("Active Task ID");
      if (
        rawActiveTask &&
        rawActiveTask !== "none" &&
        rawActiveTask !== "null"
      ) {
        activeTaskId = rawActiveTask;
      }

      const rawActiveMode = getVal("Active Mode");
      if (rawActiveMode) activeMode = rawActiveMode;

      const rawSessionCount = getVal("Pomodoro Session Count");
      if (rawSessionCount) timer.pomodoroSessionCount = Number(rawSessionCount);

      const pomodoroWorkTime = getVal("Pomodoro Work Time");
      if (pomodoroWorkTime)
        settings.pomodoroWorkTime = Number(pomodoroWorkTime);

      const shortBreakTime = getVal("Short Break Time");
      if (shortBreakTime) settings.shortBreakTime = Number(shortBreakTime);

      const longBreakTime = getVal("Long Break Time");
      if (longBreakTime) settings.longBreakTime = Number(longBreakTime);

      const longBreakInterval = getVal("Long Break Interval");
      if (longBreakInterval)
        settings.longBreakInterval = Number(longBreakInterval);

      const autoStartBreaks = getVal("Auto Start Breaks");
      if (autoStartBreaks)
        settings.autoStartBreaks = autoStartBreaks.toLowerCase() === "yes";

      const autoStartPomodoros = getVal("Auto Start Pomodoros");
      if (autoStartPomodoros)
        settings.autoStartPomodoros =
          autoStartPomodoros.toLowerCase() === "yes";

      const disableBreaks = getVal("Disable Breaks");
      if (disableBreaks)
        settings.disableBreaks = disableBreaks.toLowerCase() === "yes";

      const flowBreakTime = getVal("Flow Break Time");
      if (flowBreakTime) settings.flowBreakTime = Number(flowBreakTime);

      const autoStartFlowBreak = getVal("Auto Start Flow Break");
      if (autoStartFlowBreak)
        settings.autoStartFlowBreaks =
          autoStartFlowBreak.toLowerCase() === "yes";

      const volume = getVal("Volume");
      if (volume) settings.volume = Number(volume);

      const pomodoroEndSound = getVal("Pomodoro End Sound");
      if (pomodoroEndSound) settings.pomodoroEndSound = pomodoroEndSound;

      const breakEndSound = getVal("Break End Sound");
      if (breakEndSound) settings.breakEndSound = breakEndSound;

      const notificationSound = getVal("Notification Sound");
      if (notificationSound)
        settings.notificationSound = notificationSound.toLowerCase() === "yes";

      const currentSoundId = getVal("Current Sound ID");
      if (currentSoundId) settings.currentSoundId = currentSoundId;
    }

    const taskBlocks = mdContent
      .split(/---\s*\n/)
      .filter((block) => block.includes("## #️⃣"));
    taskBlocks.forEach((block) => {
      const idMatch = block.match(/## #️⃣\s*(.+)/);
      const titleMatch = block.match(/### 🎯\s*(.+)/);
      const statusMatch = block.match(/-\s*\*\*Status:\*\*\s*(.+)/);
      const estMatch = block.match(
        /-\s*\*\*Estimated Focus Units:\*\*\s*(\d+)/,
      );
      const compMatch = block.match(
        /-\s*\*\*Completed Focus Units:\*\*\s*(\d+)/,
      );
      const createdAtMatch = block.match(/-\s*\*\*Created At:\*\*\s*(.+)/);

      if (idMatch && titleMatch) {
        tasks.push({
          id: idMatch[1].trim(),
          title: titleMatch[1].trim(),
          status: statusMatch ? statusMatch[1].trim() : "todo",
          estimatedFocusUnits: estMatch ? parseInt(estMatch[1], 10) : 1,
          completedFocusUnits: compMatch ? parseInt(compMatch[1], 10) : 0,
          createdAt: createdAtMatch ? createdAtMatch[1].trim() : todayISO(),
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

    const noteSection = mdContent.split("## 📌 NOTES")[1];
    if (noteSection) {
      const noteBlocks = noteSection
        .split(/- \*\*ID:\*\*/)
        .filter((b) => b.trim());
      noteBlocks.forEach((block) => {
        const lines = block.trim().split("\n");
        const idAndDateMatch = lines[0].match(
          /(.+?)\s*\|\s*\*\*Created At:\*\*\s*(.+)/,
        );
        const textMatch = block.match(/\*\*Text:\*\*\s*(.*)/);

        if (idAndDateMatch) {
          notes.push({
            id: idAndDateMatch[1].trim(),
            createdAt: Number(idAndDateMatch[2].trim()) || Date.now(),
            text: textMatch ? textMatch[1].trim() : "",
          });
        }
      });
    }

    return {
      tasks,
      sessions,
      notes,
      settings,
      activeTaskId,
      activeMode,
      timer,
    };
  },

  parseCsvToState(csvContent) {
    const tasks = [];
    const sessions = [];
    const notes = [];
    const settings = {};
    let activeTaskId = null;
    let activeMode = "pomodoro";
    const timer = {};

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

      if (line === "[SETTINGS]") {
        currentSection = "SETTINGS";
        continue;
      } else if (line === "[TASKS]") {
        currentSection = "TASKS";
        continue;
      } else if (line === "[SESSIONS]") {
        currentSection = "SESSIONS";
        continue;
      } else if (line === "[NOTES]") {
        currentSection = "NOTES";
        continue;
      }

      const cols = parseCsvLine(line);

      if (currentSection === "SETTINGS") {
        if (cols[0] === "Key" && cols[1] === "Value") continue;
        if (cols.length >= 2) {
          const key = cols[0].trim();
          const val = cols[1].trim();

          if (key === "activeTaskId") {
            if (val && val !== "none" && val !== "null") activeTaskId = val;
          } else if (key === "activeMode") {
            activeMode = val;
          } else if (key === "pomodoroSessionCount") {
            timer.pomodoroSessionCount = Number(val) || 0;
          } else if (
            [
              "pomodoroWorkTime",
              "shortBreakTime",
              "longBreakTime",
              "longBreakInterval",
              "flowBreakTime",
              "volume",
            ].includes(key)
          ) {
            settings[key] = Number(val);
          } else if (
            [
              "autoStartBreaks",
              "autoStartPomodoros",
              "disableBreaks",
              "autoStartFlowBreaks",
              "isMuted",
              "notificationSound",
            ].includes(key)
          ) {
            settings[key] = val.toLowerCase() === "true";
          } else {
            settings[key] = val;
          }
        }
      } else if (currentSection === "TASKS") {
        if (cols[0] === "Id" && cols[1] === "Title") continue;
        if (cols.length >= 2) {
          tasks.push({
            id: cols[0] ? cols[0].trim() : generateId(),
            title: cols[1] ? cols[1].trim() : "Untitled Task",
            status: cols[2] ? cols[2].trim() : "todo",
            estimatedFocusUnits: cols[3] ? parseInt(cols[3], 10) : 1,
            completedFocusUnits: cols[4] ? parseInt(cols[4], 10) : 0,
            createdAt: cols[5] ? cols[5].trim() : todayISO(),
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
            completedAt: cols[5] ? cols[5].trim() : todayISO(),
          });
        }
      } else if (currentSection === "NOTES") {
        if (cols[0] === "Id" && cols[1] === "Text") continue;
        if (cols.length >= 2) {
          notes.push({
            id: cols[0] ? cols[0].trim() : generateId(),
            text: cols[1] ? cols[1].trim() : "",
            createdAt: cols[2]
              ? Number(cols[2].trim()) || Date.now()
              : Date.now(),
          });
        }
      }
    }

    return {
      tasks,
      sessions,
      notes,
      settings,
      activeTaskId,
      activeMode,
      timer,
    };
  },
};
