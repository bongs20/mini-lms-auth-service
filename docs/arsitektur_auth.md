# Diagram Alur & Keterbatasan Authentication Service

## 1. Diagram Integrasi Service

```
Client / Frontend / Postman
         │
         ▼
+─────────────────────────────────+
|      API Gateway (:8101)        |
+─────────────────────────────────+
         │
         ├──────────────────────────────────────────────┐
         ▼ (Forward /api/auth/*)                         ▼ (Validasi Token)
+─────────────────────────────────+           +─────────────────────────────+
| Authentication Service (:8102)  |           | Course, Assignment, dll     |
|   - POST /api/auth/login        |           | (Meminta /api/auth/validate |
|   - POST /api/auth/register     |           |  atau verifikasi lokal via  |
|   - POST /api/auth/validate     |           |  JWT shared secret)         |
|   - GET  /api/auth/me           |           +─────────────────────────────+
|   - GET  /health                |
+─────────────────────────────────+
         ▲
         │ (Poll Health)
+─────────────────────────────────+
|    Monitoring Service (:8107)   |
+─────────────────────────────────+
```

## 2. Keterbatasan Implementasi yang Diketahui
1. **Penyimpanan Berbasis Berkas (JSON File)**:
   - Data user disimpan pada file `data/users.json` untuk kemudahan demonstrasi tanpa instalasi DBMS terpisah.
   - Tidak menggunakan ACID transaction seperti database SQL pada tingkat produksi tinggi.
2. **Revokasi Token (Blacklist)**:
   - Token JWT bersifat stateless (berlaku hingga masa kedaluwarsa habis `24h`). Logout hanya dilakukan di sisi client dengan menghapus token lokal.
