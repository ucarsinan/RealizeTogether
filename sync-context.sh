#!/bin/bash
# ═══════════════════════════════════════════════════
# sync-context.sh – Realize Together
#
# Erzeugt eine KOMPAKTE Übersicht für Claude Chat.
# Ziel: maximaler Kontext bei minimalen Tokens.
#
# Aufruf:
#   bash sync-context.sh           → Kompakt-Übersicht (Standard)
#   bash sync-context.sh --full    → + vollständiger Code der geänderten Dateien
#   bash sync-context.sh --file src/actions/foo.ts  → eine Datei vollständig
# ═══════════════════════════════════════════════════

OUTPUT="claude-sync.md"
MODE="${1:-}"
FILE_ARG="${2:-}"

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}🔄 Claude Context Sync${NC}"
echo "──────────────────────────"

# ─────────────────────────────────────────────
# HELPER: Extrahiere Signaturen aus TS-Dateien
# Zeigt: export function/const/type/interface
# ─────────────────────────────────────────────
extract_signatures() {
  local file="$1"
  if [ ! -f "$file" ]; then return; fi

  grep -n \
    -e "^export async function" \
    -e "^export function" \
    -e "^export const" \
    -e "^export type" \
    -e "^export interface" \
    -e "^export default" \
    -e "^interface " \
    -e "^type " \
    "$file" \
  | sed 's/{$//' \
  | sed 's/ {$//' \
  | head -30
}

# ─────────────────────────────────────────────
# HELPER: TODOs & FIXMEs sammeln
# ─────────────────────────────────────────────
collect_todos() {
  grep -rn "TODO\|FIXME\|HACK\|XXX" \
    src/ \
    --include="*.ts" \
    --include="*.tsx" \
    2>/dev/null \
  | grep -v "node_modules" \
  | head -20
}

# ─────────────────────────────────────────────
# HEADER
# ─────────────────────────────────────────────
cat > "$OUTPUT" << EOF
# Realize Together – Claude Sync
**$(date '+%Y-%m-%d %H:%M')** | Projekt-Stand für Brainstorming & Planung

---
EOF

# ─────────────────────────────────────────────
# 1. DATEIBAUM (nur src/, kompakt)
# ─────────────────────────────────────────────
echo "" >> "$OUTPUT"
echo "## 📁 Struktur" >> "$OUTPUT"
echo '```' >> "$OUTPUT"
find src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  | grep -v "node_modules" \
  | sort \
  | sed 's|src/||' \
  >> "$OUTPUT"
echo '```' >> "$OUTPUT"

echo -e "${GREEN}✓${NC} Dateistruktur"

# ─────────────────────────────────────────────
# 2. GIT STATUS (was hat sich geändert?)
# ─────────────────────────────────────────────
if git rev-parse --git-dir > /dev/null 2>&1; then
  echo "" >> "$OUTPUT"
  echo "## 🔀 Git Status" >> "$OUTPUT"
  echo '```' >> "$OUTPUT"

  # Letzte 5 Commits
  echo "### Letzte Commits:" >> "$OUTPUT"
  git log --oneline -5 2>/dev/null >> "$OUTPUT"

  echo "" >> "$OUTPUT"

  # Ungespeicherte Änderungen
  CHANGED=$(git diff --name-only 2>/dev/null)
  STAGED=$(git diff --cached --name-only 2>/dev/null)
  UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null | grep -E '\.(ts|tsx)$')

  if [ -n "$STAGED" ]; then
    echo "### Staged:" >> "$OUTPUT"
    echo "$STAGED" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
  fi
  if [ -n "$CHANGED" ]; then
    echo "### Geändert (unstaged):" >> "$OUTPUT"
    echo "$CHANGED" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
  fi
  if [ -n "$UNTRACKED" ]; then
    echo "### Neu (untracked):" >> "$OUTPUT"
    echo "$UNTRACKED" >> "$OUTPUT"
  fi
  echo '```' >> "$OUTPUT"
  echo -e "${GREEN}✓${NC} Git Status"
fi

# ─────────────────────────────────────────────
# 3. TYPES (vollständig – klein aber wichtig)
# ─────────────────────────────────────────────
TYPES_FILE="src/lib/types/index.ts"
if [ -f "$TYPES_FILE" ]; then
  echo "" >> "$OUTPUT"
  echo "## 🏷️  Types" >> "$OUTPUT"
  echo '```typescript' >> "$OUTPUT"
  cat "$TYPES_FILE" >> "$OUTPUT"
  echo '```' >> "$OUTPUT"
  echo -e "${GREEN}✓${NC} Types"
fi

# ─────────────────────────────────────────────
# 4. SIGNATUREN ALLER ACTIONS
# ─────────────────────────────────────────────
echo "" >> "$OUTPUT"
echo "## ⚡ Server Actions (Signaturen)" >> "$OUTPUT"

for file in src/actions/*.ts; do
  [ -f "$file" ] || continue
  name=$(basename "$file")
  sigs=$(extract_signatures "$file")
  if [ -n "$sigs" ]; then
    echo "" >> "$OUTPUT"
    echo "### \`$name\`" >> "$OUTPUT"
    echo '```typescript' >> "$OUTPUT"
    echo "$sigs" >> "$OUTPUT"
    echo '```' >> "$OUTPUT"
  fi
done
echo -e "${GREEN}✓${NC} Action-Signaturen"

# ─────────────────────────────────────────────
# 5. SIGNATUREN ALLER COMPONENTS (Props + exports)
# ─────────────────────────────────────────────
echo "" >> "$OUTPUT"
echo "## 🧩 Components (Props & Exports)" >> "$OUTPUT"

find src/components -name "*.tsx" | sort | while read -r file; do
  # Props-Interface extrahieren
  props=$(grep -n "interface.*Props\|type.*Props" "$file" 2>/dev/null | head -5)
  exports=$(extract_signatures "$file")

  if [ -n "$props" ] || [ -n "$exports" ]; then
    echo "" >> "$OUTPUT"
    echo "### \`${file#src/}\`" >> "$OUTPUT"
    echo '```typescript' >> "$OUTPUT"
    [ -n "$props" ] && echo "$props"
    [ -n "$exports" ] && echo "$exports"
    echo '```' >> "$OUTPUT"
  fi
done >> "$OUTPUT"
echo -e "${GREEN}✓${NC} Component-Signaturen"

# ─────────────────────────────────────────────
# 6. PAGES ÜBERSICHT
# ─────────────────────────────────────────────
echo "" >> "$OUTPUT"
echo "## 📄 Pages (Routen)" >> "$OUTPUT"
echo '```' >> "$OUTPUT"
find "src/app" -name "page.tsx" | sort | while read -r file; do
  route=$(dirname "$file" | sed 's|src/app||' | sed 's|(main)||' | sed 's|//|/|g')
  [ -z "$route" ] && route="/"
  echo "$route"
done >> "$OUTPUT"
echo '```' >> "$OUTPUT"
echo -e "${GREEN}✓${NC} Routen"

# ─────────────────────────────────────────────
# 7. TODOs
# ─────────────────────────────────────────────
TODOS=$(collect_todos)
if [ -n "$TODOS" ]; then
  echo "" >> "$OUTPUT"
  echo "## 📌 TODOs & FIXMEs im Code" >> "$OUTPUT"
  echo '```' >> "$OUTPUT"
  echo "$TODOS" >> "$OUTPUT"
  echo '```' >> "$OUTPUT"
  echo -e "${GREEN}✓${NC} TODOs gefunden"
fi

# ─────────────────────────────────────────────
# 8. PACKAGE.JSON (Dependencies – was ist installiert?)
# ─────────────────────────────────────────────
if [ -f "package.json" ]; then
  echo "" >> "$OUTPUT"
  echo "## 📦 Dependencies" >> "$OUTPUT"
  echo '```json' >> "$OUTPUT"
  # Nur dependencies + devDependencies, nicht scripts etc.
  node -e "
    const p = require('./package.json');
    console.log(JSON.stringify({
      dependencies: p.dependencies,
      devDependencies: p.devDependencies
    }, null, 2));
  " 2>/dev/null >> "$OUTPUT" || \
  grep -A 50 '"dependencies"' package.json | head -60 >> "$OUTPUT"
  echo '```' >> "$OUTPUT"
  echo -e "${GREEN}✓${NC} Dependencies"
fi

# ─────────────────────────────────────────────
# OPTIONAL: --full → Geänderte Dateien vollständig
# ─────────────────────────────────────────────
if [ "$MODE" = "--full" ] && git rev-parse --git-dir > /dev/null 2>&1; then
  echo "" >> "$OUTPUT"
  echo "## 📝 Geänderte Dateien (vollständig)" >> "$OUTPUT"

  CHANGED_FILES=$(git diff --name-only HEAD 2>/dev/null | grep -E '\.(ts|tsx)$')
  if [ -n "$CHANGED_FILES" ]; then
    echo "$CHANGED_FILES" | while read -r file; do
      if [ -f "$file" ]; then
        echo "" >> "$OUTPUT"
        echo "### \`$file\`" >> "$OUTPUT"
        echo '```typescript' >> "$OUTPUT"
        cat "$file" >> "$OUTPUT"
        echo '```' >> "$OUTPUT"
        echo -e "${YELLOW}+${NC} $file (vollständig)"
      fi
    done
  else
    echo "_Keine uncommitted Änderungen._" >> "$OUTPUT"
  fi
fi

# ─────────────────────────────────────────────
# OPTIONAL: --file → eine Datei vollständig
# ─────────────────────────────────────────────
if [ "$MODE" = "--file" ] && [ -n "$FILE_ARG" ]; then
  if [ -f "$FILE_ARG" ]; then
    echo "" >> "$OUTPUT"
    echo "## 📄 Vollständige Datei: \`$FILE_ARG\`" >> "$OUTPUT"
    echo '```typescript' >> "$OUTPUT"
    cat "$FILE_ARG" >> "$OUTPUT"
    echo '```' >> "$OUTPUT"
    echo -e "${GREEN}✓${NC} $FILE_ARG vollständig angehängt"
  else
    echo -e "${YELLOW}⚠${NC}  Datei nicht gefunden: $FILE_ARG"
  fi
fi

# ─────────────────────────────────────────────
# ABSCHLUSS
# ─────────────────────────────────────────────
LINES=$(wc -l < "$OUTPUT")
SIZE=$(wc -c < "$OUTPUT" | awk '{printf "%.1f", $1/1024}')

echo ""
echo "──────────────────────────"
echo -e "${GREEN}✅ claude-sync.md${NC} – ${LINES} Zeilen · ${SIZE}kB"
echo ""
echo "  bash sync-context.sh               # Kompakt (Standard)"
echo "  bash sync-context.sh --full        # + geänderte Dateien"
echo "  bash sync-context.sh --file src/.. # + eine Datei"
echo ""
echo -e "${CYAN}➡  claude-sync.md in Claude Chat einfügen${NC}"
