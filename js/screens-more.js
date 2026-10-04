/* Screens: Side Quests · Shield Mates · Castle Kitchen · Castle Keeping · Dragon's Hoard */
(function(){
const A=App, S=A.screens, esc=A.esc;
const crop = (c,w=362) => { const [x,y,cw]=c.split(',').map(Number), s=w/cw; return `background-size:${1024*s}px auto;background-position:${-x*s}px ${-y*s}px`; };
const tag = w => `<span class="tag ${w==='snow'?'s':'c'}">${A.NAMES[w]}</span>`;
const ini = w => `<i class="w ${w==='snow'?'ws':'wc'}">${w==='snow'?'S':'C'}</i>`;

// ---------------- Side Quests ----------------
function sideTaskHtml(a, id, day, date){
  const t=L.task(id); if(!t) return ''; const st=day.done[id], eff=t.lvl==='effort'; let txt=L.fill(t.t), extra='', label=eff?'★ Effort':'Easy';
  const w=L.cfmWeek(date);
  if(/CFM|key verses|slice/i.test(t.t) && w) extra=`<small>${esc(w.week)} · ${esc(w.lesson)} · key verses ${esc(w.verses)}</small>`;
  if(/named hymn/i.test(t.t)) txt=txt.replace(/today's named hymn( \(e\.g\.[^)]*\))?/i,`“${L.hymnOf(date)}”`);
  if(/named talk/i.test(t.t)){ const k=L.talkOf(date); txt=txt.replace(/today's named talk( in full)?( \(e\.g\.[^)]*\))?/i,`“${k.title}” (${k.by}, ${k.when})$1`); }
  if(a.id==='PH' && eff && A.P.settings.gymDays.includes(A.weekday(date))){ txt='Gym day: today’s routine (~35 min)'; label='★ Effort · Gym day'; extra='<span class="link" data-act="workout">Open workout ›</span>'; }
  if(a.id==='IN' && eff){ const hw=L.homework(date)[0]; if(hw){ txt=hw.title; label='★ Effort · Homework due tomorrow'; extra=`<span class="cal">📅 ${esc(hw.raw||hw.title)}</span>`; } }
  const m=txt.match(/^Text ([^:]+?):\s*[“"](.+?)[”"]/); if(m && !st) extra+=`<span class="link" data-act="draft" data-txt="${esc(m[2])}">Open draft text ›</span>`;
  const mast=(A.P.mastered[id]||0)>=66?' <b class="mast">⭐ Mastered</b>':'';
  const rw=eff?15:5;
  return `<div class="q ${eff?'eff':''} ${st?'done':''}" data-act="side" data-id="${id}" data-r="${rw}" data-a="${a.id}"><div class="chk">${st==='half'?'½':st?'✓':''}</div><div class="qt"><em>${label}${mast}</em><span class="tx">${esc(txt).replace(/&lt;(\/?)(small|span)/g,'<$1$2')}</span>${extra}${st?'':`<span class="part" data-act="half" data-id="${id}" data-r="${rw}" data-a="${a.id}">I did part of it</span>`}</div><div class="sap">🐉 +${st==='half'?Math.floor(rw/2):rw}</div></div>`;
}
S.side = { title:'Side Quests', html:()=>{
  const P=A.P, d=A.ymd(), day=L.sidePicks(d); const all=Object.values(day.picks).flatMap(p=>p.ids), done=all.filter(i=>day.done[i]).length;
  const earned=Object.entries(day.done).reduce((s,[id,v])=>{const t=L.task(id); const r=t&&t.lvl==='effort'?15:5; return s+(v==='half'?Math.floor(r/2):r)},0), possible=all.reduce((s,id)=>s+(L.task(id).lvl==='effort'?15:5),0);
  return `<div class="art"></div><div class="top"><div class="left"><div class="back" data-go="home">‹</div><div><h1>Side Quests</h1><div class="sub">${A.pretty(d)}</div></div></div>${A.pills(false)}</div>
  <div class="summary"><div><b>${done} of ${all.length}</b> done today<br>🐉 +${earned} of ${possible} Dragon Scales</div><div class="note">Side quests never<br>break your streak 🛡️</div></div>
  <div class="wrap">${P.settings.light?'<div class="litebar">🌙 Light day: one small task per area. Any one counts as showing up.</div>':''}
  ${C.areas.map(a=>{ const n=P.areas[a.id]||0, lv=L.areaLv(n), pct=Math.round((n%5)/5*100);
    const gs={SP:`✨ Lv ${lv}`,SO:`🛡️ Lv ${lv} · ${n} crest stones`,PH:`⚔️ Lv ${lv} · ${n} gear`,IN:`📜 Lv ${lv} · ${n} scrolls`}[a.id];
    const right=a.id==='SO'?`${5-n%5} more quests`:`${pct}%`;
    return `<div class="card" id="area-${a.id}"><div class="ban"><div class="img" style="${crop(a.crop)}"></div><div class="gs">${gs}</div><div class="bt"><div class="ar">${a.label}</div><h2>${a.name}</h2></div></div>
    <div class="grow">${a.grow}<div class="bar"><i style="width:${pct}%"></i></div>${right}</div>
    <div class="tasks">${day.picks[a.id].ids.map(id=>sideTaskHtml(a,id,day,d)).join('')}<div class="rr2"><span data-act="reroll" data-a="${a.id}">🎲 Reroll</span></div></div></div>`; }).join('')}
  <div class="foot">New side quests arrive at sunrise ☀️</div></div>`; },
 mount(root,arg){ if(arg){ const el=document.getElementById('area-'+arg); if(el) setTimeout(()=>el.scrollIntoView({block:'start'}),30); } },
 act(a,el,e){
  const P=A.P, d=A.ymd(), day=P.side[d];
  if(a==='side'||a==='half'){ if(e) e.stopPropagation(); const id=el.dataset.id; if(day.done[id]) return; const half=a==='half';
    day.done[id]=half?'half':'full'; P.areas[el.dataset.a]=(P.areas[el.dataset.a]||0)+1; P.mastered[id]=(P.mastered[id]||0)+1; A.saveP();
    const r=+el.dataset.r; A.earn({scales:half?Math.floor(r/2):r, label:half?'starting counts':''}); A.render(); }
  if(a==='reroll'){ const ar=el.dataset.a; const ids=day.picks[ar].ids; if(ids.some(i=>day.done[i])){ A.toast('Reroll swaps only the ones you haven’t done… finish or leave these for today 💛'); }
    day.reroll[ar]=(day.reroll[ar]||0)+1; ids.forEach(i=>{ if(!day.done[i]) {} }); A.saveP(); A.render(); }
  if(a==='draft'){ if(e) e.stopPropagation(); location.href='sms:&body='+encodeURIComponent(el.dataset.txt); }
  if(a==='workout'){ if(e) e.stopPropagation(); A.modal(`<h3>Lower body + core (~35 min)</h3><ol class="wo"><li>5-min warm-up walk or bike</li><li>Goblet squats 3×10</li><li>Romanian deadlifts 3×10</li><li>Walking lunges 3×8 each leg</li><li>Glute bridges 3×12</li><li>Plank 3×30 sec</li><li>Dead bugs 3×8 each side</li><li>5-min stretch</li></ol><p class="mh">Sample routine; swap in your own any time.</p><div class="mrow"><button class="mb1" data-close>Got it</button></div>`); }
 } };

// ---------------- Shield Mates (couples) ----------------
S.mates = { title:'Shield Mates', html:()=>{
  const P=A.P, d=A.ymd(), sh=Sync.state, me=A.who, oth=A.OTHER[me], g=sh.griffins;
  const card=(w)=>{ const x=Object.assign({lv:1,xp:0,name:''},g[w]), mine=w===me, active=x.day===d, nm=x.name||(w==='snow'?'Sunwing':'Silverwing');
    return `<div class="gc"><div class="gt"><div class="gava ${w==='snow'?'g1':'g2'}"></div><div><div class="gn">${esc(nm)}</div><div class="who2">${A.NAMES[w]}’s griffin</div></div></div>
    <div class="lv">Lv ${x.lv} · <b class="stg">${L.griffinStage(x.lv)}</b> · ${mine?'<span data-act="gname">✏️ Rename</span>':`named by ${A.NAMES[w]}`}</div><div class="bar"><i style="width:${Math.round(x.xp/(10*x.lv)*100)}%"></i></div>
    <div class="st ${mine||active?'':'rest'}">${mine?`🪶 ${x.xp} / ${10*x.lv} to Lv ${x.lv+1}`:active?'✨ Flew today':'🌙 Resting today · never sickens'}</div></div>`; };
  const si=C.stageOf(Math.max(1,(g[me]||{}).lv||1));
  const last=sh.coffer.last && GEN.dates.find(x=>x.id===sh.coffer.last.id);
  const turn=L.bomTurn(d), ch=C.bom[sh.bom.ptr]||C.bom[0], readToday=sh.bom.reads[d];
  const day=L.couplePicks(d);
  const temple=(sh.temple||[]).find(t=>t.date>=d);
  const feed=sh.cheers.filter(c=>(c.from===me&&c.to===oth)||(c.from===oth&&c.to===me)).slice(-4).reverse();
  return `<div class="art" id="art"></div><div class="top"><div class="left"><div class="back" data-go="home">‹</div><div><h1>Shield Mates</h1><div class="sub">SNOW &amp; CARSON</div></div></div>${A.pills()}</div>
  <div class="wrap">
  <div class="card"><div class="h">Our Griffins <span>one each · both can see</span></div><div class="gp">${card('snow')}${card('carson')}</div>
   <div class="stage"><span class="lbl2">Stages:</span><span class="${si===0?'on':''}">Baby · Lv 1–4</span><span class="${si===1?'on':''}">Young · Lv 5</span><span class="${si===2?'on':''}">Grown · Lv 10</span></div>
   <div class="cap">Each griffin grows from its own partner’s Griffin Feathers 💞</div></div>
  <div class="card"><div class="h">Courtship Coffer <span>shared by you both</span></div>
   <div class="jarrow"><div class="coffer">🧰<i>🪶</i></div><div class="jinfo"><div class="n">🪶 ${sh.coffer.total} / 100 <span>· ${100-sh.coffer.total} to go</span></div><div class="bar"><i style="width:${sh.coffer.total}%"></i></div><div class="nt">Fills from both of you · unlocks a Date Night Decree</div></div></div>
   ${last?`<div class="scroll" data-act="decree"><div class="ic">📜</div><div style="flex:1"><em>Last decree unlocked · ${A.short(sh.coffer.last.date)}</em><div class="tx">${esc(last.title)}</div><small>${esc(last.where)} · ${esc(last.cost)}</small></div><div class="go">View ›</div></div>`:`<div class="scroll"><div class="ic">📜</div><div style="flex:1"><em>Your first decree</em><div class="tx">Fill the coffer to 100 together</div><small>Low-cost dates near Idaho Falls &amp; Ammon</small></div></div>`}</div>
  <div class="card"><div class="h">Book of Mormon <span>chapter ${sh.bom.ptr+1} of 239</span></div>
   ${turn===me?`<div class="q bom ${readToday?'done':''}" data-act="bom"><div class="chk">${readToday?'✓':''}</div><div class="qt"><em>📖 Today · your turn</em><span class="tx">Read ${esc(readToday?C.bom[sh.bom.ptr-1]:ch)}</span><small>Tomorrow: ${A.NAMES[oth]} reads the next one · a missed day just waits</small></div><div class="bl-r">🪶 +5</div></div>`
   :`<div class="q bom ${readToday?'done':''}"><div class="chk">${readToday?'✓':''}</div><div class="qt"><em>📖 Today · ${A.NAMES[oth]}’s turn</em><span class="tx">${esc(readToday?C.bom[sh.bom.ptr-1]:ch)}</span><small>You get an extra easy quest today 💛</small></div></div>`}</div>
  <div class="card"><div class="h">Your quests today <span>🔒 just for you</span></div>
   ${day.ids.map((id,i)=>{const q=L.cq(id), eff=id[0]==='F', st=day.done[id]; return `<div class="q ${eff?'eff':''} ${st?'done':''}" data-act="cq" data-id="${id}" data-r="${eff?8:3}"><div class="chk">${st?'✓':''}</div><div class="qt"><em>${eff?'★ Effort':'Easy'}${q.tone==='low-pressure'?' · low-pressure':''}</em><span class="tx">${esc(L.pronounce(q.t))}</span></div><div class="bl-r">🪶 +${eff?8:3}</div></div>`}).join('')}
   <div class="rr3"><span data-act="creroll">🎲 Reroll</span> · <span data-act="swap">${day.swap?'Back to the effort quest':'Swap effort for a low-pressure quest'}</span></div></div>
  <div class="card"><div class="h">Send ${A.NAMES[oth]} a cheer <span>no tally, just love</span></div>
   <div class="chips">${C.cheers.map(c=>`<div class="chip" data-act="cheer" data-t="${esc(c)}">${c}</div>`).join('')}<div class="chip cu" data-act="cheer" data-t="">✏️ Write your own</div></div>
   <div class="feed">${feed.length?feed.map(c=>`<div class="f"><div><b>${c.from===me?'You':A.NAMES[oth]}:</b> ${esc(c.text)}</div><span>${new Date(c.at).toLocaleTimeString('en-US',{timeZone:A.TZ,hour:'numeric',minute:'2-digit'})}</span></div>`).join(''):'<div class="f"><div>No cheers yet. Send the first one 💛</div></div>'}</div></div>
  <div class="card temple"><div class="ic">🕊️</div><div><b>Temple trip</b><div>${temple?`${esc(temple.title)} · ${A.short(temple.date)}`:'Shows up here when a “Temple” event is on your calendar. Nothing scheduled yet this month.'}</div></div></div>
  <div class="foot">Unfinished quests quietly roll away at midnight 🌙</div></div>`; },
 mount(){ const a=document.getElementById('art'), x=210, w=580, s=Math.min(window.innerWidth,430)/w; a.style.backgroundSize=(1024*s)+'px auto'; a.style.backgroundPosition=(-x*s)+'px 0px'; },
 async act(a,el){
  const P=A.P, d=A.ymd(), me=A.who, day=P.couple[d];
  if(a==='cq'){ const id=el.dataset.id; if(day.done[id]) return; day.done[id]=1; A.saveP(); const n=+el.dataset.r, grew=L.griffinAdd(n); A.earn({feathers:n,label:'for your griffin'}); if(grew) A.toast('🪶 Your griffin grew up!','big'); A.render(); }
  if(a==='bom'){ if(Sync.state.bom.reads[d]) return; Sync.apply('bom.read',{by:me,date:d}); L.griffinAdd(5); A.earn({feathers:5,label:'Book of Mormon'}); A.render(); }
  if(a==='creroll'){ day.reroll++; A.saveP(); A.render(); }
  if(a==='swap'){ day.swap=!day.swap; A.saveP(); A.render(); }
  if(a==='gname'){ const g=Sync.state.griffins[me]||{}; const n=await A.ask('Name your griffin',{value:g.name||'',placeholder:me==='snow'?'Sunwing':'Silverwing',hint:'You name your own; your partner names theirs.'}); if(n){ Sync.apply('griffin.set',{by:me,who:me,name:n}); A.render(); } }
  if(a==='cheer'){ let t=el.dataset.t; if(!t){ t=await A.ask('Write a cheer',{placeholder:'Proud of you 💛',ok:'Send'}); if(!t) return; }
    Sync.apply('cheer.add',{by:me,to:A.OTHER[me],cid:Sync.uid(),text:t}); A.toast('Cheer sent 💛'); A.render(); }
  if(a==='decree'){ const dd=GEN.dates.find(x=>x.id===Sync.state.coffer.last.id); A.modal(`<div class="decree"><div class="seal">🔴</div><h3>Date Night Decree</h3><b>${esc(dd.title)}</b><p>${esc(dd.what)}</p><p class="mh">📍 ${esc(dd.where)} · ${esc(dd.cost)}</p><p class="mh">Check fees, hours, seasons, and road conditions before you go.</p></div><div class="mrow"><button class="mb1" data-close>Huzzah!</button></div>`); }
 } };
// Coffer unlock celebration (watch the shared state)
let lastDecree=null; Sync.on(st=>{ const id=st.coffer.last&&st.coffer.last.id+st.coffer.last.date; if(lastDecree!==null && id && id!==lastDecree){ const dd=GEN.dates.find(x=>x.id===st.coffer.last.id); A.toast(`📜 The Courtship Coffer is full! New Date Night Decree: ${esc(dd.title)}`,'big'); } lastDecree=id||''; });

// ---------------- Castle Kitchen ----------------
const LOCS=['home','parents','out','other'], LOCI={home:'🏠',parents:'🏡',out:'🍽️',other:'🏘️'}, LOCN={home:'dinner at home',parents:'Mom & Dad’s',out:'eating out',other:'someone else’s'};
S.kitchen = { title:'Castle Kitchen', html:(arg)=>{
  const tab=arg||'recipes', d=A.ymd(), sh=Sync.state, mon=A.mondayOf(d), here=L.loc(d), cf=L.cookFor(d), ch=sh.chores[d]||{};
  const week=[0,1,2,3,4,5,6].map(i=>A.addDays(mon,i));
  const strip=`<div class="cw">${week.map(x=>{ const l=L.loc(x), c=L.cookFor(x); return `<div class="cd ${x===d?'now':''} ${l!=='home'?'away':''}" data-act="loc" data-d="${x}"><b>${A.WD[A.weekday(x)]}</b>${c?`<span>🍳${ini(c.cook)}</span><span>🧽${ini(c.dishes)}</span>`:`<span class="aw">${LOCI[l]}</span><span class="awl">${LOCN[l]}</span>`}</div>`}).join('')}</div>`;
  const job=(j,label,sub)=>{ const as=cf[j], dn=ch[j===`cook`?'cook':'dishes'], helped=dn&&dn.by!==as;
    return `<div class="job ${dn?'done':''}" data-act="job" data-j="${j}"><div class="chk">${dn?'✓':''}</div><div class="jt">${label}<small>${sub}</small>${helped?`<span class="help">${A.NAMES[dn.by]} took care of this for ${dn.by===A.who?A.NAMES[as]:'you'} 💛</span>`:''}</div>${tag(as)}</div>`; };
  const items=sh.grocery, est=items.filter(x=>!x.have_it && x.est_price!=='').reduce((s,x)=>s+(+x.est_price||0),0), bud=sh.budget;
  const loves=sh.prefs.filter(p=>p.type==='love'), nos=sh.prefs.filter(p=>p.type==='no');
  const chip=p=>`<span class="chip" data-act="unpref" data-id="${p.id}">${esc(p.item)}${p.person!=='both'?`<i>${A.NAMES[p.person]||p.person}</i>`:''}</span>`;
  const fri=(()=>{let x=d; while(A.weekday(x)!==5) x=A.addDays(x,1); return x;})();
  return `<div class="art" id="art"></div><div class="top"><div class="back" data-go="home">‹</div>${A.pills()}</div>
  <div class="ttl"><h1>Castle Kitchen</h1><div class="sub">FOOD FOR THE WEEK · ${A.short(d).toUpperCase()}</div></div>
  <div class="wrap"><div class="tabs">${[['recipes','🍲 Recipes'],['grocery','🧺 Grocery List'],['prefs','💚 Preferences']].map(([k,n])=>`<div class="tb ${tab===k?'on':''}" data-go="kitchen/${k}">${n}</div>`).join('')}</div>
  <div class="pane ${tab==='recipes'?'on':''}">
   ${cf?`<div class="card"><div class="h">Tonight <span>🏠 dinner at home</span></div><div class="tn">${job('cook','🍳 Cooking',esc((sh.meal[d]||{}).dinner||C.recipes[0].nm))}${job('dishes','🧽 Dishes','after dinner')}</div>${strip}<div class="cn">Cook skips dishes · swaps each home night · cover each other 💛 · tap a day to change where you eat</div></div>`
   :`<div class="card"><div class="h">Tonight <span>${LOCI[here]} dinner away</span></div><div class="away-done"><div class="ad-i">${LOCI[here]}</div><div><b>${here==='parents'?'Dinner at Mom &amp; Dad’s tonight':here==='out'?'Eating out tonight':'Dinner at '+esc((sh.meal[d]||{}).note||'someone else’s')+' tonight'}</b><small>The castle kitchen rests 🏰 · all done for today</small></div><div class="ad-ok">✓</div></div>${strip}<div class="cn">Away nights skip cooking &amp; dishes · roles swap each home night 💛</div></div>`}
   <div class="card"><div class="h"><div>This Week’s Recipes<span class="tag">SAMPLE</span></div><span>top-rated · DASH</span></div>
    ${C.recipes.map((r,i)=>`<div class="r ${i===0&&cf?'today':''}">${i===0&&cf?'<div class="ribbon">🍂 TONIGHT</div>':''}<div class="day">${esc(r.day)}</div><div class="nm">${esc(r.nm)}</div><div class="src">${esc(r.src)} · <span class="st">★★★★★</span> ${esc(r.stars)}</div><div class="meta">${r.meta.map((m,j)=>`<span class="m ${j===1?'g':''}">${esc(m)}</span>`).join('')}</div><div class="open"><small>${esc(r.note)}</small><a class="btn" href="${r.url}" target="_blank" rel="noopener">Open recipe ›</a></div></div>`).join('')}
    <div class="cap">Hanna’s weekly plan replaces these samples (MealPlan tab).</div></div>
   <div class="card"><div class="h">Backup Shelf <span>grab-and-go for busy days</span></div><div class="shelf">${C.shelf.map(s=>`<div class="it"><div class="e">${s.e}</div><div class="n">${esc(s.n)}<small>${s.w}</small></div><div class="s ${s.s}">${esc(s.l)}</div></div>`).join('')}</div><div class="plank"></div><div class="bud">Backup budget<div class="bar"><i style="width:45%"></i></div>~$9 of $20 this week</div></div>
  </div>
  <div class="pane ${tab==='grocery'?'on':''}">
   <div class="card budget"><div class="h">This Week’s Budget <span>pickup Fri ${A.short(fri)}</span></div>
    <div class="big"><b>~$${Math.round(est)} <small>ESTIMATE</small></b><span>budget $${bud.weekly_budget} · hard cap $${bud.hard_cap}</span></div>
    <div class="btrack"><i style="width:${Math.min(100,est/bud.hard_cap*100)}%"></i><div class="mk" style="left:${bud.weekly_budget/bud.hard_cap*100}%"></div><div class="mk cap" style="left:99.5%"></div></div>
    <div class="blab"><span style="left:${Math.min(80,est/bud.hard_cap*100)}%">~$${Math.round(est)} so far</span><span style="left:86%">$${bud.weekly_budget}</span><span style="left:97%;color:#e9a08f">$${bud.hard_cap}</span></div>
    ${est>bud.hard_cap?'<div class="warn">Over the $100 cap. Hanna will trim or flag items; nothing is ordered over it.</div>':''}</div>
   <div class="card"><div class="h">Shared Grocery List <span>Snow &amp; Carson can add</span></div>
    <form class="add" data-form="grocery"><input class="inp" name="item" placeholder="＋ Add an item… (e.g. “bananas”)" maxlength="60" autocomplete="off"><input class="inp pr2" name="price" placeholder="$ est" inputmode="decimal" maxlength="7"><button class="addb">Add</button></form>
    <div class="list">${items.length?items.map(x=>`<div class="gi ${x.have_it?'done':''}"><div class="chk" data-act="have" data-id="${x.id}">${x.have_it?'✓':''}</div><div class="n">${esc(x.item)}${x.note?`<small>${esc(x.note)}</small>`:''}</div><div class="who ${x.added_by==='snow'?'s':'c'}">${A.NAMES[x.added_by]||x.added_by}</div><div class="pr">${x.have_it?'—':x.est_price===''?'?':'$'+(+x.est_price).toFixed(2)}</div><span class="rm" data-act="rmg" data-id="${x.id}">✕</span></div>`).join(''):'<div class="gi">Nothing on the list yet.</div>'}</div>
    <div style="font-size:10.5px;color:#9c876f;margin-top:6px">✓ = have it already · prices are estimates</div>
    <div class="note">🦉 Each week Hanna checks this list against the budget, builds the cart, and sends it to you for a yes before ordering.</div></div>
  </div>
  <div class="pane ${tab==='prefs'?'on':''}">
   <div class="card prefs"><div class="sec">We love 💚</div><div class="chips">${loves.map(chip).join('')}</div>
    <form class="add" data-form="love"><input class="inp" name="item" placeholder="＋ Add something you love…" maxlength="40"><select name="p" class="psel"><option value="both">Both</option><option value="${A.who}">Me</option></select><button class="addb">Add</button></form></div>
   <div class="card prefs no"><div class="sec">No thanks 🚫</div><div class="chips">${nos.map(chip).join('')}</div>
    <form class="add" data-form="no"><input class="inp" name="item" placeholder="＋ Add a no-thanks…" maxlength="40"><select name="p" class="psel"><option value="both">Both</option><option value="${A.who}">Me</option></select><button class="addb">Add</button></form></div>
   <div class="note">🦉 Hanna reads this once a week when planning meals.</div>
  </div><div class="foot">Done is better than perfect 🍎</div></div>`; },
 mount(root){ const a=document.getElementById('art'), x=300,y=40,w=560, s=Math.min(window.innerWidth,430)/w; a.style.backgroundSize=(1024*s)+'px auto'; a.style.backgroundPosition=(-x*s)+'px '+(-y*s)+'px';
  root.querySelectorAll('form[data-form]').forEach(f=>f.onsubmit=e=>{ e.preventDefault(); const v=f.item.value.trim(); if(!v) return; const kind=f.dataset.form;
    if(kind==='grocery'){ const pr=f.price.value.replace(/[^0-9.]/g,''); Sync.apply('grocery.add',{by:A.who,gid:Sync.uid(),item:v,est_price:pr===''?'':+pr,week_of:A.mondayOf(A.ymd())}); }
    else Sync.apply('pref.add',{by:A.who,pid:Sync.uid(),type:kind,item:v,person:f.p.value});
    A.render(); }); },
 act(a,el){ const d=A.ymd(), me=A.who;
  if(a==='job'){ const j=el.dataset.j, key=j==='cook'?'cook':'dishes', ch=Sync.state.chores[d]||{}; if(ch[key]) return; const cf=L.cookFor(d);
    Sync.apply('chore.done',{by:me,date:d,job:key}); A.earn({scales:8,label:cf[j]===me?'':`covered for ${A.NAMES[cf[j]]} 💛`}); A.render(); }
  if(a==='loc'){ const x=el.dataset.d, l=L.loc(x), nx=LOCS[(LOCS.indexOf(l)+1)%LOCS.length]; Sync.apply('meal.set',{by:me,date:x,location:nx}); A.toast(`${A.WD[A.weekday(x)]}: ${LOCN[nx]}`); A.render(); }
  if(a==='have'){ const g=Sync.state.grocery.find(x=>x.id===el.dataset.id); Sync.apply('grocery.set',{by:me,gid:g.id,fields:{have_it:!g.have_it}}); A.render(); }
  if(a==='rmg'){ Sync.apply('grocery.remove',{by:me,gid:el.dataset.id}); A.render(); }
  if(a==='unpref'){ const p=Sync.state.prefs.find(x=>x.id===el.dataset.id); if(p && confirm(`Remove “${p.item}”?`)){ Sync.apply('pref.remove',{by:me,pid:p.id}); A.render(); } }
 } };

// ---------------- Castle Keeping ----------------
S.keeping = { title:'Castle Keeping', html:()=>{
  const d=A.ymd(), sh=Sync.state, mon=A.mondayOf(d), today=L.choresFor(d), ch=sh.chores[d]||{}, du=L.dust(d);
  const segs=Math.max(2, 8-Math.min(4,du.daysSince)-(2-du.doneToday)), lvl=du.doneToday===2?'Sparkling ✨':du.doneToday===1?'Almost sparkling ✨':du.daysSince>=2?'A little dusty':'Mostly tidy';
  const week=[0,1,2,3,4,5,6].map(i=>A.addDays(mon,i));
  const rowSt=x=>{ const c=sh.chores[x]||{}; if(x===d) return '<span class="st td">today</span>'; if(x>d) return A.weekday(x)===0?'<span class="st lt">light</span>':'<span class="st"></span>'; if(x<A.P.created) return '<span class="st"></span>'; return (c.laundry&&c.clean)?'<span class="st ok">✓</span>':'<span class="st rs">🌙 rest</span>'; };
  const q=(t)=>{ const dn=ch[t.job], helped=dn&&dn.by!==t.who, deep=t.deep;
    return `<div class="q ${dn?'done':''}" data-act="chore" data-j="${t.job}" data-w="${t.who}"><div class="chk">${dn?'✓':''}</div><div class="qt"><em>${t.job==='laundry'?'🧺 Laundry':deep?'🧽 Deep clean · 30-min cap':'🧽 Clean'}</em><span class="tx">${esc(t.t)}</span>
      ${deep?`<small>Next Saturday’s deep clean: ${C.deep[((today.wk+1)%4+4)%4].n} (${A.NAMES[L.nextDeep(d).clean.who]}’s turn)</small><span class="timer" data-act="t30">⏱ Start 30-min timer ›</span>`:''}
      ${helped?`<span class="help">${A.NAMES[dn.by]} took care of this for ${dn.by===A.who?A.NAMES[t.who]:'you'} 💛</span>`:''}</div>
      <div class="side">${tag(t.who)}<div class="sap">🐉 +8${helped?` <small>to ${A.NAMES[dn.by]}</small>`:''}</div></div></div>`; };
  return `<div class="art" id="art"></div><div class="top"><div class="back" data-go="home">‹</div>${A.pills()}</div>
  <div class="ttl"><h1>Castle Keeping</h1><div class="sub">${A.pretty(d)}${A.weekday(d)===6?' · DEEP CLEAN DAY':A.weekday(d)===0?' · LIGHT DAY':''}</div></div>
  <div class="wrap"><div class="card meter"><div class="h">The Castle Today <span>never ruined, just a little dusty</span></div>
   <div class="row"><div class="leafs"><span style="left:9px;top:12px">🧹</span><span style="left:27px;top:24px;font-size:12px">✨</span><span style="left:26px;top:6px;font-size:11px">✨</span></div>
    <div class="mt"><b>${lvl}</b><small>${du.doneToday} of 2 done today · ${du.doneToday?'most dust swept away':'a sweep will make it sparkle'}</small></div></div>
   <div class="tbar">${[0,1,2,3,4,5,6,7].map(i=>`<i class="${i<segs-1?'on':i===segs-1?'mid':''}"></i>`).join('')}</div>
   <div class="tl"><span>✨ Sparkling</span><span>Dusty</span><span>Extra dusty</span></div>
   ${du.doneToday<2?`<div class="spark">✨ ${du.doneToday?'One more quest and the last bit of dust is gone.':'Two small quests and the castle sparkles.'}</div>`:''}</div>
  <div class="card"><div class="h">This Week’s Rotation <span>1 laundry + 1 clean · shared</span></div><div class="rtab">
   <div class="rr hd"><b></b><span class="c1">🧺 Laundry</span><span class="c2">🧽 Clean</span><span class="st"></span></div>
   ${week.map(x=>{const c=L.choresFor(x); return `<div class="rr ${x===d?'today':''}"><b>${A.WD[c.wd]}</b><span class="c1">${c.laundry.e} ${c.laundry.s} ${ini(c.laundry.who)}</span><span class="c2">${c.clean.e} ${c.clean.s} ${ini(c.clean.who)}</span>${rowSt(x)}</div>`}).join('')}
  </div><div class="leg"><span>${ini('snow')} Snow · ${ini('carson')} Carson</span><span>roles swap every day · Sat = deep clean</span></div></div>
  <div class="card"><div class="h">Today’s Quests <span>one each · all +8</span></div>${q(today.clean)}${q(today.laundry)}
   <div class="note">Either of you can cover the other’s task. No streak is ever hurt 🛡️</div></div>
  <div class="foot">Good enough is the goal 🏰</div></div>`; },
 mount(){ const a=document.getElementById('art'), x=380,y=20,w=600, s=Math.min(window.innerWidth,430)/w; a.style.backgroundSize=(1024*s)+'px auto'; a.style.backgroundPosition=(-x*s)+'px '+(-y*s)+'px'; },
 act(a,el,e){ const d=A.ymd();
  if(a==='t30'){ if(e) e.stopPropagation(); A.timer('Deep clean · stop when it rings',1800); return; }
  if(a==='chore'){ const j=el.dataset.j, w=el.dataset.w; if((Sync.state.chores[d]||{})[j]) return; Sync.apply('chore.done',{by:A.who,date:d,job:j}); A.earn({scales:8,label:w===A.who?'':`covered for ${A.NAMES[w]} 💛`}); A.toast('✨ Sparkle!'); A.render(); }
 } };

// ---------------- The Dragon's Hoard ----------------
let rewardsSnap=null; fetch('data/rewards.json').then(r=>r.ok?r.json():null).then(j=>{rewardsSnap=j;}).catch(()=>{});
S.hoard = { title:"The Dragon's Hoard", html:(arg)=>{
  const P=A.P, f=L.fam(), fd=L.famDef(f), seas=A.season();
  const rw=(Sync.state.rewards&&Sync.state.rewards[A.who])||(A.who==='snow'?rewardsSnap:null);
  let real;
  if(rw && rw.queue && (rw.queue.length||rw.next_item)){ const nx=rw.next_item, rest=rw.queue.filter(q=>!nx||q.name!==nx.name), show=arg==='all'?rest:rest.slice(0,3), bal=(rw.balances||{})[A.who]||0;
    const price=p=>p==null?'<span class="p tbd">price TBD</span>':`<span class="p">$${(+p).toFixed(2)}</span>`;
    real=`<div class="funds one"><div class="fund s"><div class="who">Your fund</div><b>$${(+bal).toFixed(2)}</b><small>${rw.reward_line_approved?`+$${(rw.reward_line_monthly||{})[A.who]||15}/mo · ~$3.50 a week`:'Reward line not approved yet'}${bal?'':' · starts Fri Oct 9'}</small></div></div>
     ${nx?`<div class="next"><em>★ Next up</em><div class="nm">${esc(nx.name)}</div><div class="bar"><i style="width:${nx.price?Math.min(100,bal/nx.price*100):0}%"></i></div><div class="bl2"><span>$${(+bal).toFixed(0)} of $${(+nx.price).toFixed(2)}</span><span>~$3.50 a week builds it</span></div></div>`:''}
     <div class="q">${show.map(q=>`<div class="qi"><span class="n">${esc(q.name)}</span><span class="mb"></span>${price(q.price)}</div>`).join('')}${rest.length>3&&arg!=='all'?`<div class="qi more" data-go="hoard/all"><span class="n">+ ${rest.length-3} more wants · see all ›</span></div>`:''}</div>`; }
  else real=`<div class="empty">📜 Your fun-wants list is coming from Fineous. Once he adds it, it shows up here, just for you.</div>`;
  const decor=C.decor.filter(x=>!x.season||x.season===seas);
  const goods=[...fd.treats.map(t=>({kind:'treat',...t,sub:`${fd.stages[0]} treat · ${L.famName(f)}’s favorite`})), ...decor.map(x=>({kind:'decor',...x})), ...C.charms.map(x=>({kind:'charm',...x}))];
  const ownedK=P.fam.owned.map(o=>o.kind), lock=Object.keys(C.familiars).filter(k=>!ownedK.includes(k));
  const t0=fd.treats[0];
  return `<div class="art" id="art"></div><div class="top"><div class="back" data-go="keep">‹</div>${A.pills()}</div>
  <div class="ttl"><h1>The Dragon’s Hoard</h1><div class="sub">THE CASTLE TREASURE SHOP · OPEN ${A.hour()>=17?'TONIGHT':'TODAY'}</div></div>
  <div class="bubble"><b>GRANDMOTHER GOLDIE <i class="pend">name pending</i></b>${A.greet()}, ${A.NAMES[A.who]}! Fresh ${esc(t0.n.toLowerCase())} for ${esc(L.famName(f))} today. ${t0.e}</div>
  <div class="wrap"><div class="card"><div class="h">Real Rewards <span>🪙 from main quests</span></div><div class="hs">Your fun wants, kept by Fineous · 🔒 just for you</div>
   ${real}<div class="empty">✨ Wants only · household needs live in Fineous’s budget</div><div class="note">Real money is only spent with your OK. Prices don’t include tax. You have 🪙 ${P.coins} coins.</div></div>
  <div class="card"><div class="h">Hoard Goods <span>🐉 ${P.scales} Dragon Scales to spend</span></div><div class="hs">Decorations, treats, and charms for your keep</div>
   <div class="grid">${goods.map(g=>{ const owned=g.kind==='decor'?P.inv.decor.includes(g.id):g.kind==='charm'?P.inv.charms.includes(g.id):false, have=g.kind==='treat'?(P.inv.treats[g.id]||0):0;
     return `<div class="g"><span class="e">${g.e}</span><b>${esc(g.n)}${g.season?`<span class="tagl sea">${g.season.toUpperCase()}</span>`:''}</b><small>${esc(g.sub)}${have?` · you have ${have}`:''}</small><div class="pr"><span class="cost">🐉 ${g.cost}</span>${owned?'<span class="need">owned ✓</span>':P.scales>=g.cost?`<span class="buy" data-act="buy" data-k="${g.kind}" data-id="${g.id}" data-c="${g.cost}">Buy</span>`:`<span class="need">${g.cost-P.scales} more</span>`}</div></div>`}).join('')}</div>
   <div class="sec">Unlock a new familiar</div>
   <div class="fam">${lock.map(k=>{const x=C.familiars[k]; return `<div class="f" ${P.scales>=x.cost?`data-act="unlock" data-k="${k}"`:''}><span class="e">${x.emoji}</span><b>${esc(x.name)}</b><span class="cost">🐉 ${x.cost}</span><span class="lk">${P.scales>=x.cost?'Unlock':(x.cost-P.scales)+' more'}</span></div>`}).join('')||'<div class="f">You’ve met everyone 💛</div>'}</div></div>
  <div class="foot">Everglade restocks the hoard every Sunday 🍂</div></div>`; },
 mount(){ const a=document.getElementById('art'), x=270,w=640, s=Math.min(window.innerWidth,430)/w; a.style.backgroundSize=(1024*s)+'px auto'; a.style.backgroundPosition=(-x*s)+'px 64px'; },
 async act(a,el){ const P=A.P;
  if(a==='buy'){ const c=+el.dataset.c, k=el.dataset.k, id=el.dataset.id; if(!A.spend(c)) return;
    if(k==='treat') P.inv.treats[id]=(P.inv.treats[id]||0)+1; if(k==='decor') P.inv.decor.push(id); if(k==='charm') P.inv.charms.push(id); A.saveP();
    A.toast(k==='decor'?'Bought! Place it with ✨ Decorate on Home.':'Bought! 💛'); A.render(); }
  if(a==='unlock'){ const k=el.dataset.k, x=C.familiars[k]; if(!A.spend(x.cost)) return; const n=await A.ask('Name your friend',{placeholder:x.suggest,hint:`Your new ${x.name.toLowerCase()} needs a name. “${x.suggest}” is only a suggestion.`});
    P.fam.owned.push({kind:k,name:n||x.suggest,xp:0,full:70,happy:85,cared:A.now().toISOString(),since:A.ymd()}); A.saveP(); A.toast(`${x.emoji} ${esc(n||x.suggest)} joined your keep!`,'big'); A.render(); }
 } };
})();
