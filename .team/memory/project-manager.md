# Project Manager Memory

## Active Context
- Working on: nonogram puzzle game — **Site Redesign initiative** 🔵 PLANNED (not yet implemented)
- Stack: TypeScript 5.9, React 19, Vite 8, Vitest 4, Firebase Hosting + Firestore + Auth
- Live URL: https://nonogram-game-app.web.app
- Test count: 336 unit tests (24 files, all passing) + 4 E2E test suites (Playwright)
- **Previous initiatives**: 9-feature plan ✅, Firebase + Legal + Polish ✅
- **Current initiative**: Site Redesign — 🔵 PLANNED (18 todos, 35 dependency edges)
  - 4 workstreams: Visual redesign (mockup-based), Economy overhaul (dual currency), UX changes (hidden names, blurred previews), Mobile responsiveness
  - Mockup reference: ~/projects/mocks/nonogram/ (index.html, puzzles.html, play.html, profile.html, howtoplay.html)
  - Key changes: neon pink (#e40c6e) on dark (#0a0a0a), Lato 900 headings, card-based layouts with pink drop shadows, animated hero, floating geometric decorations, hamburger nav, 3 responsive breakpoints
  - Economy: tokens (to play) + coins (for hints), replays cost coins and earn tokens, BALANCE_CONFIG for tuning
  - New pages: /profile (player card, stats, achievements, activity), /howtoplay (step-by-step tutorial with grid demos)
  - UX: puzzle names hidden until solved, solution previews blurred until completed
  - 4 items immediately startable: ds-tokens, econ-engine, ux-hide-names, ux-blur-previews
  - Critical path: ds-tokens → nav-redesign → page-play → ux-mobile → test-e2e-mobile (5 sequential)
  - Max parallelism: 7 items (5 page redesigns + 2 UX changes)
  - Specialists: ui-engineer (16 todos), qa-engineer (2 todos)
  - Future work (not blocking): economy balance tuning, theme time-limits, real-money store, community puzzles, video tutorial
  - Branch: feat/firebase-integration
  - Key deliverables:
    - Firebase SDK installed, src/firebase.ts config module
    - FirebaseAuthProvider with Google sign-in (popup), email/password
    - FirestoreProgressProvider, FirestoreWalletProvider
    - AuthSwitchedProviders in App.tsx (Firestore when authenticated, localStorage when anonymous)
    - CI/CD deploy.yml (Firebase Hosting on master push)
    - Firestore security rules (user-scoped access)
    - DB migration scripts (setup, seed, migrate)
    - Legal pages (/privacy, /terms) with footer links
    - Legal analyst agent template in dev-team plugin repo
    - README updated (336+ tests, all features documented)
  - Critical path: firebase-sdk-setup → firebase-auth-provider → firestore-app-wiring
  - Blocker: legal-agent-template must be created by hiring-manager before legal-pages can start

## Learnings

### 2025-07-19 — Firebase + Legal + Polish Initiative
- **What**: Decomposed 7 user requests into 11 parallelizable todos. Executed in 4 phases with fleet parallelism. Sub-agents created branches and committed independently, requiring post-hoc consolidation (cherry-picks, conflict resolution).
- **Key Architecture Decisions**: FirebaseAuthProvider wraps Firebase Auth with Google popup sign-in. AuthSwitchedProviders component dynamically selects Firestore vs localStorage providers based on auth state. Provider pattern made this seamless — same interfaces, different backends.
- **Evidence**: Branch feat/firebase-integration, 336 tests pass, build clean.
- **Impact**: Sub-agents operating in parallel on the same repo can create branch conflicts. Future multi-agent work should either: (a) have agents work on non-overlapping files with no git operations, or (b) have a single coordinating agent handle all git operations after sub-agents finish.
- **Sub-agent reliability**: Multiple sub-agents reported creating files but actually failed (file creation tools sometimes fail silently in concurrent sessions). Always verify sub-agent output by checking file existence before proceeding to dependent phases.

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
- **Outcome**: ALL 21 todos completed in a single session using parallel fleet execution. Tests grew from 275 → 328 (24 unit test files) + 4 E2E test suites. Build passes clean. Key deliverables:
  - **E2E**: Playwright installed, 4 test suites (smoke, navigation, gameplay, creator), CI pipeline with retries
  - **Auth**: AuthProvider interface + LocalStorageAuthProvider, LoginPage, UserMenu, wired into App.tsx with /login route
  - **Themes**: 5 new themes (Space, Ocean, City, Fantasy, Food) × 100 puzzles each, registered in bundledPuzzles + StaticThemeProvider
  - **Sound**: SoundProvider + WebAudioSoundProvider (fill, cross, undo, fanfare), mute toggle in GamePage
  - **Solver**: Constraint-propagation line solver, isLogicSolvable validator, integrated into CreatorPage (live badge) + generator scripts
  - **Daily**: Deterministic daily puzzle generator (date-seeded PRNG), DailyPuzzlePage with countdown, /daily route
  - **Streak**: StreakData in ProgressProvider, StreakDisplay component, integrated into Stats/Home/DailyPuzzle
  - **Tutorial**: TutorialOverlay (5-step walkthrough), useTutorial hook, auto-show on first visit, "How to Play" link
  - **Animations**: CSS transitions on cell fill/strikethrough/confetti, completion overlay entrance animation

### 2025-07-21 — Site Redesign Plan
- **What**: Analyzed 5 HTML mockups (index, puzzles, play, profile, howtoplay) and current codebase. Decomposed into 18 todos across 7 phases with 35 dependency edges. 4 workstreams: visual redesign, economy overhaul, UX changes, mobile responsiveness.
- **Key Architecture Decisions**:
  - AD-1: New design-system.css layer for all mockup tokens (colors, typography, shadows, animations)
  - AD-2: Color palette shift from #F20574 → #e40c6e neon pink on dark #0a0a0a backgrounds
  - AD-3: Typography swap — Lato 900 for headings (was M PLUS), M PLUS stays for body
  - AD-4: Shared .card pattern — 2px pink border, drop-shadow(4px 4px 0 pink), hover lift
  - AD-5: Dual currency — tokens (to play) + coins (for hints), with BALANCE_CONFIG for tuning
  - AD-6: Puzzle names hidden until solved (names are hints!)
  - AD-7: Blurred thumbnails with scrambled colors until completion
  - AD-8: Fixed dark nav with hamburger menu on mobile
  - AD-9: Grid texture overlay utility class
  - AD-10: Mobile-first with 3 breakpoints (600/768/1024px)
- **Parallelism**: 4 items start immediately (ds-tokens, econ-engine, ux-hide-names, ux-blur-previews). Max 7 concurrent. Critical path: 5 sequential items.
- **Specialists**: ui-engineer (16 todos), qa-engineer (2 todos)
- **Future work**: Economy balance tuning, theme time-limits, real-money store, community puzzles, video tutorial — none blocking.
- **Risks**: Economy balance (mitigated by BALANCE_CONFIG), dark theme conflicts (dark becomes default), mobile regressions (E2E tests).
- **Plan location**: Session plan.md
- **Evidence**: 18 SQL todos, 35 dependency edges, plan.md written
- **Impact**: Plan only — no implementation yet. This is the largest visual overhaul to date. Current design is clean/minimal white; target is bold neon-pink-on-dark with animated hero, card layouts, and floating decorations.
