var statusCache = {};

function checkAllStatuses(){
  if(!statusSites.length) return;
  var urls=statusSites.map(function(s){return s.url;});
  urls.forEach(function(u){statusCache[u]={status:'checking'};});
  render();
  fetch('/api/check',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({urls:urls})})
  .then(function(r){return r.json();})
  .then(function(res){Object.keys(res).forEach(function(u){statusCache[u]=res[u];});render();})
  .catch(function(){urls.forEach(function(u){statusCache[u]={status:'unknown'};});render();});
}
