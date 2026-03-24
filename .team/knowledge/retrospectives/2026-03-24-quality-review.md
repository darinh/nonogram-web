# Quality Review — 2026-03-24

**Reviewer**: Tech Lead  
**Scope**: All code added by autonomous sub-agents after initial scaffold  
**Build status**: ✅ TSC clean (0 errors), ✅ 333/333 tests pass  
**ESLint**: ❌ 17 errors, 1 warning  

---

## 🔴 Critical Issues (must fix before shipping)

### C1. Auth system performs no password validation
- **Location**: `src/providers/auth/LocalStorageAuthProvider.ts:51,70`
- **Evidence**: Both `register()` and `login()` accept `_password` but discard it. Any user can log in as any other user by knowing their username alone.
- **Impact**: Entire auth system is theater — provides no actual authentication.
- **Fix**: At minimum, hash passwords with Web Crypto `subtle.digest` and compare on login. If this remains a local-only demo, document that clearly and remove the password field entirely to avoid misleading users.

### C2. Timezone mismatch breaks daily streaks
- **Location**: `src/engine/daily.ts:28` uses UTC (`toISOString().slice(0,10)`), but `src/components/DailyPuzzlePage.tsx:19-24` uses local time for countdown. `src/providers/progress/LocalStorageProgressProvider.ts:103` mixes both.
- **Impact**: Users in non-UTC timezones can lose streaks or see wrong daily puzzles. A user at UTC-8 completing a puzzle at 5pm local time gets tomorrow's UTC date.
- **Fix**: Use local date consistently: `new Date().toLocaleDateString('sv-SE')` or manual `YYYY-MM-DD` from local components.

### C3. ESLint errors: ref mutation and setState in effects
- **Evidence**: 17 ESLint errors across 6 files. Key issues:
  - `NonogramGrid.tsx:121` — mutating a ref returned from a hook (React rules violation)
  - `useGridNavigation.ts:36` — accessing ref during render (stale data risk)
  - `CoinDisplay.tsx:25`, `CreatorPage.tsx:113`, `useThemes.ts:25` — `setState` inside effects (cascading render risk)
  - `ProviderContext.tsx` — 6 fast-refresh warnings (hooks exported from component file)
  - `LocalStorageAuthProvider.ts:70` — `_password` unused var
- **Fix**: Each needs individual attention. The ref mutation and render-time ref access are the most dangerous.

### C4. localStorage writes have no error handling
- **Location**: `src/providers/progress/LocalStorageProgressProvider.ts:79` (`setStreakData`), wallet provider writes
- **Impact**: If localStorage is full or unavailable (private browsing, quota exceeded), the app crashes with unhandled exception.
- **Fix**: Wrap all `localStorage.setItem` calls in try-catch with fallback to in-memory state.

---

## ⚠️ Warnings (should fix soon)

### W1. Dead code: unused `useSound` hook
- **Location**: `src/hooks/useSound.ts`
- **Evidence**: Not imported anywhere. `GamePage.tsx` uses `useSoundProvider()` directly.
- **Action**: Delete the file.

### W2. Duplicate `getHintCost` function
- **Location**: Defined in both `src/engine/coins.ts:62` and `src/engine/hints.ts:112` with different signatures.
- **Evidence**: Only the `hints.ts` version is exported from `src/engine/index.ts`. The `coins.ts` version is dead code.
- **Action**: Remove from `coins.ts`.

### W3. Unused exported function `suggestDifficulty`
- **Location**: `src/engine/difficulty.ts:58`
- **Evidence**: Exported but never imported anywhere in the codebase (grep confirms 0 usages).
- **Action**: Remove or mark as `@internal`.

### W4. Duplicate logic: `countRevealable` in GamePage
- **Location**: `src/components/GamePage.tsx:29-43`
- **Evidence**: Reimplements the same logic as `getRevealableCount` in `src/engine/hints.ts:51-68`.
- **Action**: Import and reuse the engine function.

### W5. `canAfford` in coins.ts is dead code
- **Location**: `src/engine/coins.ts:14-16`
- **Evidence**: Exported but never imported. Components inline the check instead.
- **Action**: Remove or consolidate usage.

### W6. Power-up internal helpers exported unnecessarily
- **Location**: `src/engine/powerups.ts` — `selectBombTargets`, `getBlastRadius`, `getEdgeCells`
- **Evidence**: Only used internally by `applyBomb`/`applyEdgeReveal`. Exported to `index.ts` but never imported externally.
- **Action**: Remove from public exports.

### W7. Auth provider event listener never cleaned up
- **Location**: `src/providers/auth/LocalStorageAuthProvider.ts:22`
- **Evidence**: Constructor adds `storage` event listener but no `destroy()` or cleanup method exists.
- **Action**: Add cleanup mechanism or document that provider is app-lifetime singleton.

### W8. Missing dependency in useEffect
- **Location**: `src/components/DailyPuzzlePage.tsx:57` — `recordCompletion` missing from dependency array, suppressed with `eslint-disable`.
- **Action**: Add to deps or restructure to avoid the lint suppression.

### W9. `GamePage.tsx` useCallback missing dependency
- **Location**: `src/components/GamePage.tsx:137` — ESLint warning: `game` missing from dependency array.
- **Action**: Add `game` to the dependency array.

---

## 💡 Recommendations (nice to have)

### R1. Test coverage: hooks and components severely under-tested
- **Evidence**: 24 test files, 333 tests — but 9/12 hooks and 18/20 components have zero unit tests.
- **Tested**: All 11 engine modules ✅, all 6 providers ✅, 3 hooks ✅, 2 components ✅
- **Untested**: `useAuth`, `useProgress`, `useWallet`, `useStreak`, `useThemes`, `useTutorial`, `useSound`, `usePuzzles`, `usePageTitle`, plus all page components.
- **Priority**: Add tests for `useStreak` (timezone-sensitive logic) and `useAuth` (security-critical).

### R2. Update codebase profile
- **Location**: `.team/knowledge/projects/nonogram/codebase-profile.md`
- **Evidence**: Lists 79 files and 2 providers. Actual count: ~141 files, 7 providers, 12 hooks, 14 engine modules. Missing documentation for auth, sound, theme, wallet, daily, power-ups, streaks, hints, and tutorial systems.
- **Action**: Run `onboard-codebase` skill to regenerate.

### R3. Input length limits on auth forms
- **Location**: `LoginPage.tsx`, `RegisterPage.tsx`
- **Evidence**: No `maxLength` attributes on any input fields.
- **Action**: Add `maxLength={50}` to username/displayName, `maxLength={128}` to password fields.

### R4. Use `crypto.randomUUID()` for user IDs
- **Location**: `src/providers/auth/LocalStorageAuthProvider.ts:7-14`
- **Evidence**: Custom `simpleHash()` is non-cryptographic with poor collision resistance.
- **Action**: Replace with `crypto.randomUUID()` (supported in all modern browsers).

### R5. AudioContext cleanup
- **Evidence**: `WebAudioSoundProvider` creates AudioContext but never calls `.close()`.
- **Action**: Minor — document that context is app-lifetime, or add cleanup on provider teardown.

### R6. Silent catch blocks need logging
- **Location**: `LocalStorageWalletProvider.ts:12`, `LocalStorageProgressProvider.ts:72-75`
- **Evidence**: Empty catch blocks silently swallow errors. Data corruption goes unnoticed.
- **Action**: Add `console.warn` with error context.

### R7. JSON.parse results not validated at runtime
- **Location**: All localStorage providers use `JSON.parse(data) as Type` without validation.
- **Evidence**: If stored data schema changes between versions, the cast succeeds but data is wrong.
- **Action**: Add runtime validation or schema versioning for localStorage data.

---

## ✅ Passing (what looks good)

### P1. TypeScript compilation: zero errors
All code compiles cleanly with strict mode. No type errors.

### P2. All 333 unit tests pass
24 test files, 333 assertions, 6.15s runtime. No flaky or failing tests.

### P3. Engine layer: excellent quality
- `solver.ts`: Correct constraint propagation algorithm with proper edge case handling.
- `validation.ts`: Sound logic for line satisfaction and grid validation.
- `clues.ts`: Correct clue derivation.
- `daily.ts`: Deterministic PRNG-based puzzle generation (timezone issue aside).
- All 11 engine modules have comprehensive tests.

### P4. Provider architecture: clean separation
Interface → Implementation → Context pattern consistently applied across all 6 provider subsystems. `ProviderContext.tsx` centralizes all context creation.

### P5. Sound system: robust error handling
AudioContext blocking handled gracefully. localStorage access wrapped in try-catch. All sound methods fail silently when audio unavailable. Good test coverage.

### P6. App.tsx provider wiring: correct
All 6 providers properly nested in logical order (Auth → Sound → Puzzle → Progress → Theme → Wallet → Router). No ordering issues. All imports used.

### P7. Dependencies: minimal and clean
Only 3 runtime dependencies (`react`, `react-dom`, `react-router-dom`). No unnecessary bloat.

### P8. E2E test infrastructure in place
4 Playwright test files covering gameplay, navigation, creation, and smoke tests.

### P9. Accessibility considerations present
`HintPrompt` has focus trap, keyboard support, and ARIA labels. Grid has `role="grid"` with cell roles.

---

## Summary

| Category | Count |
|----------|-------|
| 🔴 Critical | 4 |
| ⚠️ Warnings | 9 |
| 💡 Recommendations | 7 |
| ✅ Passing | 9 |

**Overall assessment**: The engine and provider layers are solid with good test coverage and clean architecture. The critical issues center on the auth system (no real authentication), timezone bugs in daily/streak logic, ESLint violations, and missing error handling on localStorage writes. The codebase has accumulated dead code from parallel agent work that should be cleaned up. Component and hook test coverage is a significant gap.
