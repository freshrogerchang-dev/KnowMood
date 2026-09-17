-- 新增「真人表情」(family) 遊戲，放寬作答紀錄的 mode 限制
-- 注意：家人的照片本身完全不經過 Supabase，只有這裡的 emotionId/correct/tries
-- （跟其他遊戲一樣的匿名作答統計）會視雲端同步設定而同步。
alter table public.knowmood_attempts
  drop constraint if exists knowmood_attempts_mode_check;

alter table public.knowmood_attempts
  add constraint knowmood_attempts_mode_check
  check (mode in ('match', 'scenario', 'mimic', 'detective', 'where', 'voice', 'family'));
