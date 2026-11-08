import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { Miniflare } from 'miniflare';
import { fileURLToPath } from 'node:url';

let mf, db;
const origin = 'https://apeebairrodorestelo.com';
const emails = [];
const address = 'internal@example.test';
const password = 'Uma frase longa para testes 2026!';

before(async () => {
  mf = new Miniflare({scriptPath:fileURLToPath(new URL('../associados-worker.js',import.meta.url)),
    modules:true, modulesRoot:fileURLToPath(new URL('../../',import.meta.url)), compatibilityDate:'2026-07-29', compatibilityFlags:['nodejs_compat'],
    d1Databases:['DB'], modulesRules:[{type:'ESModule',include:['**/*.js'],fallthrough:true},{type:'Text',include:['**/*.html'],fallthrough:true}],
    bindings:{RELEASE_ENABLED:'true',SITE_ORIGIN:origin, API_ORIGIN:'https://api.example.test', SESSION_PEPPER:'x'.repeat(64),
      BRIDGE_SECRET:'b'.repeat(64), ADMIN_SECRET:'a'.repeat(64), MAIL_DISPATCH_ENABLED:'true'}});
  db = await mf.getD1Database('DB');
  for(const f of (await readdir(new URL('../../migrations/',import.meta.url))).sort()) {
    const sql = await readFile(new URL('../../migrations/'+f,import.meta.url),'utf8');
    for(const statement of sql.split(';').map(x=>x.trim()).filter(Boolean)) await db.prepare(statement).run();
  }
  await db.prepare('INSERT INTO members(member_number,email,full_name) VALUES(?,?,?)').bind('TEST-0001',address,'Conta Interna').run();
});
after(async () => { await mf?.dispose(); });

function request(path, body, cookie, extra={}) {
  return mf.dispatchFetch('https://api.example.test'+path,{method:body===undefined?'GET':'POST',
    headers:{origin,'content-type':'application/json','cf-connecting-ip':'192.0.2.10',...(cookie?{cookie}:{}),...extra},
    ...(body===undefined?{}:{body:JSON.stringify(body)})});
}

function internal(path,body,key='b'.repeat(64)) {
 return request(path,body,null,{authorization:'Bearer '+key});
}

async function recovery() {
  const r=await request('/api/recovery',{email:address}); assert.equal(r.status,200);
  const claim=await internal('/internal/mail/claim',{}); assert.equal(claim.status,200);
  const messages=(await claim.json()).messages;assert.ok(messages.length); const link=messages.at(-1).link;
  const url=new URL(link); return url.hash ? new URLSearchParams(url.hash.slice(1)).get('token') : url.searchParams.get('token');
}
async function login() {
  const r=await request('/api/login',{email:address,password}); assert.equal(r.status,200);
  return r.headers.get('set-cookie').split(';')[0];
}

test('rejects unauthenticated document listing and direct download',async()=>{
  assert.equal((await request('/api/documents')).status,401);
  assert.equal((await request('/api/documents/ata')).status,401);
});
test('rejects cross-origin writes and oversized bodies before doing authentication',async()=>{
  assert.equal((await request('/api/login',{email:address,password},null,{origin:'https://evil.example'})).status,403);
  assert.equal((await request('/api/login',{email:address,password:'x'.repeat(5000)})).status,413);
});
test('activation uses a fragment link and keeps an unknown email response identical',async()=>{
  const known=await request('/api/recovery',{email:address});
  const unknown=await request('/api/recovery',{email:'unknown@example.test'});
  assert.deepEqual(await known.json(),await unknown.json());
  const queued=await internal('/internal/mail/claim',{}); const messages=(await queued.json()).messages;assert.equal(messages.length,1);assert.match(messages[0].link,/#token=/);
});
test('first access sets a password; a concurrent replay changes it only once',async()=>{
  const token=await recovery();
  const responses=await Promise.all([request('/api/reset',{token,password}),request('/api/reset',{token,password})]);
  assert.deepEqual(responses.map(r=>r.status).sort(),[200,400]);
  assert.equal((await request('/api/reset',{token,password})).status,400);
});
test('login cookie is host-only and logout revokes access',async()=>{
  const r=await request('/api/login',{email:address,password}); assert.equal(r.status,200);
  const header=r.headers.get('set-cookie');
  assert.match(header,/^__Host-apee_session=/); assert.match(header,/HttpOnly/); assert.match(header,/Secure/);
  assert.doesNotMatch(header,/Domain=/i);
  const cookie=header.split(';')[0];
  assert.equal((await (await request('/api/me',undefined,cookie)).json()).authenticated,true);
  assert.equal((await request('/api/logout',{},cookie)).status,200);
  assert.equal((await request('/api/documents',undefined,cookie)).status,401);
});
test('private PDFs require active membership and revoked sessions stop immediately',async()=>{
  const cookie=await login();
  const upload=await internal('/internal/documents/upload',{id:'ata',title:'Ata',active:true,content_base64:btoa('%PDF-1.4 test')},'a'.repeat(64)); assert.equal(upload.status,200);
  let r=await request('/api/documents/ata',undefined,cookie);
  assert.equal(r.status,200); assert.match(r.headers.get('cache-control'),/no-store/);
  assert.equal(await r.text(),'%PDF-1.4 test');
  await db.prepare("UPDATE members SET status='disabled' WHERE email=?").bind(address).run();
  assert.equal((await request('/api/documents/ata',undefined,cookie)).status,401);
  await db.prepare("UPDATE members SET status='active' WHERE email=?").bind(address).run();
});
test('password recovery revokes all previous sessions and expired reset links fail',async()=>{
  // Clear only test rate counters so each scenario has its own budget.
  try { await db.prepare('DELETE FROM rate_limits').run(); } catch (e) { if (!String(e).includes('no such table')) throw e; }
  const cookie=await login(); const token=await recovery();
  assert.equal((await request('/api/reset',{token,password})).status,200);
  assert.equal((await request('/api/documents',undefined,cookie)).status,401);
  const expired=await recovery(); await db.prepare("UPDATE tokens SET expires_at=0 WHERE purpose='reset'").run();
  assert.equal((await request('/api/reset',{token:expired,password})).status,400);
});
test('durable login throttling stops repeated attempts, including parallel requests',async()=>{
  try { await db.prepare('DELETE FROM rate_limits').run(); } catch (e) { if (!String(e).includes('no such table')) throw e; }
  const responses=await Promise.all(Array.from({length:12},()=>request('/api/login',{email:'bad@example.test',password:'invalid-password'})));
  assert.equal(responses.filter(r=>r.status===401).length,10);
  assert.equal(responses.filter(r=>r.status===429).length,2);
  assert.ok(responses.find(r=>r.status===429).headers.get('retry-after'));
});


test('serves the member page from its own origin without a document bucket',async()=>{
 const r=await request('/');assert.equal(r.status,200);assert.match(await r.text(),/Espaço Associado/);
 assert.match(r.headers.get('content-security-policy'),/frame-ancestors 'none'/);
});
test('bridge credentials cannot upload or download private documents',async()=>{
 assert.equal((await internal('/internal/documents/upload',{id:'bad'})).status,401);
 assert.equal((await internal('/internal/mail/claim',{},'wrong')).status,401);
 assert.equal((await request('/api/documents/ata',undefined,null,{authorization:'Bearer '+'b'.repeat(64)})).status,401);
});
test('sync preserves existing credentials and rejects conflicting identities atomically',async()=>{
 const original=await db.prepare('SELECT password_hash FROM members WHERE email=?').bind(address).first();
 const members=[{member_number:'TEST-0001',full_name:'Conta Interna',email:address},{member_number:'TEST-0002',full_name:'Outra Conta',email:'new@example.test'}];
 assert.equal((await internal('/internal/members/sync',{members})).status,200);
 assert.equal((await db.prepare('SELECT password_hash FROM members WHERE email=?').bind(address).first()).password_hash,original.password_hash);
 const bad=await internal('/internal/members/sync',{members:[{member_number:'TEST-0003',full_name:'Erro',email:address}]});assert.equal(bad.status,409);
 assert.equal(await db.prepare("SELECT id FROM members WHERE member_number='TEST-0003'").first(),null);
});
test('mail claim leases a message and acknowledgement requires its exact lease',async()=>{
 await db.prepare('DELETE FROM rate_limits').run();
 await request('/api/recovery',{email:'new@example.test'});
 const claim=await internal('/internal/mail/claim',{});const messages=(await claim.json()).messages;
 const message=messages.find(m=>m.email==='new@example.test');assert.ok(message);
 assert.ok(!(await (await internal('/internal/mail/claim',{})).json()).messages.some(m=>m.id===message.id));
 assert.equal((await internal('/internal/mail/ack',{id:message.id,lease:'wrong'})).status,409);
 assert.equal((await internal('/internal/mail/ack',{id:message.id,lease:message.lease})).status,200);
 assert.equal((await db.prepare('SELECT delivered_at FROM mail_outbox WHERE id=?').bind(message.id).first()).delivered_at>0,true);
});

test('a deployed portal stays closed until the release flag is enabled',async()=>{
 const closed=new Miniflare({scriptPath:fileURLToPath(new URL('../associados-worker.js',import.meta.url)),modules:true,modulesRoot:fileURLToPath(new URL('../../',import.meta.url)),compatibilityDate:'2026-07-29',compatibilityFlags:['nodejs_compat'],modulesRules:[{type:'ESModule',include:['**/*.js'],fallthrough:true},{type:'Text',include:['**/*.html'],fallthrough:true}],bindings:{RELEASE_ENABLED:'false'}});
 try {assert.equal((await closed.dispatchFetch('https://closed.example.test/')).status,503);assert.equal((await closed.dispatchFetch('https://closed.example.test/api/me')).status,503);} finally {await closed.dispose()}
});

test('legacy public URLs redirect to the official domain while internal endpoints remain protected',async()=>{
 const branded=new Miniflare({scriptPath:fileURLToPath(new URL('../associados-worker.js',import.meta.url)),modules:true,modulesRoot:fileURLToPath(new URL('../../',import.meta.url)),compatibilityDate:'2026-07-29',compatibilityFlags:['nodejs_compat'],modulesRules:[{type:'ESModule',include:['**/*.js'],fallthrough:true},{type:'Text',include:['**/*.html'],fallthrough:true}],bindings:{RELEASE_ENABLED:'true',PUBLIC_ORIGIN:'https://associados.apeebairrodorestelo.com',BRIDGE_SECRET:'b'.repeat(64)}});
 try {
  const redirect=await branded.dispatchFetch('https://legacy.example.test/api/documents/test?download=1',{redirect:'manual'});
  assert.equal(redirect.status,308);assert.equal(redirect.headers.get('location'),'https://associados.apeebairrodorestelo.com/api/documents/test?download=1');
  assert.equal((await branded.dispatchFetch('https://associados.apeebairrodorestelo.com/')).status,200);
  assert.equal((await branded.dispatchFetch('https://legacy.example.test/internal/members/sync',{redirect:'manual'})).status,401);
 } finally {await branded.dispose()}
});
