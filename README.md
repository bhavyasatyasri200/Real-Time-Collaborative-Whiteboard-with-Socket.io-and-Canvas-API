# Real-Time Collaborative Whiteboard

A production-ready, real-time collaborative whiteboard application built with React, Node.js, Socket.IO, and PostgreSQL. Multiple users can draw, create shapes, and collaborate simultaneously on a shared canvas.

---

## Tech Stack & Why Each Tool Was Chosen

| Tool | Role | Why |
|---|---|---|
| **React** | Frontend UI | Component-based architecture makes it easy to manage complex state across canvas, toolbar, and user panels |
| **Konva.js + react-konva** | Canvas rendering | Provides an object model for shapes, built-in event handling per object, and draggable elements — far easier than raw Canvas API for managing rectangles and selections |
| **Socket.IO** | Real-time communication | Handles WebSocket rooms, automatic reconnection, and event namespacing. Makes `joinRoom`, `draw`, `cursorMove` events simple to implement |
| **Zustand** | State management | Lightweight store for canvas state (tool selection, undo/redo stacks, user list, remote cursors). Simpler than Redux for this use case |
| **Node.js + Express.js** | Backend API + WebSocket server | Fast, non-blocking I/O perfect for handling many concurrent WebSocket connections |
| **PostgreSQL** | Database | Persists board states and user sessions reliably. Structured data fits well for board ownership and canvas object storage |
| **Docker + Docker Compose** | Containerization | Single `docker-compose up` command starts all 3 services (frontend, backend, db) with correct startup order and health checks |
| **Passport.js + Google OAuth** | Authentication | Industry-standard OAuth flow. Users log in with Google — no passwords to manage |

---

## Project Structure

```
whiteboard/
├── docker-compose.yml        # Orchestrates all services
├── .env                      # Real environment variables (not committed)
├── .env.example              # Template for environment variables
├── submission.json           # Test credentials for evaluation
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── src/
│       ├── components/
│       │   ├── CanvasBoard.js   # Main canvas with Konva + Socket.IO
│       │   ├── Toolbar.js       # Drawing tools, colors, undo/redo
│       │   ├── UserList.js      # Active users panel
│       │   └── Cursor.js        # Remote cursor overlay
│       ├── pages/
│       │   └── BoardPage.js     # Board route with auth check
│       ├── services/
│       │   └── api.js           # Backend API calls
│       ├── store/
│       │   └── canvasStore.js   # Zustand store for canvas state
│       ├── App.js               # Routes and home page
│       └── index.js             # React entry point
└── backend/
    ├── Dockerfile
    ├── package.json
    ├── server.js               # Express + Passport + Socket.IO setup
    ├── routes/
    │   ├── authRoutes.js        # OAuth routes
    │   └── boardRoutes.js       # Board CRUD routes
    ├── socket/
    │   └── socketHandler.js     # WebSocket event handlers
    └── seeds/
        └── init.sql             # Database initialization script
```

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Google OAuth credentials](https://console.cloud.google.com/) (Client ID + Secret)
- Git

---

## Setup & Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd whiteboard
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=any_random_secret_string
FRONTEND_URL=http://localhost:3000
PORT=3001
DATABASE_URL=postgresql://postgres:password@db:5432/whiteboard
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=whiteboard
```

### 3. Start all services

```bash
docker-compose up --build
```

This starts:
- **Frontend** → http://localhost:3000
- **Backend API** → http://localhost:3001
- **PostgreSQL** → localhost:5432

### 4. Verify services are healthy

```bash
docker-compose ps
```

All three services should show `Up` status within 3 minutes.

---


## API Endpoints

---

### 1. Health Check

```
GET http://localhost:3001/health
```

Response `200 OK`:
```json
{
  "status": "ok",
  "timestamp": "2026-03-12T10:00:00.000Z"
}
```

---

### 2. Get Session

```
GET http://localhost:3001/api/auth/session
```

Authentication: Requires a valid session cookie after OAuth login.

**How to test in browser:**
1. Go to `http://localhost:3001/api/auth/google` → login with Google
2. Then go to `http://localhost:3001/api/auth/session` → returns your user data

Response `200 OK`:
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "image": "string (URL)"
  }
}
```

Response `401 Unauthorized`:
```json
{
  "error": "Not authenticated"
}
```

---

### 3. Create Board

```
POST http://localhost:3001/api/boards
```

Authentication: Requires a valid user session.

Response `201 Created`:
```json
{
  "boardId": "string (unique identifier)"
}
```

---

### 4. Save Board

```
POST http://localhost:3001/api/boards/:boardId
```

Authentication: Requires a valid user session.

Request Body:
```json
{
  "objects": []
}
```

Response `200 OK`:
```json
{
  "success": true,
  "boardId": "string"
}
```

---

### 5. Load Board

```
GET http://localhost:3001/api/boards/:boardId
```

Authentication: Requires a valid user session.

Response `200 OK`:
```json
{
  "boardId": "string",
  "objects": [],
  "updatedAt": "2026-03-12T10:00:00.000Z"
}
```

---

---

## Features

### Drawing Tools
- **Pen tool** — freehand drawing with adjustable color and brush size
- **Rectangle tool** — drag to create rectangles
- **Eraser tool** — erase parts of the canvas
- **Select tool** — drag existing shapes to reposition them

### Real-Time Collaboration
- All drawing actions sync instantly to all users in the same room
- Live cursor positions shown for every connected user
- Active user list updates in real time as users join and leave

### State Management
- **Undo** (`Ctrl+Z`) — reverts last action per user
- **Redo** (`Ctrl+Y` or `Ctrl+Shift+Z`) — restores undone action
- **Save** — persists board state to PostgreSQL
- **Clear** — clears the entire canvas

### Authentication
- Google OAuth login via Passport.js
- Session-based authentication with express-session
- Guest access allowed for quick demo

---

## WebSocket Events

| Direction | Event | Payload |
|---|---|---|
| Client → Server | `joinRoom` | `{ boardId }` |
| Client → Server | `draw` | `{ points, color, brushSize, ... }` |
| Client → Server | `addObject` | `{ type, x, y, width, height, fill }` |
| Client → Server | `cursorMove` | `{ x, y }` |
| Client → Server | `clearCanvas` | `{ boardId }` |
| Server → Client | `roomUsers` | `{ users: [{ id, name }] }` |
| Server → Client | `drawUpdate` | drawing data |
| Server → Client | `objectAdded` | object data |
| Server → Client | `cursorUpdate` | `{ userId, x, y }` |
| Server → Client | `canvasCleared` | — |

---

## Testing

The app exposes a global function for automated testing:

```javascript
// Returns all canvas objects as JSON
window.getCanvasAsJSON()
```

### Test IDs available for automation

| Element | data-testid |
|---|---|
| User list panel | `user-list` |
| Remote cursors | `remote-cursor` |
| Rectangle tool button | `tool-rectangle` |
| Undo button | `undo-button` |
| Redo button | `redo-button` |

---

## Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → **APIs & Services** → **Credentials**
3. Configure OAuth consent screen (External)
4. Create **OAuth Client ID** → Web application
5. Add authorized redirect URI:
   ```
   http://localhost:3001/api/auth/google/callback
   ```
6. Copy Client ID and Client Secret to your `.env`

---

## Stopping the Application

```bash
docker-compose down
```

To remove all data including the database volume:

```bash
docker-compose down -v
```