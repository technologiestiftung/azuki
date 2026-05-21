-- backend/eval/migrations/004-rename-work-values-to-work-expectations.sql
-- Rename profile.workValues → profile.workExpectations in stored persona JSON.
-- Run once in the Supabase SQL editor (azuki project) after deploying code that
-- reads workExpectations.
--
-- Idempotent: only updates rows that still have the legacy key.

update personas
set profile = (profile - 'workValues')
  || jsonb_build_object(
       'workExpectations',
       coalesce(profile->'workExpectations', profile->'workValues', '[]'::jsonb)
     )
where profile ? 'workValues';
