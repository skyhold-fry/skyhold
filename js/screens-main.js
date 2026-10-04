/* Screens: Who are you · Choose your companion · Home · My Keep · Decorate · Settings */
(function(){
const A=App, S=A.screens, esc=A.esc;
const pills = (fe=true) => `<div class="pills"><div class="pill">🪙 ${A.P.coins}</div><div class="pill">🐉 ${A.P.scales}</div>${fe?`<div class="pill bl">🪶 ${Sync.state.coffer.total}</div>`:''}</div>`;
A.pills = pills;
const famAva = (f, cls='ava') => f.kind==='dragon' ? `<div class="${cls}"></div>` : `<div class="${cls} emo">${C.familiars[f.kind].emoji}</div>`;
A.famAva = famAva;

// ---------------- Who are you? ----------------
S.who = { title:'Who are you?', html:()=>`
 <div class="ob"><div class="obh"><h1>Skyhold</h1><p>Who’s using this phone?</p></div>
  <div class="whos"><button data-act="pick" data-w="snow" class="wb"><span class="wi" style="background-image:url(img/sky-home-snow.jpg);background-position:-252px -26px;background-size:auto 440px"></span><b>Snow</b></button>
  <button data-act="pick" data-w="carson" class="wb"><span class="wi" style="background-image:url(img/sky-home-carson.jpg);background-position:-268px -30px;background-size:auto 440px"></span><b>Carson</b></button></div>
  <p class="obn">Saved on this phone only. Each of you uses your own phone; your quests stay private.</p></div>`,
 act(a,el){ if(a==='pick'){ A.setWho(el.dataset.w); A.render(); } } };

// ---------------- Choose your companion + name prompt ----------------
let pickKind=null;
S.onboard = { title:'Choose your companion', html:()=>{
  const ks=['dragon','falcon','wolf','direcat'];
  if(pickKind){ const f=C.familiars[pickKind]; return `<div class="ob"><div class="obh"><h1>${f.emoji}</h1><p>${esc(f.hint)}</p></div>
   <div class="big-fam">${f.emoji}</div><button class="mb1 wide" data-act="choose">Choose ${esc(f.name.toLowerCase())}</button><button class="mb2 wide" data-act="back">Look at the others</button></div>`; }
  return `<div class="ob"><div class="obh"><h1>Choose your companion</h1><p>${A.NAMES[A.who]}, pick your first familiar. The other three can join later from the Dragon’s Hoard.</p></div>
  <div class="fams">${ks.map(k=>{const f=C.familiars[k]; return `<button class="fb" data-act="look" data-k="${k}"><span class="fe2">${f.emoji}</span><b>${esc(f.name)}</b><small>${esc(f.hint)}</small></button>`}).join('')}</div></div>`; },
 async act(a,el){
  if(a==='look'){ pickKind=el.dataset.k; A.render(); }
  if(a==='back'){ pickKind=null; A.render(); }
  if(a==='choose'){ const f=C.familiars[pickKind];
    const name=await A.ask('Name your friend',{placeholder:f.suggest,hint:`Your ${f.name.toLowerCase()} needs a name. “${f.suggest}” is only a suggestion.`,ok:'That’s the name'});
    if(name==null) return; A.P.fam.owned.push({kind:pickKind,name,xp:0,full:70,happy:85,cared:A.now().toISOString(),since:A.ymd()}); A.P.fam.active=pickKind; A.saveP(); pickKind=null;
    sessionStorage.removeItem('greeted'); A.go('home'); }
 } };

// ---------------- Home (War Room) ----------------
const ART = {snow:{img:'sky-home-snow.jpg',bg:'-180px 56px/780px 439px'}, carson:{img:'sky-home-carson.jpg',bg:'-89px 56px/684px 385px'}};
const DECOR_POS = {wall:'left:44px;top:150px', shelf:'left:14px;top:300px', seat:'right:30px;top:300px', rug:'left:150px;top:418px', table:'right:96px;top:360px', corner:'left:8px;top:400px'};
S.home = { title:'Home', html:()=>{
  const P=A.P, f=L.fam(), ph=Sun.phase(A.now()), mq=L.mainQuests(), d=A.ymd(), done=P.main[d]||{};
  const sp=L.sidePicks(); const waiting=Object.values(sp.picks).reduce((s,p)=>s+p.ids.filter(id=>!sp.done[id]).length,0);
  const coinsLeft=mq.list.filter(q=>!done[q.id]).reduce((s,q)=>s+(+q.coins||0),0);
  const art=ART[A.who], seas=A.season(); const greeted=sessionStorage.getItem('greeted');
  const lv=C.levelForXp(P.xp), lo=C.xpForLevel(lv), hi=C.xpForLevel(lv+1);
  const sky={dawn:'🌅 Dawn',day:'☀️ Day',dusk:'🌇 Dusk',night:'🌙 Night'}[ph.phase];
  return `<div class="bg" style="background-image:url(img/${art.img});background-position:${art.bg.split('/')[0]};background-size:${art.bg.split('/')[1]}"></div>
  <div class="tod tod-${ph.phase}"></div><div class="shade"></div>
  ${Object.entries(P.slots).map(([s,id])=>{const it=C.decor.find(x=>x.id===id); return it?`<div class="dslot" style="${DECOR_POS[s]}" title="${esc(it.n)}">${it.e}</div>`:''}).join('')}
  <div class="top"><div class="title">Skyhold<small>WAR ROOM · ${seas.toUpperCase()}</small><span class="skychip" data-go="settings">${sky} · ${ph.phase==='day'||ph.phase==='dawn'?'sunset '+ph.setText:'sunrise '+ph.riseText}</span></div>
   <div class="cur"><div class="pill"><span class="c"></span>${P.coins}</div><div class="pill">🐉 ${P.scales}</div></div></div>
  <button class="gear-btn" data-go="settings" aria-label="Settings">⚙︎</button>
  ${P.settings.gear?`<div class="xpb"><span>⚔️ Lv ${lv} knight</span><div class="xbar"><i style="width:${Math.round((P.xp-lo)/(hi-lo)*100)}%"></i></div><span>${P.xp-lo}/${hi-lo} XP</span></div>`:''}
  <div class="bubble ${greeted?'':'pop'}" data-act="pet"><b>${f.kind!=='dragon'?C.familiars[f.kind].emoji+' ':''}${esc(L.famName(f).toUpperCase())}</b><i class="bs">${esc(L.famStage(f))}</i>${A.greet()}, ${A.NAMES[A.who]}! ${seas==='autumn'?'🍂':seas==='winter'?'❄️':seas==='spring'?'🌸':'☀️'}</div>
  ${greeted?'':`<div class="knight-wave">👋</div>`}
  <div class="deco" data-go="decorate">✨ Decorate</div>
  <div class="tough" data-go="tough">🕊️ Tough moment</div>
  <div class="panel">
   <div class="ph"><h2>Main Quests</h2><span>${mq.sample?'<i class="smp">SAMPLE</i> ':''}${Object.keys(done).length} of ${mq.list.length} · ${coinsLeft} coins up for grabs</span></div>
   ${mq.list.map(q=>`<div class="q ${done[q.id]?'done':''}" data-act="main" data-id="${esc(q.id)}" data-c="${+q.coins||0}"><div class="chk">${done[q.id]?'✓':''}</div><div class="qt"><em>${esc(q.lane||'Must do')}</em>${esc(q.title)}</div><div class="coins"><span class="c"></span>${+q.coins||0}</div></div>`).join('')}
   ${mq.sample?`<div class="sam">Sam adds your real must-dos each morning from your calendar.</div>`:''}
   <div class="side" data-go="side">⚔ SIDE QUESTS ⚔ <span>· ${waiting} waiting</span></div>
  </div>
  <div class="nav">${navTabs('home')}</div>`; },
 mount(){ if(!sessionStorage.getItem('greeted')) setTimeout(()=>{ sessionStorage.setItem('greeted','1'); const w=document.querySelector('.knight-wave'); if(w) w.classList.add('gone'); },2600); },
 act(a,el){
  const P=A.P, d=A.ymd();
  if(a==='main'){ const id=el.dataset.id, day=P.main[d]||(P.main[d]={}); if(day[id]) return; day[id]=A.now().toISOString(); A.saveP(); A.earn({coins:+el.dataset.c, label:'main quest', fact:true}); A.render(); }
  if(a==='pet'){ const r=L.care('pet'); el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); A.toast(`${esc(L.famName(L.fam()))} leans into your hand 💛`); if(r==='grew') grewUp(); }
 } };
function navTabs(on){ const t=[['home','🏰','Home'],['keeping','🧹','Castle<br>Keeping'],['kitchen','🍲','Castle<br>Kitchen'],['mates','🛡️','Shield<br>Mates'],['keep','🏯','My<br>Keep']];
  return t.map(([r,i,n])=>`<div class="tab ${on===r?'on':''}" data-go="${r}"><i>${i}</i>${n}</div>`).join(''); }
A.navTabs=navTabs;
function grewUp(){ const f=L.fam(); A.modal(`<div class="grow-up">${C.familiars[f.kind].emoji}</div><h3>${esc(L.famName(f))} grew up!</h3><p class="mh">Now a ${esc(L.famStage(f))}. Same friend, same name. 💛</p><div class="mrow"><button class="mb1" data-close>Yay!</button></div>`); }
A.grewUp=grewUp;

// ---------------- My Keep (outdoor progress view; swipeable) ----------------
S.keep = { title:'My Keep', html:()=>{
  const P=A.P, f=L.fam(), n=L.needs(f), lv=L.famLv(f), si=L.famStageIdx(f), fd=L.famDef(f);
  const g=Sync.state.griffins, me=g[A.who]||{lv:1}, them=g[A.OTHER[A.who]]||{lv:1};
  const hallLv=1+Math.floor(L.mainDone()/5), st=L.streak();
  const ar=C.areas.map(a=>({a, n:P.areas[a.id]||0}));
  const unit={SP:n=>`chapel glowing`,SO:n=>`${n} crest stones`,PH:n=>`${n} gear`,IN:n=>`${n} scrolls`};
  const xlv=C.levelForXp(P.xp);
  return `<div class="artscroll" id="artscroll"><div class="art2">
   <div class="hs" data-go="side/IN" style="left:376px;top:66px">📜 Wisdom Tower</div>
   <div class="hs hub" data-go="home" style="left:232px;top:96px">🏰 Great Hall · Lv ${hallLv}</div>
   <div class="hs" data-go="side/SP" style="left:70px;top:126px">✨ Shield of Faith</div>
   <div class="hs" data-go="side/SO" style="left:242px;top:158px">🛡️ Fellowship Hall</div>
   <div class="hs" data-go="side/PH" style="left:60px;top:200px">⚔️ Training Grounds</div>
   <div class="hs" data-go="mates" style="left:354px;top:166px">🪶 Griffins · Shield Mates</div>
   <div class="hs" data-act="famcard" style="left:464px;top:236px">${fd.emoji} ${esc(L.famName(f))}</div></div></div>
  <div class="top"><div><h1>My Keep</h1><div class="sub">${A.season().toUpperCase()} · SEASON ONE</div></div><div class="pills"><div class="pill">🪙 ${P.coins}</div><div class="pill">🐉 ${P.scales}</div></div></div>
  <div class="swipe">‹ swipe · chapel &amp; yard · nest ›</div>
  <div class="wrap" id="famcard">
   <div class="card"><div class="h"><span class="nm">${esc(L.famName(f))} <em>your ${esc(L.famStage(f))} · Lv ${lv}</em></span><span class="rn" data-act="rename">✏️ Rename</span></div>
    <div class="fam">${famAva(f)}<div style="flex:1">
     <div class="lbl">Fullness</div><div class="bar"><i style="width:${Math.round(n.full)}%"></i></div>
     <div class="lbl">Happiness</div><div class="bar"><i style="width:${Math.round(n.happy)}%"></i></div></div></div>
    <div class="stage"><span style="border:0;padding-left:0">Stage:</span><span class="${si===0?'on':''}">Baby · Lv 1–4</span><span class="${si===1?'on':''}">Young · Lv 5</span><span class="${si===2?'on':''}">Grown · Lv 10</span></div>
    <div class="btns"><div class="btn" data-act="feed">${fd.treats[0].e} Feed a treat</div><div class="btn" data-act="pet">🤲 Pet</div><div class="btn" data-act="play">🧸 Play</div></div>
    ${P.fam.owned.length>1?`<div class="swapf">${P.fam.owned.map(o=>`<span data-act="active" data-k="${o.kind}" class="${o.kind===f.kind?'on':''}">${C.familiars[o.kind].emoji} ${esc(L.famName(o))}</span>`).join('')}</div>`:''}
   </div>
   <div class="card"><div class="h">Your Keep <span>tap an area to visit</span></div>
    <div class="trees">
     <div class="t w hub" data-go="home"><b>🏰 Great Hall</b><span>hub · main quests · Lv ${hallLv} · 🔥 ${st} day${st===1?'':'s'}</span></div>
     ${ar.map(({a,n})=>`<div class="t" data-go="side/${a.id}"><b>${a.icon} ${a.name}</b>Lv ${L.areaLv(n)} · ${unit[a.id](n)}</div>`).join('')}
     <div class="t w" data-go="mates"><b>🪶 Griffins · Shield Mates</b><span>yours Lv ${me.lv||1} · ${A.NAMES[A.OTHER[A.who]]}’s Lv ${them.lv||1}</span></div>
    </div></div>
   ${P.settings.gear?`<div class="card"><div class="h">Your Gear <span>Lv ${xlv} · ${P.xp} XP</span></div><div class="gearl">${C.gear.map(g=>`<div class="gi2 ${xlv>=g.lv?'on':''}"><span>${xlv>=g.lv?g.e:'🔒'}</span><b>${esc(g.n)}</b><small>${xlv>=g.lv?'earned':'Lv '+g.lv}</small></div>`).join('')}</div></div>`:''}
   <div class="market" data-go="hoard"><span class="mk-ic"></span>VISIT THE DRAGON’S HOARD<small>Everglade (name pending) has new treats &amp; decorations</small></div>
   <div class="navpad"></div>
  </div><div class="nav fixed">${navTabs('keep')}</div>`; },
 mount(){ const s=document.getElementById('artscroll'); if(s) s.scrollLeft=148; },
 async act(a,el){
  const P=A.P, f=L.fam();
  if(a==='rename'){ const n=await A.ask('Rename your friend',{value:L.famName(f),placeholder:L.famDef(f).suggest}); if(n){ f.name=n; A.saveP(); A.render(); } }
  if(a==='famcard'){ document.getElementById('famcard').scrollIntoView({behavior:'smooth'}); }
  if(a==='active'){ P.fam.active=el.dataset.k; A.saveP(); A.render(); }
  if(a==='pet'||a==='play'){ const r=L.care(a); A.toast(a==='pet'?`${esc(L.famName(f))} purrs and nuzzles you 💛`:`${esc(L.famName(f))} chases the ball across the courtyard 🧸`); if(r==='grew') A.grewUp(); A.render(); }
  if(a==='feed'){ const tr=L.famDef(f).treats, have=tr.filter(t=>P.inv.treats[t.id]>0);
    if(!have.length){ A.modal(`<h3>No treats yet</h3><p class="mh">Everglade sells ${esc(tr.map(t=>t.n.toLowerCase()).join(', '))} at the Dragon’s Hoard.</p><div class="mrow"><button class="mb2" data-close>Later</button><button class="mb1" data-close data-go="hoard">Visit the Hoard</button></div>`); return; }
    const m=A.modal(`<h3>Feed ${esc(L.famName(f))}</h3><div class="pickl">${have.map(t=>`<button class="pk" data-t="${t.id}">${t.e} ${esc(t.n)} <small>×${P.inv.treats[t.id]}</small></button>`).join('')}</div><div class="mrow"><button class="mb2" data-close>Cancel</button></div>`);
    m.querySelectorAll('.pk').forEach(b=>b.onclick=()=>{ const r=L.care('feed',b.dataset.t); m.remove(); A.toast(`Nom nom! ${esc(L.famName(f))} loved it 😋`); if(r==='grew') A.grewUp(); A.render(); }); }
 } };

// ---------------- Decorate (6 slots) ----------------
S.decorate = { title:'Decorate', html:()=>{ const P=A.P;
  return `<div class="top"><div class="back" data-go="home">‹</div><div><h1>Decorate</h1><div class="sub">THE WAR ROOM · 6 SLOTS</div></div>${pills(false)}</div>
  <div class="wrap"><div class="card"><div class="h">Your room <span>tap a slot to swap · nothing is lost</span></div>
  ${C.slots.map(s=>{const it=C.decor.find(x=>x.id===P.slots[s.id]); return `<div class="slot" data-act="slot" data-s="${s.id}"><span class="se">${it?it.e:'＋'}</span><div><b>${s.n}</b><small>${it?esc(it.n):'empty'}</small></div><span class="go">›</span></div>`}).join('')}
  </div><div class="market" data-go="hoard">GET MORE AT THE DRAGON’S HOARD<small>decorations cost 🐉 Dragon Scales from side quests</small></div></div>`; },
 act(a,el){ const P=A.P; if(a!=='slot') return; const sid=el.dataset.s, own=C.decor.filter(d=>d.slot===sid && P.inv.decor.includes(d.id));
  const m=A.modal(`<h3>${C.slots.find(s=>s.id===sid).n}</h3>${own.length?'':'<p class="mh">You don’t own anything for this slot yet.</p>'}<div class="pickl">${own.map(d=>`<button class="pk ${P.slots[sid]===d.id?'on':''}" data-d="${d.id}">${d.e} ${esc(d.n)}</button>`).join('')}${P.slots[sid]?'<button class="pk" data-d="">Put it away (keep it)</button>':''}</div><div class="mrow"><button class="mb2" data-close>Close</button>${own.length?'':'<button class="mb1" data-close data-go="hoard">Visit the Hoard</button>'}</div>`);
  m.querySelectorAll('.pk').forEach(b=>b.onclick=()=>{ if(b.dataset.d) P.slots[sid]=b.dataset.d; else delete P.slots[sid]; A.saveP(); m.remove(); A.render(); }); } };

// ---------------- Settings ----------------
S.settings = { title:'Settings', html:()=>{ const P=A.P, s=P.settings, c=Sync.config, st=Sync.status, ph=Sun.phase(A.now());
  return `<div class="top"><div class="back" data-go="home">‹</div><div><h1>Settings</h1><div class="sub">${A.NAMES[A.who].toUpperCase()}’S PHONE</div></div></div>
  <div class="wrap">
  <div class="card"><div class="h">Today</div>
   <label class="row"><span>🌙 Light day (long shift)<small>1 easy task per area; effort hidden</small></span><input type="checkbox" data-act="light" ${s.light?'checked':''}></label>
   <div class="row"><span>Idaho Falls sky<small>sunrise ${ph.riseText} · sunset ${ph.setText} · now: ${ph.phase}</small></span></div></div>
  <div class="card"><div class="h">My people <span>for “Text / Call your person”</span></div>
   ${[0,1,2].map(i=>{const p=s.people[i]||{}; return `<div class="row2"><input placeholder="Name" data-p="${i}" data-f="name" value="${esc(p.name||'')}"><input placeholder="Phone" inputmode="tel" data-p="${i}" data-f="phone" value="${esc(p.phone||'')}"></div>`}).join('')}
   <small class="cap">Only on this phone. Nothing is ever sent for you.</small></div>
  <div class="card"><div class="h">Quest names <span>fills [Friend1] etc.</span></div>
   ${Object.keys(C.fillDefaults.snow).map(k=>`<div class="row2"><span class="lb2">${k}</span><input data-fill="${k}" value="${esc(s.fills[k]||'')}"></div>`).join('')}</div>
  <div class="card"><div class="h">Knight extras</div>
   <label class="row"><span>⚔️ XP bar + unlockable gear</span><input type="checkbox" data-act="gearon" ${s.gear?'checked':''}></label>
   <label class="row"><span>🧠 Cool fact when you finish a main quest</span><input type="checkbox" data-act="factson" ${s.facts?'checked':''}></label>
   <div class="row"><span>Gym days<small>Training Grounds effort = your workout</small></span><span class="gd">${A.WD.map((d,i)=>`<b data-act="gym" data-d="${i}" class="${s.gymDays.includes(i)?'on':''}">${d[0]}</b>`).join('')}</span></div></div>
  <div class="card"><div class="h">Reminders <span>notifications.md · Sky</span></div>
   ${[['morning','☀️ Good morning'],['night','🌙 Good night'],['bed','🛏️ Time to turn in']].map(([k,n])=>`<div class="row"><span>${n}</span><span><input type="time" data-nt="${k}" value="${s.notif[k]}"> <b class="mini" data-act="preview" data-k="${k}">Preview</b></span></div>`).join('')}
   <button class="mb1 wide" data-act="notif">${s.notif.on?'Reminders on ✓':'Turn on reminders'}</button>
   <small class="cap">iPhone shows these while Skyhold is open or recently used. True background reminders need a push server (not set up yet); until then, Sam can add calendar alerts.</small></div>
  <div class="card"><div class="h">Sync <span>${st.backend} · ${st.ok?'ok':'offline'}${Sync.pending?` · ${Sync.pending} waiting`:''}</span></div>
   <div class="row2"><input placeholder="Apps Script web app URL" data-sync="url" value="${esc(c.url)}"></div>
   <div class="row2"><input placeholder="App key (from SETUP.md)" data-sync="key" value="${esc(c.key)}"></div>
   <div class="mrow"><button class="mb2" data-act="local">Use this phone only</button><button class="mb1" data-act="connect">Connect</button></div>
   <small class="cap">${st.error?('Last error: '+esc(st.error)):(st.last?'Last sync '+new Date(st.last).toLocaleTimeString():'Shared data: grocery, preferences, meal plan, chores, coffer, griffins, cheers.')}</small></div>
  <div class="card"><div class="h">This phone</div>
   <div class="mrow"><button class="mb2" data-act="switch">Switch to ${A.NAMES[A.OTHER[A.who]]}</button><button class="mb2" data-act="export">Export my data</button></div></div>
  <div class="foot">Skyhold · Sky version · v1</div></div>`; },
 mount(root){ const P=A.P;
  root.querySelectorAll('[data-p]').forEach(i=>i.onchange=()=>{ const k=+i.dataset.p; P.settings.people[k]=Object.assign(P.settings.people[k]||{}, {[i.dataset.f]:i.value.trim()}); A.saveP(); });
  root.querySelectorAll('[data-fill]').forEach(i=>i.onchange=()=>{ P.settings.fills[i.dataset.fill]=i.value.trim(); A.saveP(); });
  root.querySelectorAll('[data-nt]').forEach(i=>i.onchange=()=>{ P.settings.notif[i.dataset.nt]=i.value; A.saveP(); Notif.schedule(); }); },
 async act(a,el){ const P=A.P, s=P.settings;
  if(a==='light'){ s.light=el.checked; A.saveP(); A.toast(s.light?'🌙 Light day on. Any one task counts.':'Light day off'); }
  if(a==='gearon'){ s.gear=el.checked; A.saveP(); }
  if(a==='factson'){ s.facts=el.checked; A.saveP(); }
  if(a==='gym'){ const d=+el.dataset.d; s.gymDays=s.gymDays.includes(d)?s.gymDays.filter(x=>x!==d):s.gymDays.concat(d); A.saveP(); A.render(); }
  if(a==='preview'){ Notif.preview(el.dataset.k); }
  if(a==='notif'){ const ok=await Notif.enable(); s.notif.on=ok; A.saveP(); A.render(); }
  if(a==='connect'){ const url=document.querySelector('[data-sync=url]').value.trim(), key=document.querySelector('[data-sync=key]').value.trim();
    if(!/^https:\/\/script\.google\.com\//.test(url)){ A.toast('That doesn’t look like an Apps Script /exec URL'); return; }
    try{ await Sync.test(url,key); await Sync.configure({backend:'appsscript',url,key}); A.toast('Connected ✓'); }catch(e){ A.toast('Couldn’t connect: '+esc(e.message)); } A.render(); }
  if(a==='local'){ await Sync.configure({backend:'local'}); A.render(); }
  if(a==='switch'){ A.setWho(A.OTHER[A.who]); sessionStorage.removeItem('greeted'); A.go('home'); }
  if(a==='export'){ const blob=new Blob([JSON.stringify({who:A.who,private:P,shared:Sync.state},null,1)],{type:'application/json'}); const u=URL.createObjectURL(blob); const l=document.createElement('a'); l.href=u; l.download=`skyhold-${A.who}-${A.ymd()}.json`; l.click(); }
 } };
})();
