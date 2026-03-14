var weatherData = null;
var dailyData = null;

function isNight(){
  if(!dailyData) return false;
  var now=new Date();
  var sr=new Date(dailyData.sunrise[0]);
  var ss=new Date(dailyData.sunset[0]);
  return now<sr||now>ss;
}

function meteoIcon(code){
  var night=isNight();
  if(code===0) return night?'clear-night':'clear-day';
  if(code===1) return night?'partly-cloudy-night':'partly-cloudy-day';
  if(code===2) return night?'partly-cloudy-night':'partly-cloudy-day';
  if(code===3) return night?'overcast-night':'overcast-day';
  if(code===45) return night?'fog-night':'fog-day';
  if(code===48) return night?'partly-cloudy-night-fog':'partly-cloudy-day-fog';
  if(code>=51&&code<=53) return night?'partly-cloudy-night-drizzle':'partly-cloudy-day-drizzle';
  if(code>=54&&code<=55) return 'drizzle';
  if(code>=56&&code<=57) return night?'partly-cloudy-night-sleet':'partly-cloudy-day-sleet';
  if(code===61) return night?'partly-cloudy-night-rain':'partly-cloudy-day-rain';
  if(code===63) return night?'partly-cloudy-night-rain':'partly-cloudy-day-rain';
  if(code>=64&&code<=65) return 'rain';
  if(code>=66&&code<=67) return 'sleet';
  if(code===71) return night?'partly-cloudy-night-snow':'partly-cloudy-day-snow';
  if(code===73) return night?'partly-cloudy-night-snow':'partly-cloudy-day-snow';
  if(code>=74&&code<=75) return 'snow';
  if(code===77) return night?'partly-cloudy-night-hail':'partly-cloudy-day-hail';
  if(code===80) return night?'partly-cloudy-night-rain':'partly-cloudy-day-rain';
  if(code>=81&&code<=82) return 'rain';
  if(code===85) return night?'partly-cloudy-night-snow':'partly-cloudy-day-snow';
  if(code===86) return 'snow';
  if(code===95) return night?'thunderstorms-night':'thunderstorms-day';
  if(code===96) return night?'thunderstorms-night-rain':'thunderstorms-day-rain';
  if(code===99) return night?'thunderstorms-night-snow':'thunderstorms-day-snow';
  return 'not-available';
}

function weatherDesc(code){
  if(code===0) return 'Clear';
  if(code<=2) return 'Partly Cloudy';
  if(code===3) return 'Overcast';
  if(code===45) return 'Fog';
  if(code===48) return 'Rime Fog';
  if(code<=53) return 'Drizzle';
  if(code<=55) return 'Heavy Drizzle';
  if(code<=57) return 'Freezing Drizzle';
  if(code===61) return 'Light Rain';
  if(code===63) return 'Rain';
  if(code===65) return 'Heavy Rain';
  if(code<=67) return 'Freezing Rain';
  if(code===71) return 'Light Snow';
  if(code===73) return 'Snow';
  if(code===75) return 'Heavy Snow';
  if(code===77) return 'Ice Pellets';
  if(code===80) return 'Light Showers';
  if(code===81) return 'Showers';
  if(code===82) return 'Heavy Showers';
  if(code===85) return 'Snow Showers';
  if(code===86) return 'Heavy Snow Showers';
  if(code===95) return 'Thunderstorm';
  if(code===96) return 'Thunderstorm + Hail';
  if(code===99) return 'Severe Thunderstorm';
  return 'Fair';
}

function beaufortScale(kmh){
  if(kmh<1) return 0;if(kmh<6) return 1;if(kmh<12) return 2;if(kmh<20) return 3;
  if(kmh<29) return 4;if(kmh<39) return 5;if(kmh<50) return 6;if(kmh<62) return 7;
  if(kmh<75) return 8;if(kmh<89) return 9;if(kmh<103) return 10;if(kmh<118) return 11;
  return 12;
}

function beaufortDesc(b){
  var d=['Calm','Light Air','Light Breeze','Gentle Breeze','Moderate','Fresh','Strong','Near Gale','Gale','Strong Gale','Storm','Violent Storm','Hurricane'];
  return d[b]||'Unknown';
}

function windIcon(kmh){
  var bf=beaufortScale(kmh);
  if(bf>=12) return 'hurricane';
  if(bf>=10) return 'tornado';
  return 'wind-beaufort-'+bf;
}

function gustIcon(gust){
  if(!gust||gust<20) return 'wind';
  return 'windsock';
}

function humidityIcon(rh){
  if(rh>=80) return 'raindrops';
  if(rh>=50) return 'humidity';
  return 'raindrop';
}

function uvLabel(uv){
  if(uv<=2) return 'Low';if(uv<=5) return 'Moderate';if(uv<=7) return 'High';
  if(uv<=10) return 'Very High';return 'Extreme';
}

function uvIcon(uv){
  if(uv<=0) return 'uv-index';
  var i=Math.min(11,Math.max(1,Math.round(uv)));
  return 'uv-index-'+i;
}

function tempIcon(t){
  if(t<=0) return 'thermometer-colder';
  if(t>=30) return 'thermometer-warmer';
  return 'thermometer';
}

function tempUnitIcon(){
  return 'celsius';
}

function tempHighIcon(t){
  if(t>=35) return 'thermometer-mercury';
  return 'thermometer-glass-celsius';
}

function tempLowIcon(t){
  if(t<=0) return 'thermometer-mercury-cold';
  return 'thermometer-glass';
}

function pressureIcon(p){
  return p>=1013?'pressure-high':'pressure-low';
}

function pressureAltIcon(p){
  return p>=1013?'pressure-high-alt':'pressure-low-alt';
}

function freezeIcon(){
  return 'snowflake';
}

function compassDir(deg){
  var dirs=['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg/22.5)%16];
}

function dayLengthStr(sunrise,sunset){
  if(!sunrise||!sunset) return '--';
  var sr=new Date(sunrise),ss=new Date(sunset);
  var diff=Math.round((ss-sr)/60000);
  var h=Math.floor(diff/60),m=diff%60;
  return h+'h '+m+'m';
}

function nightAmbientIcon(){
  var h=new Date().getHours();
  if(h>=22||h<2) return 'starry-night';
  if(h>=2&&h<5) return 'falling-stars';
  return 'star';
}

function rainProbIcon(){
  return 'umbrella';
}

function fmtTime(iso){
  if(!iso) return '--:--';
  var d=new Date(iso);
  return d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false});
}

function fetchWeather(){
  var w=CFG.weather;
  var url='https://api.open-meteo.com/v1/forecast?latitude='+w.lat+'&longitude='+w.lon
    +'&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code,surface_pressure,uv_index,dew_point_2m'
    +'&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min,precipitation_probability_max,rain_sum,snowfall_sum'
    +'&timezone='+w.tz
    +'&forecast_days=1';
  fetch(url)
  .then(function(r){return r.json();})
  .then(function(d){
    weatherData=d.current;
    dailyData=d.daily;
    renderSidebar();
  })
  .catch(function(){});
}

function getMoonPhase(){
  var n=new Date(),y=n.getFullYear(),m=n.getMonth()+1,d=n.getDate();
  if(m<=2){y--;m+=12;}
  var A=Math.floor(y/100),B=Math.floor(A/4),C=2-A+B;
  var E=Math.floor(365.25*(y+4716)),F=Math.floor(30.6001*(m+1));
  var jd=C+d+E+F-1524.5;
  return((jd-2451549.5)/29.53058770576)%1;
}

function moonIllumination(p){
  return Math.round((1-Math.cos(2*Math.PI*p))/2*100);
}

function moonIcon(p){
  if(p<0.03||p>0.97) return 'moon-new';if(p<0.22) return 'moon-waxing-crescent';
  if(p<0.28) return 'moon-first-quarter';if(p<0.47) return 'moon-waxing-gibbous';
  if(p<0.53) return 'moon-full';if(p<0.72) return 'moon-waning-gibbous';
  if(p<0.78) return 'moon-last-quarter';return 'moon-waning-crescent';
}

function moonName(p){
  if(p<0.03||p>0.97) return 'New Moon';if(p<0.22) return 'Waxing Crescent';
  if(p<0.28) return 'First Quarter';if(p<0.47) return 'Waxing Gibbous';
  if(p<0.53) return 'Full Moon';if(p<0.72) return 'Waning Gibbous';
  if(p<0.78) return 'Last Quarter';return 'Waning Crescent';
}
