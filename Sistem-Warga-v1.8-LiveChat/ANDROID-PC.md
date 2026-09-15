# WARGA v1.8 — Android & PC/Laptop

## Cara menjalankan di PC/laptop
1. Install Node.js LTS.
2. Jalankan MySQL/MariaDB dan import `database/schema.sql`, lalu `database/seed.sql` bila diperlukan.
3. Salin `.env.example` menjadi `.env` dan isi koneksi database.
4. Di folder project jalankan `npm install` lalu `npm start`.
5. Buka `http://localhost:3000` pada Chrome/Edge.

## Mengakses dari Android di jaringan lokal
1. PC/laptop dan Android harus berada pada Wi-Fi/LAN yang sama.
2. Jalankan aplikasi pada PC.
3. Cari alamat IPv4 PC, misalnya `192.168.1.20`.
4. Di Android buka `http://192.168.1.20:3000`.
5. Untuk penggunaan rutin, pasang sebagai PWA dari menu Chrome/Edge bila browser menawarkan instalasi.

## Instal sebagai aplikasi
- Android: Chrome/Edge → menu browser → **Instal aplikasi / Tambahkan ke layar utama**.
- Windows: Chrome/Edge → ikon **Instal** pada address bar atau menu browser → **Install WARGA**.

## Catatan kamera & GPS
Fitur kamera/GPS di browser memerlukan izin perangkat. Untuk deployment produksi dan akses kamera/GPS lintas perangkat, gunakan HTTPS; `localhost` adalah pengecualian pengembangan yang aman.

## Mode offline
Shell PWA (HTML/CSS/JS) tersedia saat offline. Data transaksi yang membutuhkan server/database tetap perlu mekanisme sinkronisasi backend sebelum dianggap production-ready.
