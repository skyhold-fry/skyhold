/* Notifications (notifications.md, Sky lines). iPhone web push needs iOS 16.4+ and the app added to the Home Screen.
   What works now: permission, previews, and on-device reminders while the app is open/suspended in the background.
   True background delivery at exact times needs a Web Push sender (stub: see SETUP.md "Notifications"). */
window.Notif = (function(){
const A=App; let timers=[];
const KIND={morning:'morning',night:'night',bed:'bed',kind:'kind'};
function line(k, date=A.ymd()){ const arr=GEN.notif[k]||GEN.notif.morning; const i=((A.dnum(date)+(A.who==='carson'?7:0))%arr.length+arr.length)%arr.length;
  let f='your familiar'; try{ f=L.famName(L.fam()); }catch(e){} return arr[i].replace(/\[familiar\]/g,f); }
async function show(title, body){
  if(!('Notification' in window) || Notification.permission!=='granted') return false;
  try{ const r=await navigator.serviceWorker.getRegistration(); if(r){ await r.showNotification(title,{body, icon:'icons/icon-192.png', badge:'icons/icon-192.png', tag:'sky-'+Date.now()}); return true; } }catch(e){}
  try{ new Notification(title,{body, icon:'icons/icon-192.png'}); return true; }catch(e){ return false; }
}
async function enable(){
  if(!('Notification' in window)){ A.modal(`<h3>Notifications</h3><p class="mh">On iPhone, first add Skyhold to your Home Screen (Share → Add to Home Screen), then open it from there and tap Enable again. Needs iOS 16.4 or newer.</p><div class="mrow"><button class="mb1" data-close>OK</button></div>`); return false; }
  const p = await Notification.requestPermission(); if(p==='granted'){ schedule(); show('Skyhold','🔔 Notifications are on. '+line('bed')); return true; }
  A.toast('Notifications are off. You can turn them on in iPhone Settings → Skyhold.'); return false;
}
function preview(k){ const title={morning:'☀️ Morning',night:'🌙 Evening',bed:'🔔 Bedtime',kind:'💛 Kind word'}[k]||'Skyhold';
  const t=line(KIND[k]||'morning'); A.modal(`<h3>${title} preview</h3><div class="npv"><img src="icons/icon-192.png" alt=""><div><b>Skyhold</b><p>${A.esc(t)}</p></div></div>${k==='bed'?`<p class="mh">Sound: ${A.esc(GEN.notif.bedSound)}</p>`:''}<div class="mrow"><button class="mb1" data-close>Nice</button></div>`);
  show(title, t); }
function schedule(){
  timers.forEach(clearTimeout); timers=[]; if(!A.P || !A.P.settings.notif.on) return;
  const n=A.P.settings.notif, now=A.now(), p=Sun.boiseParts(now), mins=p.h*60+p.min;
  [['morning',n.morning],['night',n.night],['bed',n.bed]].forEach(([k,hm])=>{ if(!hm) return; const [h,m]=hm.split(':').map(Number), at=h*60+m;
    if(at>mins) timers.push(setTimeout(()=>show(k==='bed'?'🔔 Bedtime':'Skyhold', line(k)), (at-mins)*60000)); });
}
return {line, show, enable, preview, schedule};
})();
