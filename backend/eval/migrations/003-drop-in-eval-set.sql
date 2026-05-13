-- backend/eval/migrations/003-drop-in-eval-set.sql
-- Drop the in_eval_set column.
-- Run AFTER the new code is deployed; the running app must already have
-- stopped reading the column.
-- Idempotent: drop index/column "if exists".

drop index if exists personas_in_eval_set_idx;
alter table personas drop column if exists in_eval_set;
