
const view = document.getElementById('view');
const title = document.getElementById('pageTitle');
const toast = document.getElementById('toast');
const sessionState = document.getElementById('sessionState');

const state = {
  sessionActive: true,
  role: 'ADMIN',
  policy: 'DEFAULT_DENY',
  audit: [
    eventOf('PORTAL_INITIALIZED','INFO','ALLOW','Portal v1 loaded'),
    eventOf('POLICY_LOADED','INFO','ALLOW','Default-deny policy active'),
    eventOf('UNRELATED_SOURCE_POLICY','WARN','DENY','Feed, groups, profile and external domains blocked')
  ]
};

function eventOf(type,severity,result,detail){
  return {time:new Date().toLocaleTimeString(),type,severity,result,actor:'ADMIN',detail};
}
function log(type,severity='INFO',result='ALLOW',detail=''){
  state.audit.unshift(eventOf(type,severity,result,detail));
}
function notify(msg){
  toast.textContent=msg; toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),2200);
}
function ensureActive(){
  if(!state.sessionActive){ notify('Portal is locked.'); return false; }
  return true;
}
function renderRows(rows){
  return rows.map(r=>`<div class="row"><div>${r[0]}</div><div>${r[1]}</div><div>${r[2]}</div><div>${r[3]}</div></div>`).join('');
}

const pages = {
  overview(){
    return `<div class="notice"><b>ISOLATION ACTIVE.</b> Only the configured Marketplace surface is represented in this portal. Unrelated Facebook sections and arbitrary external navigation are denied by policy.</div>
    <div class="grid section">
      <div class="card"><div class="label">Active session</div><div class="metric">${state.sessionActive?'01':'00'}</div></div>
      <div class="card"><div class="label">Allowed sources</div><div class="metric">01</div></div>
      <div class="card"><div class="label">Blocked routes</div><div class="metric">04+</div></div>
      <div class="card"><div class="label">Policy state</div><div class="metric">LOCK</div></div>
    </div>
    <div class="section"><div class="section-head"><h2>Policy Boundary</h2><span class="tag">DEFAULT DENY</span></div>
      <div class="table"><div class="row head"><div>RESOURCE</div><div>ACCESS</div><div>SESSION</div><div>STATE</div></div>
      ${renderRows([
        ['Approved Marketplace surface','<span class="status-allow">ALLOW</span>','Isolated','ACTIVE'],
        ['Facebook Feed / Groups / Profile','<span class="status-deny">DENY</span>','Isolated','BLOCKED'],
        ['External domains','<span class="status-deny">DENY</span>','Isolated','BLOCKED']
      ])}</div>
    </div>`;
  },
  search(){
    return `<div class="card">
      <div class="label">Controlled Marketplace query</div>
      <div class="searchbox section"><input id="q" placeholder="Search approved Marketplace content..." /><button class="primary" id="runSearch">SEARCH</button></div>
      <div class="filter-row">
        <select><option>Category: Any</option><option>Vintage</option><option>Electronics</option><option>Home</option></select>
        <select><option>Location: Approved</option></select>
        <select><option>Price: Any</option><option>Under $50</option><option>$50-$250</option></select>
        <select><option>Condition: Any</option><option>New</option><option>Used</option></select>
      </div>
    </div>
    <div id="searchResults" class="results">
      ${sampleListings().map(cardFor).join('')}
    </div>`;
  },
  listings(){
    return `<div class="section-head"><h2>Approved Listing Workspace</h2><span class="tag">MARKETPLACE ONLY</span></div>
    <div class="table"><div class="row head"><div>LISTING</div><div>STATUS</div><div>SOURCE</div><div>ACTION</div></div>
    ${renderRows([
      ['Vintage receiver','AVAILABLE','Marketplace','VIEW'],
      ['Retro game console','AVAILABLE','Marketplace','VIEW'],
      ['Workshop cabinet','SOLD','Marketplace','VIEW']
    ])}</div>`;
  },
  messages(){
    return `<div class="split">
      <div class="conversation-list">
        <div class="label">Marketplace conversations</div>
        <div class="conversation-item">Buyer A · Vintage receiver</div>
        <div class="conversation-item">Buyer B · Retro console</div>
        <div class="conversation-item">Buyer C · Workshop cabinet</div>
      </div>
      <div class="conversation">
        <div class="label">Current conversation</div>
        <div class="message">Is this still available?</div>
        <div class="message admin">Yes. This response stays inside the controlled Marketplace workflow.</div>
        <div class="composer"><textarea id="messageBox" placeholder="Admin response..."></textarea><button class="primary" id="sendMessage">SEND</button></div>
      </div>
    </div>`;
  },
  audit(){
    return `<div class="audit-controls">
      <select id="severityFilter"><option value="ALL">All severity</option><option>INFO</option><option>WARN</option><option>CRITICAL</option></select>
      <button class="secondary" id="exportAudit">EXPORT JSON</button>
    </div>
    <div class="table">
      <div class="row head"><div>EVENT</div><div>RESULT</div><div>SEVERITY</div><div>TIME</div></div>
      ${state.audit.map(e=>`<div class="row"><div>${e.type}</div><div>${e.result}</div><div class="severity-${e.severity.toLowerCase()}">${e.severity}</div><div>${e.time}</div></div>`).join('')}
    </div>`;
  },
  security(){
    return `<div class="grid">
      <div class="card"><div class="label">Session</div><div class="metric">${state.sessionActive?'ACTIVE':'LOCKED'}</div></div>
      <div class="card"><div class="label">Authorization</div><div class="metric">${state.role}</div></div>
      <div class="card"><div class="label">Policy</div><div class="metric">DENY</div></div>
      <div class="card"><div class="label">External access</div><div class="metric">BLOCK</div></div>
    </div>
    <div class="section table">
      <div class="row head"><div>CONTROL</div><div>VALUE</div><div>OWNER</div><div>STATE</div></div>
      ${renderRows([
        ['Marketplace scope','/marketplace/**','ADMIN','LOCKED'],
        ['Popups','DENY','POLICY','ACTIVE'],
        ['New windows','DENY','POLICY','ACTIVE'],
        ['External redirects','DENY','POLICY','ACTIVE']
      ])}
    </div>`;
  }
};

function sampleListings(){
  return [
    {name:'Vintage Receiver',price:'$120',status:'AVAILABLE'},
    {name:'Retro Game Console',price:'$85',status:'AVAILABLE'},
    {name:'Workshop Cabinet',price:'$200',status:'SOLD'}
  ];
}
function cardFor(x){
  return `<article class="listing-card"><div class="thumb">APPROVED MARKETPLACE</div><h3>${x.name}</h3><div class="price">${x.price}</div><p class="label">${x.status}</p><button class="secondary listingAction">OPEN LISTING</button></article>`;
}

function bind(viewName){
  if(viewName==='search'){
    document.getElementById('runSearch')?.addEventListener('click',()=>{
      if(!ensureActive()) return;
      const q=document.getElementById('q').value.trim() || 'sample';
      log('MARKETPLACE_SEARCH','INFO','ALLOW',q);
      notify(`Contained search: ${q}`);
    });
    document.querySelectorAll('.listingAction').forEach(btn=>btn.addEventListener('click',()=>{
      if(!ensureActive()) return;
      log('LISTING_OPENED','INFO','ALLOW','Approved sample listing');
      notify('Approved Marketplace listing opened.');
    }));
  }
  if(viewName==='messages'){
    document.getElementById('sendMessage')?.addEventListener('click',()=>{
      if(!ensureActive()) return;
      const msg=document.getElementById('messageBox').value.trim();
      if(!msg){notify('Message is empty.');return}
      log('MARKETPLACE_MESSAGE','INFO','ALLOW','Admin message queued in demo workspace');
      document.getElementById('messageBox').value='';
      notify('Demo message recorded.');
    });
  }
  if(viewName==='audit'){
    document.getElementById('exportAudit')?.addEventListener('click',()=>{
      const blob=new Blob([JSON.stringify(state.audit,null,2)],{type:'application/json'});
      const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='bones-marketplace-audit.json'; a.click();
      URL.revokeObjectURL(a.href);
      log('AUDIT_EXPORTED','INFO','ALLOW','Audit JSON downloaded');
      notify('Audit export created.');
    });
  }
}
function render(name='overview'){
  const fn=pages[name]||pages.overview;
  title.textContent={
    overview:'Marketplace Control',search:'Marketplace Search',listings:'Listings',
    messages:'Messages',audit:'Audit Log',security:'Security'
  }[name]||'Marketplace Control';
  view.innerHTML=fn();
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  bind(name);
}
document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>render(b.dataset.view)));

document.getElementById('killSession').addEventListener('click',()=>{
  if(!state.sessionActive) return;
  state.sessionActive=false;
  sessionState.textContent='SESSION: TERMINATED';
  log('SESSION_KILLED','CRITICAL','DENY','Emergency kill control used');
  document.body.insertAdjacentHTML('beforeend',`<div class="locked-overlay"><div class="locked-card"><h2>SESSION TERMINATED</h2><p>The Marketplace portal is locked. Reload the local preview to start a new demo session.</p></div></div>`);
});

render('overview');
