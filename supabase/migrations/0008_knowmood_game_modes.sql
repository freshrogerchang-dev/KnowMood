-- 新增動作辨識及五個延伸遊戲的匿名作答統計類型。
alter table public.knowmood_attempts
  drop constraint if exists knowmood_attempts_mode_check;

alter table public.knowmood_attempts
  add constraint knowmood_attempts_mode_check
  check (mode in ('match', 'scenario', 'mimic', 'detective', 'where', 'voice', 'family',
    'bodylang', 'cope', 'eyes', 'social', 'memory', 'cause', 'monster'));
