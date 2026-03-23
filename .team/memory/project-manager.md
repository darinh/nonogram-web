# Project Manager Memory

## Active Context
- Working on: nonogram puzzle game — **themed puzzle system** (major feature)
- Stack: TypeScript 5.9, React 19, Vite 8, Vitest 4, Firebase Hosting
- Live URL: https://nonogram-game-app.web.app
- 89 tests, all passing
- **Current initiative**: Picture Cross-style themed system with coin economy, hints, power-ups

## Learnings

### 2025-07-18 — Play Again Feature
- **What**: Added "Play Again" button to completion overlay. The `resetGrid()` in `useNonogramGame.ts` already handled clearing the grid, resetting `completed` state, and saving progress — only UI changes were needed in `GamePage.tsx` and `GamePage.module.css`.
- **Evidence**: Commit `fba6429`, 68 tests pass, deployed to Firebase.
- **Impact**: The existing hook was well-designed — `resetGrid` was a complete reset function. Future features should check existing hook capabilities before adding new logic.

### 2025-07-18 — CSS Gap: continueButton
- **What**: The `.continueButton` CSS class was used in `GamePage.tsx` but never defined in `GamePage.module.css`. Added proper styling for it alongside the new `.playAgainButton`.
- **Evidence**: `grep continueButton` found only the JSX reference, no CSS definition prior to this change.
- **Impact**: Minor — CSS modules silently ignore undefined classes. But worth checking for other missing styles in the codebase.

### 2025-07-19 — Comprehensive Codebase Audit for Improvements
- **What**: Deep audit of the full codebase to identify improvement opportunities. Key findings:
  - `useDragPaint.ts` uses only mouse events — no touch/pointer events → mobile painting broken
  - `useNonogramGame.ts:24,43` tracks `elapsedTime` but no UI displays it
  - `GamePage.module.css` has `confettiFall` keyframe animation defined but never used in React
  - Zero media queries across all CSS files — layout relies on flexbox/grid min-widths only
  - No ARIA labels, no keyboard grid navigation, poor contrast on status colors (yellow #BFA004, light gray #E6E6E6)
  - No undo/redo, no hint system, no error feedback on incorrect cells
  - No PWA manifest, no service worker
  - Creator has no "test play" mode before saving
  - Only 9 bundled puzzles, no categories/tags, hardcoded size grouping [5,10,15]
- **Evidence**: Full component tree explored — 8 components, 4 routes, 8 CSS modules, 9 puzzles
- **Impact**: Prioritized improvement roadmap created for user to select from. Mobile touch support and undo/redo are the highest-impact gaps.

### 2025-07-20 — Toggle Paint Mechanics
- **What**: Implemented fill/erase toggle for cell painting. `paintCell` now takes a `mode: DragMode` parameter ('fill' | 'erase'). Added `getDragMode(row, col)` to `useNonogramGame` — returns 'fill' for empty cells, 'erase' for cells matching active tool, null for other-tool cells. `useDragPaint` calls `getDragMode` on mousedown to determine mode (null = no-op, no drag starts), stores it, and passes it to all subsequent `onPaintCell` calls.
- **Evidence**: Commit `80ce43d`, 83 tests pass (15 new), build succeeds. Files: `src/engine/types.ts`, `src/hooks/useNonogramGame.ts`, `src/hooks/useDragPaint.ts`, `src/components/GamePage.tsx`.
- **Impact**: The `getDragMode` callback pattern keeps `useDragPaint` domain-agnostic — it doesn't need to know about CellState or Tool. Future features (e.g., undo/redo) should follow this pattern of hooks exposing query functions for UI coordination. Test count grew from 68 to 83.

### 2025-07-21 — Themed Puzzle System Plan
- **What**: Created comprehensive implementation plan for Picture Cross-style themed puzzle system. Decomposed into 30 work items across 6 layers (engine types → engine logic → providers → hooks → UI → integration) plus 7 independent improvements from prior audit. All work items in SQL todo database with 47 dependency edges.
- **Key Architecture Decisions**:
  - AD-1: 5-tier difficulty (blue/green/yellow/orange/red) replacing 3-tier (easy/medium/hard)
  - AD-2: ThemeDefinition with 10×10 grid of ThemeGridCell, each linking to a PuzzleDefinition
  - AD-3: Compact puzzle storage — solutions in flat arrays, clues derived at load time
  - AD-4: WalletState with transaction history in localStorage
  - AD-5: Hints reveal entire row/col, permanent (skip undo stack), costs scale by difficulty
  - AD-6: Edge Reveal (perimeter cells) + Bomb (random cells + blast radius, capped at 20%)
  - AD-7: Theme progress tracking per-theme in localStorage
  - AD-8: Pixel art backgrounds as PNG with CSS background-image, revealed by transparent completed cells
  - AD-9: New routes /themes, /themes/:themeId, /themes/:themeId/:puzzleId
- **Parallelism**: 9 items immediately startable (engine-types-expand, theme-pixel-art, 7 independent improvements). After engine types, 4 engine modules parallelizable. Max 7 items parallelizable at Phase 5 (UI).
- **Critical path**: engine-types-expand → engine-hints → provider-wallet → hook-game-hints → ui-hint-prompt → ui-game-page-update → integration-routes → integration-testing
- **Risks**: 100 puzzles per theme content volume (mitigated by generator script), pixel art sourcing, coin economy balance
- **Plan location**: Session plan at /home/darin/.copilot/session-state/85678f73-54cc-4eb6-b2cf-9f4c6f73c5d2/plan.md
- **Impact**: This is the largest feature addition to date. The layered decomposition ensures engine logic is pure TS (testable without React), providers follow existing patterns, and UI components are self-contained.
