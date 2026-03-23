# Project Manager Memory

## Active Context
- Working on: nonogram puzzle game
- Stack: TypeScript 5.9, React 19, Vite 8, Vitest 4, Firebase Hosting
- Live URL: https://nonogram-game-app.web.app
- 68 tests, all passing

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
