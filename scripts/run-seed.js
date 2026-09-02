const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({ connectionString: 'postgresql://postgres.rkeuugbsyggcmlpepaxi:4Y1jaPCQdBO4Xihb@aws-0-eu-west-2.pooler.supabase.com:6543/postgres' });
const sql = fs.readFileSync('supabase/seed.sql', 'utf8');
pool.query(sql).then(() => { console.log('Seed applied OK'); pool.end(); }).catch(e => { console.error('Seed error:', e.message); pool.end(); process.exit(1); });