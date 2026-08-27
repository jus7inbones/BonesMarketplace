
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname,'..');
let passed = 0, failed = 0;
function test(name, fn){
  try { fn(); console.log('PASS', name); passed++; }
  catch(e){ console.error('FAIL', name, '-', e.message); failed++; }
}
function read(p){ return fs.readFileSync(path.join(root,p),'utf8'); }
function json(p){ return JSON.parse(read(p)); }

test('required files exist', ()=>{
  ['index.html','assets/jBsheets.css','assets/portal.css','assets/portal.js',
   'security/security-policy.json','security/navigation-policy.json',
   'security/audit-schema.json','auth/roles.json'].forEach(f=>{
     if(!fs.existsSync(path.join(root,f))) throw new Error('missing '+f);
   });
});
test('theme variables preserved', ()=>{
  const css = read('assets/jBsheets.css');
  if(!css.includes('--bg-experiment: #00ffa5')) throw new Error('missing green');
  if(!css.includes('--color-experiment: #203e86')) throw new Error('missing blue');
});
test('default deny is enabled', ()=>{
  const p = json('security/security-policy.json');
  if(p.security_model !== 'default-deny') throw new Error('not default deny');
});
test('Marketplace allow rule is first', ()=>{
  const p = json('security/navigation-policy.json');
  if(p.rules[0].action !== 'allow' || !p.rules[0].match.includes('/marketplace/')) throw new Error('bad allow rule');
});
test('external navigation is denied', ()=>{
  const p = json('security/security-policy.json');
  if(p.navigation.external !== 'deny') throw new Error('external not denied');
});
test('admin has wildcard permissions', ()=>{
  const r = json('auth/roles.json');
  if(!r.administrator.includes('*')) throw new Error('admin wildcard absent');
});
test('portal JS contains kill switch and audit export', ()=>{
  const js = read('assets/portal.js');
  if(!js.includes('SESSION_KILLED')) throw new Error('kill event missing');
  if(!js.includes('AUDIT_EXPORTED')) throw new Error('audit export missing');
});
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
