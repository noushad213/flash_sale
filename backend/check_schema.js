const { query } = require('./db');

async function check() {
  try {
    const res = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users';");
    console.log('Users Columns:', res.rows.map(r => r.column_name));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
