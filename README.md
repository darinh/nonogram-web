# Nonogram

A web-based nonogram (picross) puzzle game built with React, TypeScript, and Vite.

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
npm test           # Unit tests (Vitest, 275+ tests)
npm run test:e2e   # E2E tests (Playwright, requires build first)
npm run build && npm run test:e2e  # Build then E2E
```

### Building
```bash
npm run build      # Production build to dist/
npm run preview    # Preview production build locally
```

## Features

- 🧩 9 bundled puzzles + themed puzzle packs (100 puzzles per theme)
- ✏️ Fill and X tools with click-drag painting
- ↩️ Undo/redo with keyboard shortcuts (Ctrl+Z / Ctrl+Shift+Z)
- ⏱️ Timer display
- 🪙 Coin economy with hints and power-ups
- 🎨 Puzzle creator (photo pixelizer + manual editor)
- 📤 Import/export puzzles as JSON
- 🌙 Dark mode
- ⌨️ Keyboard navigation
- 📱 Mobile touch support
- 📊 Statistics page
- 🔄 PWA with offline support

## Tech Stack

- **React 19** + **TypeScript 5.9**
- **Vite 8** (build)
- **Vitest** (unit tests) + **Playwright** (E2E tests)
- **CSS Modules** with Mahoako-inspired theme

## Project Structure

```
src/
├── engine/        # Pure TS logic (types, clues, validation, coins, hints, powerups)
├── providers/     # Abstraction layers (puzzle, progress, theme, wallet, auth)
├── hooks/         # React hooks (game state, drag paint, wallet, themes)
├── components/    # React components (pages, grid, toolbar, cards)
├── data/          # Bundled puzzle and theme data
├── styles/        # CSS Modules
└── __tests__/     # Unit tests
e2e/               # Playwright E2E tests
scripts/           # Setup and puzzle generation scripts
```
