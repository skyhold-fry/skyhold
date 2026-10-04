/* Tough Moment + Tempted (tough-moment.md). Calm screens: no pills, no currencies (except the optional +5 side-quest win).
   Nothing picked here is stored or synced. Only the user-written if-then plans stay on this phone. */
(function(){
const A=App, S=A.screens, esc=A.esc;
const DUPES=[['R1','R2'],['B2','SL2']];
const detail = {
 M1:'<b>STOP & go</b><ol><li><b>S</b>top. Don’t act on it yet.</li><li><b>T</b>ake a step back: move away from the cue.</li><li><b>O</b>ne breath: “What’s under this? Bored, stressed, lonely, tired?”</li><li><b>P</b>ick an action and start it now.</li></ol>',
 M2:'<b>Name it</b><p>“I’m feeling ___, and it makes sense because ___.”</p><p>Naming a feeling turns the volume down a little.</p>',
 M3:'<b>Check the facts</b><ol><li>What happened, just the facts?</li><li>What am I telling myself about it?</li><li>Is there another way to see it?</li><li>What am I afraid will happen?</li><li>How likely is that, really?</li><li>Does my feeling (and its size) fit the facts?</li></ol>',
 M5:'<b>Radical acceptance</b><p>“This is what’s happening. I don’t have to like it. I can get through this moment.”</p>',
 S5:'<b>Self-compassion</b><p>Hand on your heart: “This is hard, and I’m doing something kind for myself.”</p>',
 R3:'<b>Go where people are</b><p>The living room, a store, the library, the church building. You don’t have to talk.</p>',
 R5:'<b>DEAR MAN</b><ol><li><b>D</b>escribe the facts</li><li><b>E</b>xpress how you feel</li><li><b>A</b>sk clearly</li><li><b>R</b>einforce: why it helps you both</li><li>stay <b>M</b>indful · <b>A</b>ppear confident · <b>N</b>egotiate</li></ol>',
 A4:'<b>Brain dump</b><p>Write everything on your mind. Circle ONE thing. Do only that.</p><textarea class="mta" placeholder="Just for you · not saved"></textarea>',
 A5:'<b>Shelve it</b><p>Write the worry down and give it an appointment: 7 pm tomorrow. Until then it waits on the shelf.</p><textarea class="mta" placeholder="Not saved"></textarea>',
 A7:'<b>You’ve done hard things</b><p>Remember one time you got through something hard. What helped then?</p>',
 SL1:'<b>Can’t sleep?</b><p>Awake about 20 minutes? Get up, keep the light dim, and read something boring until you feel sleepy. Then try again.</p>',
 SL2:'<b>Bedside pad</b><p>Write the worries down so your brain can let go of them until morning.</p><textarea class="mta" placeholder="Not saved"></textarea>',
 G1:'<b>One repair step</b><p>Is there one thing you can do to make it right? A sorry, a fix, a prayer. If not, self-compassion is the repair.</p>',
 TG:'<b>Three good things</b><p>Write 3 good things from today and why each happened.</p><textarea class="mta" placeholder="Not saved"></textarea>',
 CP:'<b>Less comparison input</b><p>Close the app, put the phone in another room, and start something else right now.</p>',
 HALT:'<b>HALT check</b><ul><li><b>Hungry?</b> Eat something with protein.</li><li><b>Angry?</b> Cold water or fast stairs first.</li><li><b>Lonely?</b> Call or text your person.</li><li><b>Tired?</b> Go to bed now; phone outside the room.</li></ul>' };
const crisisRow = () => `<div class="crisis"><div class="h"><span><b>Support, any time</b> · free &amp; confidential</span></div><div class="cr">${C.crisis.map(c=>`<a ${c.p?'class="p"':''} href="${c.href}" ${/^http/.test(c.href)?'target="_blank" rel="noopener"':''}>${c.n}<small>${c.s}</small></a>`).join('')}</div></div>`;
const notSafe = () => A.modal(`<h3>You matter. Help is here right now.</h3><a class="cbig p" href="tel:988">📞 Call 988<small>Suicide &amp; Crisis Lifeline · 24/7</small></a><a class="cbig" href="sms:988">💬 Text 988</a><a class="cbig" href="sms:741741&body=HOME">💬 Text HOME to 741741<small>Crisis Text Line · 24/7</small></a><a class="cbig r" href="tel:911">🚨 Call 911<small>if you or someone else is in danger right now</small></a><p class="mh">If you can, move away from anything you could use to hurt yourself and go where other people are.</p><div class="mrow"><button class="mb2" data-close>Close</button></div>`,{cls:'calmm'});
function startAction(id, why){
  const x=C.actions[id]; if(!x) return;
  if(x.timer) return A.timer(x.a, x.timer);
  if(x.sms) return location.href='sms:&body='+encodeURIComponent(x.sms);
  if(x.tel){ const p=(A.P.settings.people||[])[0]; return p&&p.phone?location.href='tel:'+p.phone:A.modal(`<h3>Call your person</h3><p class="mh">Open your phone and call whoever feels safe. Add your people in ⚙️ Settings to get a one-tap call.</p><div class="mrow"><button class="mb1" data-close>OK</button></div>`); }
  if(x.url) return window.open(x.url,'_blank','noopener');
  if(detail[id]) return A.modal(`<div class="dtl">${detail[id]}</div><div class="mrow"><button class="mb1" data-close>Close</button></div>`,{cls:'calmm'});
  A.toast('Good. That counts 💛');
}
// ---- the merge (tough-moment.md §1D) ----
function merge(picks){
  const fs=picks.map(id=>C.feelings.find(f=>f.id===id)), sc={}, why={}, best={};
  fs.forEach(f=>f.steps.forEach(([id,w],i)=>{ const p=i===0?3:i===1?2:1; sc[id]=(sc[id]||0)+p; if(!(id in best)||p>best[id]){best[id]=p; why[id]=w;} }));
  DUPES.forEach(([a,b])=>{ if(sc[a]!=null&&sc[b]!=null){ const keep=sc[a]>=sc[b]?a:b, drop=keep===a?b:a; sc[keep]+=0; delete sc[drop]; } });
  let ids=Object.keys(sc).sort((a,b)=>sc[b]-sc[a] || C.actions[a].a.length-C.actions[b].a.length || (C.actions[a].timer||0)-(C.actions[b].timer||0));
  // mix the kinds: ≤2 per group within the top 5
  const out=[], later=[], cnt={}; ids.forEach(id=>{ const g=C.actions[id].g; if(out.length<5 && (cnt[g]||0)>=2) later.push(id); else { out.push(id); cnt[g]=(cnt[g]||0)+1; } }); ids=out.concat(later);
  // body first when distress is high
  if(fs.some(f=>f.hi) && !ids.slice(0,3).some(id=>C.actions[id].tipp)){ let t=ids.find(id=>C.actions[id].tipp)||'B2'; if(!why[t]) why[t]='Calms your body first when feelings run hot.'; ids=ids.filter(x=>x!==t); ids.splice(2,0,t); }
  const many=picks.length>=6; if(many){ const b=ids.find(id=>C.actions[id].g==='B'); if(b){ ids=[b].concat(ids.filter(x=>x!==b)); } }
  const n=picks.length===1?3:picks.length===2?4:5;
  return {ids, why, n, many, pin988:fs.some(f=>f.pin988)};
}
const stepHtml=(id,i,why)=>{ const x=C.actions[id]; return `<div class="st" data-act="step" data-id="${id}"><div class="n">${i+1}</div><div class="t"><div class="a">${esc(x.a)}${x.tel||x.sms?' <span class="who">tap to choose</span>':''}</div><div class="w">${esc(why||'')}</div><span class="k">${esc(x.k)}</span></div><div class="go">${x.go}</div></div>`; };
const plain = s => s.replace(/<br>/g,' ');
let picks=[], helped=false, more=false, followT=null;
S.tough = { title:'Tough moment', html:()=>{
  let res='';
  if(helped && picks.length){ const m=merge(picks), names=picks.map(id=>plain(C.feelings.find(f=>f.id===id).n).toLowerCase()); const shown=m.ids.slice(0,m.n), rest=m.ids.slice(m.n);
    const head=names.map((n,i)=>i?n:n[0].toUpperCase()+n.slice(1)).join(' + ');
    res=`${m.pin988?'<a class="pin988" href="tel:988">💛 If it gets darker, 988 is here, call or text <b>988</b> ›</a>':''}
     <div class="rh">${m.many?'That’s a lot to carry at once. Let’s start with your body.':`${esc(head)}: here are ${shown.length} things that can help`}<small>Start with whichever one feels doable.</small></div>
     ${shown.map((id,i)=>stepHtml(id,i,m.why[id])).join('')}${rest.length?(more?rest.map((id,i)=>stepHtml(id,i+shown.length,m.why[id])).join(''):`<div class="more" data-act="more">Show more ›</div>`):''}`; }
  return `<div class="art"></div><div class="top"><div class="back" data-act="back">‹</div><div class="lock">🔒 Only on this phone · never shared</div></div>
  <div class="ttl"><h1>🌙 Tough moment</h1><div class="fox">A dove rests on the sill. Take your time.</div></div>
  <div class="pin"><div class="safe" data-act="notsafe">🆘 I'm not safe</div><div class="tempt" data-go="tempted">🔥 Tempted</div></div>
  <div class="wrap"><div class="calm"><b>You're not alone.</b> This feeling will pass.<br>Pick one thing. Any one counts.</div>
  <h2>What are you feeling?</h2><div class="hint">Tap as many as fit. Tempted? Use 🔥 above.</div>
  <div class="grid">${C.feelings.map(f=>{const on=picks.includes(f.id); return `<div class="ch ${f.wide?'wide':''} ${on?'on':''}" data-act="feel" data-id="${f.id}" style="--c:${on?f.c.replace(/,\.\d+\)$/,',.20)'):f.c}"><i>${f.e}</i>${f.n}</div>`}).join('')}</div>
  ${picks.length?`<div class="bar" data-act="help"><span>${picks.length} picked</span><b>Help me</b></div>`:''}
  <div id="res">${res}</div>
  <div class="note">Close this anytime. Nothing here is saved or counted,<br>and it never touches streaks or rewards. 💛</div></div>${crisisRow()}`; },
 leave(){ },
 act(a,el){
  if(a==='back'){ picks=[]; helped=false; more=false; A.go('home'); return; }
  if(a==='notsafe') return notSafe();
  if(a==='feel'){ const id=el.dataset.id; picks=picks.includes(id)?picks.filter(x=>x!==id):picks.concat(id); helped=false; more=false; A.render(); return; }
  if(a==='help'){ helped=true; more=false; A.render(); setTimeout(()=>{const r=document.getElementById('res'); r&&r.scrollIntoView({behavior:'smooth',block:'start'});},40); followUp(); return; }
  if(a==='more'){ more=true; A.render(); return; }
  if(a==='step'){ startAction(el.dataset.id); }
 } };
// "Feeling any better? 💛": gentle check-in ~2 h later. Best-effort (needs the app open or a push service); nothing stored.
function followUp(){ if(followT) clearTimeout(followT); if(!('Notification' in window) || Notification.permission!=='granted') return;
  followT=setTimeout(()=>Notif.show('Feeling any better? 💛','No need to answer. We’re here if you need anything.'), 2*3600*1000); }

// ---- Tempted ----
let kind='porn', feel='', lastDid='';
const dsnRun = (label) => { lastDid=label; const map={
  '10 pushups':()=>pushups(), 'Walk outside':()=>A.timer('Walk outside',600), 'Cold water':()=>A.timer('Cold water on your face',30),
  'Side quest':()=>A.go('side'), 'A hands-on task':()=>A.timer('10 minutes hands-on',600), 'Text your person':()=>location.href='sms:&body='+encodeURIComponent('Having a hard moment. Can you talk for 5 min?'),
  'Call someone':()=>startAction('R2'), 'Find your spouse':()=>A.toast('Go find '+A.NAMES[A.OTHER[A.who]]+' 💛'), 'Go where people are':()=>A.toast('Go now. The phone can stay behind 💛'),
  'Step outside':()=>A.timer('Step outside',300), 'Tidy one spot':()=>A.timer('Tidy one spot',300), 'Cook something':()=>A.go('kitchen'), 'Piano / a game together':()=>A.toast('Have fun 🎹') };
  (map[label]||(()=>A.toast('Go for it 💛')))(); };
function pushups(){ let n=0; const m=A.modal(`<h3>10 pushups</h3><div class="tmr" id="pu">0</div><div class="mrow"><button class="mb2" data-close>Close</button><button class="mb1" id="pub">+1</button></div>`,{cls:'calmm'});
  m.querySelector('#pub').onclick=()=>{ n++; m.querySelector('#pu').textContent=n>=10?'10 ✓ 💪':n; }; }
const secsOf = s => { let m=s.match(/(\d+)\s*sec/); if(m) return +m[1]; m=s.match(/(\d+)[- ]min/); return m?+m[1]*60:120; };
S.tempted = { title:'Tempted', html:()=>{
  const k=C.tempted.find(x=>x.id===kind), hi=(C.dsn.feel.find(f=>f[0]===feel)||[0,0,[]])[2], plan=A.P.settings.plans[kind]||k.plan; let n=0;
  const sq=(()=>{ try{ const d=L.sidePicks(A.ymd()); const id=d.picks.PH.ids[d.picks.PH.ids.length-1]; return L.fill(L.task(id).t).replace(/\s*\(.*?\)/g,'').split(/[:.;,]/)[0].split(' ').reduce((a,w)=>(a+' '+w).length<=24?(a?a+' '+w:w):a,''); }catch(e){ return 'Side quest'; } })();
  const rs=[['🌱','Addiction Recovery Program (ARP)','Free 12-step meetings, in person or virtual<br>addictionrecovery.churchofjesuschrist.org','Find','https://addictionrecovery.churchofjesuschrist.org/'],
    ['🕊️','Talk with your bishop','Confidential · can refer you to Family Services','Plan',''],
    ...(kind==='porn'?[['📖','Addressing Pornography','Church resources for you and spouses','Open','https://www.churchofjesuschrist.org/life/pornography']]:[]),
    ...(kind==='binge'?[['🍃','ANAD Eating Disorders Helpline','1-888-375-7767 · free peer support · Mon–Fri 8 am–8 pm MT · warmline, not a crisis line','Call','tel:18883757767']]:[]),
    ['📞','SAMHSA Helpline','1-800-662-4357 · free, confidential, 24/7','Call','tel:18006624357'],
    ['💬','A licensed counselor','Family Services or a therapist. Treatment works.','Info','https://www.churchofjesuschrist.org/life/family-services']];
  return `<div class="art"></div><div class="top"><div class="back" data-go="tough">‹</div><div class="lock">🔒 Only on this phone · never shared</div></div>
  <div class="ttl"><h1>🔥 Tempted</h1><div class="fox">A dove rests on the sill. You've got time.</div></div><div class="pin"><div class="safe" data-act="notsafe">🆘 I'm not safe</div></div>
  <div class="wrap"><div class="calm"><b>An urge is a signal, not a command.</b><br>You don't have to sit still and fight it.<br>Get up and do something with it.</div>
  <h2>What kind of temptation?</h2><div class="hint">Pick one. You can switch anytime. Nothing is saved.</div>
  <div class="kinds">${C.tempted.map(x=>`<div class="k2 ${x.id===kind?'on':''}" data-act="kind" data-id="${x.id}">${x.n}</div>`).join('')}</div>
  <div class="hint" style="margin:8px 2px 0">🌀 Sucked in = one more episode, chapter, round, or video</div>
  <div class="dsn"><div class="hd"><div class="ic">⚡</div><div><b>Do something now</b><small>Tap one to start. Doing beats waiting.</small></div></div>
   <div class="q">What's under this? <small>· tap one · not saved</small></div>
   <div class="fe">${C.dsn.feel.map(f=>`<span class="${f[0]===feel?'on':''}" data-act="dfeel" data-id="${f[0]}">${f[1]}</span>`).join('')}</div>
   ${C.dsn.rows.map(r=>`<div class="ar ${hi.includes(r[0])?'hl':''}"><div class="lb">${r[1]}${r[2]?`<small>${r[2]}</small>`:''}</div><div class="cs">${r[3].map(([lab,log],i)=>`<span class="${hi.includes(r[0])&&i===0?'sg':''}" data-act="do" data-l="${esc(lab)}" data-log="${esc(log)}">${lab==='Side quest'?'Side quest: '+esc(sq):lab}</span>`).join('')}</div></div>`).join('')}
   <div class="br" data-act="breath">🫁 <span>Need to settle first? <b>30-sec breath</b>, then pick one.</span></div>
   <div class="lg" data-act="log"><span>Did one? Log it as a side quest win<small>Saves only the action (“Took a walk”), never this screen</small></span><b>+5 🐉</b></div></div>
  ${k.groups.map(([g,steps])=>`<div class="grp">${g}</div>${steps.map(s=>{n++; return `<div class="st" data-act="tstep" data-g="${esc(s[3])}" data-a="${esc(s[0])}" data-w="${esc(s[1])}"><div class="n">${n}</div><div class="t"><div class="a">${esc(s[0])}</div><div class="w">${esc(s[1])}</div><span class="k">${esc(s[2])}</span></div><div class="go">${s[3]}</div></div>`}).join('')}${g==='Redirect'||(k.groups.length===1)?`<div class="plan" data-act="plan"><b>Your if-then plan</b><p>“${esc(plan)}”</p><small>${A.P.settings.plans[kind]?'Your plan':'Starter plan'} · tap to edit · kept only on this phone</small></div>`:''}`).join('')}
  <div class="rs"><h3>🤝 Recovery support</h3><div class="sub2">Free and confidential · one tap, nothing sent for you</div>
   ${rs.map(r=>`<div class="ri"><span class="e">${r[0]}</span><div class="x"><b>${r[1]}</b><small>${r[2]}</small></div>${r[4]?`<a class="o" href="${r[4]}" ${/^http/.test(r[4])?'target="_blank" rel="noopener"':''}>${r[3]}</a>`:`<span class="o" data-act="bishop">${r[3]}</span>`}</div>`).join('')}</div>
  <div class="slip" data-act="slip"><b>Had a slip? Tap here, no judgment.</b><small>A slip is not a fall. Never miss twice. 💛</small></div>
  <div class="note">Nothing here touches streaks, coins, or your keep.<br>Close this anytime.</div></div>${crisisRow()}`; },
 async act(a,el){ const P=A.P;
  if(a==='notsafe') return notSafe();
  if(a==='kind'){ kind=el.dataset.id; A.render(); return; }
  if(a==='dfeel'){ feel=feel===el.dataset.id?'':el.dataset.id; A.render(); return; }
  if(a==='do'){ el.closest('.dsn').dataset.last=el.dataset.log; lastDid=el.dataset.log; dsnRun(el.dataset.l); lastDid=el.dataset.log; return; }
  if(a==='breath') return A.timer('Breathe in 4 · out 6',30);
  if(a==='log'){ const labels=C.dsn.rows.flatMap(r=>r[3].map(x=>x[1]));
    const pick = lastDid || await new Promise(res=>{ const m=A.modal(`<h3>What did you do?</h3><div class="chips2">${labels.map(l=>`<span class="chip" data-l="${esc(l)}">${esc(l)}</span>`).join('')}</div><div class="mrow"><button class="mb2" data-close>Cancel</button></div>`,{onClose:()=>res(null),cls:'calmm'}); m.querySelectorAll('[data-l]').forEach(c=>c.onclick=()=>{m.remove();res(c.dataset.l);}); });
    if(!pick) return; P.wins.push({date:A.ymd(), label:pick}); A.saveP(); A.earn({scales:5,label:pick}); lastDid=''; return; }
  if(a==='tstep'){ const g=el.dataset.g, t=el.dataset.a, w=el.dataset.w;
    if(g==='Start') return A.timer(t, secsOf(t));
    if(g==='Text'){ const q=w.match(/“(.+?)”/)||t.match(/“(.+?)”/); return location.href='sms:&body='+encodeURIComponent(q?q[1]:'Having a hard moment. Can you talk for 5 min?'); }
    if(g==='Check') return A.modal(`<div class="dtl">${detail.HALT}</div><div class="mrow"><button class="mb1" data-close>Close</button></div>`,{cls:'calmm'});
    if(g==='Remind'){ A.toast('We’ll include it in tonight’s bedtime reminder 🌙'); return; }
    if(/planned alternative/i.test(t)) return A.modal(`<h3>Your plan</h3><p>“${esc(P.settings.plans[kind]||C.tempted.find(x=>x.id===kind).plan)}”</p><div class="mrow"><button class="mb1" data-close>Do it now</button></div>`,{cls:'calmm'});
    if(/1 Corinthians/.test(t)) return window.open('https://www.churchofjesuschrist.org/study/scriptures/nt/1-cor/10?id=p13#p13','_blank','noopener');
    if(g==='Open') return A.modal(`<div class="dtl"><b>${esc(t)}</b><p>${esc(w)}</p></div><div class="mrow"><button class="mb1" data-close>OK</button></div>`,{cls:'calmm'});
    return A.toast('Go now 💛'); }
  if(a==='plan'){ const cur=P.settings.plans[kind]||C.tempted.find(x=>x.id===kind).plan;
    const m=A.modal(`<h3>Your if-then plan</h3><p class="mh">“If [cue], then I’ll [action].” Kept only on this phone.</p><textarea class="mta">${esc(cur)}</textarea><div class="mrow"><button class="mb2" data-close>Cancel</button><button class="mb1" id="ps">Save</button></div>`,{cls:'calmm'});
    m.querySelector('#ps').onclick=()=>{ const v=m.querySelector('textarea').value.trim(); if(v) P.settings.plans[kind]=v; else delete P.settings.plans[kind]; A.saveP(); m.remove(); A.render(); }; return; }
  if(a==='bishop') return A.modal(`<div class="dtl"><b>Talk with your bishop</b><p>It’s confidential. You can text him to ask for a time to talk; you don’t have to explain why. He can also refer you to Family Services counseling.</p></div><div class="mrow"><button class="mb1" data-close>OK</button></div>`,{cls:'calmm'});
  if(a==='slip') return A.modal(`<div class="dtl"><b>You opened this. That matters.</b><p>A slip is a moment, not who you are.</p><ol><li><b>Breathe</b> in 4, out 6. Then name what you feel. Guilt is okay. Shame isn’t the truth about you.</li><li><b>Learn, don’t punish:</b> what came before it? Time · place · feeling · HALT. <i>(Just think it through; nothing is saved.)</i></li><li><b>Update one if-then plan</b> for next time.</li><li><b>Repair</b>, when you’re ready: pray, talk with your bishop, or tell your spouse if you choose to.</li></ol><p>“My grace is sufficient for all men that humble themselves before me” (Ether 12:27).</p><p><b>Keep turning. You’re still on the path.</b> Nothing resets.</p></div><div class="mrow"><button class="mb2" data-act-x="breath" id="sb">Breathe 30 sec</button><button class="mb1" id="sp">Update my plan</button></div>`,{cls:'calmm'}) && (()=>{ const m=document.querySelector('.modal:last-child'); m.querySelector('#sb').onclick=()=>A.timer('Breathe in 4 · out 6',30); m.querySelector('#sp').onclick=()=>{ m.remove(); S.tempted.act('plan'); }; })();
 } };
})();
