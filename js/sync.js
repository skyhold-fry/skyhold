/* Sync layer with a pluggable backend.
   - LocalBackend: localStorage only (works today, offline, single device).
   - AppsScriptBackend: Snow's free Google Apps Script web app + Sheet (see apps-script/ and SETUP.md).
   Ops are applied optimistically to a local cache, queued in an outbox, and flushed when online.
   Each op has a unique id; the server records applied ids so a retried op never double-counts. */
window.Sync = (function(){
const K_CACHE='sky.shared', K_OUT='sky.outbox', K_CFG='sky.sync';
const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const load = (k,d) => { try{ const v=JSON.parse(localStorage.getItem(k)); return v==null?d:v; }catch(e){ return d; } };
const save = (k,v) => localStorage.setItem(k, JSON.stringify(v));

class LocalBackend {
  constructor(){ this.name='local'; }
  async pull(){ return null; }             // the cache IS the source of truth
  async push(ops){ return null; }
}
class AppsScriptBackend {
  constructor(url,key){ this.name='appsscript'; this.url=url; this.key=key; }
  async pull(){
    const r = await fetch(this.url+'?action=state&key='+encodeURIComponent(this.key), {method:'GET'});
    if(!r.ok) throw new Error('HTTP '+r.status); const j=await r.json(); if(j.error) throw new Error(j.error); return j.state;
  }
  async push(ops){
    // text/plain avoids a CORS preflight, which Apps Script web apps can't answer.
    const r = await fetch(this.url, {method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify({key:this.key, ops})});
    if(!r.ok) throw new Error('HTTP '+r.status); const j=await r.json(); if(j.error) throw new Error(j.error); return j.state;
  }
}
let cfg = load(K_CFG, {backend:'local', url:'', key:''});
let backend = makeBackend(cfg);
let state = load(K_CACHE, null) || sharedEmpty();
let outbox = load(K_OUT, []);
let status = {ok:true, last:null, error:'', backend:backend.name};
const listeners = new Set();
function makeBackend(c){ return (c.backend==='appsscript' && c.url) ? new AppsScriptBackend(c.url, c.key) : new LocalBackend(); }
function emit(){ save(K_CACHE, state); save(K_OUT, outbox); listeners.forEach(f=>{ try{f(state)}catch(e){console.error(e)} }); }
function rebase(server){                       // server state + any ops it hasn't seen yet
  state = server; outbox = outbox.filter(o => (server.applied||[]).indexOf(o.id)<0);
  outbox.forEach(o => sharedReduce(state, o));
}
async function flush(){
  if(backend.name==='local'){ outbox=[]; emit(); return; }
  try{
    const sending = outbox.slice();
    const server = sending.length ? await backend.push(sending) : await backend.pull();
    if(server) rebase(server);
    status = {ok:true, last:new Date().toISOString(), error:'', backend:backend.name};
  }catch(e){ status = {ok:false, last:status.last, error:String(e.message||e), backend:backend.name}; }
  emit();
}
function apply(type, payload){
  const op = Object.assign({id:uid(), t:type, at:new Date().toISOString()}, payload);
  sharedReduce(state, op); outbox.push(op); emit(); flush(); return op;
}
function configure(c){ cfg=Object.assign({},cfg,c); save(K_CFG,cfg); backend=makeBackend(cfg); status.backend=backend.name; return flush(); }
async function test(url,key){ const b=new AppsScriptBackend(url,key); const s=await b.pull(); return !!s; }
setInterval(()=>{ if(navigator.onLine!==false) flush(); }, 60000);
window.addEventListener('online', flush);
document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) flush(); });
return { get state(){return state}, get status(){return status}, get config(){return cfg}, get pending(){return outbox.length},
  apply, flush, configure, test, uid, on:f=>listeners.add(f), off:f=>listeners.delete(f),
  seed(fn){ if(cfg.backend==='local' && !state.seeded){ fn(state); state.seeded=true; emit(); } } };
})();
