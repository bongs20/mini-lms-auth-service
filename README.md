# Mini LMS Terdistribusi - Kelompok 1: Authentication Service

Repositori ini berisi implementasi **Authentication Service** untuk sistem terdistribusi Mini LMS, sesuai dengan panduan modul perkuliahan Sistem Terdistribusi.

---

## 1. Identitas Kelompok & Kontribusi
* **Mata Kuliah:** Sistem Terdistribusi (PTIK A)
* **Kelompok:** 1
* **Service:** Authentication Service
* **Port Standar:** `8102`

---

## 2. Fitur & Endpoint Minimum
Service ini menyediakan 5 endpoint lengkap:
1. `GET /health` : Endpoint pemantauan status untuk Monitoring Service (Port 8107).
2. `POST /api/auth/register` : Mendaftarkan user baru (role: `mahasiswa` atau `dosen`).
3. `POST /api/auth/login` : Login kredensial & penerbitan token JWT.
4. `POST /api/auth/validate` : Endpoint verifikasi token bagi API Gateway (Port 8101) atau service lain.
5. `GET /api/auth/me` : Pengambilan data profil pengguna aktif dari Bearer Token.

---

## 3. Prasyarat & Cara Menjalankan

### A. Prasyarat
- Node.js (v18+ atau v20+)
- npm

### B. Menjalankan Service
1. Install dependensi (jika belum):
   ```bash
   npm install
   ```
2. Jalankan service:
   ```bash
   npm start
   ```
   *(Atau untuk development reload otomatis: `npm run dev`)*
3. Service akan berjalan di `http://0.0.0.0:8102`.

### C. Menjalankan Pengujian Mandiri
Jalankan skrip uji otomatis:
```bash
npm test
```

---

## 4. Akun Demo Bawaan
Untuk keperluan demonstrasi dan gladi bersih:
* **Akun Dosen:**
  - Username: `dosen_distribusi`
  - Password: `password123`
* **Akun Mahasiswa:**
  - Username: `mahasiswa01`
  - Password: `password123`

---

## 5. Integrasi Jaringan (Multi-Laptop)
Jika dijalankan terpisah di beberapa laptop:
1. Pastikan terhubung ke satu Wi-Fi yang sama.
2. Cari IP laptop Anda dengan `ipconfig` (Windows) atau `ip a` (Linux), contoh: `192.168.1.15`.
3. Buka port 8102 pada firewall jika diblokir.
4. Berikan alamat `http://192.168.1.15:8102` ke **Kelompok API Gateway (Port 8101)** dan **Kelompok Monitoring (Port 8107)**.

---

## 6. Berkas Terkait
* [API_CONTRACT.md](API_CONTRACT.md) - Rincian kontrak endpoint, request/response, dan HTTP status code.
* [docs/TESTING.md](docs/TESTING.md) - Rangkuman hasil pengujian 10 test case.
* [postman/Mini-LMS-Auth.postman_collection.json](postman/Mini-LMS-Auth.postman_collection.json) - Koleksi Postman siap import.
