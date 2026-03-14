var editingItem = null;

function closeModal(){document.getElementById('modalOverlay').classList.remove('active');}
document.getElementById('modalOverlay').addEventListener('click',function(e){if(e.target===this)closeModal();});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModal();});

function modalHTML(title,fields,saveFn){
  var h='<h3>'+title+'</h3>';
  fields.forEach(function(f){
    h+='<div class="field"><label>'+f.label+'</label>';
    if(f.type==='select') h+='<select id="'+f.id+'">'+f.opts+'</select>';
    else h+='<input type="'+f.type+'" id="'+f.id+'" value="'+esc(f.val||'')+'" placeholder="'+(f.ph||'')+'"/>';
    h+='</div>';
  });
  h+='<div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button>';
  h+='<button class="btn btn-accent" onclick="'+saveFn+'">Save</button></div>';
  document.getElementById('modal').innerHTML=h;
  document.getElementById('modalOverlay').classList.add('active');
  setTimeout(function(){document.getElementById(fields[0].id).focus();},80);
}

function openLinkModal(gi,ii){
  var e=ii!==undefined,item=e?data.groups[gi].items[ii]:null;
  editingItem={gi:gi!==undefined?gi:0,ii:e?ii:null};
  var opts='';data.groups.forEach(function(g,i){opts+='<option value="'+i+'"'+(i===editingItem.gi?' selected':'')+'>'+esc(g.name)+'</option>';});
  modalHTML((e?'Edit':'Add')+' Link',[
    {label:'Name',type:'text',id:'m_name',val:e?item.name:'',ph:'Dashboard name'},
    {label:'URL',type:'url',id:'m_url',val:e?item.url:'',ph:'https://...'},
    {label:'Section',type:'select',id:'m_group',opts:opts}
  ],'saveLinkModal()');
}

function saveLinkModal(){
  var n=document.getElementById('m_name').value.trim(),u=document.getElementById('m_url').value.trim(),gi=parseInt(document.getElementById('m_group').value);
  if(!n||!u)return;if(u.indexOf('http')!==0)u='https://'+u;
  var entry={name:n,url:u};
  if(editingItem.ii!==null){
    var old=editingItem.gi;
    if(old!==gi){data.groups[old].items.splice(editingItem.ii,1);data.groups[gi].items.push(entry);}
    else data.groups[gi].items[editingItem.ii]=entry;
  } else data.groups[gi].items.push(entry);
  sv(CFG.keys.links,data);closeModal();render();toast(editingItem.ii!==null?'Updated':'Added');
}

function openStatusModal(si){
  var e=si!==undefined,s=e?statusSites[si]:null;
  modalHTML((e?'Edit':'Add')+' Status Site',[
    {label:'Name',type:'text',id:'s_name',val:e?s.name:'',ph:'Site name'},
    {label:'URL',type:'url',id:'s_url',val:e?s.url:'',ph:'https://...'}
  ],'saveStatusModal('+(e?si:'null')+')');
}

function saveStatusModal(si){
  var n=document.getElementById('s_name').value.trim(),u=document.getElementById('s_url').value.trim();
  if(!n||!u)return;if(u.indexOf('http')!==0)u='https://'+u;
  if(si!==null)statusSites[si]={name:n,url:u};else statusSites.push({name:n,url:u});
  sv(CFG.keys.status,statusSites);closeModal();render();checkAllStatuses();toast(si!==null?'Updated':'Added');
}

function openSubModal(si){
  var e=si!==undefined,s=e?subs[si]:null;
  modalHTML((e?'Edit':'Add')+' Subscription',[
    {label:'Name',type:'text',id:'sub_name',val:e?s.name:'',ph:'Service name'},
    {label:'Price',type:'text',id:'sub_price',val:e?s.price:'',ph:'$20/mo'},
    {label:'Next payment',type:'date',id:'sub_date',val:e?s.date:''}
  ],'saveSubModal('+(e?si:'null')+')');
}

function saveSubModal(si){
  var n=document.getElementById('sub_name').value.trim(),p=document.getElementById('sub_price').value.trim(),d=document.getElementById('sub_date').value;
  if(!n||!d)return;
  if(si!==null)subs[si]={name:n,price:p,date:d};else subs.push({name:n,price:p,date:d});
  sv(CFG.keys.subs,subs);closeModal();render();toast(si!==null?'Updated':'Added');
}

function openRenewalModal(ri){
  var e=ri!==undefined,r=e?renewals[ri]:null;
  modalHTML((e?'Edit':'Add')+' Renewal',[
    {label:'Name',type:'text',id:'ren_name',val:e?r.name:'',ph:'Domain, cert...'},
    {label:'Expiry',type:'date',id:'ren_date',val:e?r.date:''}
  ],'saveRenewalModal('+(e?ri:'null')+')');
}

function saveRenewalModal(ri){
  var n=document.getElementById('ren_name').value.trim(),d=document.getElementById('ren_date').value;
  if(!n||!d)return;
  if(ri!==null)renewals[ri]={name:n,date:d};else renewals.push({name:n,date:d});
  sv(CFG.keys.renewals,renewals);closeModal();render();toast(ri!==null?'Updated':'Added');
}
