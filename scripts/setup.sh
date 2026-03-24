#!/usr/bin/env bash
# Project setup script — run once after cloning
set -euo pipefail

echo "📦 Installing dependencies..."
npm install

echo "🎭 Installing Playwright browsers..."
npx playwright install --with-deps chromium

echo "✅ Setup complete!"
echo ""
echo "Available commands:"
echo "  npm run dev          — Start dev server"
echo "  npm test             — Run unit tests"
echo "  npm run test:e2e     — Run E2E tests (requires build first)"
echo "  npm run build        — Production build"
