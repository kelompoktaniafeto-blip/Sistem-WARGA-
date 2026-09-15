let deferredPrompt=null, activeChannel='chat', activeSession=null, chatTimer=null, queueTimer=null;
const $=s=>document.querySelector(s);
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;const b=$('#installBtn');if(b)b.hidden=false});
$('#installBtn')?.addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('#installBtn').hidden=true});
$('#menu')?.addEventListener('click',()=>{$('#sidebar').classList.toggle('show');$('#backdrop').classList.toggle('show')});
$('#backdrop')?.addEventListener('click',()=>{$('#sidebar').classList.remove('show');$('#backdrop').classList.remove('show')});
function toast(t){const x=$('#toast');x.textContent=t;x.style.display='block';setTimeout(()=>x.style.display='none',2500)}
async function loadStats(){try{const r=await fetch('/api/stats');if(!r.ok)throw Error();const d=await r.json();if(d.warga!=null)$('#warga').textContent=d.warga;if(d.pengajuan!=null)$('#pengajuan').textContent=d.pengajuan;if(d.users!=null)$('#users').textContent=d.users;$('#sync').textContent='Online';$('#syncText').textContent='Terhubung ke server'}catch(e){$('#sync').textContent='Offline';$('#syncText').textContent='Mode lokal aktif'}}
function openModal(){ $('#chatModal').classList.add('show'); $('#chatModal').setAttribute('aria-hidden','false'); loadQueue(); }
function closeModal(){ $('#chatModal').classList.remove('show'); $('#chatModal').setAttribute('aria-hidden','true'); if(chatTimer)clearInterval(chatTimer); }
function setChannel(c){activeChannel=c;document.querySelectorAll('.choice').forEach(x=>x.classList.toggle('active',x.dataset.channel===c));$('#joinQueue').style.display=c==='chat'?'block':'none';$('#startVideo').style.display=c==='video'?'block':'none';}
async function createSession(channel){try{const r=await fetch('/api/live-chat/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({channel,subject:channel==='video'?'Video Call Super Admin':'Bantuan Live Chat'})});if(!r.ok)throw Error();activeSession=await r.json();$('#queueNow').textContent=`Nomor antrean #${activeSession.queue_no} • ${channel==='video'?'Video Call':'Live Chat'} • status menunggu`; if(channel==='video')toast('Permintaan video call masuk antrean.');else toast('Anda masuk antrean Live Chat.');loadSession();loadQueue();return activeSession}catch(e){toast('Gagal membuat antrean. Pastikan server aktif.')}}
async function loadSession(){
 if(!activeSession)return;
 try{
  const r=await fetch('/api/live-chat/session/'+activeSession.id); const d=await r.json();
  const box=$('#messages'); box.innerHTML='';
  d.messages.forEach(m=>{const el=document.createElement('div');el.className=m.sender_role==='system'?'system-msg':'msg '+m.sender_role;el.textContent=m.message;box.appendChild(el)});
  box.scrollTop=box.scrollHeight;
  if(d.session.status==='aktif'){
   $('#queueNow').textContent=`Antrean #${d.session.queue_no} • sesi aktif dengan Super Admin`;
   if(d.session.channel==='video'&&!document.querySelector('#videoOpenBtn')){const b=document.createElement('button');b.id='videoOpenBtn';b.className='queue-call';b.textContent='Buka Video Call';b.onclick=()=>window.open('/video.html?session='+d.session.id+'&role=warga','_blank');$('#queueNow').appendChild(b);}
  }
 }catch(e){}
}

async function sendMessage(){const input=$('#chatInput'), message=input.value.trim();if(!message)return;if(!activeSession){await createSession('chat');}if(!activeSession)return;await fetch('/api/live-chat/session/'+activeSession.id+'/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sender_role:'warga',message})});input.value='';loadSession();}
async function loadQueue(){try{const r=await fetch('/api/live-chat/queue');const q=await r.json();const box=$('#queueList');if(!q.length){box.innerHTML='<div class="empty">Tidak ada antrean aktif.</div>';return}box.innerHTML=q.map(x=>`<div class="queue-item"><div class="queue-left"><div class="queue-no">#${x.queue_no}</div><div><b>${x.username||'Warga'}</b><br><span>${x.subject||'Bantuan'} • ${new Date(x.created_at).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</span></div></div><div class="queue-right"><span class="queue-status ${x.channel==='video'?'video':''}">${x.channel==='video'?'VIDEO CALL':'LIVE CHAT'} · ${x.status}</span><button class="queue-call" onclick="handleQueue(${x.id},'${x.channel}')">${x.status==='aktif'?'Buka':'Panggil'}</button></div></div>`).join('');}catch(e){$('#queueList').innerHTML='<div class="empty">Server antrean belum terhubung.</div>'}}
async function claimSession(id){await fetch('/api/live-chat/session/'+id+'/claim',{method:'POST',headers:{'Content-Type':'application/json'}});loadQueue();return true}
async function handleQueue(id,channel){await claimSession(id);if(channel==='video')window.open('/video.html?session='+id+'&role=super_admin','_blank');else toast('Sesi Live Chat #'+id+' diaktifkan.');}
window.handleQueue=handleQueue;
$('#openChat')?.addEventListener('click',openModal);$('#openChat2')?.addEventListener('click',openModal);$('#chatMenu')?.addEventListener('click',openModal);$('#cameraQuick')?.addEventListener('click',()=>toast('Menu Kontrol Kamera tersedia pada modul Super Admin.'));
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',closeModal));
document.querySelectorAll('.choice').forEach(b=>b.addEventListener('click',()=>setChannel(b.dataset.channel)));
$('#sendChat')?.addEventListener('click',sendMessage);$('#chatInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')sendMessage()});
$('#joinQueue')?.addEventListener('click',()=>createSession('chat'));$('#startVideo')?.addEventListener('click',async()=>{const s=await createSession('video');if(s)toast('Tunggu Super Admin memanggil Anda.');});$('#openVideo')?.addEventListener('click',()=>{openModal();setChannel('video')});$('#refreshQueue')?.addEventListener('click',loadQueue);
setChannel('chat');loadStats();loadQueue();queueTimer=setInterval(loadQueue,5000);window.addEventListener('online',loadStats);window.addEventListener('offline',()=>{$('#sync').textContent='Offline';$('#syncText').textContent='Mode lokal aktif'});
if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});
