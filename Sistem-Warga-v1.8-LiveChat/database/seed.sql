USE sistem_warga;
INSERT INTO users (username,password_hash,nama,role,status) VALUES
('superadmin','$2b$10$REPLACE_WITH_BCRYPT_HASH','Super Admin','super_admin','aktif'),
('kades_demo','$2b$10$REPLACE_WITH_BCRYPT_HASH','Kepala Desa Demo','kades','aktif'),
('kadus_demo','$2b$10$REPLACE_WITH_BCRYPT_HASH','Kepala Dusun Demo','kadus','aktif'),
('warga_demo','$2b$10$REPLACE_WITH_BCRYPT_HASH','Warga Demo','warga','aktif');
INSERT INTO warga(no_kk,nik,nama,jenis_kelamin,tanggal_lahir,tempat_lahir,pendidikan,pekerjaan,hubungan_keluarga,status_pernikahan,nama_ayah,nama_ibu,dusun)
VALUES
('1271000000000001','1271000000000001','Budi Santoso','L','1988-04-12','Medan','SMA','Wiraswasta','Kepala Keluarga','Menikah','Sutrisno','Siti Aminah','Dusun I'),
('1271000000000002','1271000000000002','Siti Rahma','P','1992-09-21','Medan','S1','Guru','Istri','Menikah','Ahmad','Nurhayati','Dusun II');
