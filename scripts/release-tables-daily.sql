-- Activer pg_cron
create extension if not exists pg_cron;

-- Créer le job quotidien à 10h heure de France en été (UTC+2)
-- pg_cron sur Supabase tourne en UTC : 8h UTC = 10h France en été, 9h en hiver
-- (s'il existe déjà, il sera remplacé)
select cron.schedule(
  'release-tables-daily',
  '0 8 * * *',
  $$
    update app.tables
    set occupied = false, occupied_by = null
    where occupied = true
  $$
);
