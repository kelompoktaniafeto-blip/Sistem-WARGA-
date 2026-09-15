const router=require("express").Router(), db=require("../config/db");
const crypto=require("crypto");
router.get("/health",async(req,res)=>{try{await db.query("SELECT 1");res.json({ok:true,database:true})}catch(e){res.status(500).json({ok:false,error:e.message})}});
router.get("/stats",async(req,res)=>{try{
 const [[w]] = await db.query("SELECT COUNT(*) total FROM warga"), [[p]]=await db.query("SELECT COUNT(*) total FROM pengajuan"),
 [[u]]=await db.query("SELECT COUNT(*) total FROM users"), [[d]]=await db.query("SELECT COUNT(*) total FROM dokumen_pengajuan");
 res.json({warga:w.total,pengajuan:p.total,users:u.total,dokumen:d.total});
}catch(e){res.status(500).json({error:e.message})}});
router.get("/warga",async(req,res)=>{try{const [r]=await db.query("SELECT * FROM warga ORDER BY nama LIMIT 500");res.json(r)}catch(e){res.status(500).json({error:e.message})}});
router.post("/warga",async(req,res)=>{try{
 const {no_kk,nik,nama,jenis_kelamin,tanggal_lahir,tempat_lahir,pendidikan,pekerjaan,hubungan_keluarga,status_pernikahan,nama_ayah,nama_ibu,dusun}=req.body;
 const [r]=await db.query(`INSERT INTO warga(no_kk,nik,nama,jenis_kelamin,tanggal_lahir,tempat_lahir,pendidikan,pekerjaan,hubungan_keluarga,status_pernikahan,nama_ayah,nama_ibu,dusun) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
 [no_kk,nik,nama,jenis_kelamin||null,tanggal_lahir||null,tempat_lahir||null,pendidikan||null,pekerjaan||null,hubungan_keluarga||null,status_pernikahan||null,nama_ayah||null,nama_ibu||null,dusun||null]);
 res.status(201).json({id:r.insertId});
}catch(e){res.status(400).json({error:e.message})}});
router.get("/jenis-surat",async(req,res)=>{const [r]=await db.query("SELECT * FROM jenis_surat WHERE aktif=1 ORDER BY nama");res.json(r)});
router.get("/pengajuan",async(req,res)=>{try{const [r]=await db.query(`SELECT p.*,w.nik,w.nama warga,js.nama jenis_surat FROM pengajuan p JOIN warga w ON w.id=p.warga_id JOIN jenis_surat js ON js.id=p.jenis_surat_id ORDER BY p.created_at DESC LIMIT 500`);res.json(r)}catch(e){res.status(500).json({error:e.message})}});
router.post("/pengajuan",async(req,res)=>{try{
 const {warga_id,jenis_surat_id,catatan}=req.body, token=crypto.randomBytes(18).toString("hex");
 const [r]=await db.query("INSERT INTO pengajuan(warga_id,jenis_surat_id,status,catatan,qr_token) VALUES(?,?, 'diajukan',?,?)",[warga_id,jenis_surat_id,catatan||null,token]);
 await db.query("INSERT INTO riwayat_pengajuan(pengajuan_id,status,catatan) VALUES(?, 'diajukan',?)",[r.insertId,catatan||"Pengajuan dibuat"]);
 res.status(201).json({id:r.insertId,qr_token:token});
}catch(e){res.status(400).json({error:e.message})}});
router.patch("/pengajuan/:id/status",async(req,res)=>{try{
 const {status,catatan}=req.body; await db.query("UPDATE pengajuan SET status=?,catatan=? WHERE id=?",[status,catatan||null,req.params.id]);
 await db.query("INSERT INTO riwayat_pengajuan(pengajuan_id,status,catatan) VALUES(?,?,?)",[req.params.id,status,catatan||null]);
 res.json({ok:true});
}catch(e){res.status(400).json({error:e.message})}});
router.get("/verifikasi/:token",async(req,res)=>{const [r]=await db.query(`SELECT p.id,p.nomor_surat,p.status,w.nama,js.nama jenis_surat,p.updated_at FROM pengajuan p JOIN warga w ON w.id=p.warga_id JOIN jenis_surat js ON js.id=p.jenis_surat_id WHERE p.qr_token=?`,[req.params.token]); if(!r.length)return res.status(404).json({valid:false});res.json({valid:true,data:r[0]})});
router.get("/notifications/:userId",async(req,res)=>{const [r]=await db.query("SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 100",[req.params.userId]);res.json(r)});
module.exports=router;
// ================= LIVE CHAT + VIDEO CALL =================
function chatAutoReply(message){
 const m=(message||'').toLowerCase();
 if(m.includes('surat')||m.includes('pengajuan')) return 'Saya bantu cek layanan surat. Pilih jenis surat pada menu Pengajuan Surat atau sampaikan nama surat yang Anda perlukan.';
 if(m.includes('nik')||m.includes('kk')||m.includes('data')) return 'Untuk perubahan data warga, siapkan NIK/KK dan keterangan perubahan. Jika perlu bantuan lanjutan, Anda dapat meneruskan chat ke Super Admin.';
 if(m.includes('status')) return 'Status pengajuan dapat dilihat pada menu Status Dokumen. Untuk pemeriksaan manual, Anda dapat masuk ke antrean Super Admin.';
 if(m.includes('kamera')||m.includes('gps')) return 'Fitur kamera dan GPS mengikuti izin perangkat. Untuk bantuan teknis lebih lanjut, pilih Live Chat Admin atau Video Call Super Admin.';
 return 'Halo, saya asisten Sistem WARGA. Saya dapat membantu informasi umum. Jika pertanyaan Anda membutuhkan petugas, pilih "Live Chat langsung ke Admin" atau "Video Call ke Super Admin".';
}
router.post('/live-chat/session', async(req,res)=>{try{
 const {user_id=null,channel='chat',subject='Bantuan Sistem WARGA'}=req.body;
 if(!['chat','video'].includes(channel)) return res.status(400).json({error:'channel tidak valid'});
 const [[q]] = await db.query("SELECT COALESCE(MAX(queue_no),0)+1 next_no FROM live_chat_sessions WHERE DATE(created_at)=CURDATE() AND status IN ('menunggu','dipanggil','aktif')");
 const queueNo=q.next_no; const room=crypto.randomBytes(18).toString('hex');
 const [r]=await db.query("INSERT INTO live_chat_sessions(user_id,channel,subject,queue_no,status,room_token) VALUES(?,?,?,?, 'menunggu',?)",[user_id,channel,subject,queueNo,room]);
 await db.query("INSERT INTO live_queue(nomor,user_id,channel,session_id,status) VALUES(?,?,?,?, 'menunggu')",[queueNo,user_id||0,channel,r.insertId]);
 const welcome=channel==='video'
  ? 'Permintaan Video Call sudah masuk antrean. Super Admin akan memanggil Anda saat tersedia.'
  : 'Permintaan Live Chat sudah masuk antrean. Sambil menunggu, saya dapat membantu pertanyaan umum secara otomatis.';
 await db.query("INSERT INTO live_chat_messages(session_id,sender_role,message) VALUES(?, 'system', ?)",[r.insertId,welcome]);
 res.status(201).json({id:r.insertId,queue_no:queueNo,channel,room_token:room,status:'menunggu'});
}catch(e){res.status(400).json({error:e.message})}});
router.get('/live-chat/queue',async(req,res)=>{try{
 const [r]=await db.query(`SELECT s.id,s.queue_no,s.channel,s.subject,s.status,s.user_id,s.created_at,u.nama username
 FROM live_chat_sessions s LEFT JOIN users u ON u.id=s.user_id
 WHERE s.status IN ('menunggu','dipanggil','aktif') ORDER BY s.queue_no ASC, s.created_at ASC LIMIT 100`); res.json(r);
}catch(e){res.status(500).json({error:e.message})}});
router.get('/live-chat/session/:id',async(req,res)=>{try{
 const [[s]]=await db.query('SELECT * FROM live_chat_sessions WHERE id=?',[req.params.id]); if(!s)return res.status(404).json({error:'Sesi tidak ditemukan'});
 const [m]=await db.query('SELECT * FROM live_chat_messages WHERE session_id=? ORDER BY id ASC',[req.params.id]); res.json({session:s,messages:m});
}catch(e){res.status(500).json({error:e.message})}});
router.post('/live-chat/session/:id/messages',async(req,res)=>{try{
 const {sender_role='warga',message}=req.body; if(!message?.trim())return res.status(400).json({error:'Pesan kosong'});
 if(!['warga','super_admin'].includes(sender_role))return res.status(400).json({error:'sender_role tidak valid'});
 await db.query('INSERT INTO live_chat_messages(session_id,sender_role,message) VALUES(?,?,?)',[req.params.id,sender_role,message.trim()]);
 if(sender_role==='warga') await db.query("INSERT INTO live_chat_messages(session_id,sender_role,message) VALUES(?, 'system', ?)",[req.params.id,chatAutoReply(message)]);
 res.json({ok:true});
}catch(e){res.status(400).json({error:e.message})}});
router.post('/live-chat/session/:id/claim',async(req,res)=>{try{
 await db.query("UPDATE live_chat_sessions SET status='aktif' WHERE id=? AND status IN ('menunggu','dipanggil')",[req.params.id]);
 await db.query("UPDATE live_queue SET status='dipanggil' WHERE session_id=?",[req.params.id]);
 res.json({ok:true});
}catch(e){res.status(400).json({error:e.message})}});
router.post('/live-chat/session/:id/close',async(req,res)=>{try{
 await db.query("UPDATE live_chat_sessions SET status='selesai' WHERE id=?",[req.params.id]);
 await db.query("UPDATE live_queue SET status='selesai' WHERE session_id=?",[req.params.id]);
 res.json({ok:true});
}catch(e){res.status(400).json({error:e.message})}});
router.post('/live-chat/session/:id/signals',async(req,res)=>{try{
 const {sender_role,signal_type,payload}=req.body;
 if(!['warga','super_admin'].includes(sender_role)||!['offer','answer','ice','bye'].includes(signal_type))return res.status(400).json({error:'signal tidak valid'});
 await db.query('INSERT INTO live_chat_signals(session_id,sender_role,signal_type,payload) VALUES(?,?,?,?)',[req.params.id,sender_role,signal_type,JSON.stringify(payload)]);res.json({ok:true});
}catch(e){res.status(400).json({error:e.message})}});
router.get('/live-chat/session/:id/signals',async(req,res)=>{try{
 const role=req.query.role; const [r]=await db.query('SELECT * FROM live_chat_signals WHERE session_id=? AND sender_role<>? ORDER BY id ASC',[req.params.id,role||'warga']);res.json(r);
}catch(e){res.status(500).json({error:e.message})}});

module.exports=router;
