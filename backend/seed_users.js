const { query } = require('./db');

async function setup() {
  try {
    await query("INSERT INTO users (name, phone, pin, role) VALUES ('Operator-02', '9876543211', '1234', 'user'), ('Operator-03', '9876543212', '1234', 'user') ON CONFLICT DO NOTHING;");
    console.log('Extra users seeded.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

setup();
