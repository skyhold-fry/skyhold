/* Real Idaho Falls sunrise/sunset (NOAA solar position algorithm), shown in America/Boise time.
   Idaho Falls, ID: 43.4917 N, 112.0339 W. */
window.Sun = (function(){
const LAT=43.4917, LON=-112.0339, TZ='America/Boise';
const rad=d=>d*Math.PI/180, deg=r=>r*180/Math.PI;
// Returns UTC Date for sunrise/sunset on the local calendar day containing `date`.
function times(date){
  const p=boiseParts(date);
  const jd = Date.UTC(p.y,p.m-1,p.d)/86400000 + 2440587.5;   // Julian day at 0h UTC
  function calc(isRise){
    let t = jd + 0.5 - LON/360;                                // rough local noon
    for(let i=0;i<3;i++){
      const T=(t-2451545)/36525;
      const L0=(280.46646+T*(36000.76983+0.0003032*T))%360;
      const M=357.52911+T*(35999.05029-0.0001537*T);
      const e=0.016708634-T*(0.000042037+0.0000001267*T);
      const C=Math.sin(rad(M))*(1.914602-T*(0.004817+0.000014*T))+Math.sin(rad(2*M))*(0.019993-0.000101*T)+Math.sin(rad(3*M))*0.000289;
      const om=125.04-1934.136*T, lam=L0+C-0.00569-0.00478*Math.sin(rad(om));
      const eps0=23+(26+(21.448-T*(46.815+T*(0.00059-T*0.001813)))/60)/60, eps=eps0+0.00256*Math.cos(rad(om));
      const decl=deg(Math.asin(Math.sin(rad(eps))*Math.sin(rad(lam))));
      const y=Math.tan(rad(eps/2))**2;
      const eqt=4*deg(y*Math.sin(2*rad(L0))-2*e*Math.sin(rad(M))+4*e*y*Math.sin(rad(M))*Math.cos(2*rad(L0))-0.5*y*y*Math.sin(4*rad(L0))-1.25*e*e*Math.sin(2*rad(M)));
      const ha=deg(Math.acos(Math.cos(rad(90.833))/(Math.cos(rad(LAT))*Math.cos(rad(decl)))-Math.tan(rad(LAT))*Math.tan(rad(decl))));
      const minutes=720-4*(LON+(isRise?ha:-ha))-eqt;               // minutes after 0h UTC
      t = jd + minutes/1440;
    }
    return new Date((t-2440587.5)*86400000);
  }
  return {rise:calc(true), set:calc(false)};
}
function boiseParts(date){
  const f=new Intl.DateTimeFormat('en-US',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false,weekday:'short'});
  const o={}; f.formatToParts(date).forEach(x=>o[x.type]=x.value);
  return {y:+o.year,m:+o.month,d:+o.day,h:+o.hour%24,min:+o.minute,wd:o.weekday};
}
const fmt=d=>d.toLocaleTimeString('en-US',{timeZone:TZ,hour:'numeric',minute:'2-digit'});
// dawn = 40 min either side of sunrise, dusk = 40 min either side of sunset
function phase(now=new Date()){
  const {rise,set}=times(now), m=40*60000, n=now.getTime(), r=rise.getTime(), s=set.getTime();
  let ph='night';
  if(n>=r-m && n<r+m) ph='dawn'; else if(n>=r+m && n<s-m) ph='day'; else if(n>=s-m && n<s+m) ph='dusk';
  return {phase:ph,rise,set,riseText:fmt(rise),setText:fmt(set)};
}
return {times,phase,boiseParts,fmt,TZ};
})();
