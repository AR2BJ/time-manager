<div align="center">
  <img src="/public/picture/demo.gif" alt="Time Manager Demo" width="100%" />
</div>

<br/>
<br>

<div align="center">
  <img src="/public/picture/logo-4.png" alt="Time Manager Logo" height="145" />
</div>

<br/>
<br>

<p align="center">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite" />
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-ES2026-F7DF1E?style=flat-square&logo=javascript" />
  <img alt="Storage" src="https://img.shields.io/badge/Storage-LocalStorage-4FC3F7?style=flat-square" />
  <img alt="Responsive" src="https://img.shields.io/badge/Responsive-Desktop%20%26%20Mobile-34A853?style=flat-square" />
  <img alt="License" src="https://img.shields.io/badge/License-MIT-00599C?style=flat-square" />
</p>

<br/>

# Time Manager

A modern, lightweight time management web application designed to help users organize daily responsibilities, stay productive, and monitor progress through a clean and responsive interface.

## Overview

Time Manager is a frontend-focused productivity app that allows users to manage times, review their workload from different perspectives, and keep everything organized without relying on any backend service. All data is stored locally in the browser using LocalStorage, ensuring a fast and private experience.

## Key Features

- Create, edit, complete, and delete times
- Organize times through a structured time-based interface
- View times in multiple perspectives such as calendar and matrix views
- Explore progress through an analytics-oriented dashboard
- Customize the experience with settings and theme support
- Maintain personal data locally for fast access and privacy

## Project Goals

This project was developed to demonstrate:

- modular frontend architecture
- clean separation of concerns
- browser-based persistence
- responsive UI design
- practical time-management workflows

## Technology Stack

- Vite
- Vanilla JavaScript
- Custom CSS styling
- Font Awesome
- LocalStorage for persistence
- Feature-based frontend modularity

## Project Structure

```text
time-manager/
├── public/
│   └── picture/
├── src/
│   ├── app/
│   ├── assets/
│   │   └── css/
│   ├── components/
│   │   ├── features/
│   │   │   ├── analytics/
│   │   │   ├── calendar/
│   │   │   ├── matrix/
│   │   │   ├── settings/
│   │   │   └── times/
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
├── package.json
├── vite.config.js
└── jsconfig.json
```

## Architecture

The application follows a structured frontend architecture based on clear separation between presentation, behavior, and state:

- `app/` — application bootstrap and global configuration
- `components/` — reusable UI blocks and feature-specific modules
- `controllers/` — event handling and workflow coordination
- `models/` — application state and persistence layer
- `services/` — reusable business logic and side-effect abstractions
- `views/` — page-level rendering and visual composition

This organization improves maintainability, readability, and extensibility while preserving a lightweight implementation.

## Demo

A visual demonstration of the interface is available in:

```text
/public/picture/demo.gif
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

1. Launch the application in a browser.
2. Create and organize the times you need to manage.
3. Review times from different views such as calendar and matrix.
4. Use the analytics dashboard to monitor your progress.
5. Adjust the app settings and theme according to your preference.

## Roadmap

Potential future enhancements include:

- richer analytics and progress insights
- time filtering and search improvements
- drag-and-drop time organization
- reminders and notifications
- data import/export support

## License

This project is licensed under the [MIT license](https://github.com/AR2BJ/time-manager/blob/dev/LICENSE).

## Contributing

Contributions are welcome. If you would like to improve the UI, extend analytics, or refine the system architecture, please feel free to open a pull request or submit an issue.
