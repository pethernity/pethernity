# Supabase + Authentication Integration Design

## Overview

Integrate Supabase as the backend for Pethernity, replacing localStorage with a persistent database. Add email + password authentication with ownership-based access control. Authentication is required to confirm memorial creation (after completing the 3-step setup).

## Decisions

- **Auth method:** Email + password (Supabase Auth native)
- **Architecture:** Client-side Supabase with Row Level Security (RLS)
- **Data scope:** All data on Supabase (memorials, likes, candles, comments)
- **Photo storage:** Supabase Storage bucket (public read, authenticated write)
- **Ownership:** Each memorial belongs to its creator (edit/delete only by owner)

## Database Schema

### profiles
Extends `auth.users` with display info.

| Column       | Type         | Constraints                    |
|-------------|--------------|--------------------------------|
| id          | uuid         | PK, references auth.users(id) |
| display_name| text         |                                |
| created_at  | timestamptz  | default now()                  |

### memorials

| Column      | Type         | Constraints                    |
|-------------|--------------|--------------------------------|
| id          | uuid         | PK, default gen_random_uuid()  |
| user_id     | uuid         | FK -> profiles(id), NOT NULL   |
| pet_name    | text         | NOT NULL                       |
| pet_type    | text         | NOT NULL (dog/cat/other)       |
| photo_url   | text         | NOT NULL                       |
| phrase      | text         | NOT NULL                       |
| birth_date  | date         |                                |
| death_date  | date         |                                |
| cloud_id    | text         | NOT NULL                       |
| created_at  | timestamptz  | default now()                  |

### likes

| Column      | Type         | Constraints                    |
|-------------|--------------|--------------------------------|
| id          | uuid         | PK, default gen_random_uuid()  |
| memorial_id | uuid         | FK -> memorials(id), NOT NULL  |
| user_id     | uuid         | FK -> profiles(id), NOT NULL   |
| created_at  | timestamptz  | default now()                  |

UNIQUE constraint on (memorial_id, user_id).

### candles

| Column      | Type         | Constraints                    |
|-------------|--------------|--------------------------------|
| id          | uuid         | PK, default gen_random_uuid()  |
| memorial_id | uuid         | FK -> memorials(id), NOT NULL  |
| user_id     | uuid         | FK -> profiles(id), NOT NULL   |
| created_at  | timestamptz  | default now()                  |

UNIQUE constraint on (memorial_id, user_id).

### comments

| Column      | Type         | Constraints                    |
|-------------|--------------|--------------------------------|
| id          | uuid         | PK, default gen_random_uuid()  |
| memorial_id | uuid         | FK -> memorials(id), NOT NULL  |
| user_id     | uuid         | FK -> profiles(id), NOT NULL   |
| text        | text         | NOT NULL                       |
| created_at  | timestamptz  | default now()                  |

### Storage

Bucket `memorial-photos`:
- Public read access
- Authenticated write access
- Path convention: `{user_id}/{memorial_id}.{ext}`

## RLS Policies

- **memorials:** SELECT public. INSERT/UPDATE/DELETE where `user_id = auth.uid()`
- **likes:** SELECT public. INSERT/DELETE where `user_id = auth.uid()`
- **candles:** SELECT public. INSERT/DELETE where `user_id = auth.uid()`
- **comments:** SELECT public. INSERT where `user_id = auth.uid()`. DELETE where `user_id = auth.uid()`
- **profiles:** SELECT public. UPDATE where `id = auth.uid()`
- **Storage (memorial-photos):** SELECT public. INSERT/DELETE where path starts with `auth.uid()/`

## Authentication Flow

```
Step 1 (Pet info) -> Step 2 (Photo) -> Step 3 (Memory)
                                              |
                                      Click "Crea memoriale"
                                              |
                                     Authenticated? --Yes--> Save to Supabase
                                              |
                                             No
                                              |
                                     Show Auth Modal
                                     (Login / Register tabs)
                                              |
                                      Auth complete
                                              |
                                     Save to Supabase
```

Form data stays in React state during auth. No data loss.

## New Files

- `lib/supabase/client.ts` - Browser Supabase client (singleton)
- `lib/supabase/server.ts` - Server-side Supabase client (cookie-based)
- `lib/supabase/middleware.ts` - Session refresh middleware logic
- `middleware.ts` - Next.js middleware entry point
- `components/auth/auth-modal.tsx` - Login/Register modal with tabs
- `components/auth/auth-provider.tsx` - React context for auth state
- `hooks/use-auth.ts` - Hook for current user and auth functions

## Modified Files

- `lib/memorials.ts` - Rewrite for Supabase queries
- `lib/interactions.ts` - Rewrite for Supabase queries
- `components/memorial/stepper.tsx` - Auth check before save, show auth modal
- `components/memorial/step-photo.tsx` - Upload to Supabase Storage
- `components/memorial/memorial-interactions.tsx` - Supabase-backed interactions
- `app/memoriale/[id]/page.tsx` - Edit/delete buttons for owner
- `app/layout.tsx` - Wrap with AuthProvider
- `app/crea/page.tsx` - Pass auth context to stepper

## What Stays the Same

- Visual design unchanged
- 3-step creation flow unchanged
- Paradise map unchanged
- Cloud spots system unchanged
- Italian interface unchanged
