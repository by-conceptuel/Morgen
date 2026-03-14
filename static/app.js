var data = ld(CFG.keys.links, DEFAULT_LINKS);
var statusSites = ld(CFG.keys.status, DEFAULT_STATUS);
var subs = ld(CFG.keys.subs, DEFAULT_SUBS);
var renewals = ld(CFG.keys.renewals, DEFAULT_RENEWALS);
var editMode = false;
var allOpened = false;

function todayKey(){ return 'morgen_done_'+new Date().toISOString().slice(0,10); }
function loadDoneCards(){
  try {
    var k=todayKey(), raw=localStorage.getItem(k);
    return raw ? JSON.parse(raw) : {};
  } catch(e){ return {}; }
}
function saveDoneCards(){
  try {
    var k=todayKey();
    var toRemove=[];
    for(var i=0;i<localStorage.length;i++){
      var key=localStorage.key(i);
      if(key && key.indexOf('morgen_done_')===0 && key!==k) toRemove.push(key);
    }
    toRemove.forEach(function(key){ localStorage.removeItem(key); });
    localStorage.setItem(k, JSON.stringify(doneCards));
  } catch(e){}
}
var doneCards = loadDoneCards();

function setAccent(idx){
  var c=ACCENT_COLORS[idx];
  document.documentElement.style.setProperty('--accent',c.hex);
  document.documentElement.style.setProperty('--accent-hover',c.hover);
  document.documentElement.style.setProperty('--accent-dim',c.dim);
  sv(CFG.keys.accent,c);
  document.querySelectorAll('.color-dot').forEach(function(d,i){
    d.classList.toggle('active',i===idx);
  });
  render();
}

function countDone(){
  var c=0;data.groups.forEach(function(g,gi){g.items.forEach(function(_,ii){if(doneCards[cardKey(gi,ii)]==='done')c++;});});return c;
}
function markAllDone(){
  data.groups.forEach(function(g,gi){g.items.forEach(function(_,ii){doneCards[cardKey(gi,ii)]='done';});});
  saveDoneCards();render();toast('All done');
}
function clearDone(){doneCards={};allOpened=false;saveDoneCards();render();}

function cardClick(gi,ii){
  if(editMode) return;
  var k=cardKey(gi,ii);
  if(!doneCards[k]){
    window.open(data.groups[gi].items[ii].url,'_blank');
    doneCards[k]='opened';
  } else if(doneCards[k]==='opened'){
    doneCards[k]='done';
  } else {
    doneCards[k]='opened';
  }
  saveDoneCards();renderMain();
}
function openAll(){
  data.groups.forEach(function(g,gi){g.items.forEach(function(item,ii){
    window.open(item.url,'_blank');
    var k=cardKey(gi,ii);
    if(!doneCards[k]) doneCards[k]='opened';
  });});
  allOpened=true;saveDoneCards();renderMain();toast('All opened');
}
function openGroup(gi){
  var g=data.groups[gi];
  g.items.forEach(function(item,ii){
    window.open(item.url,'_blank');
    var k=cardKey(gi,ii);
    if(!doneCards[k]) doneCards[k]='opened';
  });
  saveDoneCards();renderMain();toast(g.items.length+' opened');
}
function toggleEdit(){editMode=!editMode;render();}
function deleteItem(gi,ii){data.groups[gi].items.splice(ii,1);delete doneCards[cardKey(gi,ii)];sv(CFG.keys.links,data);saveDoneCards();render();}
function deleteGroup(gi){if(data.groups[gi].items.length&&!confirm('Remove "'+data.groups[gi].name+'"?'))return;data.groups.splice(gi,1);sv(CFG.keys.links,data);saveDoneCards();render();}
function renameGroup(gi){var n=prompt('Name:',data.groups[gi].name);if(n&&n.trim()){data.groups[gi].name=n.trim();sv(CFG.keys.links,data);render();}}
function addGroup(){var n=prompt('Section name:');if(n&&n.trim()){data.groups.push({name:n.trim(),items:[]});sv(CFG.keys.links,data);render();}}
function deleteStatusSite(si){statusSites.splice(si,1);sv(CFG.keys.status,statusSites);render();}
function deleteSub(si){subs.splice(si,1);sv(CFG.keys.subs,subs);render();}
function deleteRenewal(ri){renewals.splice(ri,1);sv(CFG.keys.renewals,renewals);render();}

function updateTzDisplays(){
  CFG.timezones.forEach(function(t,i){
    var el=document.getElementById('tzd'+i);
    if(el) el.innerHTML=renderClockBlock(t.city,getTZ(t.tz),i);
  });
}
setInterval(function(){
  var c=document.getElementById('clock');if(c)c.textContent=fmtClock();
  updateTzDisplays();
},1000);

render();
fetchWeather();
checkAllStatuses();
setInterval(fetchWeather,600000);
setInterval(checkAllStatuses,300000);
