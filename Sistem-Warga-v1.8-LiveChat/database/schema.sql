CREATE DATABASE IF NOT EXISTS sistem_warga CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistem_warga;

CREATE TABLE IF NOT EXISTS users (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, username VARCHAR(100) NOT NULL UNIQUE,
 password_hash VARCHAR(255) NOT NULL, nama VARCHAR(150) NOT NULL,
 role ENUM('warga','kadus','kades','super_admin') NOT NULL, no_wa VARCHAR(30),
 email VARCHAR(150), status ENUM('pending','aktif','nonaktif') DEFAULT 'pending',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS warga (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NULL,
 no_kk VARCHAR(16) NOT NULL, nik VARCHAR(16) NOT NULL UNIQUE, nama VARCHAR(150) NOT NULL,
 jenis_kelamin ENUM('L','P'), tanggal_lahir DATE, tempat_lahir VARCHAR(100),
 pendidikan VARCHAR(100), pekerjaan VARCHAR(120), hubungan_keluarga VARCHAR(80),
 status_pernikahan VARCHAR(50), tanggal_pernikahan DATE, nama_ayah VARCHAR(150),
 nama_ibu VARCHAR(150), foto VARCHAR(255), dusun VARCHAR(100),
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX(no_kk), INDEX(dusun), INDEX(nama),
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS jenis_surat (
 id INT AUTO_INCREMENT PRIMARY KEY, nama VARCHAR(150) NOT NULL, kode VARCHAR(30) NOT NULL UNIQUE,
 deskripsi TEXT, persyaratan JSON, template_file VARCHAR(255), aktif TINYINT(1) DEFAULT 1
);
CREATE TABLE IF NOT EXISTS pengajuan (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, warga_id BIGINT UNSIGNED NOT NULL,
 jenis_surat_id INT NOT NULL, status ENUM('draft','diajukan','verifikasi_admin','dikembalikan',
 'menunggu_kades','ditolak_kades','disetujui','diterbitkan') DEFAULT 'draft',
 catatan TEXT, nomor_surat VARCHAR(100), qr_token VARCHAR(255) UNIQUE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY(warga_id) REFERENCES warga(id), FOREIGN KEY(jenis_surat_id) REFERENCES jenis_surat(id),
 INDEX(status)
);
CREATE TABLE IF NOT EXISTS dokumen_pengajuan (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, pengajuan_id BIGINT UNSIGNED NOT NULL,
 jenis_dokumen VARCHAR(120) NOT NULL, nama_file VARCHAR(255) NOT NULL, path_file VARCHAR(500),
 status ENUM('menunggu','valid','tidak_valid') DEFAULT 'menunggu', catatan TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(pengajuan_id) REFERENCES pengajuan(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS riwayat_pengajuan (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, pengajuan_id BIGINT UNSIGNED NOT NULL,
 status VARCHAR(60) NOT NULL, catatan TEXT, user_id BIGINT UNSIGNED NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(pengajuan_id) REFERENCES pengajuan(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS notifications (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL,
 judul VARCHAR(200) NOT NULL, pesan TEXT NOT NULL, dibaca TINYINT(1) DEFAULT 0,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX(user_id,dibaca)
);
CREATE TABLE IF NOT EXISTS audit_log (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NULL, aksi VARCHAR(100) NOT NULL,
 objek VARCHAR(100), objek_id BIGINT UNSIGNED, keterangan TEXT, ip_address VARCHAR(45),
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS settings (
 id INT AUTO_INCREMENT PRIMARY KEY, kunci VARCHAR(100) NOT NULL UNIQUE, nilai TEXT
);
CREATE TABLE IF NOT EXISTS live_queue (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, nomor INT NOT NULL, user_id BIGINT UNSIGNED NOT NULL,
 channel ENUM('chat','video') NOT NULL DEFAULT 'chat', session_id BIGINT UNSIGNED NULL,
 status ENUM('menunggu','dipanggil','selesai') DEFAULT 'menunggu', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 INDEX(session_id), INDEX(status,channel)
);
CREATE TABLE IF NOT EXISTS aset_desa (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, nama VARCHAR(200) NOT NULL, kategori VARCHAR(100),
 lokasi VARCHAR(255), kondisi VARCHAR(100), latitude DECIMAL(10,7), longitude DECIMAL(10,7),
 keterangan TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS kegiatan (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, judul VARCHAR(200) NOT NULL, tanggal DATETIME,
 lokasi VARCHAR(255), isi TEXT, aktif TINYINT(1) DEFAULT 1
);
INSERT IGNORE INTO settings(kunci,nilai) VALUES
('nama_instansi','Pemerintah Desa'),('logo',''),('alamat',''),('telepon','');
INSERT IGNORE INTO jenis_surat(nama,kode,deskripsi,persyaratan) VALUES
('Surat Keterangan Domisili','SKD','Keterangan domisili warga','["KTP","KK"]'),
('Surat Keterangan Usaha','SKU','Keterangan usaha warga','["KTP","KK","Dokumen Usaha"]'),
('Surat Keterangan Tidak Mampu','SKTM','Keterangan kondisi sosial','["KTP","KK"]');

-- Modul Live Chat & Video Call
CREATE TABLE IF NOT EXISTS live_chat_sessions (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 user_id BIGINT UNSIGNED NULL,
 channel ENUM('chat','video') NOT NULL DEFAULT 'chat',
 subject VARCHAR(200) NULL,
 queue_no INT NULL,
 status ENUM('menunggu','dipanggil','aktif','selesai','dibatalkan') DEFAULT 'menunggu',
 room_token VARCHAR(120) NULL UNIQUE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 INDEX(status,channel), INDEX(user_id)
);
CREATE TABLE IF NOT EXISTS live_chat_messages (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 session_id BIGINT UNSIGNED NOT NULL,
 sender_role ENUM('system','warga','super_admin') NOT NULL,
 message TEXT NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(session_id) REFERENCES live_chat_sessions(id) ON DELETE CASCADE,
 INDEX(session_id,created_at)
);
CREATE TABLE IF NOT EXISTS live_chat_signals (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 session_id BIGINT UNSIGNED NOT NULL,
 sender_role ENUM('warga','super_admin') NOT NULL,
 signal_type ENUM('offer','answer','ice','bye') NOT NULL,
 payload LONGTEXT NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(session_id) REFERENCES live_chat_sessions(id) ON DELETE CASCADE,
 INDEX(session_id,id)
);
