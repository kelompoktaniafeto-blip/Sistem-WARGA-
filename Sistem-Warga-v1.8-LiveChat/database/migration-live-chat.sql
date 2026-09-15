USE sistem_warga;

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

ALTER TABLE live_queue ADD COLUMN channel ENUM('chat','video') NOT NULL DEFAULT 'chat' AFTER user_id;
ALTER TABLE live_queue ADD COLUMN session_id BIGINT UNSIGNED NULL AFTER channel;
