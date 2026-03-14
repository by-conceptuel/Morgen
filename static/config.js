var CFG = {
  keys: { links:'morgen_links_v1', status:'morgen_status_v1', subs:'morgen_subs_v1', renewals:'morgen_renewals_v1', setup:'morgen_setup_v1', accent:'morgen_accent_v1' },
  weather: { lat:'46.4748', lon:'7.2863', tz:'Europe/Zurich', city:'Gstaad' },
  iconPath: 'icons/',
  timezones: [
    { city:'New York', tz:'America/New_York' },
    { city:'Gstaad', tz:'Europe/Zurich' },
    { city:'Tokyo', tz:'Asia/Tokyo' }
  ]
};

(function(){
  try {
    var s=localStorage.getItem(CFG.keys.setup);
    if(s){
      var d=JSON.parse(s);
      if(d.weather) CFG.weather=d.weather;
      if(d.timezones) CFG.timezones=d.timezones;
    }
    var a=localStorage.getItem(CFG.keys.accent);
    if(a){
      var ac=JSON.parse(a);
      document.documentElement.style.setProperty('--accent',ac.hex);
      document.documentElement.style.setProperty('--accent-hover',ac.hover);
      document.documentElement.style.setProperty('--accent-dim',ac.dim);
    }
  } catch(e){}
})();

var DEFAULT_LINKS = { groups:[] };
var DEFAULT_STATUS = [];
var DEFAULT_SUBS = [];
var DEFAULT_RENEWALS = [];
