const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({ connectionString: 'postgresql://postgres:4Y1jaPCQdBO4Xihb@db.rkeuugbsyggcmlpepaxi.supabase.co:5432/postgres' });
const sql = fs.readFileSync('supabase/schema.sql', 'utf8');
pool.query(sql).then(() => { console.log('Schema applied OK'); pool.end(); }).catch(e => { console.error('Schema error:', e.message); pool.end(); process.exit(1); });
