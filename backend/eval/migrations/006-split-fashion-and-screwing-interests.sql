-- backend/eval/migrations/006-split-fashion-and-screwing-interests.sql
-- "Mode & styling" split into fashion (Mode) + styling; "Schrauben" split into
-- screwing + repairing. Moves personas onto the pill that carries their signal.
-- Run once in the Supabase SQL editor (azuki project) after deploying code that
-- has the styling / repairing interests.
--
-- Idempotent: safe to re-run.

-- 1) Mia (hair-salon Praktikum): fashion → styling, keeping array order
update personas
set
  profile = jsonb_set(
    profile,
    '{interests}',
    (
      select jsonb_agg(
        case when e.value = '"fashion"'::jsonb then '"styling"'::jsonb else e.value end
        order by e.idx
      )
      from jsonb_array_elements(profile->'interests') with ordinality as e(value, idx)
    )
  ),
  description = replace(description, 'fashion/helping/planning', 'styling/helping/planning')
where id = 'mia'
  and profile->'interests' ? 'fashion'
  and not profile->'interests' ? 'styling';

-- 2) Nico (Kfz dropout, likes cars and tools): add repairing
update personas
set profile = jsonb_set(profile, '{interests}', (profile->'interests') || '["repairing"]'::jsonb)
where id = 'nico'
  and not profile->'interests' ? 'repairing';
