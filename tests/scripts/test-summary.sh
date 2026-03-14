#!/bin/bash
# Appends a compact test-results block to claude-sync.md
# Called by: npm run sync

OUTPUT="claude-sync.md"
GREEN='\033[0;32m'
NC='\033[0m'

echo "" >> "$OUTPUT"
echo "## 🧪 Test Results" >> "$OUTPUT"
echo '```' >> "$OUTPUT"

# Unit Tests (Vitest)
echo "### Unit Tests (Vitest) — $(date '+%Y-%m-%d %H:%M')" >> "$OUTPUT"
npx vitest run --reporter=verbose 2>&1 \
  | grep -E "✓|✘|PASS|FAIL|Tests |Test Files|passed|failed" \
  | tail -20 >> "$OUTPUT"

echo "" >> "$OUTPUT"

# E2E Tests (Playwright – last run only, don't re-execute)
echo "### E2E Tests (Playwright)" >> "$OUTPUT"
if [ -f "test-results/.last-run.json" ]; then
  node -e "
    const r = require('./test-results/.last-run.json');
    console.log('Status:', r.status);
  " 2>/dev/null >> "$OUTPUT"
else
  echo "Noch kein E2E Run — npm run test:e2e ausführen" >> "$OUTPUT"
fi

echo '```' >> "$OUTPUT"
echo -e "${GREEN}✓${NC} Test Results"
