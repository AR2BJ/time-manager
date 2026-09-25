export const HELP_SHORTCUTS = [
  {
    category: "Timer & Modes",
    items: [
      {
        label: "Switch to Pomodoro Mode",
        icon: "ti-stopwatch",
        keys: [["Alt"], ["P"]],
        separator: "+",
      },
      {
        label: "Switch to Flow Mode",
        icon: "ti-ripple",
        keys: [["Alt"], ["F"]],
        separator: "+",
      },
      {
        label: "Start / Pause Timer",
        icon: "ti-player-pause",
        keys: [["Space"]],
      },
      {
        label: "Volume up and down",
        icon: "ti-volume",
        keys: [
          ["🠔", "🠖"],
          ["🠕", "🠗"],
        ],
        separator: "or",
      },
    ],
  },
  {
    category: "Navigation",
    items: [
      {
        label: "Go to Timer View",
        icon: "ti-clock",
        keys: [["Shift"], ["T"]],
        separator: "+",
      },
      {
        label: "Go to Analytics View",
        icon: "ti-chart-line",
        keys: [["Shift"], ["A"]],
        separator: "+",
      },
      {
        label: "Go to Setting View",
        icon: "ti-settings",
        keys: [["Shift"], ["S"]],
        separator: "+",
      },
    ],
  },
  {
    category: "Quick Actions",
    items: [
      {
        label: "Toggle Dark/Light Theme",
        icon: "ti-brightness",
        keys: [["Alt"], ["T"]],
        separator: "+",
      },
      {
        label: "Toggle Navigation Menu",
        icon: "ti-menu-4",
        keys: [["Alt"], ["N"]],
        separator: "+",
      },
      {
        label: "Open Reset Data Modal",
        icon: "ti-alert-triangle",
        keys: [["Alt"], ["R"]],
        separator: "+",
      },
      {
        label: "Close Active Modal / Blur Input",
        icon: "ti-x",
        keys: [["Esc"]],
      },
      {
        label: "Toggle This Help Center",
        icon: "ti-question-mark",
        keys: [["?"]],
      },
    ],
  },
];
