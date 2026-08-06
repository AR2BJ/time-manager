import { formatDate, generateId } from "@/utils/helpers";

import { STORAGE_VERSION } from "@/models/storage.model";

const TASK_TITLES = [
  "Fix OAuth2 Refresh Token Bug",
  "Refactor State Management Pipeline",
  "Write Unit Tests for Payment Gateway",
  "Optimize PostgreSQL Indexing Strategy",
  "Design Microservices System Architecture",
  "Set up CI/CD GitHub Actions Pipeline",
  "Implement Dark Mode Theme Support",
  "Review Pull Request for API Integration",
  "Audit Security Vulnerabilities in Dependencies",
  "Dockerize Application Container Infrastructure",
  "Setup Redis Cache Layer for Queries",
  "Draft Technical Specification Document",
];

const TASK_DESCRIPTIONS = [
  "Ensure high performance and maintainable clean code standards.",
  "Needs to be reviewed and aligned with modern architectural patterns.",
  "Priority deliverable required before the next sprint release.",
  "Follow system documentation guidelines closely during execution.",
  "",
];

const PRIORITIES = ["low", "medium", "high"];
const STATUSES = ["todo", "in_progress", "done", "blocked"];

const DEFAULT_TAG_NAMES = [
  "dev",
  "backend",
  "frontend",
  "bug",
  "architecture",
  "ops",
  "docs",
  "feature",
  "enhancement",
  "testing",
  "security",
  "performance",
  "ux",
  "ui",
  "database",
  "api",
  "deployment",
  "monitoring",
  "refactor",
  "dependencies",
];

const SUBTASK_TEMPLATES = [
  "Identify root cause",
  "Write test cases",
  "Implement fix/feature",
  "Perform peer review",
  "Deploy to staging",
];

const CAPACITY_LIMITS = {
  high: 6,
  medium: 8,
  low: 10,
  total: 24,
};

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomTagIds(availableTagObjects) {
  const maxCount = Math.min(3, availableTagObjects.length);
  const count = getRandomInt(1, maxCount);
  const shuffled = [...availableTagObjects];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count).map((tag) => tag.id);
}

function getRandomSubtasks() {
  const count = getRandomInt(0, 4);
  const subtasks = [];

  for (let i = 0; i < count; i++) {
    subtasks.push({
      id: `subtask-${Date.now()}-${i}-${Math.random()
        .toString(36)
        .substring(2, 5)}`,
      title: getRandomElement(SUBTASK_TEMPLATES),
      completed: false,
    });
  }
  return subtasks;
}

export function generateDynamicMockData(count = 20) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const subtractDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  };

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const tags = DEFAULT_TAG_NAMES.map((name) => ({
    id: generateId(),
    name,
  }));

  const times = [];
  const capacityTracker = {};

  for (let i = 1; i <= count; i++) {
    const title = `${getRandomElement(TASK_TITLES)} (#${i})`;
    const id = generateId();

    const timeTagIds = getRandomTagIds(tags);
    const description = getRandomElement(TASK_DESCRIPTIONS);

    const daysAgoCreated = getRandomInt(1, 60);
    const createdAtDate = subtractDays(today, daysAgoCreated);
    const createdAtISO = formatDate(createdAtDate);

    let dueDate = null;
    if (Math.random() > 0.2) {
      const dueOffset = getRandomInt(-5, 15);
      dueDate = formatDate(addDays(today, dueOffset));
    }

    const targetDate = dueDate || createdAtISO;

    if (!capacityTracker[targetDate]) {
      capacityTracker[targetDate] = { high: 0, medium: 0, low: 0, total: 0 };
    }

    if (capacityTracker[targetDate].total >= CAPACITY_LIMITS.total) {
      continue;
    }

    const availablePriorities = PRIORITIES.filter(
      (p) => capacityTracker[targetDate][p] < CAPACITY_LIMITS[p],
    );

    if (availablePriorities.length === 0) {
      continue;
    }

    const priority = getRandomElement(availablePriorities);
    capacityTracker[targetDate][priority]++;
    capacityTracker[targetDate].total++;

    let status = getRandomElement(STATUSES);
    let subtasks = getRandomSubtasks();

    if (subtasks.length > 0) {
      if (status === "done") {
        subtasks = subtasks.map((st) => ({ ...st, completed: true }));
      } else {
        let completedCount = 0;
        subtasks = subtasks.map((st) => {
          const isCompleted = Math.random() > 0.5;
          if (isCompleted) completedCount++;
          return { ...st, completed: isCompleted };
        });

        if (completedCount === subtasks.length) {
          status = "done";
        }
      }
    }

    const archived = status === "done" ? Math.random() < 0.2 : false;
    const completedAt =
      status === "done"
        ? formatDate(subtractDays(today, getRandomInt(0, 10)))
        : null;

    const completedSubtaskIdsBeforeDone = subtasks
      .filter((st) => st.completed)
      .map((st) => st.id);

    times.push({
      id,
      title,
      description,
      status,
      priority,
      dueDate,
      createdAt: createdAtISO,
      updatedAt: null,
      completedAt,
      archived,
      tags: timeTagIds,
      estimatedMinutes: getRandomElement([15, 30, 45, 60, 120]),
      subtasks,
      completedSubtaskIdsBeforeDone,
    });
  }

  return {
    version: STORAGE_VERSION,
    times,
    tags,
  };
}
