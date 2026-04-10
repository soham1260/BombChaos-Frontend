# Bomb Chaos Frontend

Bomb Chaos Frontend is the browser client for the Bomb Chaos multiplayer game. It provides the landing screen, room creation and joining flow, lobby management, and the animated game experience using React, Vite, Tailwind CSS, Phaser, and Socket.IO.

## Overview

This app is responsible for:

- connecting players to the game server
- creating and joining multiplayer rooms
- showing lobby state in real time
- rendering the game UI and transitions
- handling frontend state with Zustand

The frontend expects a running backend server for room management and live gameplay updates.

## Features

- React + Vite development setup
- Socket.IO client integration for real-time multiplayer
- lobby flow for creating and joining rooms
- live room updates for connected players
- animated UI using Framer Motion
- Phaser-powered game rendering
- Zustand stores for lightweight app state management

## Tech Stack

- React 18
- Vite 5
- Tailwind CSS
- Phaser 3
- Socket.IO Client
- Framer Motion
- Zustand

## Project Structure

```text
BombChaos-Frontend/
├── src/
│   ├── components/      # Reusable UI pieces
│   ├── game/            # Phaser game code, scenes, utilities
│   ├── pages/           # Login and register pages
│   ├── screens/         # Landing, lobby, game, and results screens
│   ├── store/           # Zustand stores
│   ├── App.jsx          # Top-level app screen router
│   ├── main.jsx         # Frontend entrypoint
│   └── socket.js        # Socket.IO client setup
├── index.html
├── package.json
└── vite.config.js
```

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- A running Bomb Chaos backend server

## Installation

1. Move into the frontend folder:

```bash
cd BombChaos-Frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file for local development:

```env
VITE_SERVER_URL=http://localhost:3001
```

If no `.env` file is provided, the frontend falls back to `http://localhost:3001`.

## Available Scripts

### `npm run dev`

Starts the Vite development server.

Default local URL:

```text
http://localhost:5173
```

### `npm run build`

Builds the production-ready frontend bundle.

### `npm run preview`

Serves the production build locally for preview.

## Running The App Locally

1. Start the backend server first.
2. Start the frontend:

```bash
npm run dev
```

3. Open:

```text
http://localhost:5173
```

4. Enter a nickname, create a room or join an existing room code, and wait for the host to start the match.

## Environment Variables

| Variable | Required | Description | Default |
| --- | --- | --- | --- |
| `VITE_SERVER_URL` | No | Base URL for the backend server | `http://localhost:3001` |

## How It Connects To The Backend

- The frontend uses `VITE_SERVER_URL` to connect to the backend for REST and Socket.IO traffic.
- Vite is configured to run on port `5173`.
- Socket.IO traffic is expected to reach the backend on port `3001` during local development.

## Current Screens

- Landing screen
- Lobby screen
- Login screen
- Register screen
- Game screen
- Results screen

## Notes

- This frontend depends on the backend being available before multiplayer flows will work.
- Login and registration UI exists in the frontend codebase, but its usability depends on backend auth routes being actively wired on the server side.
- No automated frontend test setup is currently defined in `package.json`.
