-- 心情日記加上「更精準的說法」欄位
-- 例如：情緒是 happy、強度 5，孩子挑了「興奮」這個詞。
-- 舊資料維持 null，前端會退回顯示核心情緒名稱。
alter table public.knowmood_journal
  add column if not exists word text;
