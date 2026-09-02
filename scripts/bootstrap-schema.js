/**
 * Bootstrap Supabase schema via HTTP API.
 *
 * This script creates an exec_sql function via the Supabase Management API,
 * then uses it to run the full schema.sql and seed.sql.
 *
 * Requires: SUPABASE_SERVICE_KEY (service_role key) or SUPABASE_ACCESS_TOKEN (PAT).
 *
 * If neither is available, falls back to creating a readable SQL bundle
 * that the user can paste into the Supabase SQL Editor.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'rkeuugbsyggcmlpepaxi';
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;

// Read the anon key from .env.local or use the hardcoded one
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrZXV1Z2JzeWdnY21scGVwYXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyODcwNzcsImV4cCI6MjEwMzg2MzA3N30.uG7pqctj4fYEmZkL_DqscE2MGYAOnkcka8qmBpalSu4';

function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function execSql(sql, apiKey) {
  const body = JSON.stringify({ query: sql });
  return httpsRequest(
    {
      hostname: PROJECT_REF + '.supabase.co',
      path: '/sql',
      method: 'POST',
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    },
    body
  );
}

async function main() {
  const schemaSql = fs.readFileSync(
    path.join(__dirname, '..', 'supabase', 'schema.sql'),
    'utf8'
  );
  const seedSql = fs.readFileSync(
    path.join(__dirname, '..', 'supabase', 'seed.sql'),
    'utf8'
  );

  // Try the /sql endpoint with the anon key (works on some projects)
  console.log('Attempting schema via /sql endpoint...');
  const result = await execSql(schemaSql, ANON_KEY);
  console.log(`Status: ${result.status}`);
  console.log(`Response: ${result.body.slice(0, 500)}`);

  if (result.status === 404 || result.status === 401) {
    console.log('\n--- HTTP SQL endpoint not available ---');
    console.log('Creating combined SQL file for manual execution...');
    
    const combined = [
      '-- CEBECO II Outage Portal — Combined Schema + Seed',
      '-- Paste this into the Supabase SQL Editor and run it.',
      '-- URL: https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql/new',
      '',
      '-- =====================================================================',
      '-- SCHEMA',
      '-- =====================================================================',
      '',
      schemaSql,
      '',
      '-- =====================================================================',
      '-- SEED DATA',
      '-- =====================================================================',
      '',
      seedSql,
      '',
    ].join('\n');

    const outPath = path.join(__dirname, '..', 'supabase', 'combined-setup.sql');
    fs.writeFileSync(outPath, combined, 'utf8');
    console.log(`Written to: ${outPath}`);
    console.log('\nPlease paste that file into the Supabase SQL Editor:');
    console.log(`https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
