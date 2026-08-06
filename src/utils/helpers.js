export const openSubtasksState = new Set();

export function clearOpenSubtasksState() {
  openSubtasksState.clear();
}

export function getTimeMatrixAttributes(time) {
  // 1. Calculate Importance Score (1 to 5)
  const priorityWeights = {
    high: 5,
    medium: 3,
    low: 1,
  };
  const importance = priorityWeights[time.priority] || 1;

  // 2. Calculate Urgency Score (1 to 5)
  let urgency = 1;
  if (time.dueDate && time.status !== "done") {
    const daysRemaining = getDaysRemaining(time.dueDate);

    if (daysRemaining !== null) {
      if (daysRemaining <= 0)
        urgency = 5; // Overdue / Due today
      else if (daysRemaining === 1)
        urgency = 4; // Due tomorrow
      else if (daysRemaining <= 3)
        urgency = 3; // Within 3 days
      else if (daysRemaining <= 7)
        urgency = 2; // Within a week
      else urgency = 1; // More than a week
    }
  }

  // 3. Calculate Priority Score
  const priorityScore = importance * urgency;

  // 4. Determine Eisenhower Quadrant based on threshold (>= 3)
  const isImportant = importance >= 3;
  const isUrgent = urgency >= 3;

  let quadrant = 4;
  if (isImportant && isUrgent)
    quadrant = 1; // Q1: Do First
  else if (isImportant && !isUrgent)
    quadrant = 2; // Q2: Schedule
  else if (!isImportant && isUrgent) quadrant = 3; // Q3: Delegate

  return {
    importance,
    urgency,
    priorityScore,
    quadrant,
  };
}

export function generateId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  function getRandomHex(length) {
    let result = "";
    const chars = "0123456789abcdef";
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * 16)];
    }
    return result;
  }

  const timestamp = getRandomHex(32).toString(16).padStart(12, "0");
  const randomPart = getRandomHex(8);

  const timeLow = timestamp.slice(0, 8);
  const timeMid = timestamp.slice(8, 12);
  const timeHiAndVersion = "4" + getRandomHex(3);
  const clockSeqHiAndReserved = getRandomHex(3);
  const node = getRandomHex(6) + randomPart.slice(0, 6);

  return `${timeLow}-${timeMid}-${timeHiAndVersion}-${clockSeqHiAndReserved}-${node}`;
}

export function processTagPipeline(componentItems = [], existingTags = []) {
  const updatedGlobalTags = [...existingTags];
  const assignedTagIds = [];

  componentItems.forEach((item) => {
    const isNewFlag = typeof item === "object" && (item.isNew || !item.id);
    const itemTitle = typeof item === "object" ? item.name || item.title : item;

    if (!itemTitle) return;

    let match = updatedGlobalTags.find(
      (t) => t.name.toLowerCase() === itemTitle.trim().toLowerCase(),
    );

    if (isNewFlag && !match) {
      const newTag = {
        id: crypto.randomUUID(),
        name: itemTitle.trim(),
      };
      updatedGlobalTags.push(newTag);
      assignedTagIds.push(newTag.id);
    } else if (match) {
      assignedTagIds.push(match.id);
    } else if (typeof item === "object" && item.id) {
      assignedTagIds.push(item.id);
    }
  });

  return {
    assignedTagIds,
    updatedGlobalTags,
  };
}

export function mapTagIdsToObjects(tagIds = [], globalTags = []) {
  if (!Array.isArray(tagIds)) return [];
  return tagIds
    .map((id) => globalTags.find((t) => t.id === id))
    .filter(Boolean);
}

export function formatDate(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    date = new Date();
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function todayISO() {
  return formatDate(new Date());
}

export function isOverdue(dueDateStr, status) {
  if (!dueDateStr || status === "done") return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  return due < today;
}

export function getDaysRemaining(dueDateStr) {
  if (!dueDateStr) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export function calculateSubtaskProgress(subtasks = []) {
  if (!Array.isArray(subtasks) || subtasks.length === 0) {
    return { completedCount: 0, totalCount: 0, percentage: 0 };
  }

  const completedCount = subtasks.filter((st) => st.completed).length;
  const totalCount = subtasks.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return { completedCount, totalCount, percentage };
}
