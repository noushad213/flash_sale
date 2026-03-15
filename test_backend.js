// Node 22 has global fetch

async function test() {
  try {
    const res = await fetch('http://localhost:3001/health');
    const data = await res.json();
    console.log('Health Check:', data);
  } catch (err) {
    console.error('Backend unreachable:', err.message);
  }
}

test();
