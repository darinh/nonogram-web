# Codebase Profile: nonogram

## Overview
- **Type**: Single-page application (SPA)
- **Primary language**: TypeScript
- **Framework**: React 19 + Vite 8
- **Database**: localStorage (browser)
- **Size**: 79 files, ~3,800 lines
- **Hosting**: Firebase Hosting (Spark plan)
- **Live URL**: https://nonogram-game-app.web.app

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Language | TypeScript 5.9 |
| UI Framework | React 19.2 |
| Routing | react-router-dom 7.x |
| Build | Vite 8.0 |
| Testing | Vitest 4.1 + @testing-library/react 16.x |
| Linting | ESLint 9.x + typescript-eslint |
| Hosting | Firebase Hosting (SPA rewrite) |
| Fonts | Google Fonts (M PLUS Rounded 1c, Lato) |

## Directory Structure
```
src/
├── engine/          # Pure TS logic — types, clues, validation, serialization, pixelizer
├── providers/       # Abstraction layers (puzzle + progress)
│   ├── puzzle/      # PuzzleProvider interface + Static/LocalStorage/Composite
│   └── progress/    # ProgressProvider interface + LocalStorage
├── hooks/           # React hooks — useNonogramGame, useDragPaint, usePuzzles, useProgress
├── components/      # React components — App, pages, grid, toolbar, cards
├── data/puzzles/    # 9 bundled puzzles (5x5, 10x10, 15x15)
├── styles/          # CSS Modules (Mahoako theme)
└── __tests__/       # Vitest tests mirroring src structure
```

## Build & Test Commands
| Command | Purpose | Verified |
|---------|---------|----------|
| `npm run build` | TypeScript compile + Vite production build | yes |
| `npm test` | Run all Vitest tests | yes |
| `npm run test:watch` | Vitest in watch mode | no |
| `npm run lint` | ESLint | no |
| `npm run deploy` | Build + Firebase deploy | yes |
| `npm run dev` | Vite dev server | no |

## Entry Points
- `src/main.tsx` — React root, renders App with StrictMode
- `src/components/App.tsx` — BrowserRouter + provider context wrapping + Routes

## Architecture Patterns
- **Provider pattern**: PuzzleProvider and ProgressProvider interfaces with React Context injection. Swap implementations (localStorage to API) without changing components.
- **Engine layer**: src/engine/ is framework-agnostic pure TypeScript — no React imports. Handles clue derivation, grid validation, import/export serialization, and image pixelization.
- **Flat arrays**: All grids stored as row-major flat number[] arrays. Index = row * size + col.
- **Composite provider**: CompositePuzzleProvider merges bundled + user-created puzzles from multiple backends.

## Conventions Observed
- Const objects with `as const` for enums (CellState, Tool) — erasableSyntaxOnly TS config
- CSS Modules for component styles (.module.css)
- CSS custom properties for theming (Mahoako color palette)
- Google Fonts loaded via CSS @import
- Test files in src/__tests__/ mirroring source structure
- Puzzle data as TypeScript files with runtime clue derivation

## Theme
- **Inspiration**: Mahou Shoujo ni Akogarete (mahoako-anime.com)
- **Primary**: Pink #F20574
- **Secondary**: Blue #0597F2
- **Font**: M PLUS Rounded 1c (400/700/900) + Lato (900 for clue numbers)
- **Style**: Rounded corners, pink accents, playful shadows

## Test Coverage
- 8 test files, 68 tests passing
- Engine: clues (12), validation (10), serialization (11), pixelizer (4)
- Providers: puzzle (11), progress (5)
- Hooks: useNonogramGame (9), useDragPaint (6)
- Component tests: not yet written

## Concerns
- No CI/CD pipeline — no GitHub Actions, tests only run locally
- No component-level tests — hooks and engine tested, but no render tests for pages
- No mobile touch support — drag painting only handles mouse events
- No undo/redo — user must reset entire grid to correct mistakes

## Onboarding Date
2026-03-21
