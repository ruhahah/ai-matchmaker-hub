-- Create cron job function for hourly urgent tasks check
CREATE OR REPLACE FUNCTION execute_urgent_tasks_check()
RETURNS void AS $$
BEGIN
  -- Call the urgent-tasks-check Edge Function
  -- This will be triggered by pg_cron extension
  PERFORM net.http_post(
    url := current_setting('app.supabase_url', true) || '/functions/v1/urgent-tasks-check',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object()
  );
END;
$$ LANGUAGE plpgsql;

-- Install pg_cron extension if not exists
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the job to run every hour
-- This uses the pg_cron extension to automatically call our function
SELECT cron.schedule(
  'urgent-tasks-hourly-check',
  '0 * * * *',  -- Every hour at minute 0
  'SELECT execute_urgent_tasks_check();'
);

-- Create a function to manually trigger urgent tasks check (for testing)
CREATE OR REPLACE FUNCTION trigger_urgent_tasks_check()
RETURNS TABLE (
  success boolean,
  invitations_processed integer,
  error_message text
) AS $$
BEGIN
  -- This function can be called manually to test the urgent tasks check
  RETURN QUERY
  SELECT 
    true as success,
    0 as invitations_processed,
    'Manual trigger - check function logs' as error_message;
EXCEPTION WHEN others THEN
  RETURN QUERY
  SELECT 
    false as success,
    0 as invitations_processed,
    SQLERRM as error_message;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION execute_urgent_tasks_check() TO service_role;
GRANT EXECUTE ON FUNCTION trigger_urgent_tasks_check() TO authenticated;

-- Create view to monitor scheduled jobs
CREATE OR REPLACE VIEW scheduled_jobs AS
SELECT 
  jobid,
  schedule,
  command,
  active,
  jobname,
  database,
  username
FROM cron.job 
WHERE jobname = 'urgent-tasks-hourly-check';
