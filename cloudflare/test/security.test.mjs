import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { Miniflare, Response } from 'miniflare';

let mf, db, bucket;
const origin = 'https://apeebairrodorestelo.com';
const emails = [];
const address = 'internal@example.test';
const password = 'Uma frase longa para testes 2026!';
const deliverMail = async request => {
  assert.equal(new URL(request.url).origin,'https://api.resend.com');
  emails.push(await request.json());
  return new Response(JSON.stringify({id:'test-delivery'}),{status:200});
};

before(async () => {
  mf = new Miniflare({scriptPath:new URL('../associados-worker.js',import.meta.url).pathname,
    modules:true, compatibilityDate:'2026-07-29', compatibilityFlags:['nodejs_compat'],
    d1Databases:['DB'], r2Buckets:['DOCS'], outboundService:deliverMail,
    bindings:{SITE_ORIGIN:origin, API_ORIGIN:'https://api.example.test', SESSION_PEPPER:'x'.repeat(64),
      RESEND_API_KEY:'test-key', MAIL_FROM:'APEE <access@example.test>'}});
  db = await mf.getD1Database('DB'); bucket = await mf.getR2Bucket('DOCS');
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
async function recovery() {
  const r=await request('/api/recovery',{email:address}); assert.equal(r.status,200);
  assert.ok(emails.length); const link=emails.at(-1).html.match(/href="([^"]+)"/)[1];
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
  assert.match(emails.at(-1).html,/#token=/);
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
  await bucket.put('private/ata.pdf','%PDF-1.4 test');
  await db.prepare("INSERT INTO documents(id,title,r2_key,active) VALUES('ata','Ata','private/ata.pdf',1)").run();
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
