var COMMON_SITES=[
  {name:'Gmail',url:'https://mail.google.com'},
  {name:'Google Calendar',url:'https://calendar.google.com'},
  {name:'GitHub',url:'https://github.com'},
  {name:'Notion',url:'https://notion.so'},
  {name:'Slack',url:'https://app.slack.com'},
  {name:'X',url:'https://x.com'},
  {name:'Reddit',url:'https://reddit.com'},
  {name:'Hacker News',url:'https://news.ycombinator.com'},
  {name:'LinkedIn',url:'https://linkedin.com'},
  {name:'YouTube',url:'https://youtube.com'},
  {name:'Google Drive',url:'https://drive.google.com'},
  {name:'ChatGPT',url:'https://chat.openai.com'},
  {name:'Claude',url:'https://claude.ai'},
  {name:'Figma',url:'https://figma.com'},
  {name:'Google Analytics',url:'https://analytics.google.com'}
];

var tzs=[{city:'New York',tz:'America/New_York'},{city:'Gstaad',tz:'Europe/Zurich'},{city:'Tokyo',tz:'Asia/Tokyo'}];
var links=[];var statuses=[];var subs=[];var accentIdx=0;

var cityEl=document.getElementById('city');
CITY_DB.forEach(function(c,i){
  var o=document.createElement('option');o.value=i;o.textContent=c.city;
  if(c.city==='Gstaad')o.selected=true;
  cityEl.appendChild(o);
});
var tzSelEl=document.getElementById('tzSelect');
CITY_DB.forEach(function(c,i){var o=document.createElement('option');o.value=i;o.textContent=c.city;tzSelEl.appendChild(o);});

var colorsEl=document.getElementById('colors');
ACCENT_COLORS.forEach(function(c,i){
  var d=document.createElement('div');d.className='dot'+(i===0?' active':'');d.style.background=c.hex;d.title=c.name;
  d.onclick=function(){accentIdx=i;document.querySelectorAll('.dot').forEach(function(el,j){el.classList.toggle('active',j===i);});document.querySelector('.btn-accent').style.background=c.hex;document.querySelector('.btn-accent').style.borderColor=c.hex;};
  colorsEl.appendChild(d);
});

function renderPresets(){var el=document.getElementById('linkPresets');el.innerHTML=COMMON_SITES.map(function(s,i){var used=links.some(function(l){return l.url===s.url;});return '<span class="preset'+(used?' used':'')+'" onclick="togglePreset('+i+')">'+esc(s.name)+'</span>';}).join('');}
function togglePreset(i){var s=COMMON_SITES[i];var idx=-1;links.forEach(function(l,j){if(l.url===s.url)idx=j;});if(idx>=0){links.splice(idx,1);}else{links.push({name:s.name,url:s.url});}renderLinkList();renderPresets();}
renderPresets();

function renderTzList(){var el=document.getElementById('tzList');if(!tzs.length){el.innerHTML='<div class="empty">No clocks added</div>';return;}el.innerHTML=tzs.map(function(t,i){return '<div class="list-item"><span>'+t.city+'</span><button class="rm" onclick="removeTz('+i+')">&times;</button></div>';}).join('');}
renderTzList();
function addTz(){var c=CITY_DB[parseInt(tzSelEl.value)];for(var i=0;i<tzs.length;i++)if(tzs[i].city===c.city)return;tzs.push({city:c.city,tz:c.tz});renderTzList();}
function removeTz(i){tzs.splice(i,1);renderTzList();}

function renderLinkList(){var el=document.getElementById('linkList');if(!links.length){el.innerHTML='<div class="empty">No sites added yet</div>';return;}el.innerHTML=links.map(function(l,i){return '<div class="list-item"><span>'+esc(l.name)+'<span class="meta">'+esc(shortHost(l.url))+'</span></span><button class="rm" onclick="removeLink('+i+')">&times;</button></div>';}).join('');}
renderLinkList();
function addLink(){var n=document.getElementById('linkName'),u=document.getElementById('linkUrl');if(!n.value.trim()||!u.value.trim())return;var url=u.value.trim();if(url.indexOf('http')!==0)url='https://'+url;links.push({name:n.value.trim(),url:url});n.value='';u.value='';renderLinkList();renderPresets();}
function removeLink(i){links.splice(i,1);renderLinkList();renderPresets();}

function renderStatusList(){var el=document.getElementById('statusList');if(!statuses.length){el.innerHTML='<div class="empty">No monitors added yet</div>';return;}el.innerHTML=statuses.map(function(s,i){return '<div class="list-item"><span>'+esc(s.name)+'<span class="meta">'+esc(shortHost(s.url))+'</span></span><button class="rm" onclick="removeStatus('+i+')">&times;</button></div>';}).join('');}
renderStatusList();
function addStatus(){var n=document.getElementById('statusName'),u=document.getElementById('statusUrl');if(!n.value.trim()||!u.value.trim())return;var url=u.value.trim();if(url.indexOf('http')!==0)url='https://'+url;statuses.push({name:n.value.trim(),url:url});n.value='';u.value='';renderStatusList();}
function removeStatus(i){statuses.splice(i,1);renderStatusList();}

function renderSubList(){var el=document.getElementById('subList');if(!subs.length){el.innerHTML='<div class="empty">No subscriptions added yet</div>';return;}el.innerHTML=subs.map(function(s,i){return '<div class="list-item"><span>'+esc(s.name)+'<span class="meta">'+esc(s.price)+' \u00b7 '+s.date+'</span></span><button class="rm" onclick="removeSub('+i+')">&times;</button></div>';}).join('');}
renderSubList();
function addSub(){var n=document.getElementById('subName'),p=document.getElementById('subPrice'),d=document.getElementById('subDate');if(!n.value.trim()||!d.value)return;subs.push({name:n.value.trim(),price:p.value.trim()||'$0',date:d.value});n.value='';p.value='';d.value='';renderSubList();}
function removeSub(i){subs.splice(i,1);renderSubList();}

function save(){
  var ci=parseInt(cityEl.value);var c=CITY_DB[ci];
  var cfg={weather:{lat:c.lat,lon:c.lon,tz:c.tz,city:c.city},timezones:tzs};
  localStorage.setItem('morgen_setup_v1',JSON.stringify(cfg));
  localStorage.setItem('morgen_accent_v1',JSON.stringify(ACCENT_COLORS[accentIdx]));
  if(links.length) localStorage.setItem('morgen_links_v1',JSON.stringify({groups:[{name:'Dashboards',items:links}]}));
  if(statuses.length) localStorage.setItem('morgen_status_v1',JSON.stringify(statuses));
  if(subs.length) localStorage.setItem('morgen_subs_v1',JSON.stringify(subs));
  document.cookie='morgen_setup=1;path=/;max-age=315360000;SameSite=Lax';
  window.location.href='/';
}

document.addEventListener('keydown',function(e){
  if(e.key!=='Enter')return;var t=e.target;
  if(t.id==='linkName'||t.id==='linkUrl')addLink();
  else if(t.id==='statusName'||t.id==='statusUrl')addStatus();
  else if(t.id==='subName'||t.id==='subPrice'||t.id==='subDate')addSub();
});
