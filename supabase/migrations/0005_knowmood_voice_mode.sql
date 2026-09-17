-- 新增「聲音裡的情緒」(voice) 遊戲，放寬作答紀錄的 mode 限制
alter table public.knowmood_attempts
  drop constraint if exists knowmood_attempts_mode_check;

alter table public.knowmood_attempts
  add constraint knowmood_attempts_mode_check
  check (mode in ('match', 'scenario', 'mimic', 'detective', 'where', 'voice'));
