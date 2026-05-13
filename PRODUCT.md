# RealizeTogether — Product Document

> **Single Source of Truth** für alle Produkt-, Design- und Architektur-Entscheidungen.
> Hier werden Fragen diskutiert, Optionen abgewogen und Entscheidungen festgehalten.
> Vor jeder Feature-Implementierung: relevante Abschnitte lesen und offene Punkte klären.

---

## 1. Vision & Ziel

### Was ist RealizeTogether?

RealizeTogether is the platform where filmmakers find their perfect team safely. Our Trust Funnel allows you to pitch ideas securely without making scripts public.

### Das Problem

Filmmakers lack a secure space to build teams. Existing networks lead to spam or force creators to share sensitive IP (scripts) prematurely.

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

**Markt:** International. UI-Sprache strikt Englisch.

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

> **ENTSCHEIDUNG #1 — Sichtbarkeit ohne Account: ✅ Option A implementiert**
> Alles hinter Login. Nur `/`, `/login`, `/register` sind öffentlich.
> Explore, Projektdetails und Profile erfordern einen Account — passt zum kuratierten Community-Ansatz.

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
| **Public Profile Page `/profile/[id]`** | ✅ Done | — | — |
| **User Skills** | ✅ Done | — | KI-Extraktion aus Bio via FastAPI (OpenAI). `skills text[]` in `profiles`. Magic Wand Button im ProfileForm. |
| **Soft Realtime (Unread Badge + Polling)** | ✅ Done | — | Entschieden: Option B. Kein Supabase Realtime. Unread Badge via 30s-Polling, MessagesPoller auf /messages. |
| **KI-Matching / Empfehlungen** | ✅ Done | — | Embedding-basiert (text-embedding-3-small + cosine similarity). Skills-Embedding in profiles, Role-Embedding in project_roles. Explore-Strip "Recommended for you". |
| **Projekt-Suche / Filter** | ✅ Done | — | Textsuche (title+logline) + Category (server) + Rollen-Filter (client). ExploreResults Client Component. |
| **Creator Dashboard Analytics** | ✅ Done | — | Global: Total Applications, Matches, NDA Consents, Match Rate. Pro Projekt: Pending / In Talks / Matched / Rejected / Verified Applicants, Match Rate. |

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

**Entschieden: Desktop-First.** Kern-Workflows (Drehbücher lesen, Projekte anlegen) finden primär am Rechner statt. Responsive für Mobile ist wichtig, aber Desktop hat Priorität.

---

## 7. Offene Entscheidungen

### Offene Entscheidung #0 — Realtime Chat: Passt das zum Konzept?

**Kontext:** Der Chat (Conversations + Messaging) existiert und funktioniert via Polling. Supabase Realtime würde Live-Updates ohne Page-Refresh ermöglichen.

**Bedenken:**

- RealizeTogether ist kein Messenger — der Trust Funnel lebt von einem *langsamen, überlegten* Rhythmus. Realtime-Chat erzeugt Druck, sofort zu antworten.
- Der Chat gehört zu Level 3 (nach Match). Die Plattform ist kein WhatsApp-Ersatz.
- Realtime erhöht Komplexität (Supabase Channels, Connection-Management) ohne klaren User-Value für den Kernprozess.

**Optionen:**

- A) Kein Realtime — Polling bleibt, Seite muss manuell refreshed werden (Status quo)
- B) Soft Realtime — Browser-Notification oder Unread-Badge via Polling (30s-Intervall), kein Live-Typing
- C) Supabase Realtime — vollständiges Live-Chat-Erlebnis

**Entschieden:** Option B — Unread-Badge via Polling (30s-Intervall). Kein Supabase Realtime, kein Live-Typing. Passt zum langsamen Trust-Funnel-Rhythmus.

---

### Entscheidung #1 — Auth-Requirement für Profile/Projekte ✅ Option A

**Entschieden:** Alles hinter Login. Nur `/`, `/login`, `/register` sind öffentlich. RealizeTogether ist eine kuratierte Community — wer Projekte sehen will, gehört dazu. Kein offener Browse-Modus.

---

### Entscheidung #2 — Public Profile: Welche Inhalte? ✅ Option A

**Entschieden:** Nur Profil-Info (Avatar, Name, Bio, Video, Portfolio-Links, Verified-Badge). Keine Projekte — Projekte würden die Creator-Anonymität (Blind Audition) unterlaufen.

---

### Entscheidung #3 — CTA auf Profil-Seite ✅ Option D

**Entschieden:** Kein CTA. Profil ist reine Visitenkarte. Kein "Nachricht senden"-Button — Kontakt entsteht ausschließlich über Projekt-Bewerbungen (Spam-Schutz).

---

### Entscheidung #4 — Profil-Links in der App ✅ Selektiv

**Entschieden:** Links zu `/profile/[id]` nur in `ApplicationsManager` (Applicant-Name) und `Dashboard` (Conversations, other_user). Auf `ProjectCard` und `ProjectDetailPage` bleibt der Creator anonym (Blind Audition).

---

### Entscheidung #5 — Eigenes Profil besuchen ✅ Option B

**Entschieden:** View-Ansicht rendern mit "Edit Profile"-Button oben rechts → Link zu `/dashboard/profile`.

---

### Entscheidung #6 — Sprache der Plattform ✅ Option A

**Entschieden:** Englisch. Internationaler Markt von Anfang an. UI-Sprache strikt Englisch; Code-Kommentare können Deutsch bleiben.

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

**Entscheidung:** Row-Level Security auf allen 9 Tabellen. Kein Row ist ohne passende Policy lesbar oder schreibbar.

| Tabelle | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | Alle Authenticated | Eigenes Profil | Eigenes Profil | — |
| `user_skills` | Alle Authenticated | Eigene Skills | Eigene Skills | Eigene Skills |
| `projects` | Alle Authenticated | Eigene Projekte | Eigene Projekte | Eigene Projekte |
| `project_roles` | Alle Authenticated | Creator des Projekts | Creator des Projekts | — |
| `nda_consents` | Eigene + Creator des Projekts | Eigener Consent | — | — |
| `project_applications` | Applicant + Creator | Eigene Bewerbung | Creator (Statusänderung) | — |
| `conversations` | Applicant + Creator (Teilnehmer) | Creator des Projekts | — | — |
| `messages` | Teilnehmer der Conversation | Teilnehmer + Sender = auth.uid() | — | — |
| `matches` | user_id + Creator | Creator des Projekts | user_id + Creator (Bestätigung) | — |

**Prinzip:** Öffentliche Tabellen (`profiles`, `projects`, `project_roles`, `user_skills`) sind für alle eingeloggten User lesbar — kein Row-Filter. Sensitive Tabellen (`conversations`, `messages`, `matches`, `nda_consents`, `project_applications`) sind auf Teilnehmer beschränkt.

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

---

## 10. Launch-Checklist

| Bereich | Status | Notiz |
|---|---|---|
| Email Verification (Resend-Button) | ✅ Done | Login + Register Done-Screen |
| SEO / OG-Tags | ✅ Done | Root layout + landing.html |
| Skeleton Loading (Explore, Dashboard, Messages) | ✅ Done | Per-Page loading.tsx |
| Supabase Auth Rate Limiting | ⚠️ 1 Klick fehlt | Dashboard → Auth → Rate Limits: max 5/h pro Email |
| Custom Rate Limiting (API-Level) | 📋 Post-Launch | Braucht Upstash Redis + @upstash/ratelimit |
| Vercel Analytics + Speed Insights | ✅ Done | Automatisch aktiv nach Vercel-Deploy |
| OG-Image (1200×630) | ✅ Done | `src/app/opengraph-image.tsx` — dunkles Brand-Design |

---

*Zuletzt aktualisiert: 2026-05-13*
*Erstellt auf Basis von Codebase-Analyse — TODO-Punkte vom Owner zu befüllen*
