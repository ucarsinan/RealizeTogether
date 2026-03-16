# Skill: Prompt Engineer
# Realize Together — Lade diesen Skill wenn du einen Prompt verbessern willst

> **Wie benutzen:** Schreibe deinen Prompt und füge hinzu:
> "@skills/prompt-engineer.md — verbessere diesen Prompt"

---

## Was dieser Skill macht

Analysiert jeden Prompt nach 6 Kriterien und gibt:
1. Eine **Bewertung** (1–10) für jeden Aspekt
2. Eine **Diagnose** was fehlt oder unklar ist
3. **Einen verbesserten Prompt** der sofort einsetzbar ist

---

## Analyse-Kriterien

### 1. Klarheit (Clarity)
- Ist das Ziel eindeutig?
- Gibt es Mehrdeutigkeiten?
- Weiß die KI was "fertig" bedeutet?

**Warnsignale:**
- "Fix das" / "Mach das besser" / "Es funktioniert nicht"
- Kein erwartetes Ergebnis beschrieben
- Kein Kontext wann/wo das Problem auftritt

---

### 2. Kontext (Context)
- Welche Dateien sind betroffen? (`@datei.ts`)
- Was ist der aktuelle Zustand?
- Was wurde bereits versucht?

**Warnsignale:**
- Keine Datei-Referenzen
- Kein Fehlermeldungs-Text
- Keine Beschreibung des aktuellen Verhaltens

---

### 3. Scope (Umfang)
- Ist die Aufgabe zu groß für eine Session?
- Gibt es klare Grenzen was geändert werden darf?
- Was darf NICHT geändert werden?

**Warnsignale:**
- Mehr als 5 Dateien gleichzeitig
- "Überarbeite alles" / "Refactore das ganze Projekt"
- Keine Einschränkungen definiert

---

### 4. Ausgabe-Format (Output)
- Weiß die KI was sie liefern soll?
- Code? Erklärung? Datei? Plan?
- Soll ein Test mitgeliefert werden?

**Warnsignale:**
- Kein erwartetes Format definiert
- Unklar ob Code sofort committed werden soll
- Keine Test-Anforderung erwähnt

---

### 5. Projekt-Kontext (Project Fit)
- Passt der Prompt zu unserem Stack? (Next.js, Supabase, Tailwind)
- Werden die Coding Standards beachtet? (`ActionResult<T>`, `"use server"`)
- Ist der richtige Skill geladen?

**Warnsignale:**
- Kein Bezug zum Tech Stack
- Könnte falschen Ansatz provozieren (z.B. API Route statt Server Action)
- Relevanter Skill nicht erwähnt

---

### 6. Testbarkeit (Testability)
- Ist klar wie das Ergebnis verifiziert wird?
- Wird ein Test angefordert?
- Gibt es einen Acceptance Criterion?

**Warnsignale:**
- Kein Hinweis auf Tests
- Kein klares Erfolgskriterium
- "Funktioniert es?" bleibt offen

---

## Bewertungs-Template

Wenn du einen Prompt analysierst, antworte IMMER in diesem Format:

```
## Prompt-Analyse

| Kriterium      | Bewertung | Problem |
|----------------|-----------|---------|
| Klarheit       | X/10      | ...     |
| Kontext        | X/10      | ...     |
| Scope          | X/10      | ...     |
| Ausgabe-Format | X/10      | ...     |
| Projekt-Fit    | X/10      | ...     |
| Testbarkeit    | X/10      | ...     |

**Gesamt: X/10**

## Diagnose
[Was fehlt, was ist unklar, was könnte schiefgehen]

## Verbesserter Prompt
[Der vollständige, verbesserte Prompt — sofort einsetzbar]
```

---

## Beispiele

### Schlechter Prompt:
```
"Das Profilformular funktioniert nicht"
```

**Analyse:**
- Klarheit: 2/10 — Was funktioniert nicht? Speichern? Laden? Validierung?
- Kontext: 1/10 — Keine Datei, keine Fehlermeldung
- Scope: 8/10 — Klein genug
- Ausgabe: 3/10 — Unklar ob Fix oder Erklärung gewünscht
- Projekt-Fit: 5/10 — Unklar ob Server Action oder UI betroffen
- Testbarkeit: 2/10 — Kein Kriterium für "fixed"

**Gesamt: 3.5/10**

**Verbesserter Prompt:**
```
Beim Klick auf "Save" in @src/components/profile/ProfileForm.tsx
passiert nichts. Console zeigt:
  TypeError: Cannot read properties of null (reading 'id')
  at updateProfile (profile.actions.ts:52)

Erwartetes Verhalten: Profil wird gespeichert, Toast "Saved!" erscheint.
Aktuelles Verhalten: Kein Feedback, kein Fehler in der UI.

Bitte:
1. Bug in @src/actions/profile.actions.ts fixen
2. Test in tests/unit/ ergänzen
3. Nur diese zwei Dateien ändern
```

---

### Guter Prompt:
```
In @src/app/(main)/explore/page.tsx fehlt der Breadcrumb.
Andere Seiten wie @src/app/(main)/dashboard/page.tsx haben ihn bereits.
Bitte den <Breadcrumb items={[{ label: 'Explore' }]} /> direkt
unter dem Kicker einfügen. Nur diese eine Datei ändern.
Kein Test nötig da rein visuell.
```

**Analyse:** 9/10 — Klar, konkret, eingeschränkt, referenziert Beispiel.

---

## Schnell-Checkliste vor jedem Prompt

```
[ ] Habe ich die betroffene Datei mit @ referenziert?
[ ] Habe ich die Fehlermeldung exakt kopiert?
[ ] Habe ich beschrieben was passiert UND was passieren soll?
[ ] Habe ich den Scope begrenzt? ("Nur diese Datei")
[ ] Habe ich nach einem Test gefragt?
[ ] Passt mein Prompt zu unserem Stack? (Next.js, Server Actions, Tailwind)
```

Wenn alle 6 Punkte ✅ → Prompt abschicken.
Wenn 2+ Punkte ❌ → Zuerst verbessern.