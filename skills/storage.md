# Skill: Storage & Uploads
# Realize Together — Lade diesen Skill bei Avatar/Video/Synopsis-Aufgaben

## Buckets

| Bucket   | Typ         | Max-Size | Formate              |
|----------|-------------|----------|----------------------|
| avatars  | public      | 5 MB     | jpg, png, webp       |
| videos   | public      | 100 MB   | mp4, mov, webm       |
| synopses | **private** | 20 MB    | pdf                  |

## Upload-Pattern (Server Action)

```typescript
// Avatar
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.${ext}`, file, { upsert: true })

// Signed URL für private Dateien (synopses)
const { data } = await supabase.storage
  .from('synopses')
  .createSignedUrl(`${projectId}/${filename}`, 3600)
```

## Public URL

```typescript
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar.jpg`)
// → data.publicUrl
```

## RLS Policies

**avatars / videos:** Owner kann hochladen, alle können lesen.

**synopses:** Nur lesen wenn NDA unterschrieben:
```sql
EXISTS(
  SELECT 1 FROM nda_consents
  WHERE project_id = (storage.foldername(name))[1]::uuid
  AND user_id = auth.uid()
)
```

## next/image für Storage-URLs

```tsx
import Image from 'next/image'

<Image
  src={avatarUrl}
  alt={name}
  width={40}
  height={40}
  className="rounded-full"
/>
```

Domain ist in `next.config.ts` erlaubt:
```typescript
images: {
  remotePatterns: [{
    protocol: 'https',
    hostname: 'dsmzvqaevqbygefuqeno.supabase.co'
  }]
}
```
