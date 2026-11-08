// APEE Espaço Associado — Worker + D1; no R2 or paid email provider.
// Requires DB, SESSION_PEPPER, SITE_ORIGIN, API_ORIGIN.
// BRIDGE_SECRET and MAIL_DISPATCH_ENABLED control the Google Apps Script bridge.
import { scrypt, createHmac, timingSafeEqual } from 'node:crypto';
import page from './espaco-associado.html';
import partnershipPage from './parcerias-privadas.html';
import documentPage from './documentos-privados.html';
import financePage from './financeiro-privado.html';
import { sealMail, internalAuthorized, internalRoute } from './internal-api.js';
const encoder=new TextEncoder();
const bytes=n=>{let x=new Uint8Array(n);crypto.getRandomValues(x);return x};
const hex=b=>Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('');
const sha=async x=>hex(await crypto.subtle.digest('SHA-256',encoder.encode(x)));
const token=()=>hex(bytes(32));
const now=()=>Math.floor(Date.now()/1000);
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}});
const cookie=(value,maxAge)=>'__Host-apee_session='+encodeURIComponent(value)+'; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age='+maxAge;
const params=req=>new URL(req.url);
function cors(req,env){const origin=req.headers.get('Origin');return origin===env.SITE_ORIGIN?{'access-control-allow-origin':origin,'access-control-allow-credentials':'true','vary':'Origin','access-control-allow-headers':'Content-Type','access-control-allow-methods':'GET, POST, OPTIONS'}:{}}
const normalizeEmail=s=>typeof s==='string'&&s.length<=254?s.trim().toLowerCase():'';
// Native scrypt avoids Workers' PBKDF2 iteration ceiling. Deployment still requires
// measuring CPU on the FREE plan; never reduce the work factor or upgrade silently.
async function passwordHash(password,salt,env){
 const input=createHmac('sha256',env.SESSION_PEPPER).update('password-v1:'+password).digest();
 const derived=await new Promise((resolve,reject)=>scrypt(input,salt,32,{N:16384,r:8,p:5,maxmem:32*1024*1024},(error,key)=>error?reject(error):resolve(key)));
 return 'scrypt-v1:'+hex(derived);
}
function validPasswordHash(a,b){return typeof b==='string'&&a.length===b.length&&timingSafeEqual(encoder.encode(a),encoder.encode(b))}
async function member(req,env){const match=(req.headers.get('Cookie')||'').match(/(?:^|;\s*)__Host-apee_session=([a-f0-9]{64})/);if(!match)return null;const hash=await sha(match[1]+env.SESSION_PEPPER);return env.DB.prepare("SELECT m.id,m.full_name,m.email,m.member_number FROM tokens t JOIN members m ON m.id=t.member_id WHERE t.token_hash=? AND t.purpose='session' AND t.expires_at>? AND t.credential_version=m.credential_version AND m.status='active'").bind(hash,now()).first()}
async function limit(env,key,max,window){
 const time=now(),bucket=Math.floor(time/window);
 const id=await sha('rate:'+key+':'+bucket+':'+env.SESSION_PEPPER);
 return !!(await env.DB.prepare('INSERT INTO rate_limits(bucket_key,attempts,expires_at) VALUES(?,1,?) ON CONFLICT(bucket_key) DO UPDATE SET attempts=attempts+1 WHERE attempts<? RETURNING attempts').bind(id,(bucket+1)*window,max).first());
}
async function authLimits(req,env,path,email){
 const ip=req.headers.get('CF-Connecting-IP')||'unknown';
 const recovery=path==='/api/recovery';
 const window=recovery?3600:900;
 if(!await limit(env,path+':ip:'+ip,recovery?5:30,window))return false;
 if(email&&!await limit(env,path+':email:'+email,recovery?3:10,window))return false;
 if(recovery&&(!await limit(env,'email:hour',40,3600)||!await limit(env,'email:day',60,86400)))return false;
 return true;
}
async function readBody(req,max=4096){
 if(!req.headers.get('content-type')?.toLowerCase().startsWith('application/json'))throw Object.assign(new Error(),{status:415});
 const reader=req.body?.getReader(); if(!reader)return {};
 const chunks=[];let size=0;
 for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw Object.assign(new Error(),{status:413})}chunks.push(value)}
 const buffer=new Uint8Array(size);let offset=0;for(const chunk of chunks){buffer.set(chunk,offset);offset+=chunk.length}
 try{const value=JSON.parse(new TextDecoder().decode(buffer));if(!value||typeof value!=='object'||Array.isArray(value))throw new Error();return value}catch{throw Object.assign(new Error(),{status:400})}
}
function cleanError(){return json({error:'Pedido não concluído. Verifique os dados ou tente mais tarde.'},400)}
async function route(req,env,body){
 const url=params(req),p=url.pathname,method=req.method;
 if(method==='GET'&&p==='/api/me'){const m=await member(req,env);return json(m?{authenticated:true,name:m.full_name,member_number:m.member_number,email:m.email}:{authenticated:false})}
 if(method==='POST'&&p==='/api/recovery'){
  const address=normalizeEmail(body.email);
  if(env.MAIL_DISPATCH_ENABLED!=='true')return json({error:'Serviço de email em configuração.'},503);
  if(address.length<5||!address.includes('@'))return cleanError();
  const m=await env.DB.prepare("SELECT id,email FROM members WHERE email=? AND status='active'").bind(address).first();
  if(m){
   const t=token(),hash=await sha(t+env.SESSION_PEPPER),exp=now()+1800;
   const payload=await sealMail(env,{email:m.email,link:env.API_ORIGIN+'/#token='+encodeURIComponent(t)});
   await env.DB.batch([
    env.DB.prepare("INSERT INTO tokens(token_hash,member_id,purpose,expires_at) VALUES(?,?,'reset',?)").bind(hash,m.id,exp),
    env.DB.prepare('INSERT INTO mail_outbox(member_id,token_hash,encrypted_payload,expires_at) VALUES(?,?,?,?)').bind(m.id,hash,payload,exp)
   ]);
  }
  return json({ok:true});
 }
 if(method==='POST'&&p==='/api/reset'){
  const b=body;if(!/^[a-f0-9]{64}$/.test(String(b.token||''))||typeof b.password!=='string'||Array.from(b.password).length<15||b.password.length>128)return cleanError();
  const hash=await sha(b.token+env.SESSION_PEPPER);
  const t=await env.DB.prepare("SELECT t.member_id FROM tokens t JOIN members m ON t.member_id=m.id WHERE t.token_hash=? AND t.purpose='reset' AND t.expires_at>? AND m.status='active'").bind(hash,now()).first();
  if(!t)return json({error:'Ligação inválida ou expirada. Peça um novo email.'},400);
  const salt=hex(bytes(16)),passhash=await passwordHash(b.password,salt,env);
  const result=await env.DB.batch([
    env.DB.prepare("UPDATE members SET password_salt=?,password_hash=?,credential_version=credential_version+1 WHERE id=? AND status='active' AND EXISTS(SELECT 1 FROM tokens WHERE token_hash=? AND purpose='reset' AND expires_at>?)").bind(salt,passhash,t.member_id,hash,now()),
    env.DB.prepare("DELETE FROM tokens WHERE member_id=? AND EXISTS(SELECT 1 FROM tokens WHERE token_hash=? AND purpose='reset' AND expires_at>?)").bind(t.member_id,hash,now())
  ]);return result[0].meta.changes===1?json({ok:true}):json({error:'Ligação inválida ou expirada. Peça um novo email.'},400)
 }
 if(method==='POST'&&p==='/api/login'){
  const b=body;const address=normalizeEmail(b.email);
  if(!address||typeof b.password!=='string'||b.password.length>128)return json({error:'Credenciais inválidas.'},401);
  const m=await env.DB.prepare("SELECT id,password_hash,password_salt,credential_version FROM members WHERE email=? AND status='active'").bind(address).first();
  // Always derive a hash to reduce timing differences between registered/unregistered addresses.
  const h=await passwordHash(b.password,m?.password_salt||'00000000000000000000000000000000',env);
  if(!m?.password_hash||!validPasswordHash(h,m.password_hash))return json({error:'Credenciais inválidas.'},401);
  const t=token(),hash=await sha(t+env.SESSION_PEPPER),expiry=now()+7*86400;
  const inserted=await env.DB.prepare("INSERT INTO tokens(token_hash,member_id,purpose,ex --- TRUNCATED --- 16,904 chars