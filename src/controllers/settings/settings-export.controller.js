import { STORAGE_KEY, STORAGE_VERSION } from "@/models/storage.model.js";

import { NotificationService } from "@/services/notification.service.js";
import { formatDate } from "@/utils/helpers.js";
import { state } from "@/models/state.model.js";

export const SettingsExportController = {
  handleDataExport(format = "json") {
    const tasks = Array.isArray(state.tasks) ? state.tasks : [];
    const sessions = Array.isArray(state.sessions) ? state.sessions : [];

    if (tasks.length === 0 && sessions.length === 0) {
      NotificationService.show({
        type: "info",
        message: "There is no data to export.",
        icon: "fa-circle-info",
        iconColor: "text-brand/80",
        duration: 5000,
      });
      return;
    }

    let fileContent = "";
    let fileName = "";
    let contentType = "";
    const dateStr = formatDate(new Date());

    if (format === "json") {
      const essentialPayload = {
        version: STORAGE_VERSION,
        exportedAt: new Date().toISOString(),
        tasks: tasks.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          estimatedPomodoros: t.estimatedPomodoros || 1,
          completedPomodoros: t.completedPomodoros || 0,
          createdAt: t.createdAt,
        })),
        sessions: sessions.map((s) => ({
          id: s.id,
          taskId: s.taskId || null,
          taskTitle: s.taskTitle || "Untitled",
          type: s.type || "pomodoro",
          durationSeconds: s.durationSeconds || 0,
          completedAt: s.completedAt,
        })),
      };

      fileContent = JSON.stringify(essentialPayload, null, 2);
      fileName = `Time_Manager_Backup_${dateStr}_v${STORAGE_VERSION}.json`;
      contentType = "application/json";
    } else if (format === "markdown") {
      fileContent = this.generateMarkdownExport(tasks, sessions);
      fileName = `Time_Manager_Backup_${dateStr}_v${STORAGE_VERSION}.md`;
      contentType = "text/markdown";
    } else if (format === "csv") {
      fileContent = this.generateCsvExport(tasks, sessions);
      fileName = `Time_Manager_Backup_${dateStr}_v${STORAGE_VERSION}.csv`;
      contentType = "text/csv;charset=utf-8;";
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

  generateMarkdownExport(tasks, sessions) {
    let content = `# 📊 Time Manager Ledger\n\n**Export Date:** ${new Date().toISOString()}\n**Version:** ${STORAGE_VERSION}\n\n---\n## 📝 TASKS\n\n`;

    if (tasks.length === 0) {
      content += `_No tasks defined._\n\n`;
    } else {
      tasks.forEach((task) => {
        content += `## #️⃣ ${task.id}\n`;
        content += `### 🎯 ${task.title}\n`;
        content += `- **Status:** ${task.status}\n`;
        content += `- **Estimated Pomodoros:** ${task.estimatedPomodoros}\n`;
        content += `- **Completed Pomodoros:** ${task.completedPomodoros}\n`;
        content += `- **Created At:** ${task.createdAt}\n\n`;
        content += `---\n\n`;
      });
    }

    content += `## ⏱️ SESSIONS\n\n`;
    if (sessions.length === 0) {
      content += `_No sessions recorded._\n\n`;
    } else {
      sessions.forEach((s) => {
        content += `- **ID:** ${s.id} | **Task:** ${s.taskTitle} (Task ID: ${s.taskId || "N/A"}) | **Type:** ${s.type} | **Duration:** ${s.durationSeconds}s | **Completed At:** ${s.completedAt}\n`;
      });
    }

    return content;
  },

  generateCsvExport(tasks, sessions) {
    const escapeCsvValue = (value) => {
      const text = value == null ? "" : String(value);
      return `"${text.replace(/"/g, '""')}"`;
    };

    let content = `# VERSION: ${STORAGE_VERSION}\n[TASKS]\nId,Title,Status,Estimated Pomodoros,Completed Pomodoros,Created At\n`;
    tasks.forEach((t) => {
      content += `${escapeCsvValue(t.id)},${escapeCsvValue(t.title)},${escapeCsvValue(t.status)},${escapeCsvValue(t.estimatedPomodoros)},${escapeCsvValue(t.completedPomodoros)},${escapeCsvValue(t.createdAt)}\n`;
    });

    content += `\n[SESSIONS]\nId,Task ID,Task Title,Type,Duration Seconds,Completed At\n`;
    sessions.forEach((s) => {
      content += `${escapeCsvValue(s.id)},${escapeCsvValue(s.taskId)},${escapeCsvValue(s.taskTitle)},${escapeCsvValue(s.type)},${escapeCsvValue(s.durationSeconds)},${escapeCsvValue(s.completedAt)}\n`;
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
