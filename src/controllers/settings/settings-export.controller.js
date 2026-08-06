import { STORAGE_KEY, STORAGE_VERSION } from "@/models/storage.model.js";
import { formatDate, todayISO } from "@/utils/helpers";

import { NotificationService } from "@/services/notification.service.js";

export const SettingsExportController = {
  handleDataExport(format = "json") {
    const localData = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const times = localData?.times || [];
    const tags = localData?.tags || [];

    if (times.length === 0 && tags.length === 0) {
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
      fileContent = JSON.stringify(localData, null, 2);
      fileName = `Times_Backup_${dateStr}_v${STORAGE_VERSION}.json`;
      contentType = "application/json";
    } else if (format === "markdown") {
      fileContent = this.generateMarkdownExport(times, tags);
      fileName = `Times_Backup_${dateStr}_v${STORAGE_VERSION}.md`;
      contentType = "text/markdown";
    } else if (format === "notion") {
      fileContent = this.generateCsvExport(times, tags);
      fileName = `Times_Backup_${dateStr}_v${STORAGE_VERSION}.csv`;
      contentType = "text/csv;charset=utf-8;";
    }

    this.downloadFile(fileContent, fileName, contentType);

    NotificationService.show({
      type: "success",
      message: `Database layer exported successfully as ${format.toUpperCase()}.`,
      icon: "fa-file-arrow-down",
      iconColor: "text-emerald-500/80",
      duration: 5000,
    });
  },

  generateMarkdownExport(times, tags) {
    let content = `# 📊 Time Manager Workspace Progress Report \n\n **Export Date:** ${todayISO()} \n\n **Storage Version:** ${STORAGE_VERSION}\n\n ---\n ## 🏷️ TAG REGISTRY `;

    if (tags.length === 0) {
      content += `_No tags defined._\n\n`;
    } else {
      tags.forEach((tag) => {
        content += `\n- Tag: ${tag.name} (ID: ${tag.id})\n`;
      });
      content += `\n`;
    }

    content += `---\n\n## 📝 TASKS LIST\n\n`;

    times.forEach((time) => {
      const tagsFormatted = (time.tags || []).join(",");

      content += `## #️⃣ ${time.id}\n`;
      content += `### 🎯 ${time.title}\n`;
      content += `- **Description:** ${time.description || "N/A"}\n`;
      content += `- **Status:** ${time.status}\n`;
      content += `- **Priority:** ${time.priority}\n`;
      content += `- **Due Date:** 📅 ${time.dueDate || "None"}\n`;
      content += `- **Estimated Time:** ⏱️ ${time.estimatedMinutes || 0} mins\n`;
      content += `- **Tags:** 🏷️ ${tagsFormatted || "None"}\n`;
      content += `- **Created At:** ⏰ ${time.createdAt}\n`;
      content += `- **Updated At:** 🔄 ${time.updatedAt}\n`;
      content += `- **Completed At:** ✅ ${time.completedAt || "N/A"}\n`;
      content += `- **Archived:** ${time.archived ? "📦 Yes" : "⚡ No"}\n\n`;

      content += `#### 📋 Subtasks (${(time.subtasks || []).filter((st) => st.completed).length}/${
        (time.subtasks || []).length
      })\n`;
      if (!time.subtasks || time.subtasks.length === 0) {
        content += `_No subtasks defined._\n\n`;
      } else {
        time.subtasks.forEach((st) => {
          content += `- [${st.completed ? "x" : " "}] ${st.title} (ID: ${st.id})\n`;
        });
        content += `\n`;
      }
      content += `---\n\n`;
    });

    return content;
  },

  generateCsvExport(times, tags) {
    const escapeCsvValue = (value) => {
      const text = value == null ? "" : String(value);
      return `"${text.replace(/"/g, '""')}"`;
    };

    let content = `# VERSION: ${STORAGE_VERSION}\n`;
    content += `[TAGS]\n`;
    content += `Id,Name\n`;
    tags.forEach((t) => {
      content += `${escapeCsvValue(t.id)},${escapeCsvValue(t.name)}\n`;
    });

    content += `\n[TASKS]\n`;
    const headers = [
      "Id",
      "Title",
      "Description",
      "Status",
      "Priority",
      "Due Date",
      "Estimated Minutes",
      "Tags",
      "Created At",
      "Updated At",
      "Completed At",
      "Archived",
      "Subtasks",
    ];
    content += headers.join(",") + "\n";

    times.forEach((t) => {
      const subtasksSerialized = (t.subtasks || [])
        .map((st) => `[${st.completed ? "X" : " "}] ${st.title} (ID: ${st.id})`)
        .join(" | ");

      const row = [
        escapeCsvValue(t.id),
        escapeCsvValue(t.title),
        escapeCsvValue(t.description),
        escapeCsvValue(t.status),
        escapeCsvValue(t.priority),
        escapeCsvValue(t.dueDate),
        escapeCsvValue(t.estimatedMinutes),
        escapeCsvValue((t.tags || []).join(";")),
        escapeCsvValue(t.createdAt),
        escapeCsvValue(t.updatedAt),
        escapeCsvValue(t.completedAt),
        escapeCsvValue(t.archived ? "Yes" : "No"),
        escapeCsvValue(subtasksSerialized),
      ];
      content += row.join(",") + "\n";
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
