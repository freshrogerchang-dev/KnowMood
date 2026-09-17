-- 冷靜角：記錄孩子用了哪個工具、做完之後情緒剩幾分。
-- 有了 before / after 才看得出「哪一個策略對這個孩子有效」。
alter table public.knowmood_journal
  add column if not exists calm_tool text,
  add column if not exists after_intensity smallint
    check (after_intensity is null or after_intensity between 1 and 5);
