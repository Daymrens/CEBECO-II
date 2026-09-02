const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const pool = new Pool({ connectionString: 'postgresql://postgres.rkeuugbsyggcmlpepaxi:4Y1jaPCQdBO4Xihb@aws-0-eu-west-2.pooler.supabase.com:6543/postgres' });
async function run() {
  const hash = await bcrypt.hash('admin1234', 12);
  await pool.query(`INSERT INTO users (name, email, password_hash, is_admin) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET password_hash = $3`, ['Admin', 'admin@cebeco.example', hash, true]);
  console.log('Admin seeded OK');
  await pool.end();
}
run().catch(e => { console.error(e.message); pool.end(); process.exit(1); });
