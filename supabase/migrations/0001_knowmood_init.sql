-- KnowMood 雲端同步用的三張表
-- 沿用同一個 Supabase 專案裡既有的「單一家庭、免登入」模式（和 zhuyin_app_* 一致）：
-- RLS 有開，但政策對 anon 開放。資料靠隨機產生的 profile_id 區分不同孩子。
-- ⚠️ 這代表拿到 anon key 的人理論上可以讀到這幾張表的內容，
--    所以請勿在事件描述裡填入真實姓名、學校、地址等個資。
--    若要真正的隔離，請改用 Supabase Auth 匿名登入 + auth.uid() 條件。

-- ---------- 狀態（星星、貼紙、設定） ----------
create table if not exists public.knowmood_state (
  profile_id  uuid primary key,
  child_name  text,
  stars       integer not null default 0,
  stickers    jsonb   not null default '[]'::jsonb,
  settings    jsonb   not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- ---------- 心情日記（事件 + 情緒 + 1-5 強度） ----------
create table if not exists public.knowmood_journal (
  id          uuid primary key,
  profile_id  uuid not null,
  entry_date  date not null,
  event_text  text not null,
  emotion_id  text not null,
  intensity   smallint not null check (intensity between 1 and 5),
  note        text,
  created_at  timestamptz not null default now()
);

create index if not exists knowmood_journal_profile_date_idx
  on public.knowmood_journal (profile_id, entry_date desc);

-- ---------- 練習紀錄（給家長看正確率） ----------
create table if not exists public.knowmood_attempts (
  id          uuid primary key,
  profile_id  uuid not null,
  mode        text not null check (mode in ('match', 'scenario', 'mimic')),
  emotion_id  text not null,
  correct     boolean not null,
  tries       smallint not null default 1,
  created_at  timestamptz not null default now()
);

create index if not exists knowmood_attempts_profile_created_idx
  on public.knowmood_attempts (profile_id, created_at desc);

-- ---------- RLS ----------
alter table public.knowmood_state    enable row level security;
alter table public.knowmood_journal  enable row level security;
alter table public.knowmood_attempts enable row level security;

do $$
declare t text;
begin
  foreach t in array array['knowmood_state', 'knowmood_journal', 'knowmood_attempts'] loop
    execute format('drop policy if exists "public read %1$s"   on public.%1$I', t);
    execute format('drop policy if exists "public insert %1$s" on public.%1$I', t);
    execute format('drop policy if exists "public update %1$s" on public.%1$I', t);
    execute format('drop policy if exists "public delete %1$s" on public.%1$I', t);

    execute format('create policy "public read %1$s"   on public.%1$I for select using (true)', t);
    execute format('create policy "public insert %1$s" on public.%1$I for insert with check (true)', t);
    execute format('create policy "public update %1$s" on public.%1$I for update using (true) with check (true)', t);
    execute format('create policy "public delete %1$s" on public.%1$I for delete using (true)', t);
  end loop;
end $$;
