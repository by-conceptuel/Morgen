var watchInitialized = false;

function renderSegDigit(val,ox,oy,w,h,color){
  var segs={
    0:[1,1,1,1,1,1,0],1:[0,1,1,0,0,0,0],2:[1,1,0,1,1,0,1],3:[1,1,1,1,0,0,1],
    4:[0,1,1,0,0,1,1],5:[1,0,1,1,0,1,1],6:[1,0,1,1,1,1,1],7:[1,1,1,0,0,0,0],
    8:[1,1,1,1,1,1,1],9:[1,1,1,1,0,1,1]
  };
  var s=segs[val]||segs[0],t=h*0.09,p=t*0.4,hw=w-2*p,hh=(h-3*p)/2;
  var svg='';
  if(s[0]) svg+='<rect x="'+(ox+p)+'" y="'+oy+'" width="'+hw+'" height="'+t+'" fill="'+color+'"/>';
  if(s[1]) svg+='<rect x="'+(ox+w-p-t)+'" y="'+(oy+p)+'" width="'+t+'" height="'+hh+'" fill="'+color+'"/>';
  if(s[2]) svg+='<rect x="'+(ox+w-p-t)+'" y="'+(oy+hh+2*p)+'" width="'+t+'" height="'+hh+'" fill="'+color+'"/>';
  if(s[3]) svg+='<rect x="'+(ox+p)+'" y="'+(oy+h-t)+'" width="'+hw+'" height="'+t+'" fill="'+color+'"/>';
  if(s[4]) svg+='<rect x="'+ox+'" y="'+(oy+hh+2*p)+'" width="'+t+'" height="'+hh+'" fill="'+color+'"/>';
  if(s[5]) svg+='<rect x="'+ox+'" y="'+(oy+p)+'" width="'+t+'" height="'+hh+'" fill="'+color+'"/>';
  if(s[6]) svg+='<rect x="'+(ox+p)+'" y="'+(oy+(h-t)/2)+'" width="'+hw+'" height="'+t+'" fill="'+color+'"/>';
  return svg;
}

function renderClockBlock(city,timeStr,idx){
  var W=240,H=34;
  var fid='neuInset'+(idx||0);
  var parts=timeStr.split(':'),hh=parts[0],mm=parts[1];
  var dw=14,dh=22,gap=2,colonW=6;
  var totalDigitsW=dw*4+gap*3+colonW;
  var active='var(--text)',ghost='rgba(0,0,0,0.07)';
  var svg='<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg">';
  svg+='<defs><filter id="'+fid+'" x="-10%" y="-10%" width="120%" height="120%">';
  svg+='<feOffset dx="1.5" dy="1.5" in="SourceAlpha" result="offD"/><feGaussianBlur stdDeviation="1.5" in="offD" result="blurD"/><feFlood flood-color="#000" flood-opacity="0.15" result="colorD"/><feComposite in="colorD" in2="blurD" operator="in" result="shadowD"/>';
  svg+='<feOffset dx="-1" dy="-1" in="SourceAlpha" result="offL"/><feGaussianBlur stdDeviation="1" in="offL" result="blurL"/><feFlood flood-color="#fff" flood-opacity="0.7" result="colorL"/><feComposite in="colorL" in2="blurL" operator="in" result="shadowL"/>';
  svg+='<feMerge><feMergeNode in="shadowD"/><feMergeNode in="shadowL"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
  svg+='<rect x="0" y="0" width="'+W+'" height="'+H+'" rx="2" fill="var(--surface)"/>';
  svg+='<rect x="3" y="3" width="'+(W-6)+'" height="'+(H-6)+'" rx="1" fill="var(--bg)" filter="url(#'+fid+')"/>';
  svg+='<text x="10" y="'+(H/2+5)+'" fill="var(--text)" font-family="\'IBM Plex Mono\',monospace" font-size="14" font-weight="500" letter-spacing="0.3">'+city.toUpperCase()+'</text>';
  var digitsX=W-10-totalDigitsW, digitsY=(H-dh)/2;
  for(var i=0;i<4;i++){var dx=digitsX+i*(dw+gap)+(i>=2?colonW:0);svg+=renderSegDigit(8,dx,digitsY,dw,dh,ghost);}
  svg+=renderSegDigit(parseInt(hh[0]),digitsX,digitsY,dw,dh,active);
  svg+=renderSegDigit(parseInt(hh[1]),digitsX+dw+gap,digitsY,dw,dh,active);
  var cx=digitsX+2*(dw+gap)+colonW/2-1.2;
  svg+='<rect x="'+cx+'" y="'+(digitsY+dh*0.28)+'" width="2.5" height="2.5" fill="'+active+'"/>';
  svg+='<rect x="'+cx+'" y="'+(digitsY+dh*0.62)+'" width="2.5" height="2.5" fill="'+active+'"/>';
  svg+=renderSegDigit(parseInt(mm[0]),digitsX+2*(dw+gap)+colonW,digitsY,dw,dh,active);
  svg+=renderSegDigit(parseInt(mm[1]),digitsX+3*(dw+gap)+colonW,digitsY,dw,dh,active);
  svg+='</svg>';
  return svg;
}

function renderWatchFixed(){
  if(watchInitialized) return;
  var h=renderWatch();
  document.getElementById('watchFixed').innerHTML=h;
  startWatch();
  watchInitialized=true;
}

function wIco(name,size){
  size=size||36;
  return '<img src="'+CFG.iconPath+name+'.svg" width="'+size+'" height="'+size+'" alt="'+name+'">';
}

function wCell(icon,value){
  return '<div class="wx-cell">'+wIco(icon,36)+'<span class="wx-val">'+value+'</span></div>';
}

function renderSidebar(){
  var h='',ph=getMoonPhase(),ip=CFG.iconPath;

  h+='<div class="sidebar-section"><div class="sidebar-title">Weather</div>';
  if(weatherData){
    var ic=meteoIcon(weatherData.weather_code);
    h+='<div class="weather-row"><div class="weather-icon"><img src="'+ip+ic+'.svg" alt="'+ic+'"></div>';
    h+='<div><span class="weather-temp">'+Math.round(weatherData.temperature_2m)+'\u00b0</span>';
    h+='<div class="weather-line">'+weatherDesc(weatherData.weather_code)+' \u00b7 '+CFG.weather.city+'</div></div></div>';

    h+='<div class="wx-grid">';

    if(weatherData.apparent_temperature!=null){
      h+=wCell(tempIcon(weatherData.apparent_temperature),Math.round(weatherData.apparent_temperature)+'\u00b0 feel');
    }
    h+=wCell(humidityIcon(weatherData.relative_humidity_2m),weatherData.relative_humidity_2m+'%');

    var ws=Math.round(weatherData.wind_speed_10m);
    var bf=beaufortScale(ws);
    h+=wCell(windIcon(ws),beaufortDesc(bf));
    if(weatherData.wind_gusts_10m!=null&&weatherData.wind_gusts_10m>0){
      h+=wCell(gustIcon(weatherData.wind_gusts_10m),Math.round(weatherData.wind_gusts_10m)+' gust');
    }

    if(weatherData.surface_pressure!=null){
      h+=wCell(pressureIcon(Math.round(weatherData.surface_pressure)),Math.round(weatherData.surface_pressure)+' hPa');
    }
    if(weatherData.uv_index!=null){
      h+=wCell(uvIcon(weatherData.uv_index),'UV '+uvLabel(weatherData.uv_index));
    }

    if(weatherData.dew_point_2m!=null){
      h+=wCell('raindrop',Math.round(weatherData.dew_point_2m)+'\u00b0 dew');
    }
    if(weatherData.temperature_2m<=0){
      h+=wCell(freezeIcon(),'Freezing');
    }
    if(dailyData&&dailyData.precipitation_probability_max!=null&&dailyData.precipitation_probability_max[0]>0){
      h+=wCell(rainProbIcon(),dailyData.precipitation_probability_max[0]+'%');
    }

    if(dailyData&&dailyData.temperature_2m_max!=null){
      h+=wCell(tempHighIcon(dailyData.temperature_2m_max[0]),Math.round(dailyData.temperature_2m_max[0])+'\u00b0 hi');
      h+=wCell(tempLowIcon(dailyData.temperature_2m_min[0]),Math.round(dailyData.temperature_2m_min[0])+'\u00b0 lo');
    }

    if(dailyData){
      h+=wCell('sunrise',fmtTime(dailyData.sunrise[0]));
      h+=wCell('horizon',dayLengthStr(dailyData.sunrise[0],dailyData.sunset[0]));
      h+=wCell('sunset',fmtTime(dailyData.sunset[0]));
    }

    h+='</div>';

  } else h+='<div class="weather-line">Loading...</div>';

  h+='<div class="moon-row"><div class="moon-icon"><img src="'+ip+moonIcon(ph)+'.svg" alt="moon"></div>';
  h+='<span class="moon-label">'+moonName(ph)+' \u00b7 '+moonIllumination(ph)+'%</span></div>';

  if(isNight()){
    h+='<div class="moon-row"><div class="moon-icon"><img src="'+ip+nightAmbientIcon()+'.svg" alt="night"></div>';
    h+='<span class="moon-label">'+new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false})+'</span></div>';
  }

  h+='</div>';

  h+='<div class="sidebar-section tz-section">';
  CFG.timezones.forEach(function(t,i){
    h+='<div class="tz-block" id="tzd'+i+'">'+renderClockBlock(t.city,getTZ(t.tz),i)+'</div>';
  });
  h+='</div>';

  h+='<div class="sidebar-section '+(editMode?'editing':'')+'"><div class="sidebar-title">Subscriptions';
  if(editMode) h+='<button class="sect-action" onclick="openSubModal()">+ add</button>';
  h+='</div>';
  subs.forEach(function(s,i){
    var d=daysUntil(s.date);
    var dotCls='active';
    if(d<=0) dotCls='overdue';
    else if(d<=1) dotCls='warning';
    h+='<div class="sub-item"><div class="sub-row">';
    h+='<span class="sub-name">'+esc(s.name)+'</span>';
    h+='<span class="sub-dot '+dotCls+'"></span>';
    h+='</div>';
    h+='<div class="sub-actions"><button class="act-btn" onclick="openSubModal('+i+')">'+IC.edit+'</button>';
    h+='<button class="act-btn del" onclick="deleteSub('+i+')">'+IC.x+'</button></div></div>';
  });
  if(!subs.length) h+='<div class="empty-text">No subscriptions</div>';
  h+='</div>';

  h+='<div class="sidebar-section '+(editMode?'editing':'')+'"><div class="sidebar-title"><span>Renewals</span><span class="meta">'+renewals.length+'</span>';
  if(editMode) h+='<button class="sect-action" onclick="openRenewalModal()" style="margin-left:auto">+ add</button>';
  h+='</div>';
  if(renewals.length){
    var sorted=renewals.slice().sort(function(a,b){return new Date(a.date)-new Date(b.date);});
    var nx=sorted[0],nd=daysUntil(nx.date),nc=nd<=7?'urgent':nd<=30?'soon':'ok';
    h+='<div class="renewal-item">';
    h+='<div class="renewal-text"><div class="renewal-name">'+esc(nx.name)+'</div>';
    h+='<div class="renewal-meta">'+fmtDate(nx.date)+' \u00b7 <span class="renewal-days '+nc+'">'+nd+'d</span></div></div>';
    h+='<span class="renewal-dot '+nc+'"></span>';
    h+='</div>';
    if(editMode) sorted.forEach(function(r){
      var oi=renewals.indexOf(r);
      var rd=daysUntil(r.date),rc=rd<=7?'urgent':rd<=30?'soon':'ok';
      h+='<div class="renewal-item" style="margin-top:4px">';
      h+='<div class="renewal-text"><div class="renewal-name" style="font-size:12px">'+esc(r.name)+'</div>';
      h+='<div class="renewal-meta">'+fmtDate(r.date)+'</div></div>';
      h+='<span class="renewal-dot '+rc+'"></span>';
      h+='<div class="renewal-actions"><button class="act-btn" onclick="openRenewalModal('+oi+')">'+IC.edit+'</button>';
      h+='<button class="act-btn del" onclick="deleteRenewal('+oi+')">'+IC.x+'</button></div>';
      h+='</div>';
    });
  } else {
    h+='<div class="empty-text">No renewals</div>';
    if(editMode) h+='<div class="add-row" onclick="openRenewalModal()">'+IC.plus+' Add renewal</div>';
  }
  h+='</div>';

  document.getElementById('sidebar').innerHTML=h;
  renderWatchFixed();
}

function renderMain(){
  var app=document.getElementById('app');
  var total=data.groups.reduce(function(s,g){return s+g.items.length;},0);
  var done=countDone(),allDone=done>=total&&total>0;

  var h='<div class="header"><div class="clock" id="clock">'+fmtClock()+'</div>';
  h+='<div class="header-right">';
  if(done>0&&!editMode) h+='<span class="link-count">'+done+'/'+total+'</span>';
  else h+='<span class="link-count">'+total+'</span>';
  h+='<button class="btn '+(editMode?'btn-done':'btn-ghost')+'" onclick="toggleEdit()">'+(editMode?'Done':'Edit')+'</button></div></div>';

  if(editMode){
    h+='<div class="color-picker">';
    var savedHex='#ecf34a';
    try{var sa=localStorage.getItem(CFG.keys.accent);if(sa)savedHex=JSON.parse(sa).hex;}catch(e){}
    ACCENT_COLORS.forEach(function(c,i){
      var active=c.hex===savedHex?' active':'';
      h+='<div class="color-dot'+active+'" style="background:'+c.hex+'" onclick="setAccent('+i+')" title="'+c.name+'"></div>';
    });
    h+='</div>';
  }

  if(!total&&!data.groups.length){
    h+='<div class="empty"><h2>No links yet</h2><p>Add your first dashboard link.</p>';
    h+='<button class="btn btn-accent" onclick="openLinkModal()">'+IC.plus+' Add Link</button></div>';
  } else {
    h+='<div class="'+(editMode?'editing':'')+'">';
    data.groups.forEach(function(g,gi){
      if(!g.items.length&&!editMode) return;
      h+='<div class="section"><div class="section-head"><h2>'+esc(g.name)+'</h2><div class="divider"></div><span class="meta">'+g.items.length+'</span>';
      if(editMode){
        h+='<button class="sect-action" onclick="renameGroup('+gi+')">rename</button>';
        h+='<button class="sect-action danger" onclick="deleteGroup('+gi+')">remove</button>';
      }
      h+='</div><div class="grid">';
      g.items.forEach(function(item,ii){
        var k=cardKey(gi,ii),state=doneCards[k];
        var cls='card';
        if(state==='done') cls+=' done';
        else if(state==='opened') cls+=' opened';
        h+='<div class="'+cls+'" onclick="cardClick('+gi+','+ii+')">';
        h+='<div class="label">'+esc(item.name)+'</div>';
        h+='<div class="host">'+esc(shortHost(item.url))+'</div>';
        h+='<div class="card-actions">';
        h+='<button class="act-btn" onclick="event.stopPropagation();openLinkModal('+gi+','+ii+')">'+IC.edit+'</button>';
        h+='<button class="act-btn del" onclick="event.stopPropagation();deleteItem('+gi+','+ii+')">'+IC.x+'</button>';
        h+='</div></div>';
      });
      if(!editMode&&g.items.length>1) h+='<div class="card-open-group" onclick="openGroup('+gi+')">Open Section</div>';
      if(editMode) h+='<div class="card-add" onclick="openLinkModal('+gi+')">'+IC.plus+' Add</div>';
      h+='</div></div>';
    });
    if(editMode) h+='<div style="margin-top:12px"><button class="btn btn-ghost" onclick="addGroup()">'+IC.plus+' New Section</button></div>';
    h+='</div>';

    if(!editMode&&total>1){
      h+='<div class="open-all-wrap">';
      if(allDone){
        h+='<div class="card-open-all done" onclick="clearDone()">Reset</div>';
      } else if(allOpened){
        h+='<div class="card-open-all ready" onclick="markAllDone()">All Done</div>';
      } else {
        h+='<div class="card-open-all" onclick="openAll()">Open All</div>';
      }
      h+='</div>';
    }
  }

  if(statusSites.length||editMode){
    h+='<div class="status-section '+(editMode?'editing':'')+'"><div class="section-head"><h2>Status</h2><span class="meta">'+statusSites.length+'</span>';
    if(!editMode) h+='<button class="sect-action" onclick="checkAllStatuses()">refresh</button>';
    h+='</div><div class="status-grid">';
    statusSites.forEach(function(s,si){
      var c=statusCache[s.url]||{status:'checking'},st=c.status;
      h+='<div class="status-box '+st+'" onclick="if(!editMode)window.open(\''+esc(s.url)+'\',\'_blank\')">';
      h+='<div class="status-name '+st+'">'+esc(s.name)+'</div>';
      var lt=st==='up'?(c.code||'UP'):st==='down'?'DOWN':st==='unknown'?'\u2014':'...';
      h+='<span class="s-label '+st+'">'+lt+'</span>';
      h+='<div class="status-actions">';
      h+='<button class="act-btn" onclick="event.stopPropagation();openStatusModal('+si+')">'+IC.edit+'</button>';
      h+='<button class="act-btn del" onclick="event.stopPropagation();deleteStatusSite('+si+')">'+IC.x+'</button>';
      h+='</div></div>';
    });
    if(editMode) h+='<div class="add-row" onclick="openStatusModal()">'+IC.plus+' Add Site</div>';
    h+='</div></div>';
  }

  app.innerHTML=h;
}

function render(){
  renderMain();
  renderSidebar();
}
