# WARGA v1.5 — Proses Lengkap

1. Jalankan MySQL/MariaDB.
2. Import `database/schema.sql` di phpMyAdmin.
3. Salin `.env.example` menjadi `.env`.
4. Jalankan `npm install`.
5. Jalankan `npm start`.
6. Buka `http://localhost:3000`.

## Modul yang sudah disiapkan
- Dashboard responsif
- Database 4 role
- Data warga
- Jenis surat dan persyaratan
- Pengajuan + riwayat status
- Dokumen pengajuan
- Notifikasi
- Audit log
- Pengaturan instansi/logo
- Live queue
- Aset desa
- Kegiatan
- QR token verifikasi
- PWA/offline shell

## Catatan keamanan
Password pada seed/demo harus menggunakan bcrypt hash nyata. Jangan menyimpan password plaintext.
Fitur tanda tangan elektronik, OCR, GPS tracking, WhatsApp/email, backup/restore dan sinkronisasi offline penuh masih perlu konfigurasi layanan/perangkat sebelum produksi.
