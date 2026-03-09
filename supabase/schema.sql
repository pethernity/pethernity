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

-- ── Chat Messages ─────────────────────────────────────────────────
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null check (char_length(message) <= 500),
  created_at timestamptz default now() not null
);

alter table public.chat_messages enable row level security;

create policy "Chat messages are viewable by everyone"
  on public.chat_messages for select using (true);

create policy "Authenticated users can insert own messages"
  on public.chat_messages for insert with check (auth.uid() = user_id);

create index chat_messages_created_at_idx on public.chat_messages (created_at desc);

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
