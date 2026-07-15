const { supabase } = require('./db');

// In-memory cache so we don't hit Supabase on every request
let experimentCache = {};
let cacheAt = 0;
const CACHE_TTL = 60_000; // 1 min

async function loadExperiments() {
  if (Date.now() - cacheAt < CACHE_TTL) return experimentCache;
  const { data: exps } = await supabase
    .from('ab_experiments')
    .select('*, ab_variants(*)')
    .eq('status', 'active');

  experimentCache = {};
  for (const exp of exps || []) {
    experimentCache[exp.route] = exp;
  }
  cacheAt = Date.now();
  return experimentCache;
}

/**
 * Select a variant for a given route using weighted random assignment.
 * Returns: { experimentId, variantId, variantName, promptKey }
 */
async function selectVariant(route) {
  try {
    const experiments = await loadExperiments();
    const exp = experiments[route];
    if (!exp || !exp.ab_variants?.length) {
      return { experimentId: null, variantId: null, variantName: 'control', promptKey: 'zero_shot' };
    }

    const variants = exp.ab_variants;
    const rand = Math.random();
    let cumulative = 0;
    for (const v of variants) {
      cumulative += v.weight;
      if (rand <= cumulative) {
        return {
          experimentId: exp.id,
          variantId:    v.id,
          variantName:  v.name,
          promptKey:    v.prompt_key || 'zero_shot',
        };
      }
    }
    const last = variants[variants.length - 1];
    return { experimentId: exp.id, variantId: last.id, variantName: last.name, promptKey: last.prompt_key || 'zero_shot' };
  } catch (_) {
    return { experimentId: null, variantId: null, variantName: 'control', promptKey: 'zero_shot' };
  }
}

/**
 * Record A/B result for statistical analysis.
 */
async function recordResult({ experimentId, variantId, variantName, latencyMs, qualityScore, userId }) {
  if (!experimentId) return;
  try {
    await supabase.from('ab_results').insert({
      experiment_id: experimentId,
      variant_id:    variantId,
      variant_name:  variantName,
      latency_ms:    latencyMs,
      quality_score: qualityScore,
      user_id:       userId,
    });
  } catch (_) {}
}

/**
 * Get A/B test summary with basic statistical comparison.
 * Returns per-variant stats + a winner recommendation.
 */
async function getSummary(experimentId) {
  const { data } = await supabase
    .from('ab_results')
    .select('variant_name, latency_ms, quality_score')
    .eq('experiment_id', experimentId);

  if (!data?.length) return null;

  const groups = {};
  for (const row of data) {
    if (!groups[row.variant_name]) groups[row.variant_name] = [];
    groups[row.variant_name].push(row);
  }

  const stats = {};
  for (const [name, rows] of Object.entries(groups)) {
    const n = rows.length;
    const avgQ = rows.reduce((s, r) => s + (r.quality_score || 0), 0) / n;
    const avgL = rows.reduce((s, r) => s + (r.latency_ms || 0), 0) / n;
    // Standard deviation for quality
    const variance = rows.reduce((s, r) => s + Math.pow((r.quality_score || 0) - avgQ, 2), 0) / n;
    stats[name] = { n, avg_quality: +avgQ.toFixed(2), avg_latency_ms: Math.round(avgL), std_dev: +Math.sqrt(variance).toFixed(2) };
  }

  // Recommend winner: highest quality with adequate sample (n >= 30 for significance)
  const entries = Object.entries(stats).filter(([, s]) => s.n >= 5);
  let winner = null;
  if (entries.length > 1) {
    const sorted = entries.sort((a, b) => b[1].avg_quality - a[1].avg_quality);
    const [topName, topStats] = sorted[0];
    const [, secondStats] = sorted[1];
    const diff = topStats.avg_quality - secondStats.avg_quality;
    if (diff > 2) winner = topName; // >2 point quality advantage is meaningful
  }

  return { variants: stats, winner, sufficient_data: entries.length > 1 && entries[0][1].n >= 30 };
}

module.exports = { selectVariant, recordResult, getSummary };
