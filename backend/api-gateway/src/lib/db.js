const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getUserFromToken(authHeader) {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const { data: { user } } = await supabase.auth.getUser(token);
  return user?.id ?? null;
}

async function saveAlert(level, title, description, source, reference_id = null) {
  await supabase.from('alerts').insert({ level, title, description, source, reference_id });
}

module.exports = { supabase, getUserFromToken, saveAlert };
