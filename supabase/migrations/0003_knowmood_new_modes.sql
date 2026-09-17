-- 新增兩個遊戲：情緒小偵探 (detective)、情緒在哪裡？(where)
-- 原本的 CHECK 只允許 match / scenario / mimic，新遊戲的作答紀錄會被擋下來。
alter table public.knowmood_attempts
  drop constraint if exists knowmood_attempts_mode_check;

alter table public.knowmood_attempts
  add constraint knowmood_attempts_mode_check
  check (mode in ('match', 'scenario', 'mimic', 'detective', 'where'));
