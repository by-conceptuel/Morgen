function renderWatch(){
  var size=160,cx=80,cy=80;
  var svg='<svg class="swiss-watch" width="'+size+'" height="'+size+'" viewBox="0 0 160 160">';

  svg+='<defs>';
  svg+='<radialGradient id="wDial"><stop offset="0%" stop-color="var(--surface)"/><stop offset="100%" stop-color="var(--bg)"/></radialGradient>';
  svg+='<pattern id="wRings" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">';
  for(var ri=20;ri<=72;ri+=4){
    svg+='<circle cx="80" cy="80" r="'+ri+'" fill="none" stroke="var(--border)" stroke-width="0.3" opacity="'+(0.15+ri*0.005)+'"/>';
  }
  svg+='</pattern>';
  svg+='<clipPath id="wClip"><circle cx="80" cy="80" r="55"/></clipPath>';
  svg+='</defs>';

  svg+='<circle cx="80" cy="80" r="79" fill="none" stroke="var(--text)" stroke-width="0.8"/>';
  svg+='<circle cx="80" cy="80" r="76" fill="none" stroke="var(--border)" stroke-width="0.3"/>';

  svg+='<circle cx="80" cy="80" r="75" fill="url(#wDial)"/>';

  svg+='<circle cx="80" cy="80" r="75" fill="url(#wRings)"/>';

  for(var sp=0;sp<12;sp++){
    var sa=sp*30*Math.PI/180;
    var sx1=cx+Math.sin(sa)*12, sy1=cy-Math.cos(sa)*12;
    var sx2=cx+Math.sin(sa)*58, sy2=cy-Math.cos(sa)*58;
    svg+='<line x1="'+sx1.toFixed(1)+'" y1="'+sy1.toFixed(1)+'" x2="'+sx2.toFixed(1)+'" y2="'+sy2.toFixed(1)+'" stroke="var(--border)" stroke-width="0.2" opacity="0.4"/>';
  }

  svg+='<image href="conceptuel.png" x="56" y="88" width="48" height="48" opacity="0.5" clip-path="url(#wClip)" preserveAspectRatio="xMidYMid meet"/>';

  for(var m=0;m<60;m++){
    var a=m*6*Math.PI/180;
    var isHour=m%5===0;
    if(isHour){
      var r1=60,r2=74;
      var x1=cx+Math.sin(a)*r1, y1=cy-Math.cos(a)*r1;
      var x2=cx+Math.sin(a)*r2, y2=cy-Math.cos(a)*r2;
      svg+='<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="var(--text)" stroke-width="2" stroke-linecap="butt"/>';
    } else {
      var mr1=70,mr2=74;
      var mx1=cx+Math.sin(a)*mr1, my1=cy-Math.cos(a)*mr1;
      var mx2=cx+Math.sin(a)*mr2, my2=cy-Math.cos(a)*mr2;
      svg+='<line x1="'+mx1.toFixed(1)+'" y1="'+my1.toFixed(1)+'" x2="'+mx2.toFixed(1)+'" y2="'+my2.toFixed(1)+'" stroke="var(--text-muted)" stroke-width="0.4"/>';
    }
  }

  svg+='<circle cx="80" cy="80" r="56" fill="none" stroke="var(--border)" stroke-width="0.5"/>';
  svg+='<circle cx="80" cy="80" r="14" fill="none" stroke="var(--border)" stroke-width="0.4"/>';

  svg+='<g id="watch-hour">';
  svg+='<line x1="80" y1="84" x2="80" y2="40" stroke="var(--text)" stroke-width="3.5" stroke-linecap="butt"/>';
  svg+='</g>';

  svg+='<g id="watch-minute">';
  svg+='<line x1="80" y1="84" x2="80" y2="18" stroke="var(--text)" stroke-width="1.8" stroke-linecap="butt"/>';
  svg+='</g>';

  svg+='<g id="watch-second">';
  svg+='<line x1="80" y1="96" x2="80" y2="16" stroke="var(--red)" stroke-width="1.5"/>';
  svg+='<circle cx="80" cy="93" r="3" fill="var(--red)"/>';
  svg+='</g>';

  svg+='<circle cx="80" cy="80" r="4" fill="var(--text)" stroke="var(--border)" stroke-width="0.5"/>';
  svg+='<circle cx="80" cy="80" r="2" fill="var(--surface)"/>';
  svg+='<circle cx="80" cy="80" r="0.8" fill="var(--text)"/>';

  svg+='</svg>';
  return svg;
}

var watchRAF=null;
function tickWatch(){
  var now=new Date();
  var h=now.getHours()%12, m=now.getMinutes(), s=now.getSeconds(), ms=now.getMilliseconds();

  var secAngle=((s+ms/1000)/60)*360;
  var minAngle=((m+(s+ms/1000)/60)/60)*360;
  var hrAngle=((h+(m+s/60)/60)/12)*360;

  var se=document.getElementById('watch-second');
  var me=document.getElementById('watch-minute');
  var he=document.getElementById('watch-hour');

  if(se) se.setAttribute('transform','rotate('+secAngle.toFixed(2)+' 80 80)');
  if(me) me.setAttribute('transform','rotate('+minAngle.toFixed(2)+' 80 80)');
  if(he) he.setAttribute('transform','rotate('+hrAngle.toFixed(2)+' 80 80)');

  watchRAF=requestAnimationFrame(tickWatch);
}

function startWatch(){
  if(watchRAF) cancelAnimationFrame(watchRAF);
  tickWatch();
}
