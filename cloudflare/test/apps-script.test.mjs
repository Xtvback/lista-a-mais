import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
const source=readFileSync(new URL('../../integrations/apps-script/Code.gs',import.meta.url),'utf8');
function fixture(){
 const props=new Map([['APEE_API_ORIGIN','https://apee-associados-testes.xtvback2.workers.dev'],['APEE_BRIDGE_SECRET','b'.repeat(64)],['APEE_SEND_EMAILS','false']]);
 const state={quota:100,mail:[],calls:[],failAck:false,minutes:null,headers:['Número permanente','Nome','Email'],triggers:[{getHandlerFunction:()=> 'cartoesExistentes'}]};
 const store={getProperty:k=>props.get(k)||null,setProperty:(k,v)=>props.set(k,v),getProperties:()=>Object.fromEntries(props),deleteProperty:k=>props.delete(k)};
 const token='f'.repeat(64);state.messages=[{id:1,lease:'c'.repeat(64),email:'internal@example.test',link:'https://apee-associados-testes.xtvback2.workers.dev/#token='+token}];
 const sheet={getLastRow:()=>2,getRange:(row,col,rows,width)=>({getDisplayValues:()=>col===2?[state.headers,['0001','Conta Interna','internal@example.test']]:[['Estado'],['Enviado']]})};
 const context=vm.createContext({
  PropertiesService:{getScriptProperties:()=>store},
  SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet})},
  Utilities:{DigestAlgorithm:{SHA_256:'SHA_256'},computeDigest:(_,s)=>createHash('sha256').update(s).digest(),base64EncodeWebSafe:b=>Buffer.from(b).toString('base64url')},
  LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>{}})},
  MailApp:{getRemainingDailyQuota:()=>state.quota,sendEmail:m=>{state.mail.push(m);state.quota--;}},
  UrlFetchApp:{fetch:(url,options)=>{state.calls.push({url,options});if(state.failAck&&url.endsWith('/ack'))return {getResponseCode:()=>503};return {getResponseCode:()=>200,getContentText:()=>JSON.stringify(url.endsWith('/claim')?{messages:state.messages}:{ok:true})}}},
  ScriptApp:{getProjectTriggers:()=>state.triggers,newTrigger:name=>({timeBased:()=>({everyMinutes:minutes=>({create:()=>{state.minutes=minutes;state.triggers.push({getHandlerFunction:()=>name});}})})}),deleteTrigger:()=>{throw new Error('Existing triggers must be preserved');}}
 });
 vm.runInContext(source,context);return {context,state,props};
}
test('install is idempotent and never sends mail or removes existing card triggers',()=>{
 const f=fixture();f.context.installApeeBridge();f.context.installApeeBridge();
 assert.equal(f.state.mail.length,0);assert.equal(f.state.triggers.length,2);assert.equal(f.state.triggers[0].getHandlerFunction(),'cartoesExistentes');assert.equal(f.state.minutes,5);
 assert.equal(f.state.calls.filter(c=>c.url.endsWith('/sync')).length,1);
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
 assert.equal(f.state.mail[0].to,'internal@example.test');assert.match(f.state.mail[0].body,/#token=f{64}/);
});
test('test-only recipient filter prevents sending to other members',()=>{
 const f=fixture();f.props.set('APEE_SEND_EMAILS','true');f.props.set('APEE_TEST_EMAIL','owner@example.test');f.context.apeeBridgeTick();assert.equal(f.state.mail.length,0);
});
test('a foreign reset link is rejected before mail delivery',()=>{
 const f=fixture();f.props.set('APEE_SEND_EMAILS','true');f.state.messages[0].link='https://evil.example/#token='+'f'.repeat(64);
 assert.throws(()=>f.context.apeeBridgeTick(),/Mensagem inválida/);assert.equal(f.state.mail.length,0);
});
test('changed spreadsheet headers stop synchronization before any API write',()=>{
 const f=fixture();f.state.headers=['Nome','Email','Número'];assert.throws(()=>f.context.apeeBridgeTick(),/Colunas/);assert.equal(f.state.calls.length,0);
});
