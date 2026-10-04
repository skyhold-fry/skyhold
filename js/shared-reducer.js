/* Shared (partner-visible) state + the op reducer. The SAME file runs in the app and in Apps Script
   (tools/build_gs.sh copies it to apps-script/Reducer.gs), so both sides agree on every result.
   Only household / couple-shared data lives here: grocery, preferences, budget, meal plan, chores,
   Courtship Coffer total, each partner's griffin progress, cheers, Book of Mormon pointer,
   calendar-fed quests (read-only from Apps Script). Private data (side & couple quests, Tough Moment,
   Market wants, coins, familiars) NEVER goes through here. */
var DATE_IDS = ['D01','D02','D03','D04','D05','D06','D07','D08','D09','D10','D11','D12'];
function sharedEmpty(){
  return {v:1, grocery:[], prefs:[], budget:{weekly_budget:90, hard_cap:100, cart_status:'draft', approved_by:'', approved_at:''},
    meal:{}, chores:{}, coffer:{total:0, used:[], last:null}, griffins:{snow:{name:'',lv:1,xp:0,day:''}, carson:{name:'',lv:1,xp:0,day:''}},
    cheers:[], bom:{ptr:0, reads:{}}, quests:{}, temple:[], rewards:null, applied:[]};
}
function sharedReduce(st, op){
  if(!op || !op.id) return st;
  if(st.applied.indexOf(op.id)>=0) return st;          // idempotent: each op applies once
  var t=op.t, i, g;
  switch(t){
    case 'grocery.add': st.grocery.push({id:op.gid, item:op.item, qty:op.qty||'', added_by:op.by, added_at:op.at, have_it:false, est_price:op.est_price===''||op.est_price==null?'':Number(op.est_price), note:op.note||'', week_of:op.week_of||''}); break;
    case 'grocery.set': for(i=0;i<st.grocery.length;i++) if(st.grocery[i].id===op.gid){ for(var k in op.fields) st.grocery[i][k]=op.fields[k]; } break;
    case 'grocery.remove': st.grocery=st.grocery.filter(function(x){return x.id!==op.gid}); break;
    case 'pref.add': st.prefs.push({id:op.pid, person:op.person||'both', type:op.type, item:op.item, note:op.note||'', updated_at:op.at}); break;
    case 'pref.remove': st.prefs=st.prefs.filter(function(x){return x.id!==op.pid}); break;
    case 'budget.set': for(var b in op.fields) st.budget[b]=op.fields[b]; break;
    case 'meal.set': g=st.meal[op.date]||{}; ['location','note','dinner','recipe_link'].forEach(function(f){ if(op[f]!==undefined) g[f]=op[f]; }); st.meal[op.date]=g; break;
    case 'chore.done': g=st.chores[op.date]||{}; g[op.job]={by:op.by, at:op.at}; st.chores[op.date]=g; break;
    case 'chore.undo': g=st.chores[op.date]; if(g) delete g[op.job]; break;
    case 'coffer.add':
      st.coffer.total += Number(op.n)||0;
      while(st.coffer.total>=100){
        st.coffer.total -= 100;
        var next=null; for(i=0;i<DATE_IDS.length;i++){ if(st.coffer.used.indexOf(DATE_IDS[i])<0){ next=DATE_IDS[i]; break; } }
        if(!next){ st.coffer.used=[]; next=DATE_IDS[0]; }
        st.coffer.used.push(next); st.coffer.last={id:next, date:op.date||String(op.at).slice(0,10)};
      }
      break;
    case 'griffin.set': g=st.griffins[op.who]||{}; ['name','lv','xp','day'].forEach(function(f){ if(op[f]!==undefined) g[f]=op[f]; }); st.griffins[op.who]=g; break;
    case 'cheer.add': st.cheers.push({id:op.cid, from:op.by, to:op.to, text:String(op.text).slice(0,120), at:op.at}); if(st.cheers.length>60) st.cheers=st.cheers.slice(-60); break;
    case 'bom.read': if(!st.bom.reads[op.date]){ st.bom.reads[op.date]=op.by; st.bom.ptr=Math.min(238, st.bom.ptr+1); } break;
  }
  st.applied.push(op.id); if(st.applied.length>400) st.applied=st.applied.slice(-400);
  return st;
}
if(typeof module!=='undefined') module.exports={sharedEmpty:sharedEmpty, sharedReduce:sharedReduce, DATE_IDS:DATE_IDS};
