const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres.rkeuugbsyggcmlpepaxi:4Y1jaPCQdBO4Xihb@aws-0-eu-west-2.pooler.supabase.com:6543/postgres' });
async function run() {
  const outages = [
    { title: 'Scheduled maintenance — Poblacion feeder', municipality: 'Sogod', barangays: ['Poblacion','Lubo'], type: 'scheduled', status: 'scheduled', date: '2026-09-05', start_time: '08:00', end_time: '16:00', reason: 'Vegetation clearing along the Poblacion feeder line.' },
    { title: 'Emergency — downed line near Ampongol', municipality: 'Sogod', barangays: ['Ampongol'], type: 'emergency', status: 'ongoing', date: '2026-09-02', start_time: '09:30', end_time: null, reason: 'Storm-damaged line near Ampongol. Crew dispatched.', source: 'facebook', source_url: 'https://www.facebook.com/cebeco2.official' },
    { title: 'Transformer replacement — Bagakay', municipality: 'Sogod', barangays: ['Bagakay','Bawo'], type: 'scheduled', status: 'scheduled', date: '2026-09-08', start_time: '07:00', end_time: '17:00', reason: 'Upgrade of distribution transformer serving Bagakay and Bawo.' },
    { title: 'Substation load management — Mohon', municipality: 'Sogod', barangays: ['Mohon','Pansoy'], type: 'brownout', status: 'scheduled', date: '2026-09-03', start_time: '13:00', end_time: '18:00', reason: 'Substation load management to prevent overload during peak demand.' },
    { title: 'Emergency — equipment failure Tabunok', municipality: 'Sogod', barangays: ['Tabunok'], type: 'emergency', status: 'restored', date: '2026-09-01', start_time: '06:00', end_time: '14:30', reason: 'Faulty switchgear replaced. Power restored at 14:30.' },
    { title: 'Scheduled maintenance — Calumboyan', municipality: 'Sogod', barangays: ['Calumboyan','Liki'], type: 'scheduled', status: 'restored', date: '2026-08-30', start_time: '08:00', end_time: '15:00', reason: 'Line maintenance and tree trimming completed.' },
  ];
  for (const o of outages) {
    await pool.query(
      `INSERT INTO outages (title, municipality, barangays, type, status, date, start_time, end_time, reason, source, source_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [o.title, o.municipality, o.barangays, o.type, o.status, o.date, o.start_time, o.end_time ?? null, o.reason, o.source ?? 'manual', o.source_url ?? null]
    );
  }
  console.log('Real outages seeded:', outages.length);
  await pool.end();
}
run().catch(e => { console.error(e.message); pool.end(); process.exit(1); });
