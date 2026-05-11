# Quick Wins Design Spec

**Datum:** 2026-05-11  
**Scope:** Zwei isolierte Bugfixes / fehlende Features  
**Status:** Approved

---

## QW1 — Register: selectedRole wird gespeichert

### Problem

In `src/app/(auth)/register/page.tsx` existiert der State `selectedRole`, der per UI befüllt wird. Er wird jedoch beim `supabase.auth.signUp()`-Aufruf nicht mitgeschickt — die Rolle geht verloren.

### Ziel

Beim Registrieren wird die gewählte Rolle persistent in `profiles.role` gespeichert.

### Änderungen

**1. Supabase Migration**

```sql
ALTER TABLE profiles ADD COLUMN role text;
```

Nullable — bestehende Nutzer ohne Rolle bleiben unberührt.

**2. `src/app/(auth)/register/page.tsx`**

`role` in die signUp-Metadata aufnehmen:

```ts
options: {
  data: {
    full_name: fullName,
    role: selectedRole ?? undefined,
  },
}
```

**3. `src/app/auth/callback/route.ts`**

Nach `exchangeCodeForSession` die Rolle aus `user.user_metadata` in die `profiles`-Tabelle schreiben:

```ts
const { data: { user } } = await supabase.auth.getUser()
if (user?.user_metadata?.role) {
  await supabase
    .from('profiles')
    .update({ role: user.user_metadata.role })
    .eq('id', user.id)
}
```

**4. `src/lib/types/index.ts`**

`Profile` type manuell erweitern (database.types.ts ist veraltet):

```ts
// Extend outdated generated type
export type Profile = Database['public']['Tables']['profiles']['Row'] & {
  role: string | null
  skills: string[] | null  // auch für QW2
}
```

### Constraints

- Kein Pflichtfeld — `selectedRole` bleibt nullable
- RLS: Nutzer darf nur eigenes Profil updaten (bereits so konfiguriert)
- Kein DB-Trigger nötig — der Callback-Schritt übernimmt das Schreiben

---

## QW2 — Public Profile: Skills anzeigen

### Problem

`extractSkillsFromBio` (FastAPI) extrahiert Skills und schreibt sie in `profiles.skills`. `src/components/profile/ProfileView.tsx` zeigt diese Skills jedoch nicht an.

### Ziel

Skills erscheinen als eigene Karte auf dem Public Profile — konsistent mit dem bestehenden Karten-Pattern (wie die Links-Karte).

### Design-Entscheidung

**Option B — Eigene Skills-Karte** (User-Wahl)

Skills bekommen eine dedizierte Karte nach dem Links-Abschnitt. Gleiche visuelle Sprache wie alle anderen Karten: `bg-white border border-[#e0ddd8] rounded-2xl p-8 shadow-[0_4px_32px_rgba(0,0,0,0.07)]`.

Chips: `border border-[#e0ddd8] rounded-full px-3 py-1 text-sm text-[#1a1918]`

Section-Label: `font-sans text-[12px] font-medium text-[#6b6762] uppercase tracking-widest`

### Änderungen

**1. `src/lib/types/index.ts`**

`skills: string[] | null` zum `Profile` type (zusammen mit `role` aus QW1, s.o.)

**2. `src/components/profile/ProfileView.tsx`**

Neue Skills-Karte nach dem Links-Abschnitt einfügen — nur rendern wenn `profile.skills?.length > 0`:

```tsx
{profile.skills && profile.skills.length > 0 && (
  <div className="bg-white border border-[#e0ddd8] rounded-2xl p-8 shadow-[0_4px_32px_rgba(0,0,0,0.07)]">
    <p className="font-sans text-[12px] font-medium text-[#6b6762] uppercase tracking-widest mb-4">
      Skills
    </p>
    <div className="flex flex-wrap gap-2">
      {profile.skills.map((skill) => (
        <span
          key={skill}
          className="border border-[#e0ddd8] rounded-full px-3 py-1 text-sm text-[#1a1918]"
        >
          {skill}
        </span>
      ))}
    </div>
  </div>
)}
```

### Constraints

- Nur Lese-Operation — kein Update-Flow
- Skills werden ausschließlich vom AI-Backend geschrieben (kein manuelles Editieren im MVP)
- Keine Anzeige wenn `skills` null oder leer → kein leerer Kartenblock

---

## Betroffene Dateien

| Datei | Änderung |
|---|---|
| `supabase/migrations/YYYYMMDD_add_role_to_profiles.sql` | NEU — `role text` Spalte |
| `src/app/(auth)/register/page.tsx` | role in signUp-Metadata |
| `src/app/auth/callback/route.ts` | role aus metadata in profiles schreiben |
| `src/lib/types/index.ts` | `role` + `skills` zu Profile type |
| `src/components/profile/ProfileView.tsx` | Skills-Karte hinzufügen |

---

## Out of Scope

- Kein Edit-UI für Skills (MVP: AI-only)
- Kein Edit-UI für Role nach Registration
- Keine Anzeige der Role auf dem Public Profile (nur gespeichert)
- Keine Validierung der Role-Werte gegen eine Enum-Liste (vorerst freier Text)
