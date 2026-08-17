import { NotificationService } from "@/services/notification.service.js";
import { STORAGE_VERSION } from "@/models/storage.model.js";
import { SoundModel } from "@/models/sound.model.js";
import { state } from "@/models/state.model.js";
import { todayISO } from "@/utils/helpers.js";

export const SettingsExportController = {
  handleDataExport(format = "json") {
    const tasks = Array.isArray(state.tasks) ? state.tasks : [];
    const sessions = Array.isArray(state.sessions) ? state.sessions : [];
    const notes = Array.isArray(state.notes) ? state.notes : [];
    const settings = state.settings || {};
    const soundState = SoundModel.getState();

    let fileContent = "";
    let fileName = "";
    let contentType = "";
    const dateStr = todayISO();

    if (format === "json") {
      const essentialPayload = {
        version: STORAGE_VERSION,
        exportedAt: todayISO(),
        activeTaskId: state.activeTaskId || null,
        activeMode: state.activeMode || "pomodoro",
        timer: {
          pomodoroSessionCount: state.timer?.pomodoroSessionCount || 0,
          currentPhase: state.timer?.currentPhase || "work",
        },
        settings: {
          ...settings,
          currentSoundId: SoundModel.getCurrentSoundId(),
          volume: soundState.volume,
          isMuted: soundState.isMuted,
        },
        tasks: tasks.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description || "",
          status: t.status || "todo",
          priority: t.priority || "low",
          tags: Array.isArray(t.tags) ? t.tags : [],
          estimatedPomodoros: t.estimatedPomodoros || 1,
          completedPomodoros: t.completedPomodoros || 0,
          dueDate: t.dueDate || null,
          createdAt: t.createdAt,
          completedAt: t.completedAt || null,
        })),
        sessions: sessions.map((s) => ({
          id: s.id,
          taskId: s.taskId || null,
          taskTitle: s.taskTitle || "Untitled",
          type: s.type || "pomodoro",
          durationSeconds: s.durationSeconds || 0,
          targetDurationSeconds: s.targetDurationSeconds || 1500,
          isFlowMode: Boolean(s.isFlowMode),
          completedAt: s.completedAt,
        })),
        notes: notes.map((n) => ({
          id: n.id,
          text: n.text || "",
          createdAt: n.createdAt,
        })),
      };

      fileContent = JSON.stringify(essentialPayload, null, 2);
      fileName = `Time_Manager_Backup_${dateStr}_v${STORAGE_VERSION}.json`;
      contentType = "application/json";
    } else if (format === "markdown") {
      fileContent = this.generateMarkdownExport(
        tasks,
        sessions,
        notes,
        settings,
        soundState,
      );
      fileName = `Time_Manager_Backup_${dateStr}_v${STORAGE_VERSION}.md`;
      contentType = "text/markdown";
    } else if (format === "csv") {
      fileContent = this.generateCsvExport(
        tasks,
        sessions,
        notes,
        settings,
        soundState,
      );
      fileName = `Time_Manager_Backup_${dateStr}_v${STORAGE_VERSION}.csv`;
      contentType = "text/csv";
    }

    this.downloadFile(fileContent, fileName, contentType);

    NotificationService.show({
      type: "success",
      message: `Data ledger exported successfully as ${format.toUpperCase()}.`,
      icon: "fa-file-arrow-down",
      iconColor: "text-emerald-500/80",
      duration: 5000,
    });
  },

  generateMarkdownExport(tasks, sessions, notes, settings, soundState) {
    let content = `# 📊 Time Manager Ledger\n\n**Export Date:** ${todayISO()}\n**Version:** ${STORAGE_VERSION}\n\n---\n`;

    content += `## ⚙️ SETTINGS & STATE\n\n`;
    content += `- **Active Task ID:** ${state.activeTaskId || "none"}\n`;
    content += `- **Active Mode:** ${state.activeMode || "pomodoro"}\n`;
    content += `- **Pomodoro Session Count:** ${state.timer?.pomodoroSessionCount || 0}\n`;
    content += `- **Pomodoro Work Time:** ${settings.pomodoroWorkTime || 25}\n`;
    content += `- **Short Break Time:** ${settings.shortBreakTime || 5}\n`;
    content += `- **Long Break Time:** ${settings.longBreakTime || 15}\n`;
    content += `- **Long Break Interval:** ${settings.longBreakInterval || 4}\n`;
    content += `- **Auto Start Breaks:** ${settings.autoStartBreaks ? "Yes" : "No"}\n`;
    content += `- **Auto Start Pomodoros:** ${settings.autoStartPomodoros ? "Yes" : "No"}\n`;
    content += `- **Disable Breaks:** ${settings.disableBreaks ? "Yes" : "No"}\n`;
    content += `- **Volume:** ${soundState.volume ?? 50}\n`;
    content += `- **Is Muted:** ${soundState.isMuted ? "Yes" : "No"}\n`;
    content += `- **Pomodoro End Sound:** ${settings.pomodoroEndSound || "none"}\n`;
    content += `- **Break End Sound:** ${settings.breakEndSound || "none"}\n`;
    content += `- **Notification Sound:** ${settings.notificationSound !== false ? "Yes" : "No"}\n`;
    content += `- **Current Sound ID:** ${SoundModel.getCurrentSoundId()}\n\n---\n\n`;

    content += `## 📝 TASKS\n\n`;
    if (tasks.length === 0) {
      content += `_No tasks defined._\n\n`;
    } else {
      tasks.forEach((task) => {
        const tagsStr = Array.isArray(task.tags) ? task.tags.join(", ") : "";
        content += `## #️⃣ ${task.id}\n`;
        content += `### 🎯 ${task.title}\n`;
        content += `- **Status:** ${task.status || "todo"}\n`;
        content += `- **Priority:** ${task.priority || "medium"}\n`;
        content += `- **Tags:** ${tagsStr}\n`;
        content += `- **Estimated Pomodoros:** ${task.estimatedPomodoros || 1}\n`;
        content += `- **Completed Pomodoros:** ${task.completedPomodoros || 0}\n`;
        content += `- **Due Date:** ${task.dueDate || "N/A"}\n`;
        content += `- **Created At:** ${task.createdAt}\n`;
        content += `- **Completed At:** ${task.completedAt || "N/A"}\n`;
        content += `- **Description:** ${task.description || "None"}\n\n`;
        content += `---\n\n`;
      });
    }

    content += `## ⏱️ SESSIONS\n\n`;
    if (sessions.length === 0) {
      content += `_No sessions recorded._\n\n`;
    } else {
      sessions.forEach((s) => {
        content += `- **ID:** ${s.id} | **Task:** ${s.taskTitle} (Task ID: ${s.taskId || "N/A"}) | **Type:** ${s.type} | **Duration:** ${s.durationSeconds}s / ${s.targetDurationSeconds || 1500}s | **Flow Mode:** ${s.isFlowMode ? "Yes" : "No"} | **Completed At:** ${s.completedAt}\n`;
      });
      content += `\n---\n\n`;
    }

    content += `## 📌 NOTES\n\n`;
    if (notes.length === 0) {
      content += `_No notes recorded._\n\n`;
    } else {
      notes.forEach((n) => {
        content += `- **ID:** ${n.id} | **Created At:** ${n.createdAt}\n  **Text:** ${n.text}\n\n`;
      });
    }

    return content;
  },

  generateCsvExport(tasks, sessions, notes, settings, soundState) {
    const escapeCsvValue = (value) => {
      const text = value == null ? "" : String(value);
      return `"${text.replace(/"/g, '""')}"`;
    };

    let content = `# VERSION: ${STORAGE_VERSION}\n`;

    content += `[SETTINGS]\nKey,Value\n`;
    content += `activeTaskId,${escapeCsvValue(state.activeTaskId || "none")}\n`;
    content += `activeMode,${escapeCsvValue(state.activeMode || "pomodoro")}\n`;
    content += `pomodoroSessionCount,${escapeCsvValue(state.timer?.pomodoroSessionCount || 0)}\n`;
    content += `pomodoroWorkTime,${escapeCsvValue(settings.pomodoroWorkTime || 25)}\n`;
    content += `shortBreakTime,${escapeCsvValue(settings.shortBreakTime || 5)}\n`;
    content += `longBreakTime,${escapeCsvValue(settings.longBreakTime || 15)}\n`;
    content += `longBreakInterval,${escapeCsvValue(settings.longBreakInterval || 4)}\n`;
    content += `autoStartBreaks,${escapeCsvValue(settings.autoStartBreaks ? "true" : "false")}\n`;
    content += `autoStartPomodoros,${escapeCsvValue(settings.autoStartPomodoros ? "true" : "false")}\n`;
    content += `disableBreaks,${escapeCsvValue(settings.disableBreaks ? "true" : "false")}\n`;
    content += `volume,${escapeCsvValue(soundState.volume ?? 50)}\n`;
    content += `isMuted,${escapeCsvValue(soundState.isMuted ? "true" : "false")}\n`;
    content += `pomodoroEndSound,${escapeCsvValue(settings.pomodoroEndSound || "none")}\n`;
    content += `breakEndSound,${escapeCsvValue(settings.breakEndSound || "none")}\n`;
    content += `notificationSound,${escapeCsvValue(settings.notificationSound !== false ? "true" : "false")}\n`;
    content += `currentSoundId,${escapeCsvValue(SoundModel.getCurrentSoundId())}\n\n`;

    content += `[TASKS]\nId,Title,Status,Priority,Tags,Estimated Pomodoros,Completed Pomodoros,Due Date,Created At,Completed At,Description\n`;
    tasks.forEach((t) => {
      const tagsStr = Array.isArray(t.tags) ? t.tags.join(";") : "";
      content += `${escapeCsvValue(t.id)},${escapeCsvValue(t.title)},${escapeCsvValue(t.status)},${escapeCsvValue(t.priority)},${escapeCsvValue(tagsStr)},${escapeCsvValue(t.estimatedPomodoros)},${escapeCsvValue(t.completedPomodoros)},${escapeCsvValue(t.dueDate)},${escapeCsvValue(t.createdAt)},${escapeCsvValue(t.completedAt)},${escapeCsvValue(t.description)}\n`;
    });

    content += `\n[SESSIONS]\nId,Task ID,Task Title,Type,Duration Seconds,Target Duration Seconds,Is Flow Mode,Completed At\n`;
    sessions.forEach((s) => {
      content += `${escapeCsvValue(s.id)},${escapeCsvValue(s.taskId)},${escapeCsvValue(s.taskTitle)},${escapeCsvValue(s.type)},${escapeCsvValue(s.durationSeconds)},${escapeCsvValue(s.targetDurationSeconds || 1500)},${escapeCsvValue(s.isFlowMode ? "true" : "false")},${escapeCsvValue(s.completedAt)}\n`;
    });

    content += `\n[NOTES]\nId,Text,Created At\n`;
    notes.forEach((n) => {
      content += `${escapeCsvValue(n.id)},${escapeCsvValue(n.text)},${escapeCsvValue(n.createdAt)}\n`;
    });

    return content;
  },

  downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = URL.createObjectURL(blob);
    downloadAnchor.download = fileName;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(downloadAnchor.href);
  },
};
