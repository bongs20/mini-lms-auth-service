# Kontrak API - Authentication Service (Kelompok 1)

Service ini bertanggung jawab untuk pendaftaran akun, autentikasi (login), penerbitan token JWT, validasi token pengguna, serta health check untuk sistem Mini LMS Terdistribusi.

- **Port Default:** `8102`
- **Host Binding:** `0.0.0.0:8102`
- **Format Pertukaran Data:** `application/json`
- **Tracing Header:** `X-Request-ID` (diteruskan jika ada, atau di-generate otomatis)

---

## Format Standar Respons

### 1. Format Respons Sukses
```json
{
  "success": true,
  "data": {},
  "meta": {
    "request_id": "req-1730780000000-abc123"
  }
}
```

### 2. Format Respons Gagal
```json
{
  "success": false,
  "error": {
    "code": "error_code_identifier",
    "message": "Deskripsi kesalahan yang mudah dipahami"
  },
  "meta": {
    "request_id": "req-1730780000000-abc123"
  }
}
```

---

## Daftar Endpoint

### 1. Health Check
* **Method:** `GET`
* **Path:** `/health`
* **Deskripsi:** Digunakan oleh Monitoring Service & API Gateway untuk mengecek ketersediaan service.
* **Headers:** None
* **Status HTTP:** `200 OK`
* **Response:**
```json
{
  "status": "healthy",
  "service": "authentication-service",
  "timestamp": "2026-11-05T12:00:00.000Z"
}
```

---

### 2. Pendaftaran Pengguna (Register)
* **Method:** `POST`
* **Path:** `/api/auth/register`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "username": "budi_santoso",
  "name": "Budi Santoso",
  "password": "password123",
  "role": "mahasiswa" 
}
```
*(Catatan: `role` dapat bernilai `"mahasiswa"` atau `"dosen"`, default `"mahasiswa"`)*

* **Status HTTP:**
  * `201 Created` - Pengguna berhasil didaftarkan
  * `400 Bad Request` - Field wajib kosong atau format tidak sesuai
  * `409 Conflict` - Username sudah terdaftar

* **Response Sukses (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr-a1b2c3d4",
      "username": "budi_santoso",
      "name": "Budi Santoso",
      "role": "mahasiswa",
      "created_at": "2026-11-05T12:00:00.000Z"
    }
  },
  "meta": {
    "request_id": "req-001"
  }
}
```

* **Response Gagal (`409 Conflict`):**
```json
{
  "success": false,
  "error": {
    "code": "username_already_exists",
    "message": "Username sudah terdaftar"
  },
  "meta": {
    "request_id": "req-001"
  }
}
```

---

### 3. Login Pengguna (Login & Issue Token)
* **Method:** `POST`
* **Path:** `/api/auth/login`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "username": "budi_santoso",
  "password": "password123"
}
```

* **Status HTTP:**
  * `200 OK` - Login berhasil, token JWT diterbitkan
  * `400 Bad Request` - Username atau password tidak diisi
  * `401 Unauthorized` - Kredensial tidak valid (username atau password salah)

* **Response Sukses (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr-a1b2c3d4",
      "username": "budi_santoso",
      "name": "Budi Santoso",
      "role": "mahasiswa"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "meta": {
    "request_id": "req-002"
  }
}
```

---

### 4. Validasi Token (Validate)
* **Method:** `POST`
* **Path:** `/api/auth/validate`
* **Deskripsi:** Endpoint ini dipanggil oleh API Gateway atau service lain untuk memeriksa keabsahan token.
* **Headers:** 
  * `Authorization: Bearer <token>`
  * *(Opsional: body `{"token": "<token>"}` jika tidak memakai header)*
* **Status HTTP:**
  * `200 OK` - Token sah dan masih aktif
  * `401 Unauthorized` - Token tidak ada, tidak valid, atau kedaluwarsa

* **Response Sukses (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": {
      "id": "usr-a1b2c3d4",
      "username": "budi_santoso",
      "name": "Budi Santoso",
      "role": "mahasiswa"
    }
  },
  "meta": {
    "request_id": "req-003"
  }
}
```

---

### 5. Profil Pengguna yang Sedang Login (Me)
* **Method:** `GET`
* **Path:** `/api/auth/me`
* **Headers:** `Authorization: Bearer <token>`
* **Status HTTP:**
  * `200 OK` - Profil berhasil diambil
  * `401 Unauthorized` - Header Authorization tidak ada atau token invalid

* **Response Sukses (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr-a1b2c3d4",
      "username": "budi_santoso",
      "name": "Budi Santoso",
      "role": "mahasiswa"
    }
  },
  "meta": {
    "request_id": "req-004"
  }
}
```
