/* Boot: seed local shared data (first run on the local backend only), render, register the service worker. */
(function(){
const A=App;
Sync.seed(st=>{
  C.seedGrocery.forEach(([item,by,price,note],i)=>sharedReduce(st,{id:'seedg'+i,t:'grocery.add',gid:'g'+i,item,by,est_price:price,note,at:new Date().toISOString(),week_of:A.mondayOf(A.ymd())}));
  C.seedPrefs.forEach(([type,person,item],i)=>sharedReduce(st,{id:'seedp'+i,t:'pref.add',pid:'p'+i,type,person,item,at:new Date().toISOString()}));
  st.bom.ptr=C.bom.indexOf('Alma 32'); if(st.bom.ptr<0) st.bom.ptr=0;
});
// re-render when shared data changes from the server (not mid-typing)
let rt; Sync.on(()=>{ clearTimeout(rt); rt=setTimeout(()=>{ const ae=document.activeElement; if(!ae || !/INPUT|TEXTAREA|SELECT/.test(ae.tagName)) { if(!document.querySelector('.modal')) A.render(); } }, 50); });
A.render();
Sync.flush();
if(A.P && A.P.settings.notif.on) Notif.schedule();
if('serviceWorker' in navigator && location.protocol!=='file:') navigator.serviceWorker.register('sw.js').catch(e=>console.warn('SW',e));
})();
