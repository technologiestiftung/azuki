-- backend/eval/migrations/002-drop-criteria.sql
-- Drop the criteria column.
-- Run AFTER the new code is deployed, not before:
-- the running app must already have stopped reading the column.

alter table personas drop column if exists criteria;
