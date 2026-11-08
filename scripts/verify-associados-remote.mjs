// Run only against the isolated staging database. Never use real member data.
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const cfg=JSON.parse(await readFile(process.argv[2],'utf8'));
assert.equal(cfg.origin,'https://apee-associados-testes.xtvback2.workers.dev');
const password='Frase de teste APEE longa e segura 2026!';
let cookie;
let checks=0;
async function req(path,body,extra={}) {
 const r=await fetch(cfg.origin+path,{method:body===undefined?'GET':'POST',headers:{'User-Agent':'APEE-Associados-Integration-Test/1.0','X-APEE-Test':cfg.testKey,Origin:cfg.origin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...extra},...(body===undefined?{}:{body:JSON.stringify(body)})});
 return r;
}
async function internal(path,body,key=cfg.bridge){return req(path,body,{Authorization:'Bearer '+key})}
async function check(status,want,label){assert.equal(status,want,label);checks++;}
if(process.argv.includes('--mail-disabled')) {
 await check((await req('/api/documents')).status,401,'anonymous document list');
 await check((await req('/api/recovery',{email:'internal@example.test'})).status,503,'email dispatch remains disabled');
 await check((await internal('/internal/mail/claim',{})).status,503,'bridge cannot claim while disabled');
 const login=await req('/api/login',{email:'internal@example.test',password});await check(login.status,200,'login on Workers Free');
 cookie=login.headers.get('set-cookie').split(';')[0];
 const doc=await req('/api/documents/test-pdf');await check(doc.status,200,'private D1 PDF');assert.match(doc.headers.get('content-security-policy'),/sandbox/);
 await check((await req('/api/logout',{})).status,200,'logout');await check((await req('/api/documents/test-pdf')).status,401,'revoked session');
 const page=await req('/');await check(page.status,200,'same-origin member page');assert.match(await page.text(),/Espaço Associado/);
 console.log(JSON.stringify({checks,success:true,environment:'Cloudflare Workers Free + isolated EU D1',mail_dispatch_enabled:false,real_emails_sent:0}));process.exit(0);
}
await check((await req('/api/documents')).status,401,'anonymous list');
await check((await req('/api/login',{email:'internal@example.test',password},{Origin:'https://evil.example'})).status,403,'cross-origin');
await check((await internal('/internal/members/sync',{members:[{member_number:'TEST-0001',full_name:'Conta Sintética',email:'internal@example.test'}]})).status,200,'sync');
await check((await req('/api/recovery',{email:'internal@example.test'})).status,200,'recovery');
const claim=await internal('/internal/mail/claim',{});await check(claim.status,200,'claim');
const message=(await claim.json()).messages.at(-1);assert.equal(message.email,'internal@example.test');
const token=new URLSearchParams(new URL(message.link).hash.slice(1)).get('token');
await check((await req('/api/reset',{token,password})).status,200,'set password on Workers Free');
await check((await req('/api/reset',{token,password})).status,400,'single-use token');
const login=await req('/api/login',{email:'internal@example.test',password});
await check(login.status,200,'login on Workers Free');
const header=login.headers.get('set-cookie');assert.match(header,/^__Host-apee_session=/);assert.match(header,/HttpOnly/);assert.doesNotMatch(header,/Domain=/i);cookie=header.split(';')[0];
assert.equal((await (await req('/api/me')).json()).authenticated,true);checks++;
await check((await internal('/internal/documents/upload',{id:'ata'})).status,401,'bridge cannot upload');
const sample='%PDF-1.4\n%Synthetic APEE fixture\n%%EOF';
await check((await internal('/internal/documents/upload',{id:'test-pdf',title:'Documento sintético',active:true,content_base64:Buffer.from(sample).toString('base64')},cfg.admin)).status,200,'D1 PDF upload');
const document=await req('/api/documents/test-pdf');await check(document.status,200,'private download');assert.equal(await document.text(),sample);assert.match(document.headers.get('cache-control'),/no-store/);
await check((await req('/api/logout',{})).status,200,'logout');
await check((await req('/api/documents/test-pdf')).status,401,'logout revokes cookie');
const page=await req('/');await check(page.status,200,'same-origin member page');assert.match(await page.text(),/Espaço Associado/);
console.log(JSON.stringify({checks,success:true,environment:'Cloudflare Workers Free + isolated EU D1',real_emails_sent:0}));
