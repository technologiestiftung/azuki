-- backend/eval/migrations/005-migrate-secret-talent-to-custom-strengths.sql
-- Migrate profile.secretTalent → customStrengths + selectedCustomStrengths.
-- Run once in the Supabase SQL editor (azuki project) after deploying code that
-- reads customStrengths / selectedCustomStrengths.
--
-- Idempotent: safe to re-run.

-- 1) Legacy secretTalent string → arrays (selected = migrated entry)
update personas
set profile = (profile - 'secretTalent')
  || jsonb_build_object(
       'customStrengths',
       case
         when coalesce(trim(profile->>'secretTalent'), '') <> '' then
           jsonb_build_array(trim(profile->>'secretTalent'))
         else coalesce(profile->'customStrengths', '[]'::jsonb)
       end,
       'selectedCustomStrengths',
       case
         when coalesce(trim(profile->>'secretTalent'), '') <> '' then
           jsonb_build_array(trim(profile->>'secretTalent'))
         else coalesce(
           profile->'selectedCustomStrengths',
           profile->'customStrengths',
           '[]'::jsonb
         )
       end
     )
where profile ? 'secretTalent';

-- 2) Rows already on customStrengths but missing selectedCustomStrengths
update personas
set profile = profile
  || jsonb_build_object(
       'selectedCustomStrengths',
       coalesce(profile->'selectedCustomStrengths', profile->'customStrengths', '[]'::jsonb)
     )
where profile ? 'customStrengths'
  and not profile ? 'selectedCustomStrengths';
