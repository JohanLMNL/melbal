-- Activer pg_cron
create extension if not exists pg_cron;

-- Créer le job quotidien à 10h heure de France
-- (s'il existe déjà, il sera remplacé)
-- Note : Supabase pg_cron supporte schedule_in_database avec timezone sur certains plans.
-- Sinon, utilisez `select cron.schedule('release-tables-daily', '0 8 * * *', ...);` pour 10h UTC+2 (été)
select cron.schedule_in_database(
  'release-tables-daily',
  '0 10 * * *',
  $$
    update app.tables
    set occupied = false, occupied_by = null
    where occupied = true
  $$,
  'postgres',
  'Europe/Paris'
);
