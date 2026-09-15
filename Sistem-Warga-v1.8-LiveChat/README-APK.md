# Sistem WARGA v1.8 — Paket Kompilasi APK

Paket ini adalah **source project Android Studio** untuk membungkus aplikasi web Sistem WARGA v1.8 menjadi aplikasi Android.

## Yang sudah disiapkan
- Nama aplikasi: **WARGA**
- Subjudul: **Sistem Informasi Desa**
- Ikon launcher memakai logo resmi WARGA yang baru dibuat.
- WebView untuk membuka server Sistem WARGA.
- Konfigurasi alamat server pada pemakaian pertama.
- JavaScript + penyimpanan lokal WebView.
- Izin kamera dan mikrofon untuk fitur kamera yang digunakan oleh halaman web.
- Izin lokasi untuk GPS.
- Pembatasan permintaan media/geolocation ke host server yang dikonfigurasi.
- Tombol kembali Android mengikuti navigasi halaman web.

## Cara compile di Windows
1. Install **Android Studio** versi terbaru yang mendukung Android SDK 35.
2. Buka Android Studio → **Open** → pilih folder `android` pada paket ini.
3. Tunggu Gradle Sync selesai dan izinkan Android Studio memasang SDK yang diminta.
4. Untuk APK pengujian: **Build → Build APK(s)**.
5. APK debug biasanya berada di:
   `android/app/build/outputs/apk/debug/app-debug.apk`

## Koneksi ke server
Pada Android pertama kali dijalankan, masukkan alamat server, misalnya:
`http://192.168.1.10:3000`

HP Android dan PC/server harus berada pada jaringan yang sama untuk akses LAN.

Untuk internet/public deployment, gunakan HTTPS.

## Catatan penting
Paket ini **belum merupakan file APK hasil kompilasi** karena Android SDK/Gradle build environment tidak tersedia di lingkungan pembuatan paket ini. Paket ini adalah source yang disiapkan untuk langsung dibuka dan dikompilasi di Android Studio.

Fitur kamera/GPS pada APK mengikuti implementasi web/backend Sistem WARGA. Backend Node.js + MySQL tetap dijalankan di server/PC.

## Live Chat & Video Call (v1.8)
- Asisten memberikan jawaban otomatis untuk pertanyaan umum.
- Warga dapat memilih **Live Chat langsung ke Admin** atau **Video Call langsung ke Super Admin**.
- Sistem membuat nomor antrean dan Super Admin dapat memantau serta memanggil antrean.
- Sesi video memakai fondasi WebRTC signaling melalui API.
- Untuk video call produksi, gunakan **HTTPS** dan konfigurasi STUN/TURN agar koneksi lintas jaringan stabil.

## Build APK secara online di GitHub
Paket ini sekarang menyertakan workflow:
`.github/workflows/android-apk.yml`

Panduan lengkap ada di `GITHUB-BUILD.md`.

Workflow GitHub akan:
1. Checkout source.
2. Menyiapkan JDK 17.
3. Menyiapkan Gradle 8.7.
4. Menjalankan `assembleDebug` pada folder `android`.
5. Menghasilkan artifact `WARGA-v1.8.0-debug` yang dapat diunduh dari halaman Actions.
