# RealizeTogether — Product Document

> **Single Source of Truth** für alle Produkt-, Design- und Architektur-Entscheidungen.
> Hier werden Fragen diskutiert, Optionen abgewogen und Entscheidungen festgehalten.
> Vor jeder Feature-Implementierung: relevante Abschnitte lesen und offene Punkte klären.

---

## 1. Vision & Ziel

### Was ist RealizeTogether?

> **TODO (Owner):** Formuliere die Vision in 2–3 Sätzen. Was soll jemand nach 10 Sekunden auf der Landing Page verstehen?

*Zwischenstand aus Codebase-Analyse:*
RealizeTogether ist eine Kollaborationsplattform für die Filmbranche. Creators (Regisseure, Produzenten) stellen Projekte ein und suchen Talente (Schauspieler, DPs, Editoren, Komponisten). Talente bewerben sich — der Trust Funnel schützt sensible Projektinformationen und baut Vertrauen schrittweise auf.

### Das Problem

> **TODO (Owner):** Warum existiert diese Plattform? Was funktioniert auf bestehenden Plattformen NICHT?

*Hypothesen:*
- LinkedIn ist zu generisch, nicht auf Film/Kreative ausgerichtet
- Casting-Plattformen sind einseitig (nur Casting, kein Crew)
- Creative-Projekte teilen sensible Infos (Drehbücher) zu früh oder gar nicht
- Kein strukturiertes Vertrauensmodell für kreative Kollaborationen

### Kern-Value Proposition

| Persona | Problem | Value |
|---|---|---|
| **Creator** | Findet kein passendes Team, muss Drehbuch blind teilen | Strukturierter Trust Funnel + verifizierte Talente |
| **Talent** | Findet keine ernsthaften Projekte, Spam auf anderen Plattformen | Kuratierte Projekte + transparenter Bewerbungsprozess |

---

## 2. Zielgruppe

### Primär
- Unabhängige Filmemacher, Regisseure, Produzenten
- Seriöse Hobby- bis Mid-Level-Professional (nicht Hollywood Studios)
- Deutschsprachiger Raum (DE/AT/CH) als erster Markt

> **TODO (Owner):** Ist der initiale Fokus deutschsprachig oder international-englisch?

### Sekundär
- Schauspieler, Kameraleute (DPs), Cutter/Editoren
- Komponisten, Sound Designer, Production Designer
- Drehbuchautoren die Co-Creators suchen

### Was die Plattform NICHT ist
- Kein Job-Board / Freelancer-Marktplatz (kein direktes Bezahlen über die Plattform)
- Kein Casting-Tool im klassischen Sinne (keine Casting-Sheets, keine Agentur-Logik)
- Kein Social Network (kein Feed, kein follower-System)
- Kein LinkedIn-Konkurrent (kein generisches Profil-System)

---

## 3. Trust Funnel — Das Kernkonzept

Das Herzstück der Plattform. Informationen werden schrittweise freigegeben, um Vertrauen aufzubauen bevor sensibles Material geteilt wird.

```
Level 1 — Öffentlich (kein Account nötig)
  └── Titel, Logline, Stage, Rollen gesucht, Commitment-Typ
  └── Creator-Identität: MASKIERT ("Anonymous Creator" / "Verified Creator")
  └── Kein Avatar, kein Intro-Video des Creators

Level 2 — Hinter NDA-Zustimmung (Account + NDA-Consent)
  └── Synopsis / Pitch Deck (PDF in Supabase Storage)
  └── Creator-Identität bleibt maskiert

Level 3 — Nur im privaten Chat nach Match
  └── Volles Drehbuch — nie auf der Plattform gespeichert
  └── Creator-Identität enthüllt sich automatisch (Chat lädt echte User-Daten)
```

**Blind Audition Prinzip:** Die Identität des Creators (Name, Avatar, Intro-Video) bleibt für alle anderen User bis zum Match verborgen. Nur der Verified-Status ist sichtbar. Eigene Projekte zeigt der Creator immer mit echten Daten.

> **ENTSCHEIDUNG #1 — Sichtbarkeit ohne Account: ✅ Option B implementiert**
> Level-1-Inhalte (`/explore`, `/projects/[id]`) sind öffentlich zugänglich ohne Login.
> Level 2+ (NDA/Synopsis, Bewerben) bleiben hinter Login.
> `/projects/[id]/apply` und `/projects/[id]/applications` sind weiterhin geschützt.

### Status-Flow Projekte

```
open → in_progress → completed
         ↑
    (nach Double-Opt-in Match)
```

### Status-Flow Bewerbungen

```
pending → in_talks → matched
        ↘ rejected
```

---

## 4. Core User Journeys

### Creator Journey

```
1. Register + Profil anlegen
2. Projekt erstellen (Titel, Beschreibung, Rollen, Stage, Commitment)
3. Optional: Synopsis/Pitch hochladen (Trust Funnel Level 2)
4. Bewerbungen eingehen sehen → Dashboard
5. Bewerbung annehmen → "In Talks" + Chat öffnet sich
6. Im Chat: Volles Drehbuch privat teilen (Level 3)
7. Match bestätigen (Double Opt-in) → Projekt geht in_progress
8. Projekt abschließen
```

### Talent Journey

```
1. Register + Profil aufbauen (Bio, Avatar, Video, Links)
2. Projekte entdecken (Explore)
3. NDA-Zustimmung → Synopsis lesen (Level 2)
4. Bewerben (Rolle auswählen + Nachricht)
5. Warten auf Annahme → "In Talks" + Chat
6. Match bestätigen
```

---

## 5. Feature-Map

| Feature | Status | Priorität | Offene Entscheidungen |
|---|---|---|---|
| Auth (Register/Login) | ✅ Done | — | — |
| Profil erstellen/bearbeiten | ✅ Done | — | — |
| Avatar & Video Upload | ✅ Done | — | — |
| Profil-Verifikation (Portfolio-Links) | ✅ Done | — | — |
| Projekt erstellen/bearbeiten | ✅ Done | — | — |
| Explore / Projekt-Listing | ✅ Done | — | — |
| Projekt-Detailseite | ✅ Done | — | — |
| Trust Funnel Level 2 (NDA + Synopsis) | ✅ Done | — | — |
| Bewerbung einreichen | ✅ Done | — | — |
| Bewerbungen verwalten (Creator) | ✅ Done | — | — |
| Messaging / Chat | ✅ Done | — | — |
| Double Opt-in Match | ✅ Done | — | — |
| Email-Notifications (Resend) | ✅ Done | — | — |
| **Public Profile Page `/profile/[id]`** | 🔄 Geplant | Hoch | #1, #2, #3, #4, #5 (s. Abschnitt 7) |
| User Skills (`user_skills`) | 📋 Backlog | Mittel | Welche Skills? Taxonomie? |
| Realtime Chat (Supabase Realtime) | 📋 Backlog | Mittel | Polling reicht? Push? |
| KI-Matching / Empfehlungen | 📋 Backlog | Niedrig | FastAPI-Backend scope |
| Projekt-Suche / Filter | 📋 Backlog | Mittel | Welche Filter-Dimensionen? |
| Creator Dashboard Analytics | 📋 Backlog | Niedrig | Was messen? |

---

## 6. UX/Design-Prinzipien

### Visuelles System (aus Codebase abgeleitet)

| Token | Wert | Verwendung |
|---|---|---|
| Hintergrund | `#f2f0ed` | Page background |
| Weiß | `#ffffff` | Cards |
| Border | `#e0ddd8` | Card-Rahmen |
| Akzent | `#e8621a` | CTAs, Hover, Badges |
| Akzent-Bg | `#fdf2ec` | Leichte Akzent-Fläche |
| Text-Primary | `#1a1918` | Headings, Body |
| Text-Muted | `#6b6762` | Sekundäre Info |

**Schriften:**
- `font-unbounded` — Überschriften, Kicker-Labels, Brand-Text
- `font-sans` — Alle UI-Texte, Body, Labels

**Card-Muster:**
```
bg-white border border-[#e0ddd8] rounded-2xl p-8
shadow-[0_4px_32px_rgba(0,0,0,0.07)]
```

**Kicker + Heading:**
```html
<p class="font-unbounded text-[10px] font-bold tracking-[.18em] uppercase text-[#e8621a]">
  SECTION LABEL
</p>
<h1 class="font-unbounded font-black text-[clamp(28px,3.5vw,52px)] tracking-[-0.04em] leading-[.95] text-[#1a1918]">
  Page Title
</h1>
```

### Interaktions-Patterns
- Hover auf Links/Cards: `hover:border-[#e8621a]` + Farb-Transition
- Primärer CTA: `bg-[#e8621a] hover:bg-[#c9521a] text-white rounded-full font-bold`
- Sekundärer Link: `border border-[#e0ddd8] hover:border-[#1a1918] rounded-full`
- Badges: Inline `<span>` mit Tailwind — kein shadcn `<Badge>`
- Icons: Lucide React

### Mobile-First vs. Desktop-First

> **TODO (Owner):** Ist die primäre Nutzung mobil oder Desktop? Aktuell hat der Code `max-md:px-5` Anpassungen, aber keine echte Mobile-first-Struktur.
> - Option A: Desktop-first (Kreative arbeiten am Rechner)
> - Option B: Mobile-first (Discovery passiert überall)

---

## 7. Offene Entscheidungen

### Offene Entscheidung #1 — Auth-Requirement für Profile/Projekte

**Kontext:** Middleware blockiert aktuell alles außer `/`, `/login`, `/register`.

**Frage:** Sollen Projekte (Explore, Detail) und Profile ohne Login sichtbar sein?

**Optionen:**
- A) Alles hinter Login (Status quo) — Daten-Privacy, aber schlechte Discovery
- B) Level-1-Inhalte öffentlich (Projekte + Profile), Level 2+ hinter Login
- C) Projekte öffentlich, Profile nur für eingeloggte User

**Implikation für `/profile/[id]`:** Wenn A → keine Middleware-Änderung. Wenn B/C → Exception in `src/lib/supabase/middleware.ts` nötig.

---

### Offene Entscheidung #2 — Public Profile: Welche Inhalte?

**Frage:** Was zeigt die `/profile/[id]`-Seite?

**Minimal:** Avatar, Name, Bio, Video, Portfolio-Links, Verified-Badge

**Erweitert:** + Liste der Projekte des Users (Creator-Projekte die open/in_progress sind)

**Optionen:**
- A) Nur Profil-Info (Avatar, Bio, Links) — schneller zu bauen, fokussiert
- B) Profil + Projekte des Creators — mehr Value, mehr Komplexität

---

### Offene Entscheidung #3 — CTA auf Profil-Seite

**Frage:** Was soll ein Besucher auf dem Profil TUN können?

**Optionen:**
- A) Nur ansehen (rein informationally)
- B) Button "Projekte ansehen" → Explore gefiltert auf diesen Creator
- C) Button "Nachricht senden" (nur wenn eingeloggt und eine gemeinsame Konversation existiert)
- D) Nichts — Profil ist Visitenkarte, Aktionen passieren über Projekte

---

### Offene Entscheidung #4 — Profil-Links in der App

**Frage:** Wo in der App sollen Creator/Talent-Namen auf `/profile/[id]` verlinken?

**Kandidaten:**
- `ProjectCard` — Creator-Name/Avatar unten links
- `ProjectDetailPage` — Creator-Block (Avatar + Name)
- `ApplicationsManager` — Applicant-Name
- `Dashboard` — Conversations-Liste (other_user)
- `NavBar` — aktuell linkt auf `/dashboard/profile` (Edit), nicht auf View

**Optionen:**
- A) Alle sofort (vollständige Verlinkung)
- B) Nur ProjectCard + ProjectDetail (die öffentlichsten Stellen)
- C) Erst wenn Profil-Seite live ist, dann iterativ erweitern

---

### Offene Entscheidung #5 — Eigenes Profil besuchen

**Frage:** Was passiert wenn ein eingeloggter User `/profile/[eigene-id]` aufruft?

**Optionen:**
- A) Redirect zu `/dashboard/profile` (Edit-Seite)
- B) View-Ansicht rendern mit "Edit Profile"-Button oben
- C) View-Ansicht rendern, ohne speziellen Edit-Hinweis

---

### Offene Entscheidung #6 — Sprache der Plattform

**Frage:** Englisch oder Deutsch als primäre Sprache für UI-Texte?

*Beobachtung aus Code:* Kommentare im Code sind Deutsch, UI-Labels Englisch (Explore, Dashboard, etc.), Email-Templates Englisch.

**Optionen:**
- A) Englisch (internationaler Markt von Anfang an)
- B) Deutsch (DE/AT/CH-Fokus, später i18n)
- C) Zweisprachig von Anfang an (i18n)

---

## 8. Architektur-Entscheidungen (ADRs)

### ADR-001: Supabase als Haupt-Backend

**Entscheidung:** Supabase für Auth, DB (Postgres), Storage und (zukünftig) Realtime.

**Warum:** Kein separater API-Layer für CRUD. Server Actions → Supabase direkt. Spart eine Abstraktionsschicht, bleibt typsicher durch generierte `database.types.ts`.

**Konsequenz:** Kein REST/GraphQL-Layer für Standard-CRUD. Nur FastAPI für KI/Matching.

---

### ADR-002: FastAPI nur für KI und Matching

**Entscheidung:** Python/FastAPI-Backend existiert, wird NICHT für CRUD genutzt.

**Warum:** KI-Libraries (Python-Ökosystem), Heavy Processing, ML-Modelle. Next.js Server Actions sind für alles andere ausreichend.

**Konsequenz:** Zwei Backend-Systeme — Supabase (CRUD) + FastAPI (KI). Kein Overkill für Standard-Operationen.

---

### ADR-003: Email via Resend (Fire-and-forget)

**Entscheidung:** Transaktionale Emails über Resend, immer als `void (async () => {...})()`.

**Warum:** Email-Fehler sollen nie die Haupt-Operation blockieren. User bekommt Antwort, auch wenn Email-Delivery fehlschlägt.

**Konsequenz:** Kein Retry-Mechanismus, kein Email-Queue. Akzeptables Risiko für MVP.

---

### ADR-004: RLS in Supabase

**Entscheidung:** Row-Level Security für alle sensitiven Tabellen.

> **TODO:** RLS-Regeln dokumentieren — welche Tabellen, welche Policies?

---

### ADR-005: Blind Audition — Creator-Identität maskiert bis Match

**Entscheidung:** `getProjects` und `getProject` maskieren die `profiles`-Daten des Creators für alle User die nicht der Creator selbst sind. `full_name` wird zu "Anonymous Creator" / "Verified Creator", `avatar_url` und `video_url` werden auf `null` gesetzt.

**Warum:** Trust Funnel soll auch für Creators funktionieren — kein Promi-Bias, keine Netzwerk-Vorteile. Talente entscheiden auf Basis des Projekts, nicht der Bekanntheit des Creators.

**Konsequenz:** Creator-Identität wird erst im Chat nach Match sichtbar (Conversation Actions laden echte User-Daten). Verified-Badge bleibt sichtbar (Vertrauenssignal ohne Identitätspreisgabe).

---

## 9. Glossar

| Begriff | Definition |
|---|---|
| **Creator** | User der ein Projekt erstellt |
| **Talent** | User der sich auf Projekte bewirbt |
| **Trust Funnel** | Schrittweise Freigabe von Projekt-Informationen |
| **Match** | Double Opt-in: beide Seiten bestätigen Zusammenarbeit |
| **In Talks** | Status nach Bewerbungsannahme, vor Match |
| **NDA** | Non-Disclosure Agreement für Trust Funnel Level 2 |
| **Verified** | User mit mindestens einem Portfolio-Link |

---

*Zuletzt aktualisiert: 2026-03-31*
*Erstellt auf Basis von Codebase-Analyse — TODO-Punkte vom Owner zu befüllen*
