/** APEE: separate, read-only integration. Never changes cards or their triggers. */
function apeeConfig_() {
  var p = PropertiesService.getScriptProperties();
  var origin = p.getProperty('APEE_API_ORIGIN') || '';
  var secret = p.getProperty('APEE_BRIDGE_SECRET') || '';
  if (!/^https:\/\/apee-associados(?:-testes)?\.xtvback2\.workers\.dev$/.test(origin) || secret.length < 32) throw new Error('Configuração de acesso em falta.');
  return { origin: origin, secret: secret, sheet: '1jX19ukDbyIvNJNvJck89w6hW33vpIpO_toy6bfrGRb4', send: p.getProperty('APEE_SEND_EMAILS') === 'true', testEmail: p.getProperty('APEE_TEST_EMAIL') || '' };
}
function apeeApi_(cfg, path, body) {
  var response = UrlFetchApp.fetch(cfg.origin + path, {method:'post', contentType:'application/json', headers:{Authorization:'Bearer ' + cfg.secret}, payload:JSON.stringify(body), muteHttpExceptions:true, followRedirects:false});
  if (response.getResponseCode() !== 200) throw new Error('Pedido APEE não concluído (' + response.getResponseCode() + ').');
  return JSON.parse(response.getContentText());
}
function apeeDigest_(value) {
  return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value)).replace(/=+$/, '');
}
function apeeReadMembers_(cfg) {
  // Sheets REST supports spreadsheets.readonly; SpreadsheetApp.openById requires write scope.
  var url='https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(cfg.sheet)+'/values:batchGet?ranges='+encodeURIComponent('Registo_Cartoes!B:D')+'&ranges='+encodeURIComponent('Registo_Cartoes!F:F')+'&valueRenderOption=FORMATTED_VALUE';
  var response=UrlFetchApp.fetch(url,{method:'get',headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken()},muteHttpExceptions:true,followRedirects:false});
  if(response.getResponseCode()!==200) {
    var failure=JSON.parse(response.getContentText()).error || {}, reason=(failure.details || []).map(function(d){return d.reason || '';}).join(' ');
    throw new Error('Leitura do registo APEE não concluída ('+response.getResponseCode()+'). '+(reason.indexOf('SERVICE_DISABLED')!==-1?'Ativar Google Sheets API neste projeto.':String(failure.message || failure.status || '').slice(0,500)));
  }
  var ranges=JSON.parse(response.getContentText()).valueRanges || [];
  var rows=(ranges[0] || {}).values || [], states=(ranges[1] || {}).values || [];
  if (!rows[0] || rows[0].join('|') !== 'Número permanente|Nome|Email' || !states[0] || states[0][0] !== 'Estado') throw new Error('Colunas do registo alteradas. Requer revisão.');
  var members = [];
  for (var i=1;i<rows.length;i++) {
    if ((states[i] || [])[0] !== 'Enviado') continue;
    var m = {member_number:String(rows[i][0] || '').trim(), full_name:String(rows[i][1] || '').trim(), email:String(rows[i][2] || '').trim().toLowerCase()};
    if (!m.member_number || !m.full_name || !m.email) throw new Error('Registo enviado incompleto.');
    members.push(m);
  }
  if (members.length > 50) throw new Error('Limite configurado atingido. Requer revisão.');
  return members;
}
function apeeSync_(cfg) {
  var members = apeeReadMembers_(cfg), p = PropertiesService.getScriptProperties();
  var digest = apeeDigest_(cfg.origin + JSON.stringify(members));
  if (p.getProperty('APEE_LAST_SYNC') === digest) return;
  apeeApi_(cfg, '/internal/members/sync', {members:members});
  p.setProperty('APEE_LAST_SYNC',digest);
}
function apeeMail_(cfg) {
  if (!cfg.send || MailApp.getRemainingDailyQuota() <= 25) return;
  var p = PropertiesService.getScriptProperties(), previous = p.getProperties();
  Object.keys(previous).forEach(function(key){ if(key.indexOf('APEE_SENT_')===0 && Number(previous[key]) < Date.now()-86400000) p.deleteProperty(key); });
  var messages = apeeApi_(cfg,'/internal/mail/claim',{}).messages || [];
  for (var i=0;i<messages.length;i++) {
    var m=messages[i];
    if (!Number.isSafeInteger(m.id) || !/^[a-f0-9]{64}$/.test(m.lease) || typeof m.email!=='string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email) || typeof m.link!=='string' || m.link.indexOf(cfg.origin+'/#token=')!==0 || !/^[a-f0-9]{64}$/.test(m.link.slice((cfg.origin+'/#token=').length))) throw new Error('Mensagem inválida.');
    if (cfg.testEmail && m.email.toLowerCase()!==cfg.testEmail.toLowerCase()) continue;
    var key='APEE_SENT_'+apeeDigest_(cfg.origin+'|'+m.id);
    if (!p.getProperty(key)) {
      if (MailApp.getRemainingDailyQuota() <= 25) break;
      MailApp.sendEmail({to:m.email, subject:'APEE Bairro do Restelo — Definir palavra-passe', name:'APEE Bairro do Restelo', body:'Recebemos um pedido para ativar ou recuperar o acesso ao Espaço Associado.\n\nEscolha a sua palavra-passe nesta ligação:\n'+m.link+'\n\nA ligação é válida durante 30 minutos a partir do pedido. Se não fez este pedido, ignore esta mensagem.'});
      p.setProperty(key,String(Date.now()));
    }
    apeeApi_(cfg,'/internal/mail/ack',{id:m.id,lease:m.lease});
  }
}
function apeeBridgeTick() {
  var lock=LockService.getScriptLock(); if(!lock.tryLock(1000)) return;
  try {var cfg=apeeConfig_(); apeeSync_(cfg); apeeMail_(cfg);} finally {lock.releaseLock();}
}
function installApeeBridge() {
  // No email is sent during installation. No pre-existing trigger is removed.
  var cfg=apeeConfig_(); apeeSync_(cfg);
  if(!ScriptApp.getProjectTriggers().some(function(t){return t.getHandlerFunction()==='apeeBridgeTick';})) ScriptApp.newTrigger('apeeBridgeTick').timeBased().everyMinutes(5).create();
}

function testApeeMail() {
  var p=PropertiesService.getScriptProperties();
  var origin=p.getProperty('APEE_TEST_API_ORIGIN') || '';
  var secret=p.getProperty('APEE_TEST_BRIDGE_SECRET') || '';
  if(origin!=='https://apee-associados-testes.xtvback2.workers.dev' || secret.length<32) throw new Error('Configuração de teste em falta.');
  apeeMail_({origin:origin,secret:secret,send:true,testEmail:'apee.bairro.restelo@gmail.com'});
}

function authorizeApeeBridge() {
  var members=apeeReadMembers_({sheet:'1jX19ukDbyIvNJNvJck89w6hW33vpIpO_toy6bfrGRb4'});
  MailApp.getRemainingDailyQuota();
  ScriptApp.getProjectTriggers();
  console.log('Permissões verificadas: '+members.length+' associados. Nenhum email foi enviado nem foi criado um acionador.');
}
