/* Game rules: daily picks, rotations, levels, familiars. Pure-ish functions over App.P + Sync.state. */
window.L = (function(){
const A=App;
// ---------- familiars ----------
function fam(){ const P=A.P; return P.fam.owned.find(f=>f.kind===P.fam.active)||P.fam.owned[0]; }
const famDef = f => C.familiars[f.kind];
const famLv = f => 1+Math.floor((f.xp||0)/10);              // 10 care/treat XP per level
const famStageIdx = f => C.stageOf(famLv(f));
const famStage = f => famDef(f).stages[famStageIdx(f)];
const famName = f => f.name || famDef(f).suggest;
// gentle needs: drop a little over time, never below 20 (never sickens, never leaves)
function needs(f){ const h=(A.now()-new Date(f.cared||A.now()))/36e5; return {full:Math.max(20,Math.min(100,(f.full??70)-h*1.5)), happy:Math.max(20,Math.min(100,(f.happy??80)-h*1.2))}; }
function care(kind, treat){
  const P=A.P, f=fam(), n=needs(f), d=A.ymd(), cd=P.careDay[d]||(P.careDay[d]={pet:0,play:0,feed:0});
  const beforeStage=famStageIdx(f);
  if(kind==='feed'){ if(!(P.inv.treats[treat]>0)) return 'none'; P.inv.treats[treat]--; f.full=Math.min(100,n.full+30); f.happy=Math.min(100,n.happy+8); f.xp=(f.xp||0)+4; cd.feed++; }
  else { f.happy=Math.min(100,n.happy+(kind==='play'?15:10)); f.full=n.full; if(cd[kind]<3){ f.xp=(f.xp||0)+2; } cd[kind]++; }
  f.cared=A.now().toISOString(); A.saveP();
  return famStageIdx(f)>beforeStage ? 'grew' : 'ok';
}
// ---------- side quests ----------
const fill = t => t.replace(/\[([A-Za-z0-9 ]+)\]/g,(m,k)=>A.P.settings.fills[k]||m);
function pool(area){ let p=GEN.pools[area]; if(A.who==='carson') p=p.filter(x=>!C.snowOnly.test(x.t)); return p; }
// 1 effort + 1-2 easy per area; light day = one 🌙 easy only; no repeat within ~7 days (shuffled cycle)
function sidePicks(date=A.ymd()){
  const P=A.P; const day=P.side[date]||(P.side[date]={picks:{},done:{},reroll:{}});
  C.areas.forEach(a=>{
    const key=a.id+(P.settings.light?'L':'')+(day.reroll[a.id]||0);
    if(day.picks[a.id] && day.picks[a.id].key===key) return;
    const p=pool(a.id), cyc=Math.floor((A.dnum(date)-A.dnum(A.ANCHOR))/7), seed=`${A.who}|${a.id}|${cyc}`;
    const pos=((A.dnum(date)-A.dnum(A.ANCHOR))%7+7)%7, rr=day.reroll[a.id]||0;
    const eff=A.shuffle(p.filter(x=>x.lvl==='effort'),seed+'e'), easy=A.shuffle(p.filter(x=>x.lvl==='easy'),seed+'z'), lite=A.shuffle(p.filter(x=>x.light),seed+'l');
    const at=(arr,i)=>arr[((i%arr.length)+arr.length)%arr.length];
    let ids;
    if(P.settings.light) ids=[at(lite,pos+rr*3).id];
    else ids=[at(eff,pos+rr*7).id, at(easy,pos*2+rr*7).id, at(easy,pos*2+1+rr*7).id].filter((v,i,s)=>s.indexOf(v)===i);
    day.picks[a.id]={key,ids};
  });
  A.saveP(); return day;
}
const task = id => { for(const k in GEN.pools){ const t=GEN.pools[k].find(x=>x.id===id); if(t) return t; } };
function cfmWeek(date=A.ymd()){ const y=+date.slice(0,4); for(const w of GEN.cfm){ const m=w.week.match(/(\w{3}) (\d+)–(?:(\w{3}) )?(\d+)/); if(!m) continue;
  const s=`${y}-${String(A.MON.indexOf(m[1])+1).padStart(2,'0')}-${m[2].padStart(2,'0')}`, e=`${y}-${String(A.MON.indexOf(m[3]||m[1])+1).padStart(2,'0')}-${m[4].padStart(2,'0')}`;
  if(date>=s && date<=e) return w; } return null; }
const hymnOf = (date=A.ymd()) => GEN.hymns[((A.dnum(date))%GEN.hymns.length+GEN.hymns.length)%GEN.hymns.length];
const talkOf = (date=A.ymd()) => GEN.talks[((A.dnum(date))%GEN.talks.length+GEN.talks.length)%GEN.talks.length];
const areaLv = n => 1+Math.floor(n/5);
// ---------- main quests (Sam via Calendar → Apps Script → Sheet "Quests") ----------
function mainQuests(date=A.ymd()){
  const q=(Sync.state.quests[date]||{})[A.who];
  if(q && q.length) return {list:q.filter(x=>!x.kind||x.kind==='main').slice(0,3), sample:false};
  const sample = A.who==='snow'
    ? [{id:'s1',lane:'Must do · Home',title:'Kitchen 15-min clean',coins:15},{id:'s2',lane:'Must do · Finance',title:'Pay CareCredit',coins:20},{id:'s3',lane:"Tomorrow's lesson",title:'Prep nursery lesson',coins:10}]
    : [{id:'c1',lane:'Study block · ISU',title:'45-min focused study',coins:15},{id:'c2',lane:'Must do · Home',title:'Take out trash & recycling',coins:20},{id:'c3',lane:'Must do · Errand',title:'Pick up prescription',coins:10}];
  return {list:sample, sample:true};
}
function homework(date=A.ymd()){ const q=(Sync.state.quests[A.addDays(date,1)]||{})[A.who]||[]; return q.filter(x=>x.kind==='homework'); }
function streak(){ const m=A.P.main; let d=A.ymd(), n=0; if(!Object.keys(m[d]||{}).length) d=A.addDays(d,-1); while(Object.keys(m[d]||{}).length){ n++; d=A.addDays(d,-1); } return n; }
const mainDone = () => Object.values(A.P.main).reduce((s,o)=>s+Object.keys(o).length,0);
// ---------- Castle Keeping: 1 laundry + 1 clean a day, alternating daily ----------
function choresFor(date){
  const k=A.dnum(date)-A.dnum(A.ANCHOR), wd=A.weekday(date);
  const snowLaundry = ((k%2)+2)%2===0;                      // Mon Sep 28 (week A): Snow 🧺, Carson 🧽
  const wk=Math.floor(k/7), L=C.laundry[wd], Cl=Object.assign({},C.cleaning[wd]);
  if(Cl.deep){ const dc=C.deep[((wk%4)+4)%4]; Cl.t=dc.t; Cl.s='Deep clean'; Cl.deepName=dc.n; }
  return {laundry:Object.assign({job:'laundry',who:snowLaundry?'snow':'carson'},L), clean:Object.assign({job:'clean',who:snowLaundry?'carson':'snow'},Cl), wd, wk};
}
function nextDeep(date){ let d=A.addDays(date,1); while(A.weekday(d)!==6) d=A.addDays(d,1); return choresFor(d); }
// dust: days since the last finished cleaning job (gentle; never "ruined")
function dust(date=A.ymd()){ const ch=Sync.state.chores; let d=date, n=0; while(n<4){ const c=ch[d]||{}; if(c.clean||c.laundry) break; d=A.addDays(d,-1); n++; }
  const today=ch[date]||{}; const done=(today.clean?1:0)+(today.laundry?1:0); return {daysSince:n, doneToday:done}; }
// ---------- Kitchen: cook/dishes alternate across HOME nights only ----------
const loc = date => ((Sync.state.meal[date]||{}).location)||(A.weekday(date)===0?'parents':'home');
function cookFor(date){
  if(loc(date)!=='home') return null;
  let k=0; for(let d=A.ANCHOR; d<date; d=A.addDays(d,1)) if(loc(d)==='home') k++;
  if(date<A.ANCHOR){ k=0; }
  const cook = k%2===0?'carson':'snow'; return {cook, dishes:A.OTHER[cook]};
}
// ---------- Shield Mates ----------
const bomTurn = (date=A.ymd()) => (((A.dnum(date)-A.dnum('2026-10-03'))%2)+2)%2===0?'snow':'carson';
function couplePicks(date=A.ymd()){
  const P=A.P, day=P.couple[date]||(P.couple[date]={done:{},reroll:0,swap:false});
  const turn=bomTurn(date), cyc=Math.floor((A.dnum(date)-A.dnum(A.ANCHOR))/14), pos=((A.dnum(date)-A.dnum(A.ANCHOR))%14+14)%14, seed=`${A.who}|cq|${cyc}`;
  const easy=A.shuffle(GEN.couple.easy,seed+'e'), eff=A.shuffle(GEN.couple.effort,seed+'f'), low=A.shuffle(GEN.couple.easy.filter(x=>x.tone==='low-pressure'),seed+'l');
  const at=(a,i)=>a[((i%a.length)+a.length)%a.length], rr=day.reroll;
  const ids=[day.swap?at(low,pos+rr).id:at(eff,pos+rr*14).id, at(easy,pos*2+rr*14).id]; if(turn!==A.who) ids.push(at(easy,pos*2+1+rr*14).id);
  day.ids=ids; A.saveP(); return day;
}
const cq = id => GEN.couple.easy.find(x=>x.id===id)||GEN.couple.effort.find(x=>x.id===id);
function pronounce(t){ const p=A.pron[A.who]; return t.replace(/\{her\|him\}/g,p.her).replace(/\{she\|he\}/g,p.she).replace(/\{her\|his\}/g,p.his).replace(/\{She\|He\}/g,p.He); }
function griffinAdd(n){ const me=A.who, g=Object.assign({lv:1,xp:0,name:''},Sync.state.griffins[me]); let xp=(g.xp||0)+n, lv=g.lv||1, grew=false;
  while(xp>=10*lv){ xp-=10*lv; lv++; if(lv===5||lv===10) grew=true; }
  Sync.apply('griffin.set',{by:me, who:me, lv, xp, day:A.ymd()}); Sync.apply('coffer.add',{by:me, n, date:A.ymd()}); return grew; }
const griffinStage = lv => ['Baby','Young','Grown'][C.stageOf(lv)];
return {fam,famDef,famLv,famStage,famStageIdx,famName,needs,care,fill,pool,sidePicks,task,cfmWeek,hymnOf,talkOf,areaLv,mainQuests,homework,streak,mainDone,
  choresFor,nextDeep,dust,loc,cookFor,bomTurn,couplePicks,cq,pronounce,griffinAdd,griffinStage};
})();
