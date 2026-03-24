# Project Manager Memory

## Active Context
- Working on: nonogram puzzle game — **9-feature improvement initiative**
- Stack: TypeScript 5.9, React 19, Vite 8, Vitest 4, Firebase Hosting
- Live URL: https://nonogram-game-app.web.app
- **Previous initiative**: Picture Cross-style themed system — ✅ IMPLEMENTED
- Test count: 275 (20 test files), all passing. Zero E2E tests.
- **Current initiative**: 9-feature improvement plan — PLANNED (not yet implemented)
  - 21 todos across 4 phases, max 11 parallel at Phase 0
  - Features: E2E tests, login, 5 new themes, sound effects, puzzle quality solver, daily puzzle, streak tracking, tutorial, animations
  - Specialists: qa-engineer (E2E), ui-engineer (all features)
  - Plan location: session plan.md
  - Key architecture decisions: AuthProvider pattern (AD-1), Playwright E2E (AD-2), Web Audio API sounds (AD-3), deterministic daily seed (AD-4), constraint-propagation solver (AD-5), streak in ProgressProvider (AD-6)

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
- **Outcome**: ALL 30 themed system items + 7 independent improvements completed. 42 total todos done. Tests grew from 89 → 275 (20 files). Build passes clean. Key deliverables:
  - Engine: difficulty.ts, coins.ts, hints.ts, powerups.ts + constants.ts (all pure TS with tests)
  - Providers: ThemeProvider, WalletProvider, extended ProgressProvider
  - Hooks: useThemes, useWallet, useGridNavigation
  - UI: ThemeBrowserPage, ThemeGridPage, CoinDisplay, HintPrompt, PowerUpToolbar, StatsPage, DifficultyBadge (5-color)
  - Theme content: Nature theme (100 puzzles), pixel art background (SVG)
  - Infrastructure: CI/CD (GitHub Actions), PWA manifest + service worker, dark mode, responsive breakpoints, keyboard nav, clue satisfaction feedback
  - Integration: Routes wired, navigation updated, GamePage fully integrated with hints/powerups/coins

### 2025-07-21 — 9-Feature Improvement Plan
- **What**: Created comprehensive plan for 9 new features decomposed into 21 work items across 4 phases. Priority order: E2E tests (Playwright), login (AuthProvider pattern), 5 new themes (Space/Ocean/City/Fantasy/Food), sound effects (Web Audio API), puzzle quality (constraint-propagation solver), daily puzzle (deterministic seed), streak tracking, tutorial/onboarding, animations (CSS transitions).
- **Architecture Decisions**: AuthProvider follows existing provider pattern (AD-1). Playwright for E2E with Vite preview server (AD-2). Web Audio API for synthesized sound effects (AD-3). Daily puzzle uses date-based deterministic seed (AD-4). Logic solver via constraint propagation (AD-5). Streak data extends ProgressProvider (AD-6).
- **Parallelism**: 11 items immediately startable in Phase 0. Max parallelism across phases: 11→6→3→1. Critical path: solver-engine → daily-puzzle → streak-tracking (3 sequential items).
- **Specialists**: qa-engineer handles all E2E work (5 todos). ui-engineer handles all feature implementation (16 todos).
- **Risks**: Theme content volume (100 puzzles each), solver complexity for 15×15, Web Audio browser differences, Playwright CI flakiness.
- **Plan location**: Session plan.md
- **Impact**: Plan only — no implementation yet. 21 todos inserted in SQL with 12 dependency edges.
