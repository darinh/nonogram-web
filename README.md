# Nonogram

A web-based nonogram (picross) puzzle game built with React, TypeScript, and Vite.

🌐 **Live**: [nonogram-game-app.web.app](https://nonogram-game-app.web.app)

## Getting Started

### Prerequisites
- Node.js 20+
- npm

### Setup
```bash
git clone <repo-url>
cd nonogram
bash scripts/setup.sh
```

The setup script installs npm dependencies and Playwright browsers (requires sudo for system libraries).

### Development
```bash
npm run dev        # Start dev server at http://localhost:5173
```

### Testing
```bash
npm test           # Unit tests (Vitest, 336+ tests across 24 files)
npm run test:e2e   # E2E tests (Playwright, 4 suites — requires build first)
npm run build && npm run test:e2e  # Build then E2E
```

### Building
```bash
npm run build      # Production build to dist/
npm run preview    # Preview production build locally
```

### Deployment
```bash
npm run deploy     # Build and deploy to Firebase Hosting
```

## Features

- 🧩 9 bundled puzzles + 6 themed puzzle packs (600+ puzzles total across Nature, Space, Ocean, City, Fantasy, Food themes)
- ✏️ Fill and X tools with click-drag painting
- ↩️ Undo/redo with keyboard shortcuts (Ctrl+Z / Ctrl+Shift+Z)
- ⏱️ Timer display
- 🪙 Coin economy with hints and power-ups
- 💡 Hints (reveal row/column) and power-ups (Edge Reveal, Bomb)
- 🎨 Puzzle creator (photo pixelizer + manual editor) with logic solvability checker
- 📤 Import/export puzzles as JSON
- 🌙 Dark mode
- ⌨️ Keyboard navigation
- 📱 Mobile touch support
- 📊 Statistics page
- 🔄 PWA with offline support
- 🔊 Sound effects (Web Audio API) with mute toggle
- 📅 Daily puzzle with countdown timer
- 🔥 Streak tracking (current and longest)
- 🎓 Tutorial/onboarding (5-step walkthrough)
- 🎭 CSS animations (cell fill, strikethrough, confetti, completion overlay)
- 👤 User authentication (login/register)
- 5-tier difficulty system (Beginner/Easy/Medium/Hard/Expert)

## Routes

| Path | Page |
|------|------|
| `/` | Home |
| `/puzzles` | Puzzle Browser |
| `/themes` | Theme Browser |
| `/themes/:themeId` | Theme Grid |
| `/themes/:themeId/:puzzleId` | Play (themed) |
| `/daily` | Daily Puzzle |
| `/play/:puzzleId` | Play |
| `/create` | Puzzle Creator |
| `/stats` | Statistics |
| `/login` | Login |
| `/register` | Register |

## Tech Stack

- **React 19** + **TypeScript 5.9**
- **Vite 8** (build)
- **Vitest** (unit tests) + **Playwright** (E2E tests)
- **CSS Modules** with Mahoako-inspired theme

## Project Structure

```
src/
├── engine/        # Pure TS logic (types, clues, validation, coins, hints, powerups, solver, difficulty)
├── providers/     # Abstraction layers (puzzle, progress, theme, wallet, auth, sound)
├── hooks/         # React hooks (game state, drag paint, wallet, themes, tutorial)
├── components/    # React components (pages, grid, toolbar, cards, overlays)
├── data/          # Bundled puzzle and theme data (6 themes, 600+ puzzles)
├── styles/        # CSS Modules
├── utils/         # Utility functions (formatting, helpers)
└── __tests__/     # Unit tests (24 files, 336+ tests)
e2e/               # Playwright E2E tests (4 suites)
scripts/           # Setup, puzzle generation, theme generation
```
