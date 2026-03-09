-- ── Chat Messages ──────────────────────────────────────────────────
-- Run this in the Supabase SQL Editor to create the chat_messages table.
-- Also enable Realtime for this table in Supabase Dashboard:
--   Database → Replication → supabase_realtime → Toggle chat_messages ON

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

-- Index for fetching recent messages efficiently
create index chat_messages_created_at_idx on public.chat_messages (created_at desc);

-- Enable realtime for this table
alter publication supabase_realtime add table public.chat_messages;
