# Dashboard App — Customized Chart Feature

An Angular 21 single-page application that lets users build, manage and reorder personal doughnut charts on a live-data dashboard. Charts track how many rooms fall into user-defined sensor-value ranges, updating automatically every 2 seconds via a mock WebSocket.

---

## Table of Contents

1. [Project Requirements](#1-project-requirements)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [How to Run](#4-how-to-run)
5. [Mock Data & Real-Time Simulation](#5-mock-data--real-time-simulation)
6. [Available Scripts](#6-available-scripts)
7. [Angular Guidelines](#7-angular-guidelines)

---

## 1. Project Requirements

### Feature Overview

Users can define and manage personal charts on the Dashboard Home. Each chart visualises how many rooms fall into user-defined sensor-value ranges. Charts are personal, persist across sessions, and reflect live sensor data at all times.

### Capabilities

| #   | Capability         | Description                                                                 |
| --- | ------------------ | --------------------------------------------------------------------------- |
| 1   | View custom charts | Display saved charts in a dedicated row on the dashboard.                   |
| 2   | Create a chart     | Define a chart with a name, rooms, sensor type, and value ranges.           |
| 3   | Edit a chart       | Modify any configuration of an existing chart.                              |
| 4   | Delete a chart     | Permanently remove a chart after explicit confirmation.                     |
| 5   | Reorder charts     | Rearrange charts; order persists per user.                                  |
| 6   | Live data sync     | Charts automatically reflect the latest sensor readings and room statuses.  |
| 7   | List View          | Per-room breakdown of which range each room currently falls into.           |
| 8   | Room detail        | Open a room from List View to see its current reading and range assignment. |
| 9   | Export             | Export list or detail data to a spreadsheet.                                |

### Validation Rules

| Rule           | Requirement                                                    |
| -------------- | -------------------------------------------------------------- |
| Chart name     | Required. Must be unique across all the user's charts.         |
| Room selection | At least one room must be selected.                            |
| Sensor type    | Must be selected from types common to all selected rooms.      |
| Ranges         | At least one range must be defined.                            |
| Range overlap  | No two ranges may share any value. Intervals must not overlap. |
| Range names    | Must be unique within a single chart.                          |

### States & Messaging

| State                           | Expected Behaviour                                             |
| ------------------------------- | -------------------------------------------------------------- |
| No custom charts yet            | Show an empty state encouraging the user to create one.        |
| Chart has no rooms in any range | Show an appropriate empty state within the chart card.         |
| Room ranges not configured      | Show a "Room Ranges Not Set!" message in the chart card.       |
| Failed create / edit / delete   | Display a descriptive error; the user's data must not be lost. |
| Loading                         | Show loading indicators while data is being fetched/saved.     |

---

## 2. Tech Stack

| Technology       | Version | Purpose                            |
| ---------------- | ------- | ---------------------------------- |
| Angular          | 21.2.x  | Application framework              |
| Angular Material | 21.2.x  | UI components & dialogs            |
| Angular CDK      | 21.2.x  | Drag-and-drop, overlays            |
| Chart.js         | 4.5.x   | Doughnut chart rendering           |
| RxJS             | 7.8.x   | Reactive state & socket simulation |
| TailwindCSS      | 4.2.x   | Utility-first styling              |
| Vitest           | 4.x     | Unit testing (replaces Karma)      |
| TypeScript       | 5.9.x   | Type safety                        |

---

## 3. Project Structure

```
AFaqy_Task/
├── customized-chart-feature-requirements.md   # Full feature requirements
├── mock-data.json                             # Root-level copy of initial mock data
├── mock-socket.json                           # Root-level copy of socket event contract
└── dashboard-app/                             # Angular workspace root
    ├── angular.json                           # Angular CLI configuration
    ├── package.json                           # Dependencies & scripts
    ├── tsconfig.json                          # Base TypeScript config
    ├── tsconfig.app.json                      # App-specific TS config
    ├── tsconfig.spec.json                     # Test-specific TS config
    ├── vite.config.mts                        # Vite / Vitest configuration
    ├── ANGULAR_GUIDELINES.md                  # Project coding standards
    ├── public/                                # Static public assets
    └── src/
        ├── index.html                         # App shell HTML
        ├── main.ts                            # Bootstrap entry point
        ├── styles.scss                        # Global styles
        ├── tailwind.css                       # Tailwind entry
        ├── test-setup.ts                      # Vitest global setup
        ├── assets/
        │   └── data/
        │       ├── mock-data.json             # Initial rooms, charts & chart order
        │       └── mock-socket.json           # Socket event payloads
        └── app/
            ├── app.config.ts                  # Application providers
            ├── app.routes.ts                  # Top-level routes
            ├── app.ts                         # Root component
            ├── app.html                       # Root template
            │
            ├── core/                          # App-wide singletons & contracts
            │   ├── constants/
            │   │   ├── app.constants.ts       # Global constants
            │   │   └── index.ts
            │   ├── models/
            │   │   ├── chart.model.ts         # Chart, Range, SensorType interfaces
            │   │   ├── dialog-data.model.ts   # Dialog input/output interfaces
            │   │   ├── room.model.ts          # Room interface
            │   │   ├── sensor.model.ts        # Sensor reading interface
            │   │   ├── socket-event.model.ts  # WebSocket event payloads
            │   │   └── index.ts
            │   └── services/
            │       ├── index.ts
            │       ├── dashboard/
            │       │   ├── dashboard.service.ts       # Chart CRUD & ordering
            │       │   └── dashboard.service.spec.ts
            │       ├── socket/
            │       │   ├── socket.service.ts          # Mock WebSocket simulation
            │       │   └── socket.service.spec.ts
            │       └── storage/
            │           ├── storage.service.ts         # LocalStorage persistence
            │           └── storage.service.spec.ts
            │
            ├── features/                      # Feature components (lazy-loadable)
            │   ├── chart-card/
            │   │   ├── chart-card.component.ts        # Doughnut card + options menu
            │   │   ├── chart-card.component.html
            │   │   ├── chart-card.component.scss
            │   │   └── chart-card.component.spec.ts
            │   ├── chart-dialog/
            │   │   ├── chart-dialog.component.ts      # Add/Edit chart dialog
            │   │   ├── chart-dialog.component.html
            │   │   ├── chart-dialog.component.scss
            │   │   └── chart-dialog.component.spec.ts
            │   ├── dashboard/
            │   │   ├── dashboard.component.ts         # Main dashboard page
            │   │   ├── dashboard.component.html
            │   │   ├── dashboard.component.scss
            │   │   └── dashboard.component.spec.ts
            │   ├── delete-confirm-dialog/
            │   │   ├── delete-confirm-dialog.component.ts
            │   │   ├── delete-confirm-dialog.component.html
            │   │   ├── delete-confirm-dialog.component.scss
            │   │   └── delete-confirm-dialog.component.spec.ts
            │   ├── list-view/
            │   │   ├── list-view.component.ts         # Per-room range breakdown
            │   │   ├── list-view.component.html
            │   │   ├── list-view.component.scss
            │   │   ├── list-view.component.spec.ts
            │   │   └── list-view.model.ts             # List-view-specific types
            │   └── room-detail/
            │       ├── room-detail.component.ts       # Room reading & range detail
            │       ├── room-detail.component.html
            │       ├── room-detail.component.scss
            │       └── room-detail.component.spec.ts
            │
            └── shared/                        # Reusable presentational components
                ├── components/
                │   ├── header/                # App header with "Add Chart" button
                │   ├── sidebar/               # Navigation sidebar
                │   └── not-implemented/       # Placeholder for unbuilt routes
                └── utils/
                    ├── chart.utils.ts         # Chart count algorithm & helpers
                    ├── chart.utils.spec.ts
                    ├── csv-export.utils.ts    # CSV export helper
                    └── index.ts
```

---

## 4. How to Run

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 11 (project uses `packageManager: npm@11.6.2`)

### Installation

```bash
# From the workspace root
cd dashboard-app
npm install
```

### Development Server

```bash
npm start
# or
ng serve
```

Open [http://localhost:4200](http://localhost:4200) in your browser.  
The application reloads automatically on file changes.

### Production Build

```bash
npm run build
```

Output artifacts are placed in `dist/`.

---

## 5. Mock Data & Real-Time Simulation

The app uses two static JSON files in `src/assets/data/` as stand-ins for a real API and WebSocket layer.

### `mock-data.json` — Initial State

| Key            | Description                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| `rooms`        | 20 rooms across 4 floors. 17 online, 3 offline. All have temperature & humidity; floors 2–4 also have CO₂. |
| `customCharts` | 3 pre-configured charts: Temperature Zones, Humidity Levels, CO₂ Monitor.                                  |
| `chartOrder`   | Saved display order for the current user.                                                                  |
| `sensorBounds` | Min/max realistic values per sensor type.                                                                  |

### `mock-socket.json` — Live Updates

The `SocketService` fires events every **2 seconds** matching these payloads:

| Event           | Action                                                               |
| --------------- | -------------------------------------------------------------------- |
| `sensor_update` | Updates a room's sensor value; chart counts recomputed & re-rendered |
| `room_status`   | Updates a room's online/offline status; chart counts recomputed      |

### Chart Count Algorithm

1. Take the chart's `roomIds`.
2. Keep only rooms that are **online** and have a reading for the chart's `sensorType`.
3. For each qualifying room, find its range: `from ≤ value < to` (last range: `from ≤ value ≤ to`).
4. Count rooms per range → doughnut segment values.

---

## 6. Available Scripts

| Script               | Command                 | Description                       |
| -------------------- | ----------------------- | --------------------------------- |
| Start dev server     | `npm start`             | Serve on `localhost:4200`         |
| Production build     | `npm run build`         | Build to `dist/`                  |
| Build watch          | `npm run watch`         | Build in watch mode (development) |
| Run tests (once)     | `npm test`              | Run all Vitest unit tests         |
| Run tests (watch)    | `npm run test:watch`    | Vitest in interactive watch mode  |
| Run tests (coverage) | `npm run test:coverage` | Vitest with V8 coverage report    |

---

## 7. Angular Guidelines

See [ANGULAR_GUIDELINES.md](./ANGULAR_GUIDELINES.md) for the full set of coding standards enforced in this project.

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
