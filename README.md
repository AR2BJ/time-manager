<div align="center">
  <img src="/public/picture/demo.gif" alt="Time Manager Demo" width="100%" />
</div>

<br/>
<br>

<div align="center">
  <img src="/public/picture/logo-2.png" alt="Time Manager Logo" height="145" />
</div>

<br/>
<br>

<p align="center">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite" />
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-ES2026-F7DF1E?style=flat-square&logo=javascript" />
  <img alt="LocalStorage" src="https://img.shields.io/badge/Storage-LocalStorage-4FC3F7?style=flat-square" />
  <img alt="Responsive" src="https://img.shields.io/badge/Responsive-Desktop%20%26%20Mobile-34A853?style=flat-square" />
  <img alt="License" src="https://img.shields.io/badge/License-MIT-00599C?style=flat-square" />
</p>

<br/>

# Time Manager

A lightweight productivity web app designed to help users focus on their tasks, manage work sessions, keep daily notes, and monitor their progress through a clean and responsive interface.

## Overview

Time Manager is a frontend-only application built for personal productivity. It combines task management, a visual timer, notes, sound alerts, analytics, and settings into a single browser-based experience. All application data is stored locally in the browser using LocalStorage, which keeps the app fast, private, and independent from any backend service.

## Features

- Create, edit, complete, and delete tasks
- Track active work with a focused timer workflow
- View a daily overview of current tasks and progress
- Add and manage personal notes
- Customize sound alerts and volume
- Review productivity data in an analytics dashboard
- Switch themes and adjust app settings
- Import, export, and reset saved data
- Use the app responsively on desktop and mobile screens

## Core Functionalities

### Timer and Focus Workflow

The app includes a timer system with task-based focus sessions, start/pause/reset controls, and visual progress feedback. A flip-clock style display gives the timer a more polished and modern look.

### Task Management

Users can manage tasks throughout the day by creating new items, updating existing ones, marking them complete, and viewing today’s workload in a dedicated overview panel.

### Notes

The project includes a note feature for storing short reminders, quick ideas, and daily planning information. Notes are persisted locally so they remain available across sessions.

### Sound and Notifications

A sound system is included for timer completion alerts, with selectable sound options and volume control to personalize the experience.

### Analytics

The analytics section provides an overview of productivity-related activity, helping users review performance and identify task patterns.

### Settings and Data Management

The app includes settings support for theme customization and data controls such as importing, exporting, and resetting stored state.

## Technology Stack

- Vite
- Vanilla JavaScript
- Custom CSS
- Font Awesome
- LocalStorage for persistence
- Modular frontend architecture

## Project Structure

```text
time-manager/
├── public/
│   └── picture/
├── src/
│   ├── app/
│   ├── assets/
│   │   ├── css/
│   │   └── font/
│   ├── components/
│   │   ├── features/
│   │   │   ├── analytics/
│   │   │   ├── note/
│   │   │   ├── settings/
│   │   │   ├── sound/
│   │   │   ├── tasks/
│   │   │   └── timer/
│   │   ├── layout/
│   │   ├── modals/
│   │   ├── shared/
│   │   └── ui/
│   ├── controllers/
│   ├── models/
│   ├── services/
│   ├── utils/
│   └── views/
├── vendor/
│   └── fontawesome/
├── index.html
├── jsconfig.json
├── package.json
├── vite.config.js
├── LICENSE
├── README.md
├── .gitignore
└── public/
```

## Architecture

The app follows a modular frontend structure with responsibilities separated into clear areas:

- `app/` — app bootstrap and theme setup
- `components/` — UI blocks and feature-specific interfaces
- `controllers/` — event handling and coordination
- `models/` — application state and persistence models
- `services/` — timer, sound, theme, note, and storage logic
- `views/` — rendering and presentation layers
- `utils/` — helpers and adapters

This structure keeps the codebase easier to maintain, extend, and debug as the project grows.

## Demo

A visual demo is available in:

```text
/public/picture/demo.gif
/public/picture/logo-2.png
```

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd time-manager
```

Install dependencies:

```bash
npm install
```

## Running the Application

Start the development server:

```bash
npm run dev
```

Build the project for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Usage

1. Open the app in your browser.
2. Create or select a task.
3. Start the timer for a focused work session.
4. Use your notes for reminders or quick planning.
5. Adjust sound and volume preferences.
6. Review analytics to monitor your activity.
7. Customize settings and theme to match your workflow.

## Data Storage

The app stores user data locally in the browser using `LocalStorage`, including:

- tasks
- notes
- settings
- sound preferences
- theme choice
- app state

## Roadmap

Potential future improvements include:

- richer analytics views and filters
- recurring task support
- drag-and-drop task organization
- reminder notifications
- more advanced data export/import tools
- expanded theme and customization options

## License

This project is licensed under the [MIT License](https://github.com/AR2BJ/time-manager/blob/dev/LICENSE).

## Contributing

Contributions are welcome. If you want to improve the timer flow, extend the analytics, add new features, or refine the architecture, feel free to open a pull request or submit an issue.
