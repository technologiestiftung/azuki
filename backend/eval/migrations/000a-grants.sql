-- backend/eval/migrations/000a-grants.sql
-- Grant table privileges to service_role.
-- Safe to run on top of an already-deployed schema.
--
-- Why this exists: when a table is created in Supabase via the SQL editor
-- with RLS enabled, Supabase does not always auto-grant table privileges to
-- service_role. Without this grant, /api/personas* responds with
-- "permission denied for table personas" even though the service role key is
-- correct.
--
-- service_role bypasses RLS entirely, so policies are not needed; the only
-- thing missing is basic SQL privileges.

grant all on table personas to service_role;
