# Movel AI — ROS Plugin Integration

Robot teleoperation dashboard built for the **Movel AI ROS Plugin Integration** assignment. A full-stack, containerized system that drives a simulated ROS robot via WebSocket and renders real-time telemetry in the browser.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  web-dashboard (Next.js 16 · port 3000)                     │
│  Canvas position tracker · WASD keyboard · battery gauge    │
└─────────────┬───────────────────────────────────────────────┘
              │ socket.io (telemetry_update)
              ▼
┌─────────────────────────────────────────────────────────────┐
│  cloud-backend (Express + Socket.IO · port 4000)            │
│  In-memory robot state · command queue · REST API           │
└──────┬──────────────────────────────────┬───────────────────┘
       │ REST POST /internals/telemetry   │ REST GET /internals/robots/:id/commands (poll 500ms)
       ▼                                  ▼
┌─────────────────────────────────────────────────────────────┐
│  ros-plugin (Bun · roslib · axios)                          │
│  Subscribes /pose /battery_percentage · publishes /cmd      │
└─────────────┬───────────────────────────────────────────────┘
              │ roslib WebSocket (ws://web-ros:9090)
              ▼
┌─────────────────────────────────────────────────────────────┐
│  web-ros (ROS Simulator · Docker · port 9090)               │
│  Publishes geometry_msgs/Point & std_msgs/Float32           │
└─────────────────────────────────────────────────────────────┘
```

**Data flow:**
- ROS simulator publishes pose + battery → ros-plugin reads via `roslib` WebSocket subscriptions
- ros-plugin POSTs telemetry to cloud-backend → backend stores in memory + broadcasts via Socket.IO
- Dashboard receives `telemetry_update` events → renders position on canvas, updates battery/status
- Dashboard sends WASD/STOP commands via REST → backend queues them → ros-plugin polls and publishes to ROS `/cmd` topic

## Why These Technologies

### Bun (Runtime)

All three services use **Bun** instead of Node.js as the JavaScript runtime:

| Reason | Impact |
|---|---|
| **Native TypeScript** | No build step. `bun run src/plugin.ts` executes `.ts` files directly — no `ts-node`, no `tsc` pre-compilation. This keeps the feedback loop tight during development. |
| **Faster startup** | Bun starts ~4× faster than Node.js. In a Docker Compose setup with four services that restart frequently during development, this saves meaningful iteration time. |
| **Node.js compatible** | Bun implements Node.js built-in modules (`node:http`, `node:process`, `node:events`) and the npm ecosystem. Code written for Bun runs on Node.js without changes, so there's no lock-in. |
| **`bun install` speed** | Package installs are significantly faster than npm/yarn, which matters in CI and Docker builds. |
| **Env flexibility** | Unlike Node.js 20+ `--env-file`, Bun requires `dotenv`. This is an explicit trade-off: using `dotenv` keeps the code portable across Node.js and Bun runtimes while the ecosystem catches up. |

### WebSocket (Two Tiers)

WebSocket is used at two different layers, each for a different reason:

| Layer | Library | Why WebSocket |
|---|---|---|
| **ROS Bridge** | `roslib` (native rosbridge WebSocket protocol) | ROS communicates over its own WebSocket wire protocol (rosbridge). This is the **only** way to interface with a ROS master from a non-ROS process. `roslib` handles topic subscribe/publish, service calls, and reconnection semantics. |
| **Dashboard ↔ Backend** | `socket.io` (server) + `socket.io-client` (browser) | Raw WebSocket would only deliver bytes. Socket.IO provides **event-based messaging** (`telemetry_update`), **automatic reconnection** with backoff, **fallback to HTTP long-polling** if WebSocket is blocked by a proxy, and **rooms/namespaces** (scalable to multiple robots). For a teleoperation dashboard where stale data = danger, socket.io's reconnection guarantees are critical. |

### Node.js Ecosystem

The entire stack runs on JavaScript/TypeScript using Node.js-compatible libraries:

- **Express.js** — mature HTTP framework with middleware (cors, body-parser, error handling)
- **axios** — HTTP client with interceptors, timeout handling, and clean error types
- **roslib** — the standard npm package for ROS WebSocket communication
- **Shared types** — TypeScript interfaces (`RobotData`, `RobotCommand`) are defined once and reused conceptually across all three services

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- OR [Bun](https://bun.sh/) ≥ 1.0 installed locally (to run services without Docker)

### Option 1: Docker Compose (recommended)

```bash
# Start all four services
docker compose up --build

# Services:
#   web-dashboard   → http://localhost:3000
#   cloud-backend   → http://localhost:4000
#   ros-plugin      → (internal, connects to web-ros:9090)
#   web-ros         → ws://localhost:9090
```

### Option 2: Run locally with Bun

```bash
# Terminal 1 — ROS simulator (Docker only)
docker compose -f docker-compose-assignment.yaml up

# Terminal 2 — Cloud backend
cd apps/cloud-backend && bun install && bun run index.ts

# Terminal 3 — ROS plugin
cd apps/ros-plugin && bun install && bun run index.ts

# Terminal 4 — Web dashboard
cd apps/web-dashboard && bun install && bun run dev
```

## Using the Dashboard

1. Open **http://localhost:3000** in your browser.
2. The dashboard connects to the cloud backend via Socket.IO and fetches initial robot state via REST.
3. **WASD keys** send movement commands (`w`/`a`/`s`/`d`) to the robot. Releasing any key sends `STOP`.
4. The **canvas** (right panel) shows the robot's 2D position in real-time on a grid.
5. The **telemetry panel** (left panel) displays battery health, X/Y coordinates, and connection status.
6. The **virtual keyboard** (bottom) highlights pressed WASD keys.

## API Endpoints (cloud-backend)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check with plugin connectivity status |
| `GET` | `/api/robot/state` | Get current state of robot-1 |
| `POST` | `/api/robot/command` | Queue a command (`w`, `a`, `s`, `d`, `STOP`) |
| `POST` | `/api/internals/telemetry` | ROS plugin pushes telemetry (internal) |
| `GET` | `/api/internals/robots/:id/commands` | ROS plugin polls pending commands (internal) |

## Project Structure

```
movel-ai/
├── docker-compose.yml                 # 4-service orchestration
├── apps/
│   ├── web-dashboard/                 # Next.js 16 frontend (React 19)
│   │   ├── app/
│   │   │   ├── page.tsx               # Main dashboard (Socket.IO, WASD, canvas)
│   │   │   ├── types.ts               # RobotTelemetry interface
│   │   │   └── components/
│   │   │       ├── Header.tsx
│   │   │       ├── TelemetryPanel.tsx  # Battery, position, status cards
│   │   │       ├── RobotViewer.tsx     # 2D canvas position tracker
│   │   │       └── VirtualKeyboard.tsx # On-screen WASD keyboard
│   │   └── Dockerfile                 # Multi-stage Bun build
│   ├── cloud-backend/                 # Express + Socket.IO server
│   │   └── src/
│   │       ├── server.ts              # HTTP server, Socket.IO setup
│   │       ├── types.ts               # RobotData, RobotCommand types
│   │       ├── state/robotState.ts    # In-memory Map store
│   │       ├── controllers/           # Business logic handlers
│   │       ├── routes/                # REST API definitions
│   │       └── middleware/            # Error handler
│   └── ros-plugin/                    # ROS bridge client
│       └── src/
│           └── plugin.ts              # roslib connection, subscribers, polling
```

## Key Design Decisions

- **Command queue pattern** — the dashboard sends commands via REST, the backend queues them, and the ROS plugin polls every 500ms. This decouples the browser from ROS timing and prevents command loss if the ROS bridge disconnects.
- **In-memory state** — robot state is stored in `Map<string, RobotData>` for O(1) lookups. For production, this would be replaced with Redis or a database.
- **Exponential backoff** — the ROS plugin retries the WebSocket connection with jitter (1s → 2s → 4s → … → 30s max), preventing thundering-herd reconnection storms.
- **Online/offline staleness** — the dashboard considers the robot offline if no telemetry arrives within 5 seconds, providing clear UX feedback.
