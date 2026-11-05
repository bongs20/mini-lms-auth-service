# Laporan Pengujian Authentication Service (Kelompok 1)

## 1. Lingkungan Pengujian
* **Service:** Authentication Service (Kelompok 1)
* **Port:** 8102
* **Host:** 0.0.0.0
* **Alat Pengujian:** Unit test script (`tests/test_api.js`) & Postman Collection (`postman/Mini-LMS-Auth.postman_collection.json`)
* **Waktu Pengujian:** 05 November 2026

---

## 2. Ringkasan Hasil Pengujian

| No | Kasus Uji | Skenario | Endpoint | Status Harapan | Status Aktual | Hasil |
|:--:|:---|:---|:---|:--:|:--:|:---:|
| 1 | Health Check | Monitoring polling status service | `GET /health` | 200 | 200 | **PASS** |
| 2 | Register Baru | Pendaftaran user baru dengan kredensial valid | `POST /api/auth/register` | 201 | 201 | **PASS** |
| 3 | Register Duplikat | Mencoba mendaftar dengan username yang sudah ada | `POST /api/auth/register` | 409 | 409 | **PASS** |
| 4 | Register Bad Request | Body request kosong / field wajib tidak diisi | `POST /api/auth/register` | 400 | 400 | **PASS** |
| 5 | Login Sukses | Kredensial benar, menerbitkan token JWT | `POST /api/auth/login` | 200 | 200 | **PASS** |
| 6 | Login Gagal | Password salah | `POST /api/auth/login` | 401 | 401 | **PASS** |
| 7 | Validasi Token Sah | Token valid dikirim melalui Bearer | `POST /api/auth/validate` | 200 | 200 | **PASS** |
| 8 | Validasi Token Palsu | Token rusak / palsu | `POST /api/auth/validate` | 401 | 401 | **PASS** |
| 9 | Get Profile (Auth) | Akses data profil dengan token sah | `GET /api/auth/me` | 200 | 200 | **PASS** |
| 10 | Get Profile (No Auth)| Akses endpoint tanpa header token | `GET /api/auth/me` | 401 | 401 | **PASS** |

**Total:** 10 Pengujian, 10 Berhasil (100% Pass Rate).

---

## 3. Catatan Respons Standar
Seluruh respons telah mematuhi kontrak bersama:
* Membawa properti `success: true/false`
* Membawa metadata `meta.request_id` (`X-Request-ID` tracing)
* Status HTTP error sesuai spesifikasi modul (400, 401, 409).
