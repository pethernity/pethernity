# Supabase + Authentication Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace localStorage with Supabase (database + storage) and add email/password authentication required before memorial creation.

**Architecture:** Client-side Supabase with `@supabase/ssr` for cookie-based session management. RLS policies enforce ownership. Next.js middleware refreshes sessions. Auth modal appears when unauthenticated user tries to create a memorial.

**Tech Stack:** Supabase (`@supabase/supabase-js`, `@supabase/ssr`), Next.js 16 App Router, React 19, TypeScript

---

## Prerequisites

Before starting, the developer must:
1. Create a Supabase project at https://supabase.com
2. Get the project URL and anon key from Settings > API
3. Create a `.env.local` file (never committed) with those values

---

### Task 1: Install Dependencies and Configure Environment

**Files:**
- Modify: `package.json`
- Create: `.env.local`
- Modify: `.gitignore` (ensure `.env.local` is listed)
- Modify: `next.config.mjs` (add image domains for Supabase storage)

**Step 1: Install Supabase packages**

Run:
```bash
npm install @supabase/supabase-js @supabase/ssr
```

**Step 2: Create `.env.local`**

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

**Step 3: Verify `.gitignore` includes `.env.local`**

Check that `.env.local` is in `.gitignore`. If not, add it.

**Step 4: Update `next.config.mjs` for Supabase Storage images**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
}

export default nextConfig
```

**Step 5: Commit**

```bash
git add package.json package-lock.json next.config.mjs .gitignore
git commit -m "chore: install supabase dependencies and configure env"
```

---

### Task 2: Create Supabase Database Schema

**Files:**
- Create: `supabase/schema.sql` (reference file, applied via Supabase dashboard)

**Step 1: Write the SQL schema**

Create `supabase/schema.sql` with the full database setup. This file is applied via the Supabase SQL Editor, not programmatically.

```sql
-- Enable UUID extension (usually already enabled)
create extension if not exists "uuid-ossp";

-- ── Profiles ────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Memorials ───────────────────────────────────────────────────────
create table public.memorials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pet_name text not null,
  pet_type text not null check (pet_type in ('dog', 'cat', 'other')),
  photo_url text not null,
  phrase text not null,
  birth_date date,
  death_date date,
  cloud_id text not null,
  created_at timestamptz default now() not null
);

alter table public.memorials enable row level security;

create policy "Memorials are viewable by everyone"
  on public.memorials for select using (true);

create policy "Users can create own memorials"
  on public.memorials for insert with check (auth.uid() = user_id);

create policy "Users can update own memorials"
  on public.memorials for update using (auth.uid() = user_id);

create policy "Users can delete own memorials"
  on public.memorials for delete using (auth.uid() = user_id);

-- ── Likes ───────────────────────────────────────────────────────────
create table public.likes (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references public.memorials(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now() not null,
  unique(memorial_id, user_id)
);

alter table public.likes enable row level security;

create policy "Likes are viewable by everyone"
  on public.likes for select using (true);

create policy "Users can insert own likes"
  on public.likes for insert with check (auth.uid() = user_id);

create policy "Users can delete own likes"
  on public.likes for delete using (auth.uid() = user_id);

-- ── Candles ─────────────────────────────────────────────────────────
create table public.candles (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references public.memorials(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now() not null,
  unique(memorial_id, user_id)
);

alter table public.candles enable row level security;

create policy "Candles are viewable by everyone"
  on public.candles for select using (true);

create policy "Users can insert own candles"
  on public.candles for insert with check (auth.uid() = user_id);

create policy "Users can delete own candles"
  on public.candles for delete using (auth.uid() = user_id);

-- ── Comments ────────────────────────────────────────────────────────
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  memorial_id uuid not null references public.memorials(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz default now() not null
);

alter table public.comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.comments for select using (true);

create policy "Users can insert own comments"
  on public.comments for insert with check (auth.uid() = user_id);

create policy "Users can delete own comments"
  on public.comments for delete using (auth.uid() = user_id);

-- ── Storage bucket ──────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('memorial-photos', 'memorial-photos', true)
on conflict (id) do nothing;

create policy "Anyone can view memorial photos"
  on storage.objects for select
  using (bucket_id = 'memorial-photos');

create policy "Authenticated users can upload memorial photos"
  on storage.objects for insert
  with check (bucket_id = 'memorial-photos' and auth.role() = 'authenticated');

create policy "Users can delete own memorial photos"
  on storage.objects for delete
  using (bucket_id = 'memorial-photos' and auth.uid()::text = (storage.foldername(name))[1]);
```

**Step 2: Apply schema in Supabase Dashboard**

Go to Supabase Dashboard > SQL Editor, paste the contents, and run.

**Step 3: Commit the reference file**

```bash
git add supabase/schema.sql
git commit -m "feat: add supabase database schema with RLS policies"
```

---

### Task 3: Create Supabase Client Utilities

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/middleware.ts`

**Step 1: Create browser client**

Create `lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 2: Create server client**

Create `lib/supabase/server.ts`:

```typescript
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}
```

**Step 3: Create middleware helper**

Create `lib/supabase/middleware.ts`:

```typescript
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — important for server components
  await supabase.auth.getUser()

  return supabaseResponse
}
```

**Step 4: Commit**

```bash
git add lib/supabase/
git commit -m "feat: add supabase client utilities (browser, server, middleware)"
```

---

### Task 4: Add Next.js Middleware for Session Refresh

**Files:**
- Create: `middleware.ts` (project root)

**Step 1: Create middleware**

Create `middleware.ts` in project root:

```typescript
import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|clouds/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
```

**Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: add next.js middleware for supabase session refresh"
```

---

### Task 5: Create Auth Provider and Hook

**Files:**
- Create: `components/auth/auth-provider.tsx`
- Create: `hooks/use-auth.ts`
- Modify: `app/layout.tsx:35-52`

**Step 1: Create AuthProvider**

Create `components/auth/auth-provider.tsx`:

```typescript
"use client"

import { createContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
```

**Step 2: Create useAuth hook**

Create `hooks/use-auth.ts`:

```typescript
"use client"

import { useContext } from "react"
import { AuthContext, type AuthContextType } from "@/components/auth/auth-provider"

export function useAuth(): AuthContextType {
  return useContext(AuthContext)
}
```

**Step 3: Wrap layout with AuthProvider**

Modify `app/layout.tsx` — wrap `{children}` with `<AuthProvider>`:

```tsx
import { AuthProvider } from "@/components/auth/auth-provider"

// ... existing code ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="it"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, fontDisplay.variable, "font-sans", fontSans.variable)}
    >
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
```

**Step 4: Verify the app still builds**

Run: `npm run build`
Expected: Build succeeds with no errors.

**Step 5: Commit**

```bash
git add components/auth/auth-provider.tsx hooks/use-auth.ts app/layout.tsx
git commit -m "feat: add auth provider and useAuth hook"
```

---

### Task 6: Create Auth Modal Component

**Files:**
- Create: `components/auth/auth-modal.tsx`

**Step 1: Create the auth modal**

This is a dialog with two tabs (Login / Registrazione). It uses existing shadcn/ui components: `Dialog`, `Tabs`, `Input`, `Button`, `Label`.

Create `components/auth/auth-modal.tsx`:

```tsx
"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuthSuccess: () => void
}

export function AuthModal({ open, onOpenChange, onAuthSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<string>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const supabase = createClient()

  function resetForm() {
    setEmail("")
    setPassword("")
    setDisplayName("")
    setError("")
    setLoading(false)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email o password non corretti"
          : error.message
      )
      setLoading(false)
      return
    }

    toast.success("Accesso effettuato!")
    resetForm()
    onAuthSuccess()
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("La password deve avere almeno 6 caratteri")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || email.split("@")[0] },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    toast.success("Registrazione completata!")
    resetForm()
    onAuthSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o) }}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {tab === "login" ? "Bentornato" : "Crea un account"}
          </DialogTitle>
          <DialogDescription>
            {tab === "login"
              ? "Accedi per confermare il tuo memoriale"
              : "Registrati per creare e gestire i tuoi memoriali"}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => { setTab(v); setError("") }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Accedi</TabsTrigger>
            <TabsTrigger value="register">Registrati</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="la-tua@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="La tua password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                Accedi
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Il tuo nome</Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="Come ti chiami?"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="la-tua@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Minimo 6 caratteri"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                Registrati
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 2: Commit**

```bash
git add components/auth/auth-modal.tsx
git commit -m "feat: add auth modal with login/register tabs"
```

---

### Task 7: Rewrite Memorial Data Layer for Supabase

**Files:**
- Modify: `lib/memorials.ts` (full rewrite)

**Step 1: Rewrite `lib/memorials.ts`**

Replace the entire file. The interface changes: `photo` becomes `photo_url` (snake_case to match DB), and all functions become async.

```typescript
import { createClient } from "@/lib/supabase/client"
import { CLOUD_SPOTS } from "./cloud-spots"

export interface Memorial {
  id: string
  user_id: string
  pet_name: string
  pet_type: "dog" | "cat" | "other"
  photo_url: string
  phrase: string
  birth_date: string | null
  death_date: string | null
  cloud_id: string
  created_at: string
}

export async function getMemorials(): Promise<Memorial[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("memorials")
    .select("*")
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching memorials:", error)
    return []
  }
  return data as Memorial[]
}

export async function getMemorial(id: string): Promise<Memorial | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("memorials")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return null
  return data as Memorial
}

export async function saveMemorial(
  memorial: Omit<Memorial, "id" | "created_at">
): Promise<Memorial | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("memorials")
    .insert(memorial)
    .select()
    .single()

  if (error) {
    console.error("Error saving memorial:", error)
    return null
  }
  return data as Memorial
}

export async function deleteMemorial(id: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from("memorials").delete().eq("id", id)
  return !error
}

export async function getOccupiedCloudIds(): Promise<Set<string>> {
  const memorials = await getMemorials()
  return new Set(memorials.map((m) => m.cloud_id))
}

export async function uploadMemorialPhoto(
  userId: string,
  file: File
): Promise<string | null> {
  const supabase = createClient()
  const ext = file.name.split(".").pop() || "jpg"
  const path = `${userId}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from("memorial-photos")
    .upload(path, file)

  if (error) {
    console.error("Error uploading photo:", error)
    return null
  }

  const { data } = supabase.storage
    .from("memorial-photos")
    .getPublicUrl(path)

  return data.publicUrl
}
```

**Step 2: Commit**

```bash
git add lib/memorials.ts
git commit -m "feat: rewrite memorials data layer for supabase"
```

---

### Task 8: Rewrite Interactions Data Layer for Supabase

**Files:**
- Modify: `lib/interactions.ts` (full rewrite)

**Step 1: Rewrite `lib/interactions.ts`**

Replace the entire file. All functions become async. The `authorName` field on comments is replaced by `user_id` (display name fetched via join).

```typescript
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"
import { it } from "date-fns/locale"

// ── Types ──────────────────────────────────────────────────────────

export interface LikeData {
  count: number
  likedByCurrentUser: boolean
}

export interface CandleData {
  count: number
  litByCurrentUser: boolean
}

export interface Comment {
  id: string
  user_id: string
  author_name: string
  text: string
  created_at: string
}

export interface InteractionCounts {
  likes: number
  candles: number
  comments: number
}

// ── Likes ──────────────────────────────────────────────────────────

export async function getLikes(
  memorialId: string,
  userId: string | null
): Promise<LikeData> {
  const supabase = createClient()

  const { count } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("memorial_id", memorialId)

  let likedByCurrentUser = false
  if (userId) {
    const { data } = await supabase
      .from("likes")
      .select("id")
      .eq("memorial_id", memorialId)
      .eq("user_id", userId)
      .maybeSingle()
    likedByCurrentUser = !!data
  }

  return { count: count ?? 0, likedByCurrentUser }
}

export async function toggleLike(
  memorialId: string,
  userId: string
): Promise<LikeData> {
  const supabase = createClient()

  // Check if already liked
  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("memorial_id", memorialId)
    .eq("user_id", userId)
    .maybeSingle()

  if (existing) {
    await supabase.from("likes").delete().eq("id", existing.id)
  } else {
    await supabase
      .from("likes")
      .insert({ memorial_id: memorialId, user_id: userId })
  }

  return getLikes(memorialId, userId)
}

// ── Candles ─────────────────────────────────────────────────────────

export async function getCandle(
  memorialId: string,
  userId: string | null
): Promise<CandleData> {
  const supabase = createClient()

  const { count } = await supabase
    .from("candles")
    .select("*", { count: "exact", head: true })
    .eq("memorial_id", memorialId)

  let litByCurrentUser = false
  if (userId) {
    const { data } = await supabase
      .from("candles")
      .select("id")
      .eq("memorial_id", memorialId)
      .eq("user_id", userId)
      .maybeSingle()
    litByCurrentUser = !!data
  }

  return { count: count ?? 0, litByCurrentUser }
}

export async function lightCandle(
  memorialId: string,
  userId: string
): Promise<CandleData> {
  const supabase = createClient()

  // Candle is one-time: check if already lit
  const { data: existing } = await supabase
    .from("candles")
    .select("id")
    .eq("memorial_id", memorialId)
    .eq("user_id", userId)
    .maybeSingle()

  if (!existing) {
    await supabase
      .from("candles")
      .insert({ memorial_id: memorialId, user_id: userId })
  }

  return getCandle(memorialId, userId)
}

// ── Comments ────────────────────────────────────────────────────────

export async function getComments(memorialId: string): Promise<Comment[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("comments")
    .select("id, user_id, text, created_at, profiles(display_name)")
    .eq("memorial_id", memorialId)
    .order("created_at", { ascending: false })

  if (error || !data) return []

  return data.map((c: any) => ({
    id: c.id,
    user_id: c.user_id,
    author_name: c.profiles?.display_name || "Anonimo",
    text: c.text,
    created_at: c.created_at,
  }))
}

export async function addComment(
  memorialId: string,
  userId: string,
  text: string
): Promise<Comment | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("comments")
    .insert({
      memorial_id: memorialId,
      user_id: userId,
      text: text.trim().slice(0, 500),
    })
    .select("id, user_id, text, created_at, profiles(display_name)")
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    user_id: data.user_id,
    author_name: (data as any).profiles?.display_name || "Anonimo",
    text: data.text,
    created_at: data.created_at,
  }
}

// ── Aggregate counts ───────────────────────────────────────────────

export async function getInteractionCounts(
  memorialId: string
): Promise<InteractionCounts> {
  const supabase = createClient()

  const [likes, candles, comments] = await Promise.all([
    supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("memorial_id", memorialId),
    supabase
      .from("candles")
      .select("*", { count: "exact", head: true })
      .eq("memorial_id", memorialId),
    supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("memorial_id", memorialId),
  ])

  return {
    likes: likes.count ?? 0,
    candles: candles.count ?? 0,
    comments: comments.count ?? 0,
  }
}

// ── Relative time formatting ────────────────────────────────────────

export function formatRelativeTime(isoDate: string): string {
  return formatDistanceToNow(new Date(isoDate), { addSuffix: true, locale: it })
}
```

**Step 2: Commit**

```bash
git add lib/interactions.ts
git commit -m "feat: rewrite interactions data layer for supabase"
```

---

### Task 9: Update StepPhoto for Supabase Storage

**Files:**
- Modify: `components/memorial/step-photo.tsx`

**Step 1: Modify StepPhoto to store File instead of base64**

The stepper data now stores a `File` object in memory (not persisted). The actual upload happens at creation time. We need to change the `StepperData` interface too (done in Task 10), but for this step, `StepPhoto` needs to expose the raw `File` via a callback.

Update the `StepperData` interface in `components/memorial/stepper.tsx` to include `photoFile`:

The `StepPhoto` component already works fine as-is for preview (using FileReader for the preview image). The key change is: also pass the `File` object back so it can be uploaded later.

Modify `components/memorial/step-photo.tsx` to pass the File through:

Change the interface: the parent now also receives a `photoFile` callback.

```tsx
"use client"

import { useCallback, useRef } from "react"
import { ImagePlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { StepperData } from "./stepper"

interface StepPhotoProps {
  data: StepperData
  onChange: (d: Partial<StepperData>) => void
  onFileSelect: (file: File | null) => void
}

export function StepPhoto({ data, onChange, onFileSelect }: StepPhotoProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return
      onFileSelect(file)
      const reader = new FileReader()
      reader.onload = () => {
        onChange({ photo: reader.result as string })
      }
      reader.readAsDataURL(file)
    },
    [onChange, onFileSelect]
  )

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleRemove() {
    onChange({ photo: "" })
    onFileSelect(null)
  }

  if (data.photo) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <img
            src={data.photo}
            alt="Foto del tuo compagno"
            className="h-64 w-64 rounded-2xl object-cover shadow-lg"
          />
          <Button
            variant="destructive"
            size="icon-sm"
            className="absolute -right-2 -top-2 rounded-full"
            onClick={handleRemove}
          >
            <X className="size-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">Una foto bellissima!</p>
      </div>
    )
  }

  return (
    <div
      className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-muted/30 p-12 text-center transition-colors hover:border-primary/60 hover:bg-muted/50"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <ImagePlus className="mb-4 size-16 text-muted-foreground" />
      <p className="text-lg font-medium text-foreground">
        Trascina qui una foto
      </p>
      <p className="mt-2 text-base text-muted-foreground">
        oppure clicca per sceglierla dal tuo dispositivo
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/memorial/step-photo.tsx
git commit -m "feat: update step-photo to pass File for supabase upload"
```

---

### Task 10: Update Memorial Stepper with Auth Gate

**Files:**
- Modify: `components/memorial/stepper.tsx` (significant changes)

**Step 1: Rewrite the stepper**

The stepper now:
1. Holds a `photoFile: File | null` in state
2. On "Crea memoriale" click, checks auth status
3. If not authenticated, shows AuthModal
4. After auth (or if already authed), uploads photo and saves memorial

```tsx
"use client"

import { useState, useRef } from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { StepCompanion } from "./step-companion"
import { StepPhoto } from "./step-photo"
import { StepMemory } from "./step-memory"
import { saveMemorial, getOccupiedCloudIds, uploadMemorialPhoto } from "@/lib/memorials"
import { getNextAvailableCloudId } from "@/lib/cloud-spots"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { AuthModal } from "@/components/auth/auth-modal"
import { toast } from "sonner"

export interface StepperData {
  petName: string
  petType: "dog" | "cat" | "other"
  photo: string  // base64 preview only
  phrase: string
  birthDate: string
  deathDate: string
}

const STEP_TITLES = [
  "Il tuo compagno",
  "Una foto",
  "Un ricordo",
]

export function MemorialStepper() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<StepperData>({
    petName: "",
    petType: "dog",
    photo: "",
    phrase: "",
    birthDate: "",
    deathDate: "",
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const pendingCreateRef = useRef(false)

  const progress = ((step + 1) / 3) * 100

  function updateData(partial: Partial<StepperData>) {
    setData((prev) => ({ ...prev, ...partial }))
  }

  function canAdvance(): boolean {
    switch (step) {
      case 0: return data.petName.trim().length > 0
      case 1: return data.photo.length > 0
      case 2: return data.phrase.trim().length > 0
      default: return false
    }
  }

  async function performCreate(userId: string) {
    setIsSaving(true)
    try {
      // Upload photo
      if (!photoFile) {
        toast.error("Nessuna foto selezionata")
        setIsSaving(false)
        return
      }

      const photoUrl = await uploadMemorialPhoto(userId, photoFile)
      if (!photoUrl) {
        toast.error("Errore durante il caricamento della foto")
        setIsSaving(false)
        return
      }

      // Get next cloud
      const occupied = await getOccupiedCloudIds()
      const cloudId = getNextAvailableCloudId(occupied)
      if (!cloudId) {
        toast.error("Non ci sono piu nuvole disponibili nel paradiso")
        setIsSaving(false)
        return
      }

      // Save memorial
      const memorial = await saveMemorial({
        user_id: userId,
        pet_name: data.petName.trim(),
        pet_type: data.petType,
        photo_url: photoUrl,
        phrase: data.phrase.trim(),
        birth_date: data.birthDate || null,
        death_date: data.deathDate || null,
        cloud_id: cloudId,
      })

      if (!memorial) {
        toast.error("Errore durante la creazione del memoriale")
        setIsSaving(false)
        return
      }

      setIsComplete(true)
      setTimeout(() => {
        router.push("/paradiso")
      }, 2500)
    } catch {
      toast.error("Si e verificato un errore")
      setIsSaving(false)
    }
  }

  function handleCreate() {
    if (user) {
      performCreate(user.id)
    } else {
      pendingCreateRef.current = true
      setShowAuth(true)
    }
  }

  function handleAuthSuccess() {
    setShowAuth(false)
    // Auth state updates async — use a small delay to let AuthProvider update
    setTimeout(async () => {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { data: { user: freshUser } } = await supabase.auth.getUser()
      if (freshUser && pendingCreateRef.current) {
        pendingCreateRef.current = false
        performCreate(freshUser.id)
      }
    }, 100)
  }

  if (isComplete) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-6">
        <div className="animate-bounce mb-6">
          <Sparkles className="size-16 text-oro-antico" />
        </div>
        <h2 className="font-display text-3xl font-bold text-foreground">
          {data.petName} e nel paradiso
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Il suo memoriale e stato creato. Ti portiamo a visitarlo...
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto max-w-xl px-6 py-8">
        <div className="mb-2 text-center">
          <span className="text-sm font-medium text-muted-foreground">
            Passo {step + 1} di 3
          </span>
        </div>
        <Progress value={progress} className="mb-8 h-2" />

        <h2 className="font-display text-center text-2xl font-bold text-foreground md:text-3xl mb-8">
          {STEP_TITLES[step]}
        </h2>

        <div className="min-h-[300px]">
          {step === 0 && <StepCompanion data={data} onChange={updateData} />}
          {step === 1 && (
            <StepPhoto
              data={data}
              onChange={updateData}
              onFileSelect={setPhotoFile}
            />
          )}
          {step === 2 && <StepMemory data={data} onChange={updateData} />}
        </div>

        <div className="mt-8 flex justify-between gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0 || isSaving}
            className="h-12 px-6 text-base"
          >
            <ArrowLeft className="size-5" />
            Indietro
          </Button>

          {step < 2 ? (
            <Button
              size="lg"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance()}
              className="h-12 px-6 text-base"
            >
              Avanti
              <ArrowRight className="size-5" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleCreate}
              disabled={!canAdvance() || isSaving}
              className="h-12 px-8 text-base bg-oro-antico text-white hover:bg-oro-antico/90"
            >
              {isSaving ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Sparkles className="size-5" />
              )}
              {isSaving ? "Creazione..." : "Crea memoriale"}
            </Button>
          )}
        </div>
      </div>

      <AuthModal
        open={showAuth}
        onOpenChange={setShowAuth}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  )
}
```

**Step 2: Commit**

```bash
git add components/memorial/stepper.tsx
git commit -m "feat: add auth gate to memorial creation stepper"
```

---

### Task 11: Update Memorial Interactions for Supabase

**Files:**
- Modify: `components/memorial/memorial-interactions.tsx`

**Step 1: Rewrite interactions component for async Supabase calls**

The component now uses `useAuth` to get the current user, and calls the async interaction functions. Unauthenticated users see counts but can't interact (or get prompted to login).

```tsx
"use client"

import { useEffect, useState } from "react"
import {
  Heart,
  Flame,
  Star,
  MessageCircle,
  Send,
  User,
  LogIn,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  type LikeData,
  type CandleData,
  type Comment,
  getLikes,
  toggleLike,
  getCandle,
  lightCandle,
  getComments,
  addComment,
  formatRelativeTime,
} from "@/lib/interactions"
import { useAuth } from "@/hooks/use-auth"
import { AuthModal } from "@/components/auth/auth-modal"

interface MemorialInteractionsProps {
  memorialId: string
  petName: string
}

export function MemorialInteractions({
  memorialId,
  petName,
}: MemorialInteractionsProps) {
  const { user } = useAuth()
  const [likeData, setLikeData] = useState<LikeData>({ count: 0, likedByCurrentUser: false })
  const [candleData, setCandleData] = useState<CandleData>({ count: 0, litByCurrentUser: false })
  const [comments, setComments] = useState<Comment[]>([])
  const [showCandle, setShowCandle] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    async function load() {
      const [likes, candle, commentList] = await Promise.all([
        getLikes(memorialId, user?.id ?? null),
        getCandle(memorialId, user?.id ?? null),
        getComments(memorialId),
      ])
      setLikeData(likes)
      setCandleData(candle)
      setShowCandle(candle.litByCurrentUser)
      setComments(commentList)
    }
    load()
  }, [memorialId, user?.id])

  function requireAuth(action: () => void) {
    if (!user) {
      setShowAuth(true)
      return
    }
    action()
  }

  async function handleLike() {
    requireAuth(async () => {
      const updated = await toggleLike(memorialId, user!.id)
      setLikeData(updated)
      if (updated.likedByCurrentUser) {
        toast(`Un cuore per ${petName}`)
      }
    })
  }

  async function handleCandle() {
    requireAuth(async () => {
      if (candleData.litByCurrentUser) return
      const updated = await lightCandle(memorialId, user!.id)
      setCandleData(updated)
      setShowCandle(true)
      toast("La tua luce riscalda il suo ricordo")
    })
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault()
    requireAuth(async () => {
      if (!commentText.trim()) return
      const comment = await addComment(memorialId, user!.id, commentText)
      if (comment) {
        setComments((prev) => [comment, ...prev])
        setCommentText("")
        toast("Pensiero condiviso")
      }
    })
  }

  return (
    <>
      <div className="flex w-full flex-col items-center gap-8">
        {/* Decorative separator */}
        <div className="flex w-full items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-rosa-aurora/30" />
          <Star className="size-4 text-oro-antico" />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-rosa-aurora/30" />
        </div>

        {/* Like + Candle buttons */}
        <div className="flex items-center justify-center gap-6">
          {/* Like button */}
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium backdrop-blur-sm transition-all",
              likeData.likedByCurrentUser
                ? "bg-rosa-aurora/20 ring-2 ring-rosa-aurora/30"
                : "bg-card/60 hover:bg-card/80"
            )}
          >
            <Heart
              className={cn(
                "size-5 transition-colors",
                likeData.likedByCurrentUser
                  ? "fill-rosa-aurora text-rosa-aurora"
                  : "text-muted-foreground"
              )}
            />
            <span>{likeData.count}</span>
            <span className="text-muted-foreground">
              {likeData.count === 1 ? "cuore" : "cuori"}
            </span>
          </button>

          {/* Candle button */}
          <button
            onClick={handleCandle}
            className={cn(
              "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium backdrop-blur-sm transition-all",
              candleData.litByCurrentUser
                ? "bg-oro-antico/20 ring-2 ring-oro-antico/30"
                : "bg-card/60 hover:bg-card/80"
            )}
          >
            <Flame
              className={cn(
                "size-5 transition-colors",
                candleData.litByCurrentUser
                  ? "animate-pulse fill-oro-antico text-oro-antico"
                  : "text-muted-foreground"
              )}
            />
            <span>{candleData.count}</span>
            <span className="text-muted-foreground">
              {candleData.count === 1 ? "candela" : "candele"}
            </span>
          </button>
        </div>

        {/* Candle animation */}
        {showCandle && (
          <div className="flex animate-fade-up flex-col items-center gap-3">
            <div className="relative flex items-center justify-center">
              <div className="absolute size-20 rounded-full bg-oro-antico/20 blur-xl" />
              <span className="relative animate-float text-5xl">🕯️</span>
            </div>
            <p className="text-sm italic text-muted-foreground">
              Una luce accesa in memoria di {petName}
            </p>
          </div>
        )}

        {/* Comments section */}
        <div className="w-full space-y-6">
          {/* Heading */}
          <div className="flex items-center justify-center gap-2 lg:justify-start">
            <MessageCircle className="size-5 text-muted-foreground" />
            <h3 className="font-display text-xl font-bold">Pensieri e ricordi</h3>
            {comments.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {comments.length}
              </Badge>
            )}
          </div>

          {/* Comment form */}
          {user ? (
            <form
              onSubmit={handleComment}
              className="rounded-2xl bg-card/60 p-6 shadow-sm backdrop-blur-sm"
            >
              <div className="space-y-4">
                <Textarea
                  placeholder={`Scrivi un pensiero per ${petName}...`}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  maxLength={500}
                  className="min-h-24 bg-white/50"
                />
                <Button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="w-full"
                >
                  <Send className="size-4" />
                  Invia pensiero
                </Button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-card/60 p-6 text-sm text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-card/80"
            >
              <LogIn className="size-4" />
              Accedi per lasciare un pensiero
            </button>
          )}

          {/* Comment list */}
          {comments.length > 0 && (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="animate-fade-up rounded-xl bg-card/60 p-4 backdrop-blur-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-celeste-paradiso/30">
                      <User className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium">
                          {comment.author_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(comment.created_at)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AuthModal
        open={showAuth}
        onOpenChange={setShowAuth}
        onAuthSuccess={() => setShowAuth(false)}
      />
    </>
  )
}
```

**Step 2: Commit**

```bash
git add components/memorial/memorial-interactions.tsx
git commit -m "feat: update interactions component for supabase with auth"
```

---

### Task 12: Update Memorial Detail Page

**Files:**
- Modify: `app/memoriale/[id]/page.tsx`

**Step 1: Rewrite memorial detail page for async data + owner controls**

The page now fetches data from Supabase and shows edit/delete buttons if the current user owns the memorial.

```tsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getMemorial, deleteMemorial, type Memorial } from "@/lib/memorials"
import { Button } from "@/components/ui/button"
import { DecorativeClouds } from "@/components/paradise/cloud-overlay"
import { Rainbow } from "@/components/paradise/rainbow"
import Link from "next/link"
import { ArrowLeft, MapPin, Calendar, Heart, Trash2 } from "lucide-react"
import { MemorialInteractions } from "@/components/memorial/memorial-interactions"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function MemorialePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const [memorial, setMemorial] = useState<Memorial | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      const m = await getMemorial(id)
      if (m) {
        setMemorial(m)
      } else {
        setNotFound(true)
      }
    }
    load()
  }, [id])

  async function handleDelete() {
    if (!memorial) return
    const success = await deleteMemorial(memorial.id)
    if (success) {
      toast.success("Memoriale eliminato")
      router.push("/paradiso")
    } else {
      toast.error("Errore durante l'eliminazione")
    }
  }

  const isOwner = user && memorial && user.id === memorial.user_id

  if (notFound) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-3xl font-bold">Memoriale non trovato</h1>
        <p className="mt-4 text-muted-foreground">
          Questo memoriale potrebbe essere stato rimosso o il link non e corretto.
        </p>
        <Button asChild className="mt-8">
          <Link href="/paradiso">Vai al paradiso</Link>
        </Button>
      </div>
    )
  }

  if (!memorial) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="relative min-h-svh bg-gradient-to-b from-[#A8DEF0] via-background to-[#E8F6FE]">
      <DecorativeClouds />
      <Rainbow className="pointer-events-none absolute -right-20 top-0 h-[400px] w-[600px] opacity-30" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link href="/paradiso">
              <ArrowLeft className="size-4" />
              Torna al paradiso
            </Link>
          </Button>

          {isOwner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="size-4" />
                  Elimina
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Eliminare il memoriale?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Questa azione non puo essere annullata. Il memoriale di {memorial.pet_name} verra rimosso per sempre.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Elimina
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr,400px] lg:gap-14">
          {/* Left column — pet info */}
          <div className="flex flex-col items-center text-center">
            {/* Photo */}
            <div className="overflow-hidden rounded-3xl border-4 border-white shadow-xl ring-4 ring-rosa-aurora/20">
              <img
                src={memorial.photo_url}
                alt={memorial.pet_name}
                className="h-72 w-72 object-cover"
              />
            </div>

            {/* Name */}
            <h1 className="mt-8 font-display text-4xl font-bold text-foreground md:text-5xl">
              {memorial.pet_name}
            </h1>

            {/* Type badge */}
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-rosa-aurora/20 px-4 py-1.5 text-sm font-medium text-primary">
              <Heart className="size-4 fill-current" />
              {memorial.pet_type === "dog" ? "Cane" : memorial.pet_type === "cat" ? "Gatto" : "Animale"}
            </div>

            {/* Dates */}
            {(memorial.birth_date || memorial.death_date) && (
              <div className="mt-6 flex flex-wrap justify-center gap-6 text-muted-foreground">
                {memorial.birth_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    <span>Nato il {new Date(memorial.birth_date).toLocaleDateString("it-IT")}</span>
                  </div>
                )}
                {memorial.death_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    <span>Scomparso il {new Date(memorial.death_date).toLocaleDateString("it-IT")}</span>
                  </div>
                )}
              </div>
            )}

            {/* Memory phrase */}
            <blockquote className="mt-10 max-w-lg rounded-2xl bg-card/60 p-8 text-center text-xl italic leading-relaxed text-foreground shadow-sm backdrop-blur-sm">
              &ldquo;{memorial.phrase}&rdquo;
            </blockquote>

            {/* Map link */}
            <div className="mt-10">
              <Button asChild variant="outline" size="lg" className="h-12 px-8">
                <Link href="/paradiso">
                  <MapPin className="size-5" />
                  Visita nel paradiso
                </Link>
              </Button>
            </div>
          </div>

          {/* Right column — interactions (sticky on desktop) */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <MemorialInteractions memorialId={memorial.id} petName={memorial.pet_name} />
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add app/memoriale/\\[id\\]/page.tsx
git commit -m "feat: update memorial detail page for supabase with owner controls"
```

---

### Task 13: Update Paradise Map for Async Data

**Files:**
- Modify: `components/paradise/paradise-map.tsx`

**Step 1: Update ParadiseMap to use async data fetching**

The key changes:
- `getMemorials()` is now async
- `getInteractionCounts()` is now async
- Memorial fields use snake_case (`pet_name`, `photo_url`, `cloud_id`, `pet_type`, `birth_date`, `death_date`)

Update the `InteractionBadges` component and `ParadiseMap`:

In `paradise-map.tsx`, make these changes:

1. `useEffect` calls `getMemorials()` with `await`
2. `InteractionBadges` uses async `getInteractionCounts`
3. All field references change from camelCase to snake_case

This is a field rename throughout the file:
- `m.petName` → `m.pet_name`
- `m.photo` → `m.photo_url`
- `m.petType` → `m.pet_type`
- `m.cloudId` → `m.cloud_id`
- `m.birthDate` → `m.birth_date`
- `m.deathDate` → `m.death_date`
- `selected.petName` → `selected.pet_name`
- `selected.photo` → `selected.photo_url`
- `selected.petType` → `selected.pet_type`
- `selected.phrase` → `selected.phrase` (unchanged)
- `selected.birthDate` → `selected.birth_date`
- `selected.deathDate` → `selected.death_date`

Update the `useEffect` to async:

```tsx
useEffect(() => {
  getMemorials().then(setMemorials)
}, [])
```

Update `InteractionBadges`:

```tsx
function InteractionBadges({ memorialId }: { memorialId: string }) {
  const [counts, setCounts] = useState<InteractionCounts | null>(null)
  useEffect(() => {
    getInteractionCounts(memorialId).then(setCounts)
  }, [memorialId])

  if (!counts || (counts.likes + counts.candles + counts.comments === 0)) return null

  return (
    <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
      {counts.likes > 0 && <span>❤️ {counts.likes}</span>}
      {counts.candles > 0 && <span>🕯️ {counts.candles}</span>}
      {counts.comments > 0 && <span>💬 {counts.comments}</span>}
    </div>
  )
}
```

Update all field references in the search filter:

```tsx
const filtered = query.trim()
  ? memorials.filter(m =>
      m.pet_name.toLowerCase().includes(query.toLowerCase()) ||
      m.phrase.toLowerCase().includes(query.toLowerCase())
    )
  : memorials
```

And all references in the JSX (search results, dialog content) to use snake_case fields.

**Step 2: Commit**

```bash
git add components/paradise/paradise-map.tsx
git commit -m "feat: update paradise map for async supabase data"
```

---

### Task 14: Update Cloud Overlay for snake_case Memorial fields

**Files:**
- Modify: `components/paradise/cloud-overlay.tsx`

**Step 1: Check and update cloud-overlay.tsx for snake_case field names**

The `MapCloudLayer` component receives `memorials` and uses `cloudId` and `photo` fields from the `Memorial` type. These need to change to `cloud_id` and `photo_url`.

Update all references:
- `m.cloudId` → `m.cloud_id`
- `m.photo` → `m.photo_url`
- `m.petName` → `m.pet_name`

**Step 2: Commit**

```bash
git add components/paradise/cloud-overlay.tsx
git commit -m "feat: update cloud overlay for snake_case memorial fields"
```

---

### Task 15: Add User Menu to Header

**Files:**
- Create: `components/auth/user-menu.tsx`
- Modify: `components/landing/hero.tsx` (add auth button to landing)

**Step 1: Create user menu component**

This shows a login button when logged out, or the user's name + sign out when logged in. It can be placed in the header/nav areas.

Create `components/auth/user-menu.tsx`:

```tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { AuthModal } from "./auth-modal"
import { LogIn, LogOut, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserMenu() {
  const { user, loading, signOut } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  if (loading) return null

  if (!user) {
    return (
      <>
        <Button variant="ghost" size="sm" onClick={() => setShowAuth(true)}>
          <LogIn className="size-4" />
          Accedi
        </Button>
        <AuthModal
          open={showAuth}
          onOpenChange={setShowAuth}
          onAuthSuccess={() => setShowAuth(false)}
        />
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <User className="size-4" />
          {user.user_metadata?.display_name || user.email?.split("@")[0]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="size-4" />
          Esci
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

**Step 2: Commit**

```bash
git add components/auth/user-menu.tsx
git commit -m "feat: add user menu component"
```

---

### Task 16: Build, Test, and Fix

**Step 1: Run typecheck**

Run: `npm run typecheck`

Fix any type errors that come up from the field name changes (camelCase to snake_case).

**Step 2: Run build**

Run: `npm run build`

Fix any build errors.

**Step 3: Manual test checklist**

- [ ] Landing page loads
- [ ] Click "Crea memoriale" → stepper works through 3 steps
- [ ] On step 3, click "Crea memoriale" → auth modal appears (if not logged in)
- [ ] Register a new account → modal closes, memorial gets created
- [ ] Redirect to /paradiso → memorial cloud appears
- [ ] Click memorial cloud → dialog shows with correct data
- [ ] Click "Vedi memoriale completo" → detail page works
- [ ] Like/candle/comment work (require auth)
- [ ] Owner sees delete button on their memorial
- [ ] Log out and back in → memorial still there
- [ ] Different browser → memorial visible, interactions work

**Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve build and type errors from supabase migration"
```

---

### Task 17: Final Cleanup — Remove localStorage References

**Step 1: Search for any remaining localStorage usage**

Search for `localStorage` across the codebase. All references should now be gone from `lib/memorials.ts` and `lib/interactions.ts`. If any remain in other files, remove them.

**Step 2: Commit**

```bash
git add -A
git commit -m "chore: remove remaining localStorage references"
```

---

## Summary of All New/Modified Files

### New Files
- `.env.local` (not committed)
- `supabase/schema.sql`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/middleware.ts`
- `middleware.ts`
- `components/auth/auth-provider.tsx`
- `components/auth/auth-modal.tsx`
- `components/auth/user-menu.tsx`
- `hooks/use-auth.ts`

### Modified Files
- `package.json`
- `next.config.mjs`
- `app/layout.tsx`
- `lib/memorials.ts`
- `lib/interactions.ts`
- `components/memorial/stepper.tsx`
- `components/memorial/step-photo.tsx`
- `components/memorial/memorial-interactions.tsx`
- `app/memoriale/[id]/page.tsx`
- `components/paradise/paradise-map.tsx`
- `components/paradise/cloud-overlay.tsx`
