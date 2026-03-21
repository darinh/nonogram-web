# Dev-Team Memory

### ONBOARDING — 2026-03-21
- **Project**: nonogram
- **Stack**: TypeScript 5.9, React 19, Vite 8, Vitest 4, Firebase Hosting
- **Build**: `npm run build` (tsc + vite build)
- **Test**: `npm test` (vitest run, 68 tests)
- **Deploy**: `npm run deploy` (build + firebase deploy)
- **Key concern**: No CI/CD pipeline, no component tests
- **Theme**: Mahoako-inspired (pink #F20574, M PLUS Rounded 1c font)
- **Architecture**: Provider pattern for puzzles + progress, pure TS engine layer
- **Live URL**: https://nonogram-game-app.web.app
