# AGENTS.md – Kontext-Regeln für Claude Code
# Realize Together

> Diese Datei gilt für ALLE KI-Agenten die an diesem Projekt arbeiten.
> Basiert auf: "Context Hygiene" Best Practices (Julian Ivanov).
> **Lies diese Datei bevor du mit einer neuen Session beginnst.**

---

## Regel 1 — Subagenten für schwere Aufgaben

Bevor du rechenintensive Aufgaben (Internetrecherche, 100+ Dateien durchsuchen,
Security Review) im Haupt-Agenten machst:

```bash
# Subagent starten
/ags "Analysiere alle TypeScript-Fehler in src/actions/ und liste sie auf"
/ags "Security Review: Prüfe alle Server Actions auf fehlende Auth-Checks"
```

**Regel:** Jede Aufgabe die > 5 Dateien gleichzeitig liest → Subagent.

---

## Regel 2 — Skills laden statt alles in CLAUDE.md

Skill-Dateien existieren in `skills/`. Lade nur was du brauchst:

| Aufgabe | Skill laden |
|---|---|
| Datenbank / Schema / Typen | `@skills/database.md` |
| NDA / Synopsis / Storage | `@skills/trust-funnel.md` |
| KI / FastAPI Endpoints | `@skills/ai-backend.md` |
| Storage Buckets / Policies | `@skills/storage.md` |

**Regel:** Niemals alle Skills auf einmal laden. Nur den relevanten.

---

## Regel 3 — Planmodus vor jedem großen Feature

Bei Features die > 3 Dateien neu erstellen oder > 100 Zeilen Code schreiben:

```
1. In den Planmodus gehen (kein Code schreiben)
2. Architekturplan iterieren bis er perfekt ist
3. Plan in feature-name-plan.md speichern
4. /clear → neuer Chat
5. "Lies feature-name-plan.md und setze ihn um"
```

**Gilt für:** FastAPI Setup, KI-Features, Matching-Algorithmus, neue Domains.

---

## Regel 4 — Präzise Prompts mit Datei-Referenzen

**Schlecht:**
```
"Das Formular ist kaputt"
"Fix den Login"
```

**Gut:**
```
"Beim Klick auf 'Save' in @ProfileForm.tsx passiert nichts.
 Console zeigt: TypeError: Cannot read property 'id' of undefined
 Zeile 145 in @profile.actions.ts"
```

**Immer:**
- Fehlermeldung exakt kopieren
- `@dateiname.ts` für direkte Datei-Referenzen
- Screenshots hochladen wenn UI-Problem
- Erwartetes vs. tatsächliches Verhalten beschreiben

---

## Regel 5 — CLAUDE.md unter 100 Zeilen halten

`CLAUDE.md` enthält NUR:
- Router-Tabelle
- Tech Stack (3 Zeilen)
- Auth (5 Zeilen)
- Coding Standards (10 Zeilen)

**Alles andere → Skills.**

Aktuelle Zeilenzahl prüfen:
```bash
wc -l CLAUDE.md  # Ziel: unter 100
```

---

## Regel 6 — Aktive Kontexthygiene

```bash
# Kontext prüfen
/c                    # Wie voll ist das Fenster?

# Bei ~70% Auslastung:
/compact              # Kontext komprimieren
# Dann explizit sagen: "Behalte: geänderte Dateien + aktuellen Plan"

# Vor /clear immer:
# "Schreibe eine progress.md mit: was wurde geändert, was ist der nächste Schritt"
# Dann im neuen Chat: "Lies progress.md und mach weiter"
```

**Progress-Datei Format:**
```markdown
# progress.md
## Zuletzt geändert
- src/actions/profile.actions.ts — uploadAvatar fix
- src/components/profile/ProfileForm.tsx — neues Avatar-Preview

## Nächster Schritt
- ProfileForm Tests schreiben (tests/unit/components/ProfileForm.test.tsx)
- Dann: npm run test:unit

## Offene Fragen
- Soll Avatar-Upload auch Videos unterstützen?
```

---

## Regel 7 — Richtiges Modell für die Aufgabe

| Aufgabe | Modell | Befehl |
|---|---|---|
| "Wo ist die Login-Funktion?" | Haiku | `/model haiku` |
| Bug fixen, Feature bauen, Tests schreiben | Sonnet | `/model sonnet` (default) |
| Neue Architektur, FastAPI Design, Matching-Algo | Opus | `/model opus` |

**Faustregel:** Erst Sonnet versuchen. Nur zu Opus wechseln wenn Sonnet
mehrfach falsch liegt oder das Problem grundlegend neu ist.

---

## Regel 8 — CLI Tools statt MCP-Server

**Bevorzuge:**
```bash
curl, git, npx, tsx    # CLI Tools — kein Kontext-Overhead
```

**MCP-Server:**
- Niemals global installieren
- Nur auf Projektebene wenn wirklich nötig
- Jeder MCP-Server belastet das Kontextfenster permanent

---

## Checkliste: Neue Session starten

```
[ ] CLAUDE.md gelesen (Router beachten)
[ ] Relevante Skills geladen (@skills/xxx.md)
[ ] claude-sync.md hochgeladen (aktueller Projektstand)
[ ] Test Results im Sync geprüft (alle grün?)
[ ] Aufgabe präzise beschrieben mit Datei-Referenzen
[ ] Modell gewählt (Standard: Sonnet)
```

## Checkliste: Session beenden

```
[ ] npm run test:unit — alle grün?
[ ] npm run test:e2e — alle grün?
[ ] git add -A && git commit && git push
[ ] npm run sync (claude-sync.md aktualisieren)
[ ] Falls /clear nötig: progress.md schreiben lassen
```

---

## Projekt-Kontext auf einen Blick

```
Plattform:    realize-together.vercel.app
Repository:   github.com/[repo]/realize-together
DB:           Supabase (dsmzvqaevqbygefuqeno)
Stack:        Next.js 16 · TypeScript · Tailwind · Supabase
Tests:        18 Unit ✅ · 14+ E2E ✅
CI:           GitHub Actions (tsc → lint → vitest → playwright)
```
