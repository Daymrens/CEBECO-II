const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.rkeuugbsyggcmlpepaxi:4Y1jaPCQdBO4Xihb@aws-0-eu-west-2.pooler.supabase.com:6543/postgres',
  connectionTimeoutMillis: 10000
});

async function run() {
  const outages = [
    // 1. Bogo City
    { title: 'Scheduled maintenance — San Lorenzo feeder', municipality: 'Bogo City', barangays: ['San Lorenzo'], type: 'scheduled', status: 'scheduled', date: '2026-09-04', start_time: '08:00', end_time: '16:00', reason: 'Scheduled vegetation clearing along San Lorenzo distribution feeder.' },
    { title: 'Emergency — fallen tree on line, Guadalupe', municipality: 'Bogo City', barangays: ['Guadalupe', 'Lib-tong'], type: 'emergency', status: 'ongoing', date: '2026-09-02', start_time: '10:15', end_time: null, reason: 'Storm-damaged tree collapsed on power line. Crew dispatched.', source: 'facebook', source_url: 'https://www.facebook.com/cebeco2.official' },
    { title: 'Brownout — Nailon transformer upgrade', municipality: 'Bogo City', barangays: ['Nailon'], type: 'brownout', status: 'restored', date: '2026-08-31', start_time: '07:00', end_time: '14:00', reason: 'Distribution transformer replaced. Power restored ahead of schedule.' },

    // 2. Danao City
    { title: 'Scheduled maintenance — Dagohoy line inspection', municipality: 'Danao City', barangays: ['Dagohoy', 'Poblacion'], type: 'scheduled', status: 'scheduled', date: '2026-09-06', start_time: '08:00', end_time: '15:00', reason: 'Annual line inspection and preventive maintenance on Dagohoy circuit.' },
    { title: 'Emergency — Sabang substation fault', municipality: 'Danao City', barangays: ['Sabang'], type: 'emergency', status: 'ongoing', date: '2026-09-02', start_time: '06:45', end_time: null, reason: 'Circuit breaker failure at Sabang substation. Repair team on site.', source: 'facebook', source_url: 'https://www.facebook.com/cebeco2.official' },
    { title: 'Brownout — Abaca load shedding', municipality: 'Danao City', barangays: ['Abaca', 'Poblacion'], type: 'brownout', status: 'restored', date: '2026-08-29', start_time: '12:00', end_time: '17:30', reason: 'Rotational load shedding due to peak demand. Power restored at 17:30.' },

    // 3. Borbon
    { title: 'Scheduled maintenance — Tabunan line clearing', municipality: 'Borbon', barangays: ['Tabunan', 'San Antonio'], type: 'scheduled', status: 'scheduled', date: '2026-09-07', start_time: '07:30', end_time: '14:30', reason: 'Tree trimming and line clearing along Tabunan–San Antonio corridor.' },
    { title: 'Brownout — San Isidro feeder load management', municipality: 'Borbon', barangays: ['San Isidro'], type: 'brownout', status: 'scheduled', date: '2026-09-03', start_time: '13:00', end_time: '18:00', reason: 'Feeder load management to prevent transformer overload.' },

    // 4. Carmen
    { title: 'Scheduled maintenance — Hagnaya feeder', municipality: 'Carmen', barangays: ['Hagnaya', 'San Miguel'], type: 'scheduled', status: 'restored', date: '2026-08-28', start_time: '08:00', end_time: '14:00', reason: 'Feeder maintenance and insulator replacement completed.' },
    { title: 'Emergency — Santa Rosario pole damage', municipality: 'Carmen', barangays: ['Santa Rosario'], type: 'emergency', status: 'ongoing', date: '2026-09-02', start_time: '11:00', end_time: null, reason: 'Concrete pole cracked after vehicle collision. Replacement in progress.', source: 'facebook', source_url: 'https://www.facebook.com/cebeco2.official' },
    { title: 'Brownout — Esperanza scheduled brownout', municipality: 'Carmen', barangays: ['Esperanza'], type: 'brownout', status: 'scheduled', date: '2026-09-05', start_time: '09:00', end_time: '15:00', reason: 'Scheduled brownout for new service connection installation.' },

    // 5. Catmon
    { title: 'Scheduled maintenance — San Antonio line', municipality: 'Catmon', barangays: ['San Antonio', 'Tangob'], type: 'scheduled', status: 'scheduled', date: '2026-09-08', start_time: '07:00', end_time: '16:00', reason: 'Conductor replacement and pole re-alignment on San Antonio line.' },
    { title: 'Emergency — Guimpayan line fault', municipality: 'Catmon', barangays: ['Guimpayan', 'Malilong'], type: 'emergency', status: 'restored', date: '2026-09-01', start_time: '05:30', end_time: '12:00', reason: 'Faulty underground cable located and repaired. Power restored.' },

    // 6. Compostela
    { title: 'Scheduled maintenance — Magay transformer', municipality: 'Compostela', barangays: ['Magay', 'Poblacion'], type: 'scheduled', status: 'scheduled', date: '2026-09-09', start_time: '08:00', end_time: '17:00', reason: 'Distribution transformer replacement and load transfer in Magay.' },
    { title: 'Brownout — San Isidro load management', municipality: 'Compostela', barangays: ['San Isidro', 'Tubod'], type: 'brownout', status: 'restored', date: '2026-08-30', start_time: '10:00', end_time: '16:00', reason: 'Rotational brownout for peak demand management. All areas restored.' },

    // 7. Daanbantayan
    { title: 'Scheduled maintenance — Maya substation', municipality: 'Daanbantayan', barangays: ['Maya', 'Agujo'], type: 'scheduled', status: 'scheduled', date: '2026-09-10', start_time: '06:00', end_time: '16:00', reason: 'Substation preventive maintenance and equipment testing at Maya.' },
    { title: 'Emergency — Malbago line down', municipality: 'Daanbantayan', barangays: ['Malbago', 'Tapilon'], type: 'emergency', status: 'ongoing', date: '2026-09-02', start_time: '08:00', end_time: null, reason: 'High winds brought down distribution line between Malbago and Tapilon.', source: 'facebook', source_url: 'https://www.facebook.com/cebeco2.official' },
    { title: 'Brownout — Agujo scheduled brownout', municipality: 'Daanbantayan', barangays: ['Agujo'], type: 'brownout', status: 'restored', date: '2026-08-27', start_time: '07:00', end_time: '13:00', reason: 'Scheduled brownout for capacitor bank installation. Completed early.' },

    // 8. Medellin
    { title: 'Scheduled maintenance — Cabacongan line', municipality: 'Medellin', barangays: ['Cabacongan', 'Kawit'], type: 'scheduled', status: 'scheduled', date: '2026-09-04', start_time: '08:00', end_time: '15:00', reason: 'Line reconductoring and cross-arm replacement on Cabacongan feeder.' },
    { title: 'Emergency — Poblacion transformer fire', municipality: 'Medellin', barangays: ['Poblacion'], type: 'emergency', status: 'restored', date: '2026-08-29', start_time: '14:30', end_time: '21:00', reason: 'Distribution transformer caught fire. Unit replaced and power restored.' },
    { title: 'Brownout — Tinarga load management', municipality: 'Medellin', barangays: ['Tinarga'], type: 'brownout', status: 'scheduled', date: '2026-09-06', start_time: '12:00', end_time: '17:00', reason: 'Load management brownout during peak summer demand period.' },

    // 9. San Remigio
    { title: 'Scheduled maintenance — San Antonio line clearing', municipality: 'San Remigio', barangays: ['San Antonio', 'Tambongon'], type: 'scheduled', status: 'restored', date: '2026-08-26', start_time: '07:00', end_time: '12:00', reason: 'Vegetation management and line inspection completed ahead of schedule.' },
    { title: 'Emergency — Batad line fault', municipality: 'San Remigio', barangays: ['Batad', 'Foronda'], type: 'emergency', status: 'ongoing', date: '2026-09-02', start_time: '07:15', end_time: null, reason: 'Insulator flashover on Batad–Foronda line. Repair crew dispatched.', source: 'facebook', source_url: 'https://www.facebook.com/cebeco2.official' },

    // 11. Tabogon
    { title: 'Scheduled maintenance — Tabogon Poblacion feeder', municipality: 'Tabogon', barangays: ['Tabogon', 'Poblacion'], type: 'scheduled', status: 'scheduled', date: '2026-09-05', start_time: '08:00', end_time: '16:00', reason: 'Feeder maintenance, fuse replacement, and line inspection.' },
    { title: 'Brownout — Espinosa scheduled brownout', municipality: 'Tabogon', barangays: ['Espinosa', 'San Antonio'], type: 'brownout', status: 'restored', date: '2026-08-28', start_time: '09:00', end_time: '14:00', reason: 'Scheduled brownout for new line tapping. Power restored at 14:00.' },

    // 12. Tabuelan
    { title: 'Scheduled maintenance — Tabuelan–San Bernardo line', municipality: 'Tabuelan', barangays: ['Tabuelan', 'San Bernardo'], type: 'scheduled', status: 'scheduled', date: '2026-09-07', start_time: '07:30', end_time: '15:30', reason: 'Conductor sagging correction and pole treatment on main line.' },
    { title: 'Emergency — Tudela line damage', municipality: 'Tabuelan', barangays: ['Tudela', 'Coin'], type: 'emergency', status: 'ongoing', date: '2026-09-02', start_time: '09:00', end_time: null, reason: 'Excavation damage to underground cable near Tudela. Locating fault.', source: 'facebook', source_url: 'https://www.facebook.com/cebeco2.official' },
    { title: 'Brownout — Coin load management', municipality: 'Tabuelan', barangays: ['Coin'], type: 'brownout', status: 'scheduled', date: '2026-09-09', start_time: '13:00', end_time: '18:00', reason: 'Load management brownout to balance feeder load during peak hours.' },

    // 13. Tuburan
    { title: 'Scheduled maintenance — Armader line inspection', municipality: 'Tuburan', barangays: ['Armader', 'Bakid'], type: 'scheduled', status: 'scheduled', date: '2026-09-08', start_time: '08:00', end_time: '16:00', reason: 'Annual line inspection, insulator washing, and vegetation clearing.' },
    { title: 'Emergency — Lepanto pole collapse', municipality: 'Tuburan', barangays: ['Lepanto'], type: 'emergency', status: 'restored', date: '2026-08-30', start_time: '06:00', end_time: '11:30', reason: 'Wooden pole collapsed due to termites. Pole replaced and re-energized.' },
    { title: 'Brownout — Putat scheduled brownout', municipality: 'Tuburan', barangays: ['Putat', 'Armader'], type: 'brownout', status: 'restored', date: '2026-08-27', start_time: '07:00', end_time: '12:00', reason: 'Scheduled brownout for meter replacement and line upgrade. Completed.' },
  ];

  for (const o of outages) {
    await pool.query(
      `INSERT INTO outages (title, municipality, barangays, type, status, date, start_time, end_time, reason, source, source_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [o.title, o.municipality, o.barangays, o.type, o.status, o.date, o.start_time, o.end_time ?? null, o.reason, o.source ?? 'manual', o.source_url ?? null]
    );
  }

  console.log(`Inserted ${outages.length} outages across ${new Set(outages.map(o => o.municipality)).size} municipalities`);

  const r = await pool.query('SELECT municipality, count(*) as cnt FROM outages GROUP BY municipality ORDER BY municipality');
  console.log('\nOutages per municipality:');
  for (const row of r.rows) {
    console.log(`  ${row.municipality.padEnd(16)} ${row.cnt}`);
  }

  await pool.end();
  console.log('\nDone.');
}

run().catch(e => { console.error('Error:', e.message); pool.end(); process.exit(1); });
