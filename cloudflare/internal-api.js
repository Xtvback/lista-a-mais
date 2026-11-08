// Internal integration: a separate bridge credential cannot read or upload PDFs.
import { timingSafeEqual } from 'node:crypto';
const encoder = new TextEncoder();
const time = () => Math.floor(Date.now()/1000);
const hex = data => Array.from(new Uint8Array(data),b=>b.toString(16).padStart(2,'0')).join('');
const random = () => hex(crypto.getRandomValues(new Uint8Array(32)));
const digest = async value => hex(await crypto.subtle.digest('SHA-256',encoder.encode(value)));
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'}});
const fromHex=value=>new Uint8Array(value.match(/../g).map(x=>parseInt(x,16)));
const mailKey=async env=>crypto.subtle.importKey('raw',await crypto.subtle.digest('SHA-256',encoder.encode('mail-outbox-v1:'+env.SESSION_PEPPER)),'AES-GCM',false,['encrypt','decrypt']);
export async function sealMail(env,payload){
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const data=await crypto.subtle.encrypt({name:'AES-GCM',iv},await mailKey(env),encoder.encode(JSON.stringify(payload)));
 return hex(iv)+':'+hex(data);
}
async function openMail(env,value){
 const [iv,data]=value.split(':');
 return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:fromHex(iv)},await mailKey(env),fromHex(data))));
}
function authorized(req,secret){
 if(!secret||secret.length<32)return false;
 const actual=encoder.encode(req.headers.get('authorization')||''),want=encoder.encode('Bearer '+secret);
 return actual.length===want.length&&timingSafeEqual(actual,want);
}
export function internalAuthorized(req,env,path){return authorized(req,path.startsWith('/internal/documents/')?env.ADMIN_SECRET:env.BRIDGE_SECRET)}
export async function internalRoute(path,body,env){
 if(path==='/internal/mail/claim'){
  if(env.MAIL_DISPATCH_ENABLED!=='true')return json({error:'Envio ainda desativado.'},503);
  const rows=await env.DB.prepare("SELECT o.id,o.encrypted_payload FROM mail_outbox o JOIN tokens t ON t.token_hash=o.token_hash JOIN members m ON m.id=o.member_id WHERE o.delivered_at IS NULL AND o.expires_at>? AND o.lease_until<=? AND o.attempts<5 AND t.expires_at>? AND m.status='active' ORDER BY o.id LIMIT 5").bind(time()+60,time(),time()).all();
  const messages=[];
  for(const row of rows.results){
   const lease=random();
   const r=await env.DB.prepare('UPDATE mail_outbox SET lease_hash=?,lease_until=?,attempts=attempts+1 WHERE id=? AND lease_until<=? AND delivered_at IS NULL RETURNING id').bind(await digest(lease),time()+120,row.id,time()).first();
   if(r)messages.push({id:row.id,lease,...await openMail(env,row.encrypted_payload)});
  }
  return json({messages});
 }
 if(path==='/internal/mail/ack'){
  if(!Number.isSafeInteger(body.id)||typeof body.lease!=='string'||!/^[a-f0-9]{64}$/.test(body.lease))return json({error:'Entrega inválida.'},409);
  const r=await env.DB.prepare('UPDATE mail_outbox SET delivered_at=?,encrypted_payload=? WHERE id=? AND lease_hash=? AND lease_until>? AND delivered_at IS NULL').bind(time(),'delivered',body.id,await digest(body.lease),time()).run();
  return r.meta.changes===1?json({ok:true}):json({error:'Entrega inválida.'},409);
 }
 if(path==='/internal/members/sync'){
  if(!Array.isArray(body.members)||body.members.length>50)return json({error:'Lista inválida.'},400);
  const list=body.members.map(m=>({number:m.member_number,name:m.full_name,email:typeof m.email==='string'?m.email.trim().toLowerCase():''}));
  if(list.some(m=>typeof m.number!=='string'||!/^\w[\w-]{0,39}$/.test(m.number)||typeof m.name!=='string'||!m.name.trim()||m.name.length>200||m.email.length>254||!m.email.includes('@'))||new Set(list.map(m=>m.number)).size!==list.length||new Set(list.map(m=>m.email)).size!==list.length)return json({error:'Lista inválida ou duplicada.'},400);
  const current=(await env.DB.prepare('SELECT member_number,email FROM members').all()).results;
  if(current.length+list.filter(m=>!current.some(c=>c.member_number===m.number)).length>50)return json({error:'Limite de associados configurado atingido.'},409);
  if(list.some(m=>current.some(c=>(c.member_number===m.number&&c.email!==m.email)||(c.email===m.email&&c.member_number!==m.number))))return json({error:'Identidade em conflito. Requer revisão.'},409);
  if(list.length){try{await env.DB.batch(list.map(m=>env.DB.prepare('INSERT INTO members(member_number,full_name,email) VALUES(?,?,?) ON CONFLICT(member_number) DO UPDATE SET full_name=excluded.full_name WHERE members.email=excluded.email').bind(m.number,m.name,m.email)))}catch{return json({error:'Conflito na sincronização. Requer revisão.'},409)}}
  return json({ok:true,received:list.length});
 }
 if(path==='/internal/documents/upload'){
  if(!/^[\w-]{1,80}$/.test(body.id)||typeof body.title!=='string'||!body.title.trim()||body.title.length>200||typeof body.content_base64!=='string'||body.content_base64.length>2400000)return json({error:'Documento inválido ou demasiado grande.'},400);
  let binary;try{binary=Uint8Array.from(atob(body.content_base64),c=>c.charCodeAt(0))}catch{return json({error:'Documento inválido.'},400)}
  if(binary.length>1800000||new TextDecoder().decode(binary.slice(0,5))!=='%PDF-')return json({error:'É necessário um PDF até 1,8 MB.'},400);
  await env.DB.batch([
   env.DB.prepare('INSERT INTO documents(id,title,category,r2_key,active) VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,category=excluded.category,active=excluded.active').bind(body.id,body.title,String(body.category||'Documentação').slice(0,100),'d1:'+body.id,body.active===true?1:0),
   env.DB.prepare('INSERT INTO document_content(document_id,content) VALUES(?,?) ON CONFLICT(document_id) DO UPDATE SET content=excluded.content').bind(body.id,binary.buffer)
  ]);
  return json({ok:true,active:body.active===true});
 }
 return json({error:'Rota não encontrada.'},404);
}
