function ld(k,d){try{var r=localStorage.getItem(k);return r?JSON.parse(r):JSON.parse(JSON.stringify(d));}catch(e){return JSON.parse(JSON.stringify(d));}}
function sv(k,v){localStorage.setItem(k,JSON.stringify(v));}
function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
function shortHost(u){try{return new URL(u).hostname.replace('www.','');}catch(e){return u;}}
function daysUntil(d){var a=new Date(d),b=new Date();a.setHours(0,0,0,0);b.setHours(0,0,0,0);return Math.ceil((a-b)/864e5);}
function fmtDate(d){return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'});}
function fmtClock(){var n=new Date();return n.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})+' '+n.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false});}
function getTZ(tz){return new Date().toLocaleTimeString('en-US',{timeZone:tz,hour:'2-digit',minute:'2-digit',hour12:false});}
function toast(m){var el=document.getElementById('toast');if(!el)return;el.textContent=m;el.classList.add('show');setTimeout(function(){el.classList.remove('show');},1500);}
function cardKey(gi,ii){return gi+':'+ii;}

var IC={
  plus:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  edit:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
  x:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
};
