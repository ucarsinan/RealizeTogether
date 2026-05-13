# E2E Test Suite — Vollständige Abdeckung

**Datum:** 2026-05-13  
**Ansatz:** Hybrid (Flat Specs + Fixtures, kein POM)  
**Ziel:** Alle Routen und Cross-User-Flows abdecken

---

## Kontext

Aktueller Stand: 18 Tests, alle grün. Abgedeckt: Auth-Grundfluss, Explore-Basisfilter, Messages-Liste, Projekt-Formular-Sichtbarkeit, Security-Header.

Nicht abgedeckt: Profil-Seiten, Projekt-Detail, Apply-Flow, Applications-Management, Message-Threads, Dashboard-Profil, Cross-User-Flows.

---

## Architektur

### Setup-Erweiterungen

**`tests/global-setup.ts`**
- User A Session speichern (wie bisher): `tests/.auth/user-a.json`
- User B Session speichern: `tests/.auth/user-b.json`
- Supabase Admin Client (`SUPABASE_SERVICE_ROLE_KEY`):
  - 1 Testprojekt anlegen (User A als Creator) → ID in `process.env.TEST_PROJECT_ID`
  - 1 Bewerbung anlegen (User B → Testprojekt) → ID in `process.env.TEST_APPLICATION_ID`
- `tests/global-teardown.ts` (neu): Testprojekt und Bewerbung nach dem Run löschen

**`playwright.config.ts`**
- Bestehendes `chromium-auth` Projekt: unverändert (User A, alle bestehenden Specs)
- Neues Projekt `chromium-user-b`: `storageState: 'tests/.auth/user-b.json'`, matched `**/apply-flow.spec.ts` und `**/profile.spec.ts`
- `globalTeardown: './tests/global-teardown.ts'` hinzufügen

**`.env.test`** — neue Variablen erforderlich:
```
TEST_USER_B_EMAIL=...
TEST_USER_B_PASSWORD=...
TEST_USER_B_ID=...          # Supabase user UUID von User B (für /profile/[id] Tests)
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_URL=...
```

**`tests/e2e/fixtures.ts`** — neue Helper-Funktionen:
```ts
navigateToProject(page, projectId): Promise<void>
navigateToProfile(page, userId): Promise<void>
```

---

## Neue Spec-Dateien

### `tests/e2e/dashboard.spec.ts` (User A, chromium-auth)

| # | Test | Beschreibung |
|---|---|---|
| 1 | Dashboard zeigt Benutzernamen | `/dashboard` enthält den Namen des eingeloggten Users |
| 2 | Navigation zu Dashboard-Profil | Link/Button zu `/dashboard/profile` sichtbar und navigierbar |
| 3 | Dashboard-Profil lädt | `/dashboard/profile` rendert Bearbeitungs-Formular |
| 4 | Profil-Felder vorhanden | Name-Input und Bio-Textarea sichtbar und befüllbar |

### `tests/e2e/profile.spec.ts` (User A → User B Profil, chromium-auth & chromium-user-b)

| # | Test | Beschreibung |
|---|---|---|
| 1 | Öffentliches Profil lädt | `/profile/[TEST_USER_B_ID]` rendert mit Namen |
| 2 | Avatar/Profilbild sichtbar | Avatar-Element vorhanden |
| 3 | Portfolio-Bereich sichtbar | Section für Portfolio-Links gerendert |

### `tests/e2e/project-detail.spec.ts` (User A, chromium-auth)

| # | Test | Beschreibung |
|---|---|---|
| 1 | Projekt-Detail lädt | `/projects/[TEST_PROJECT_ID]` rendert |
| 2 | Projekttitel sichtbar | Titel des Testprojekts im DOM |
| 3 | Stage-Badge sichtbar | Stage-Anzeige gerendert |
| 4 | Creator sieht Applications-Link | User A sieht "Manage Applications" Link |

### `tests/e2e/apply-flow.spec.ts` — KERN (Cross-User, beide Projekte)

**User B (chromium-user-b):**

| # | Test | Beschreibung |
|---|---|---|
| 1 | Apply-Seite lädt | `/projects/[TEST_PROJECT_ID]/apply` für User B zugänglich |
| 2 | Apply-Formular hat Pflichtfelder | Motivation-/Rollen-Felder sichtbar |
| 3 | Apply-Submit erfolgreich | User B sendet Bewerbung, Bestätigung/Redirect |

**User A (chromium-auth):**

| # | Test | Beschreibung |
|---|---|---|
| 4 | Applications-Liste lädt | `/projects/[TEST_PROJECT_ID]/applications` sichtbar für User A |
| 5 | Bewerbung von User B sichtbar | User B Name/Bewerbung in der Liste |
| 6 | Accept-Aktion verfügbar | Accept-Button für Bewerbung vorhanden |
| 7 | Reject-Aktion verfügbar | Reject-Button für Bewerbung vorhanden |

### `tests/e2e/messages.spec.ts` (erweitern, chromium-auth)

| # | Test | Beschreibung |
|---|---|---|
| 3 | Conversation-Detail lädt | `/messages/[TEST_CONVERSATION_ID]` lädt wenn Conversation existiert |
| 4 | Message-Input sichtbar | Texteingabe-Feld in Conversation vorhanden |

---

## Erweiterte bestehende Specs

### `tests/e2e/explore.spec.ts` (3 neue Tests)

| # | Test | Beschreibung |
|---|---|---|
| 4 | Commitment-Filter ändert URL | Klick auf Commitment-Chip setzt URL-Param |
| 5 | Mehrere Filter gleichzeitig | Stage + Commitment → beide Params in URL |
| 6 | Filter-Reset | "Any" klicken entfernt alle Filter-Params |

---

## Route-Abdeckung nach Abschluss

| Route | Vorher | Nachher |
|---|---|---|
| `/` | ✅ | ✅ |
| `/login` | ✅ | ✅ |
| `/register` | Basis | ✅ |
| `/dashboard` | Basis | ✅ |
| `/dashboard/profile` | ❌ | ✅ |
| `/explore` | Basis | ✅ Erweitert |
| `/profile/[id]` | ❌ | ✅ |
| `/projects/new` | Basis | ✅ |
| `/projects/[id]` | ❌ | ✅ |
| `/projects/[id]/apply` | ❌ | ✅ |
| `/projects/[id]/applications` | ❌ | ✅ |
| `/messages` | Basis | ✅ |
| `/messages/[id]` | ❌ | ✅ |

---

## Daten-Strategie

**API-Setup im global-setup.ts** (via Supabase Admin Client):
- Testprojekt: Status `draft`, User A als Creator
- Seed-Bewerbung: User B → Testprojekt, Status `pending`
- Seed-Conversation: Wenn nach Match eine Conversation entsteht, ID festhalten

**Teardown:** global-teardown.ts löscht via Supabase Admin alle Seed-Daten in umgekehrter Reihenfolge (FK-Constraints beachten).

**Isolation:** Seed-IDs über `process.env` weitergegeben, nie hardcoded.

---

## Nicht abgedeckt (explizit ausgeschlossen)

- NDA-Flow (separates Feature, eigene Spec wenn bereit)
- Realtime-Updates (Playwright + WebSocket Testing komplex, separater Scope)
- Mobile Viewports (separates Playwright-Projekt wenn nötig)
