import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
const source=readFileSync(new URL('../../integrations/apps-script/Code.gs',import.meta.url),'utf8');
function fixture(){
 const props=new Map([['APEE_API_ORIGIN','https://apee-associados-testes.xtvback2.workers.dev'],['APEE_BRIDGE_SECRET','b'.repeat(64)],['APEE_SEND_EMAILS','false']]);
 const state={quota:100,mail:[],calls:[],failAck:false,minutes:null,headers:['Número permanente','Nome','Email'],triggers:[{getHandlerFunction:()=> 'cartoesExistentes'}]};
 state.members=[['0001','Conta Interna','internal@example.test']];state.statuses=['Enviado'];
 const store={getProperty:k=>props.get(k)||null,setProperty:(k,v)=>props.set(k,v),getProperties:()=>Object.fromEntries(props),deleteProperty:k=>props.delete(k)};
 const token='f'.repeat(64);state.messages=[{id:1,lease:'c'.repeat(64),email:'internal@example.test',link:'https://apee-associados-testes.xtvback2.workers.dev/#token='+token}];
 const context=vm.createContext({
  PropertiesService:{getScriptProperties:()=>store},
  Utilities:{DigestAlgorithm:{SHA_256:'SHA_256'},computeDigest:(_,s)=>createHash('sha256').update(s).digest(),base64EncodeWebSafe:b=>Buffer.from(b).toString('base64url')},
  LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>{}})},
  MailApp:{getRemainingDailyQuota:()=>state.quota,sendEmail:m=>{state.mailAttempts=(state.mailAttempts||0)+1;if(state.failMail)throw new Error('Mail transport uncertain');state.mail.push(m);state.quota--;}},
  UrlFetchApp:{fetch:(url,options)=>{state.calls.push({url,options});if(url.startsWith('https://sheets.googleapis.com/'))return {getResponseCode:()=>state.sheetStatus||200,getContentText:()=>JSON.stringify({valueRanges:[{values:[state.headers,...state.members]},{values:[['Estado'],...state.statuses.map(s=>[s])]}]})};if(state.failAck&&url.endsWith('/ack'))return {getResponseCode:()=>503};return {getResponseCode:()=>200,getContentText:()=>JSON.stringify(url.endsWith('/claim')?{messages:state.messages}:{ok:true})}}},
  ScriptApp:{getOAuthToken:()=> 'google-readonly-token',getProjectTriggers:()=>state.triggers,newTrigger:name=>({timeBased:()=>({everyMinutes:minutes=>({create:()=>{state.minutes=minutes;state.triggers.push({getHandlerFunction:()=>name});}})})}),deleteTrigger:()=>{throw new Error('Existing triggers must be preserved');}}
 });
 vm.runInContext(source,context);return {context,state,props};
}
test('install is idempotent and never sends mail or removes existing card triggers',()=>{
 const f=fixture();f.context.installApeeBridge();f.context.installApeeBridge();
 assert.equal(f.state.mail.length,0);assert.equal(f.state.triggers.length,2);assert.equal(f.state.triggers[0].getHandlerFunction(),'cartoesExistentes');assert.equal(f.state.minutes,5);
 assert.equal(f.state.calls.filter(c=>c.url.endsWith('/sync')).length,1);
});
function invitationsFixture(){const f=fixture();f.props.set('APEE_API_ORIGIN','https://apee-associados.xtvback2.workers.dev');f.props.set('APEE_SEND_EMAILS','true');f.props.set('APEE_SEND_INVITES','true');f.state.messages=[];return f;}
test('welcome invitation is sent once after a card is sent; a new member receives their own invite',()=>{
 const f=invitationsFixture();f.context.apeeBridgeTick();f.context.apeeBridgeTick();assert.equal(f.state.mail.length,1);
 assert.match(f.state.mail[0].subject,/Convite/);assert.match(f.state.mail[0].htmlBody,/href="https:\/\/apee-associados\.xtvback2\.workers\.dev\/"/);assert.doesNotMatch(f.state.mail[0].body,/https?:\/\/|#token=/);
 f.state.members.push(['0002','Nova Conta','new@example.test']);f.state.statuses.push('Pendente');f.context.apeeBridgeTick();assert.equal(f.state.mail.length,1);
 f.state.statuses[1]='Enviado';f.context.apeeBridgeTick();assert.equal(f.state.mail.length,2);assert.equal(f.state.mail[1].to,'new@example.test');
});
test('welcome invitations preserve the card quota and resume remaining members later',()=>{
 const f=invitationsFixture();f.state.members.push(['0002','Nova Conta','new@example.test']);f.state.statuses.push('Enviado');f.state.quota=26;
 f.context.apeeBridgeTick();assert.equal(f.state.mail.length,1);assert.equal(f.state.quota,25);
 f.state.quota=100;f.context.apeeBridgeTick();assert.equal(f.state.mail.length,2);assert.equal(new Set(f.state.mail.map(m=>m.to)).size,2);
});
test('welcome invitations require explicit activation, production origin and no test filter',()=>{
 for(const mutate of [f=>f.props.set('APEE_SEND_INVITES','false'),f=>f.props.set('APEE_API_ORIGIN','https://apee-associados-testes.xtvback2.workers.dev'),f=>f.props.set('APEE_TEST_EMAIL','owner@example.test'),f=>f.props.set('APEE_SEND_EMAILS','false')]){const f=invitationsFixture();mutate(f);f.context.apeeBridgeTick();assert.equal(f.state.mail.length,0);}
});
test('uncertain invitation delivery is retained for review and never automatically duplicated',()=>{
 const f=invitationsFixture();f.state.failMail=true;assert.throws(()=>f.context.apeeBridgeTick(),/Convite/);
 assert.equal(f.state.mailAttempts,1);assert.equal(f.state.mail.length,0);assert.ok([...f.props].some(([k,v])=>k.startsWith('APEE_INVITED_')&&v.startsWith('pending:')));
 f.state.failMail=false;f.context.apeeBridgeTick();assert.equal(f.state.mailAttempts,1);assert.equal(f.state.mail.length,0);
});
test('disabled sending and low remaining quota leave the email queue untouched',()=>{
 const f=fixture();f.context.apeeBridgeTick();assert.equal(f.state.calls.some(c=>c.url.endsWith('/claim')),false);
 f.props.set('APEE_SEND_EMAILS','true');f.state.quota=25;f.context.apeeBridgeTick();assert.equal(f.state.mail.length,0);assert.equal(f.state.calls.some(c=>c.url.endsWith('/claim')),false);
});
test('delivery retry after a failed acknowledgement does not resend the same message',()=>{
 const f=fixture();f.props.set('APEE_SEND_EMAILS','true');f.state.failAck=true;
 assert.throws(()=>f.context.apeeBridgeTick(),/503/);assert.equal(f.state.mail.length,1);
 f.state.failAck=false;f.context.apeeBridgeTick();assert.equal(f.state.mail.length,1);
 assert.equal(f.state.calls.filter(c=>c.url.endsWith('/ack')).length,2);
 assert.equal(f.state.mail[0].to,'internal@example.test');assert.match(f.state.mail[0].htmlBody,/#token=f{64}/);assert.doesNotMatch(f.state.mail[0].body,/https?:\/\//);
});
test('test-only recipient filter prevents sending to other members',()=>{
 const f=fixture();f.props.set('APEE_SEND_EMAILS','true');f.props.set('APEE_TEST_EMAIL','owner@example.test');f.context.apeeBridgeTick();assert.equal(f.state.mail.length,0);
});
test('a foreign reset link is rejected before mail delivery',()=>{
 const f=fixture();f.props.set('APEE_SEND_EMAILS','true');f.state.messages[0].link='https://evil.example/#token='+'f'.repeat(64);
 assert.throws(()=>f.context.apeeBridgeTick(),/Mensagem inválida/);assert.equal(f.state.mail.length,0);
});
test('changed spreadsheet headers stop synchronization before any API write',()=>{
 const f=fixture();f.state.headers=['Nome','Email','Número'];assert.throws(()=>f.context.apeeBridgeTick(),/Colunas/);assert.equal(f.state.calls.some(c=>c.options.method==='post'),false);
});
test('Google read token is only sent to Sheets; HTTP errors stop before member sync',()=>{
 const f=fixture();f.context.apeeBridgeTick();
 const sheetCall=f.state.calls.find(c=>c.url.startsWith('https://sheets.googleapis.com/'));
 assert.equal(sheetCall.options.method,'get');assert.equal(sheetCall.options.headers.Authorization,'Bearer google-readonly-token');
 const url=new URL(sheetCall.url);assert.deepEqual(url.searchParams.getAll('ranges'),['Registo_Cartoes!B:D','Registo_Cartoes!F:F']);assert.equal(url.searchParams.get('valueRenderOption'),'FORMATTED_VALUE');
 assert.equal(f.state.calls.find(c=>c.url.endsWith('/sync')).options.headers.Authorization,'Bearer '+'b'.repeat(64));
 const denied=fixture();denied.state.sheetStatus=403;assert.throws(()=>denied.context.apeeBridgeTick(),/403/);assert.equal(denied.state.calls.length,1);assert.equal(denied.state.mail.length,0);
});

test('email buttons hide raw addresses, escape names and use the branded domain when configured',()=>{
 const f=invitationsFixture();f.props.set('APEE_PUBLIC_ORIGIN','https://associados.apeebairrodorestelo.com');f.state.members[0][1]='<img src=x onerror="bad()"> & Maria';f.context.apeeBridgeTick();
 const m=f.state.mail[0];assert.match(m.htmlBody,/>Aceder ao Espaço Associado<\/a>/);assert.match(m.htmlBody,/&lt;img/);assert.match(m.htmlBody,/href="https:\/\/associados\.apeebairrodorestelo\.com\/"/);assert.doesNotMatch(m.htmlBody,/<img|>https?:\/\//);assert.doesNotMatch(m.body,/https?:\/\/|github/i);
});
test('an explicitly authorized invitation campaign resends once and retains previous delivery records',()=>{
 const f=invitationsFixture();f.context.apeeBridgeTick();const oldKeys=[...f.props.keys()].filter(k=>k.startsWith('APEE_INVITED_'));
 f.props.set('APEE_INVITE_CAMPAIGN','2');f.context.apeeBridgeTick();f.context.apeeBridgeTick();
 assert.equal(f.state.mail.length,2);assert.ok(f.props.has(oldKeys[0]));assert.equal([...f.props.keys()].filter(k=>k.startsWith('APEE_INVITED_')).length,2);
});
