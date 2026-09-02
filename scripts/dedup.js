const { Pool } = require('pg');
const p = new Pool({ connectionString: 'postgresql://postgres.rkeuugbsyggcmlpepaxi:4Y1jaPCQdBO4Xihb@aws-0-eu-west-2.pooler.supabase.com:6543/postgres' });
async function run() {
  const r = await p.query(`
    DELETE FROM outages
    WHERE ctid NOT IN (
      SELECT MIN(ctid) FROM outages GROUP BY title, municipality, date
    )
  `);
  console.log('Deleted', r.rowCount, 'duplicate rows');
  const c = await p.query('SELECT count(*) as c FROM outages');
  console.log('Remaining outages:', c.rows[0].c);
  await p.end();
}
run().catch(e => { console.error(e.message); p.end(); process.exit(1); });
