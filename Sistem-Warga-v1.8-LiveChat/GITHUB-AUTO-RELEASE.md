# WARGA v1.8 — Build GitHub Otomatis

## Hasil yang diinginkan
Setelah source WARGA dimasukkan ke repository GitHub dengan branch `main`, setiap **push perubahan source** akan:

1. Checkout source.
2. Menyiapkan Java 17.
3. Menyiapkan Gradle 8.7.
4. Build `assembleRelease`.
5. Menghasilkan `WARGA-v1.8.0.apk`.
6. Membuat checksum SHA-256.
7. Menyimpan APK sebagai GitHub Actions Artifact.
8. Membuat/memperbarui GitHub Release **WARGA v1.8 - APK Terbaru** dengan tag `latest-v1.8`.

## Cara pakai

1. Buat repository baru di https://github.com/new
2. Pilih nama, misalnya `Sistem-WARGA`.
3. Upload **isi folder proyek ini** ke branch `main` (bukan folder pembungkusnya).
4. Setelah file masuk, buka tab **Actions**.
5. Workflow `WARGA - Build APK Otomatis & Release` akan berjalan otomatis.
6. Setelah selesai, buka tab **Releases**.
7. Ambil file `WARGA-v1.8.0.apk` dari release **WARGA v1.8 - APK Terbaru**.

## Build manual
Masuk ke **Actions → WARGA - Build APK Otomatis & Release → Run workflow**.

`publish_release = true` akan mengunggah APK ke Release. Jika hanya ingin artifact, pilih `false`.

## Catatan keamanan
Workflow menggunakan `GITHUB_TOKEN` dengan izin `contents: write` agar dapat membuat Release. Tidak ada password database atau secret server yang dimasukkan ke workflow.

## Jika repository memakai branch selain main
Ubah bagian:

```yaml
branches: [ main ]
```

pada `.github/workflows/build-and-release.yml` sesuai nama branch.

## Catatan APK release saat ini
Konfigurasi Android proyek v1.8 saat ini menghasilkan APK release tanpa signing key produksi. Untuk distribusi Play Store, siapkan keystore/signing key dan GitHub Secrets. Jangan commit keystore atau password ke repository.
