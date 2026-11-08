/** APEE: separate, read-only integration. Never changes cards or their triggers. */
function apeeConfig_() {
  var p = PropertiesService.getScriptProperties();
  var origin = p.getProperty('APEE_API_ORIGIN') || '';
  var secret = p.getProperty('APEE_BRIDGE_SECRET') || '';
  if (!/^https:\/\/apee-associados(?:-testes)?\.xtvback2\.workers\.dev$/.test(origin) || secret.length < 32) throw new Error('Configuração de acesso em falta.');
  return { origin: origin, secret: secret, sheet: '1jX19ukDbyIvNJNvJck89w6hW33vpIpO_toy6bfrGRb4', send: p.getProperty('APEE_SEND_EMAILS') === 'true', invite: p.getProperty('APEE_SEND_INVITES') === 'true', inviteCampaign: p.getProperty('APEE_INVITE_CAMPAIGN') || '1', testEmail: p.getProperty('APEE_TEST_EMAIL') || '' };
}
function apeeApi_(cfg, path, body) {
  var response = UrlFetchApp.fetch(cfg.origin + path, {method:'post', contentType:'application/json', headers:{Authorization:'Bearer ' + cfg.secret}, payload:JSON.stringify(body), muteHttpExceptions:true, followRedirects:false});
  if (response.getResponseCode() !== 200) throw new Error('Pedido APEE não concluído (' + response.getResponseCode() + ').');
  return JSON.parse(response.getContentText());
}
function apeeDigest_(value) {
  return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value)).replace(/=+$/, '');
}
function apeeEscape_(value) {
  return String(value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});
}
function apeeEmailHtml_(content,label,link) {
  var branded=PropertiesService.getScriptProperties().getProperty('APEE_PUBLIC_ORIGIN') || '';
  var legacy='https://apee-associados.xtvback2.workers.dev';
  if(branded==='https://associados.apeebairrodorestelo.com' && link.indexOf(legacy+'/')===0) link=branded+link.slice(legacy.length);
  return '<div style="font-family:Arial,sans-serif;color:#183c61;max-width:600px;margin:auto;padding:24px"><h2 style="color:#12549b">APEE Bairro do Restelo</h2>'+content+'<p style="margin:28px 0"><a href="'+apeeEscape_(link)+'" style="display:inline-block;background:#145bb2;color:#fff;text-decoration:none;padding:14px 22px;border-radius:8px;font-weight:bold">'+apeeEscape_(label)+'</a></p><p>Juntos Somamos Mais!<br>APEE Bairro do Restelo</p></div>';
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
  if (p.getProperty('APEE_LAST_SYNC') !== digest) {
    apeeApi_(cfg, '/internal/members/sync', {members:members});
    p.setProperty('APEE_LAST_SYNC',digest);
  }
  return members;
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
      MailApp.sendEmail({to:m.email, subject:'APEE Bairro do Restelo — Definir palavra-passe', name:'APEE Bairro do Restelo', body:'Recebemos um pedido para ativar ou recuperar o acesso ao Espaço Associado.\n\nUtilize o botão «Definir palavra-passe» nesta mensagem. A ligação é válida durante 30 minutos a partir do pedido. Se não fez este pedido, ignore esta mensagem. Se precisar de apoio, responda a este email.', htmlBody:apeeEmailHtml_('<p>Recebemos um pedido para ativar ou recuperar o acesso ao Espaço Associado.</p><p>Escolha a sua palavra-passe através do botão abaixo. A ligação é válida durante 30 minutos a partir do pedido.</p><p>Se não fez este pedido, ignore esta mensagem.</p>','Definir palavra-passe',m.link)});
      p.setProperty(key,String(Date.now()));
    }
    apeeApi_(cfg,'/internal/mail/ack',{id:m.id,lease:m.lease});
  }
}
function apeeInvites_(cfg,members) {
  if(!cfg.send || !cfg.invite || cfg.testEmail || cfg.origin!=='https://apee-associados.xtvback2.workers.dev') return;
  if(!/^[A-Za-z0-9_-]{1,40}$/.test(cfg.inviteCampaign)) throw new Error('Identificador de envio inválido.');
  var p=PropertiesService.getScriptProperties();
  for(var i=0;i<members.length;i++) {
    var m=members[i], key='APEE_INVITED_'+apeeDigest_(cfg.origin+'|'+m.member_number+'|'+m.email+(cfg.inviteCampaign==='1'?'':'|'+cfg.inviteCampaign));
    if(p.getProperty(key)) continue;
    if(MailApp.getRemainingDailyQuota()<=25) break;
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email)) throw new Error('Email do convite inválido. Requer revisão.');
    // Record the attempt first: an uncertain/crashed send must never trigger an automatic duplicate.
    p.setProperty(key,'pending:'+Date.now());
    try {
      var instructions='No primeiro acesso:\n1. Introduza o email usado na sua inscrição.\n2. Escolha «Ativar conta ou recuperar palavra-passe».\n3. Abra a ligação que receber por email e escolha a sua palavra-passe (mínimo de 15 caracteres).';
      MailApp.sendEmail({to:m.email,subject:'APEE Bairro do Restelo — Convite para o Espaço Associado',name:'APEE Bairro do Restelo',body:'Olá, '+m.full_name+',\n\nO Espaço Associado da APEE Bairro do Restelo já está disponível. Utilize o botão «Aceder ao Espaço Associado» nesta mensagem ou a opção «Espaço Associado» no site da APEE.\n\n'+instructions+'\n\nSe já definiu a sua palavra-passe, pode entrar diretamente. A documentação da Associação será disponibilizada nesta área.\n\nJuntos Somamos Mais!\nAPEE Bairro do Restelo',htmlBody:apeeEmailHtml_('<p>Olá, '+apeeEscape_(m.full_name)+',</p><p>O Espaço Associado da APEE Bairro do Restelo já está disponível.</p><p>No primeiro acesso:</p><ol><li>Introduza o email usado na sua inscrição.</li><li>Escolha «Ativar conta ou recuperar palavra-passe».</li><li>Abra a ligação que receber por email e escolha a sua palavra-passe (mínimo de 15 caracteres).</li></ol><p>Se já definiu a sua palavra-passe, pode entrar diretamente. A documentação da Associação será disponibilizada nesta área.</p>','Aceder ao Espaço Associado',cfg.origin+'/')});
      p.setProperty(key,'sent:'+Date.now());
    } catch(err) { throw new Error('Convite com entrega não confirmada. Rever o registo privado antes de reenviar.'); }
  }
}
function apeeBridgeTick() {
  var lock=LockService.getScriptLock(); if(!lock.tryLock(1000)) return;
  try {var cfg=apeeConfig_(), members=apeeSync_(cfg); apeeMail_(cfg); apeeInvites_(cfg,members);} finally {lock.releaseLock();}
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
