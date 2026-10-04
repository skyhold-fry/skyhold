/* Core: dates (America/Boise), private per-partner store, rewards, toasts, modals, router. */
window.App = (function(){
const TZ='America/Boise';
const $ = (s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc = s => String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// ---------- dates (all "days" are Boise calendar days) ----------
let clockOffset = 0;                                   // tests can shift "now"
const now = () => new Date(Date.now()+clockOffset);
function ymd(d=now()){ const p=Sun.boiseParts(d); return `${p.y}-${String(p.m).padStart(2,'0')}-${String(p.d).padStart(2,'0')}`; }
const dnum = s => Math.round(Date.UTC(+s.slice(0,4),+s.slice(5,7)-1,+s.slice(8,10))/86400000);   // day number
const fromDnum = n => new Date(n*86400000).toISOString().slice(0,10);
const addDays = (s,n) => fromDnum(dnum(s)+n);
const weekday = s => new Date(dnum(s)*86400000).getUTCDay();              // 0 Sun .. 6 Sat
const WD=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], WDL=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const pretty = s => `${WDL[weekday(s)].toUpperCase()} · ${MON[+s.slice(5,7)-1].toUpperCase()} ${+s.slice(8,10)}`;
const short = s => `${MON[+s.slice(5,7)-1]} ${+s.slice(8,10)}`;
const mondayOf = s => addDays(s, -((weekday(s)+6)%7));
const ANCHOR = '2026-09-28';                           // Monday of "week A" in side-quests.md §5
function season(s=ymd()){ const m=+s.slice(5,7); return m>=9&&m<=11?'autumn':m===12||m<=2?'winter':m<=5?'spring':'summer'; }
function hour(){ return Sun.boiseParts(now()).h; }
const greet = () => { const h=hour(); return h<12?'Morning':h<17?'Afternoon':'Evening'; };
// seeded random (stable picks per day/person/area)
function rng(seed){ let h=1779033703^seed.length; for(let i=0;i<seed.length;i++){h=Math.imul(h^seed.charCodeAt(i),3432918353);h=h<<13|h>>>19;}
  return ()=>{ h=Math.imul(h^h>>>16,2246822507); h=Math.imul(h^h>>>13,3266489909); return ((h^=h>>>16)>>>0)/4294967296; }; }
function shuffle(arr,seed){ const a=arr.slice(), r=rng(seed); for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
// ---------- who + private store ----------
const NAMES={snow:'Snow',carson:'Carson'}, OTHER={snow:'carson',carson:'snow'};
const pron = {snow:{her:'him',his:'his',she:'he',He:'He'}, carson:{her:'her',his:'her',she:'she',He:'She'}};   // pronoun for the PARTNER
let who = localStorage.getItem('sky.who') || '';
function setWho(w){ who=w; localStorage.setItem('sky.who',w); P=loadP(); }
function defaultP(w){
  return {coins:0, scales:0, feathers:0, xp:0, created:ymd(),
    fam:{owned:[], active:null}, inv:{treats:{}, decor:[], charms:[]}, slots:{},
    side:{}, areas:{SP:0,SO:0,PH:0,IN:0}, mastered:{}, wins:[],
    main:{}, couple:{}, facts:[], gearSeen:[], careDay:{},
    settings:{light:false, people:[], fills:Object.assign({},C.fillDefaults[w]||{}), plans:{}, gear:w==='carson', facts:w==='carson', gymDays:[1,3,5],
      notif:{morning:'05:30', night:'21:15', bed:'21:00', on:false}}};
}
function loadP(){ if(!who) return null; try{ const v=JSON.parse(localStorage.getItem('sky.p.'+who)); if(v) return Object.assign(defaultP(who),v); }catch(e){} return defaultP(who); }
let P = loadP();
function saveP(){ if(who) localStorage.setItem('sky.p.'+who, JSON.stringify(P)); }
// ---------- earning ----------
function earn({coins=0, scales=0, feathers=0, xp, label='', fact=false}){
  P.coins+=coins; P.scales+=scales; P.feathers+=feathers;
  const gained = xp!=null?xp:(coins+scales+feathers);
  const before = C.levelForXp(P.xp); P.xp+=gained; const after=C.levelForXp(P.xp);
  saveP();
  const bits=[coins&&`+${coins} 🪙`, scales&&`+${scales} 🐉`, feathers&&`+${feathers} 🪶`].filter(Boolean).join(' ');
  if(bits) toast(`${bits}${label?' · '+esc(label):''}`, 'win');
  if(P.settings.gear && gained>0) toast(`+${gained} XP`, 'xp');
  if(P.settings.gear && after>before){ const g=C.gear.filter(x=>x.lv>before && x.lv<=after); toast(`⚔️ Level ${after}!`+(g.length?` New gear: ${g.map(x=>x.e+' '+x.n).join(', ')}`:''), 'big'); }
  if(fact && P.settings.facts){ const left=C.facts.map((f,i)=>i).filter(i=>P.facts.indexOf(i)<0); const pool=left.length?left:C.facts.map((f,i)=>i);
    const i=pool[Math.floor(Math.random()*pool.length)]; if(!left.length) P.facts=[]; P.facts.push(i); saveP(); setTimeout(()=>toast('🧠 Cool fact: '+C.facts[i],'fact'),600); }
}
function spend(scales){ if(P.scales<scales) return false; P.scales-=scales; saveP(); return true; }
// ---------- UI helpers ----------
let toastBox;
function toast(html, kind=''){
  if(!toastBox){ toastBox=document.createElement('div'); toastBox.id='toasts'; document.body.appendChild(toastBox); }
  const t=document.createElement('div'); t.className='toast '+kind; t.innerHTML=html; toastBox.appendChild(t);
  setTimeout(()=>t.classList.add('out'), kind==='fact'||kind==='big'?5200:2400); setTimeout(()=>t.remove(), kind==='fact'||kind==='big'?5800:3000);
}
function modal(html, {onClose, cls=''}={}){
  const m=document.createElement('div'); m.className='modal '+cls; m.innerHTML=`<div class="sheet" role="dialog">${html}</div>`;
  m.addEventListener('click', e=>{ if(e.target===m || e.target.closest('[data-close]')){ m.remove(); onClose&&onClose(); } });
  document.body.appendChild(m); const f=m.querySelector('input,textarea'); if(f) setTimeout(()=>f.focus(),50); return m;
}
function ask(title, {value='', placeholder='', ok='Save', hint=''}={}){
  return new Promise(res=>{ const m=modal(`<h3>${title}</h3>${hint?`<p class="mh">${hint}</p>`:''}<input class="min" maxlength="40" value="${esc(value)}" placeholder="${esc(placeholder)}"><div class="mrow"><button data-close class="mb2">Cancel</button><button class="mb1" data-ok>${ok}</button></div>`,{onClose:()=>res(null)});
    const go=()=>{ const v=m.querySelector('input').value.trim()||placeholder; m.remove(); res(v); };
    m.querySelector('[data-ok]').onclick=go; m.querySelector('input').onkeydown=e=>{ if(e.key==='Enter') go(); }; });
}
function timer(label, secs){
  let left=secs, iv; const m=modal(`<h3>${esc(label)}</h3><div class="tmr">${fmtT(left)}</div><div class="mrow"><button data-close class="mb2">Close</button></div>`,{onClose:()=>clearInterval(iv)});
  iv=setInterval(()=>{ left--; const el=m.querySelector('.tmr'); if(!el){clearInterval(iv);return;} el.textContent=left>0?fmtT(left):'Done 💛'; if(left<=0){clearInterval(iv); if(navigator.vibrate) navigator.vibrate(200);} },1000);
}
const fmtT = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
// ---------- router ----------
const screens = {};
function route(){ const h=location.hash.replace(/^#\/?/,'')||'home'; const [name,...rest]=h.split('/'); return {name, arg:rest.join('/')}; }
function go(h){ if(location.hash==='#/'+h) render(); else location.hash='#/'+h; }
let current=null;
function render(){
  if(!who){ return show('who',''); }
  if(!P.fam.owned.length){ return show('onboard',''); }
  const r=route(); show(screens[r.name]?r.name:'home', r.arg);
}
function show(name, arg){
  const app=$('#app'); const prev=current; current=name;
  if(prev && screens[prev] && screens[prev].leave) screens[prev].leave();
  app.innerHTML = `<div id="s-${name}" class="scr">${screens[name].html(arg)}</div>`;
  if(screens[name].mount) screens[name].mount($('#s-'+name), arg);
  if(prev!==name) window.scrollTo(0,0);
  document.title = 'Skyhold · '+(screens[name].title||name);
}
// delegated clicks: data-go="route" / data-act="name" handled by the active screen
document.addEventListener('click', e=>{
  const g=e.target.closest('[data-go]'); if(g){ e.preventDefault(); go(g.dataset.go); return; }
  const a=e.target.closest('[data-act]'); if(a && screens[current] && screens[current].act){ if(!a.matches('input,select,textarea,a[href]')) e.preventDefault(); screens[current].act(a.dataset.act, a, e); }
});
window.addEventListener('hashchange', render);
return {TZ,$,$$,esc,now,ymd,dnum,addDays,weekday,WD,WDL,MON,pretty,short,mondayOf,ANCHOR,season,hour,greet,rng,shuffle,NAMES,OTHER,pron,
  get who(){return who}, setWho, get P(){return P}, saveP, earn, spend, toast, modal, ask, timer, screens, go, render, route,
  setClockOffset(ms){clockOffset=ms}, uid:()=>Sync.uid()};
})();
