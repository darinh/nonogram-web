# Tech Lead Memory

## OUTCOME — 2026-03-24: Quality Review of Autonomous Agent Work

**Task**: Full quality review of all code added by sub-agents after initial scaffold.  
**Result**: 4 critical issues, 9 warnings, 7 recommendations, 9 passing areas.

### Key Findings
- **Auth system is non-functional** — passwords are discarded entirely. Critical security issue.
- **Timezone mismatch** — daily.ts uses UTC but DailyPuzzlePage uses local time. Breaks streaks for non-UTC users.
- **17 ESLint errors** — ref mutations, setState in effects, fast-refresh violations. TSC is clean but linter is not.
- **localStorage writes unprotected** — no try-catch on setItem calls in progress/streak providers.
- **Dead code accumulation** — unused `useSound` hook, duplicate `getHintCost`, unused `suggestDifficulty`, `canAfford`, internal helpers exported as public API.
- **Test coverage gap** — engine 100% covered, but 9/12 hooks and 18/20 components have zero tests.
- **Codebase profile severely outdated** — lists 79 files/2 providers when actual is ~141 files/7 providers.

### Learnings
- Parallel agent work creates duplicate implementations (two `getHintCost`, duplicate `countRevealable`).
- Agents suppress ESLint warnings rather than fixing root cause (eslint-disable comments).
- Provider interfaces are well-designed but implementations skip error handling on writes.
- Auth was built as a UI scaffold without actual security — needs to be either removed or properly implemented.

### Process Recommendations
- Run ESLint as part of agent CI checks — don't let agents suppress warnings.
- Require agents to run full lint + type check before committing.
- Auth system needs a clear decision: demo-only (remove password fields) or real (add hashing).
- Schedule codebase profile refresh after major feature additions.
