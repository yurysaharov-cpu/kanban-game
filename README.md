# Kanban Board Game

Full-stack clone of [kanbanboardgame.com](https://www.kanbanboardgame.com/) — a web-based Kanban workflow simulation game.

## Features

- Register / Login with JWT auth
- Dashboard: game history, leaderboard Top 50
- Two game modes: Standard (35 days) and getKanban V2 (21 days)
- Interactive Kanban board: Backlog → Ready → Analysis → Development → Test → Deployed
- Drag & drop story cards and team member tokens
- 4 card types: Standard (yellow), Expedite (blue), Intangible (green), Fixed date (purple)
- Expedite + Standard lanes
- Specialist bonus: analysts/developers/testers get ×2 in their column
- 3 analytics charts: Cumulative Flow Diagram, Financial Chart, Cycle Time

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Drag & Drop | dnd-kit |
| Charts | Recharts |
| State | Zustand |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + bcrypt |
| DevOps | Docker Compose |
| CI/CD | GitHub Actions |

## Quick Start (Docker)

```bash
git clone https://github.com/YOUR_USERNAME/kanban-game
cd kanban-game
cp .env.example .env
# Edit .env — set JWT_SECRET
docker compose up
```

Then open http://localhost:5173

## Local Development (without Docker)

**Prerequisites:** Node 20+, PostgreSQL 15+

```bash
# Backend
cd backend
cp ../.env.example .env
npm install
npx prisma migrate dev
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Environment Variables

```env
DATABASE_URL=postgresql://kanban:kanban@localhost:5432/kanban_game
JWT_SECRET=your_long_random_secret_here
PORT=3001
VITE_API_URL=http://localhost:3001
```

## API Endpoints

```
POST /api/auth/register      { username, email, password }
POST /api/auth/login         { username, password }
GET  /api/auth/me

GET  /api/games              List user games
POST /api/games/new          { gameType: "Standard" | "V2" }
POST /api/games/start        { GameId }
POST /api/games/next         { GameId }
DELETE /api/games/:id

POST /api/story/move         { GameId, StoryId, Stage }
POST /api/team-member/move   { GameId, TeamMemberId, StoryId }

POST /api/chart/cfd          { GameId }
POST /api/chart/revenue      { GameId }
POST /api/chart/cycle-time   { GameId }
GET  /api/games/leaderboard  ?gameType=Standard
```

## Project Structure

```
kanban-game/
├── .github/workflows/      # CI + Deploy pipelines
├── frontend/               # React app
│   └── src/
│       ├── pages/          # Login, Register, Dashboard, Game
│       ├── components/     # board/, charts/
│       ├── store/          # Zustand (auth, game)
│       ├── api/            # API client
│       └── types/          # TypeScript types
└── backend/                # Express API
    ├── src/
    │   ├── routes/         # auth, game, story, teamMember, chart
    │   ├── services/       # gameEngine, storyData
    │   └── middleware/     # auth, error
    └── prisma/             # DB schema + migrations
```
