const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:8102';

async function runTests() {
  console.log(`=== Memulai Uji Otomatis Authentication Service (${BASE_URL}) ===\n`);
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(` [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  // 1. Health check
  await test('GET /health mengembalikan 200 dan healthy', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.status !== 'healthy') throw new Error(`Status tidak healthy: ${data.status}`);
  });

  // 2. Register User Baru
  const testUsername = `user_${Date.now()}`;
  await test('POST /api/auth/register (User Baru) -> 201 Created', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUsername,
        name: 'Tester Otomatis',
        password: 'password123',
        role: 'mahasiswa'
      })
    });
    if (res.status !== 201) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.data.user.id) throw new Error(`Format respons salah`);
  });

  // 3. Register Username Duplikat -> 409 Conflict
  await test('POST /api/auth/register (Duplikat) -> 409 Conflict', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUsername,
        password: 'password123'
      })
    });
    if (res.status !== 409) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.success !== false || data.error.code !== 'username_already_exists') {
      throw new Error(`Error body salah`);
    }
  });

  // 4. Register Field Kosong -> 400 Bad Request
  await test('POST /api/auth/register (Field Kosong) -> 400 Bad Request', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    if (res.status !== 400) throw new Error(`Status ${res.status}`);
  });

  // 5. Login Sukses -> 200 OK & Ambil Token
  let authToken = '';
  await test('POST /api/auth/login (Kredensial Benar) -> 200 OK & Dapat Token', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUsername,
        password: 'password123'
      })
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.data.token) throw new Error(`Token tidak ditemukan dalam response`);
    authToken = data.data.token;
  });

  // 6. Login Gagal / Password Salah -> 401 Unauthorized
  await test('POST /api/auth/login (Password Salah) -> 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUsername,
        password: 'passwordsalah'
      })
    });
    if (res.status !== 401) throw new Error(`Status ${res.status}`);
  });

  // 7. Validate Token Valid -> 200 OK
  await test('POST /api/auth/validate (Token Sah) -> 200 OK', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.data.valid) throw new Error(`Validasi gagal`);
  });

  // 8. Validate Token Palsu -> 401 Unauthorized
  await test('POST /api/auth/validate (Token Palsu) -> 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer token_asal_asalan`
      }
    });
    if (res.status !== 401) throw new Error(`Status ${res.status}`);
  });

  // 9. GET /api/auth/me (Dengan Token Sah) -> 200 OK
  await test('GET /api/auth/me (Dengan Token) -> 200 OK', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.data.user.username !== testUsername) throw new Error(`Data user tidak cocok`);
  });

  // 10. GET /api/auth/me (Tanpa Token) -> 401 Unauthorized
  await test('GET /api/auth/me (Tanpa Token) -> 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`);
    if (res.status !== 401) throw new Error(`Status ${res.status}`);
  });

  console.log(`\n=== Hasil Pengujian: ${passed} Berhasil, ${failed} Gagal ===`);
  if (failed > 0) process.exit(1);
}

runTests();
