(function(){
'use strict';
if(document.getElementById('apee-assistente-abrir'))return;
const base='/';
const knowledge=[
 {keys:['refeitorio','alimentacao','almoco','lanche','ementa','comida','refeicoes'],title:'Refeições e refeitório',answer:'Podes consultar as informações sobre refeições, valores e funcionamento no Guia das Famílias. Os valores indicados pela APEE são 1,46 € para o almoço e 0,46 € para o lanche. Confirma sempre as condições aplicáveis à tua família.',link:'guia-refeicoes.html',label:'Consultar refeições'},
 {keys:['aaaf','caf','prolongamento','acolhimento','ferias','atividades de apoio'],title:'AAAF e CAF',answer:'As AAAF destinam-se ao Jardim de Infância e a CAF ao 1.º Ciclo. Podes consultar modalidades, atividades e informações práticas no guia próprio. No Jardim de Infância, os pais podem acompanhar os filhos até à sala na entrada e na saída.',link:'guia-aaaf-caf.html',label:'Ver informações AAAF e CAF'},
 {keys:['aec','enriquecimento','atividades extracurriculares'],title:'Atividades de Enriquecimento Curricular',answer:'As AEC são atividades de enriquecimento curricular do 1.º Ciclo. Segundo o guia da escola, decorrem habitualmente entre as 16h15 e as 17h30. Consulta o guia para detalhes e confirma eventuais alterações com a escola.',link:'guia-horarios.html',label:'Consultar horários'},
 {keys:['horario','entrada','saida','horas','abre','fecha'],title:'Horários da escola',answer:'O horário letivo do 1.º Ciclo termina habitualmente às 15h30 e as AEC decorrem entre as 16h15 e as 17h30. Os horários de outros serviços podem variar. Consulta a informação detalhada no guia.',link:'guia-horarios.html',label:'Ver horários'},
 {keys:['siga','inovar','credenciais','plataformas','password','senha','login'],title:'SIGA e Inovar',answer:'O SIGA utiliza credenciais disponibilizadas pela Câmara Municipal de Lisboa por correio eletrónico. Para o Inovar, o acesso utiliza os dados de identificação do educando indicados no Guia das Famílias. Não partilhes palavras-passe aqui.',link:'guia-plataformas.html',label:'Consultar plataformas'},
 {keys:['associado','associacao','inscricao','inscrever','aderir','quota','quotas','cartao de associado'],title:'Associados da APEE',answer:'A participação na APEE é gratuita, sem quotas. Para formalizar o registo como associado e participar nos processos próprios da associação, consulta a página de inscrição.',link:'inscricao.html',label:'Inscrição de Associados'},
 {keys:['doacao','donativo','contribuir','ajudar com dinheiro'],title:'Donativos',answer:'A APEE tem uma página dedicada às intenções de donativo. Antes de enviares qualquer informação pessoal, consulta as condições e o formulário no site oficial.',link:'doacoes.html',label:'Ver donativos'},
 {keys:['materiais','material escolar','doar roupa','apoio social','banco de material','patins','capacete','kimono'],title:'Apoio social e materiais',answer:'A APEE está a desenvolver iniciativas de partilha de materiais, incluindo equipamento para atividades. Consulta os projetos e usa os contactos oficiais para saber como contribuir ou pedir apoio.',link:'projetos.html',label:'Ver projetos'},
 {keys:['agenda','eventos','atividades da escola','datas','reunioes','calendario'],title:'Agenda APEE',answer:'A agenda reúne as principais iniciativas e datas divulgadas pela APEE. Consulta-a para informações atualizadas.',link:'agenda.html',label:'Abrir agenda'},
 {keys:['noticias','novidades','acontecimentos','informacoes recentes'],title:'Notícias',answer:'Na página de Notícias encontras as últimas comunicações e iniciativas divulgadas pela APEE.',link:'noticias.html',label:'Ver notícias'},
 {keys:['parcerias','descontos','beneficios','parceiros'],title:'Parcerias',answer:'As parcerias da APEE podem incluir condições específicas para associados. Consulta a informação disponível na área respetiva. Algumas informações podem exigir acesso como associado.',link:'espaco-associado.html',label:'Espaço Associado'},
 {keys:['educacao especial','inclusao','nee','necessidades educativas','apoios educativos'],title:'Inclusão e apoios educativos',answer:'A APEE promove o diálogo sobre inclusão e apoios educativos. Questões individuais sobre crianças e medidas de apoio devem ser tratadas diretamente com a escola ou APEE, nunca neste chat público.',link:'contactos.html',label:'Contactar a APEE'},
 {keys:['contacto','contactar','email','telefone','falar com','reclamacao','queixa','problema','duvida'],title:'Falar com a APEE',answer:'Para uma questão específica, dúvida sem resposta ou assunto que necessite de intervenção humana, utiliza os contactos oficiais da APEE. Evita incluir dados pessoais de alunos num chat público.',link:'contactos.html',label:'Abrir contactos'}
];
const prompts=['Como funcionam as AAAF e a CAF?','Como me torno associado?','Onde vejo os horários?','Como contactar a APEE?'];
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
const style=el('style');style.textContent=`
#apee-assistente-abrir{position:fixed;right:18px;bottom:20px;z-index:998;background:#155ba9;color:#fff;border:2px solid #f4c947;border-radius:999px;box-shadow:0 5px 25px #102b5270;padding:12px 17px;display:flex;align-items:center;gap:8px;font:750 14px "DM Sans",system-ui,sans-serif;cursor:pointer}
#apee-assistente-abrir:hover{background:#0b417d}
#apee-assistente-abrir:focus-visible,.apee-assistente button:focus-visible,.apee-assistente a:focus-visible{outline:3px solid #f3bb48;outline-offset:3px}
.apee-assistente{position:fixed;right:18px;bottom:78px;z-index:999;display:none;flex-direction:column;width:min(370px,calc(100vw - 24px));max-height:min(660px,calc(100dvh - 108px));background:#fff;color:#173858;border:1px solid #c7d7e8;border-radius:18px;box-shadow:0 14px 60px #102b5260;overflow:hidden;font:14px/1.5 "DM Sans",system-ui,sans-serif}
.apee-assistente[data-open="true"]{display:flex}
.apee-assistente-head{display:flex;align-items:center;gap:11px;background:#155ba9;color:#fff;padding:14px 16px;flex-shrink:0}
.apee-assistente-logo{background:#f4c947;color:#153b68;font-weight:900;border-radius:50%;width:39px;height:39px;display:grid;place-items:center;font-size:12px;letter-spacing:-.3px;flex-shrink:0}
.apee-assistente-head-text{flex:1;min-width:0}.apee-assistente-head-text strong{display:block;font-size:15px}.apee-assistente-head-text small{display:block;opacity:.9;font-size:11px}
.apee-assistente-close{background:transparent;border:0;color:#fff;font:25px system-ui;cursor:pointer;padding:1px 7px}
.apee-assistente-body{padding:15px;overflow-y:auto;overscroll-behavior:contain;min-height:140px;display:flex;flex-direction:column;gap:13px}
.apee-assistente-bubble{min-width:0;max-width:94%;padding:12px 14px;border-radius:14px;white-space:pre-line;overflow-wrap:anywhere}
.apee-assistente-bot{background:#edf4fb;align-self:flex-start}
.apee-assistente-user{background:#155ba9;color:#fff;align-self:flex-end}
.apee-assistente-links{display:flex;gap:7px;flex-wrap:wrap;align-self:flex-start}
.apee-assistente-links a,.apee-assistente-question{overflow-wrap:anywhere;background:#fff;color:#155ba9;border:1px solid #b8cfe9;border-radius:12px;padding:9px 11px;font:700 12px "DM Sans",system-ui;cursor:pointer;text-decoration:none;line-height:1.35}
.apee-assistente-links a:hover,.apee-assistente-question:hover{background:#f1f7ff}
.apee-assistente-choices{display:flex;flex-wrap:wrap;gap:7px}
.apee-assistente-form{display:flex;gap:8px;min-width:0;width:100%;box-sizing:border-box;padding:11px 13px;border-top:1px solid #d9e6f1;background:#fff;flex-shrink:0}
.apee-assistente-input{min-width:0;flex:1;border:1px solid #b8cfe9;border-radius:12px;padding:10px;font:16px "DM Sans",system-ui;color:#173858}
.apee-assistente-send{flex:0 0 auto;white-space:nowrap;min-width:0;background:#155ba9;color:#fff;border:0;border-radius:12px;padding:8px 13px;font-weight:750;cursor:pointer}
.apee-assistente-foot{font-size:10px;padding:0 13px 11px;color:#5c6f82;background:#fff}
@media(max-width:760px){#apee-assistente-abrir{bottom:calc(102px + env(safe-area-inset-bottom));right:12px;padding:11px 13px;font-size:12px}.apee-assistente{right:8px;bottom:calc(157px + env(safe-area-inset-bottom));width:calc(100vw - 16px);max-width:calc(100% - 16px);max-height:calc(100dvh - 170px);border-radius:16px}}
@media(max-width:375px){#apee-assistente-abrir{padding:9px 11px}}
@media(max-width:760px){.apee-assistente .apee-assistente-form{min-width:0;max-width:100%;overflow:hidden}.apee-assistente .apee-assistente-input{font-size:16px!important;width:100%;max-width:100%;min-width:0}.apee-assistente .apee-assistente-send{font-size:14px;flex-shrink:0}.apee-assistente .apee-assistente-foot{overflow-wrap:anywhere}.apee-assistente[data-open="true"]{box-sizing:border-box}.apee-assistente-aberto .mobile-bottom-nav.mobile-bottom-nav--apee{visibility:hidden!important;pointer-events:none!important}}
@media(max-width:760px){
  .apee-assistente[data-open="true"]{
    position:fixed!important;
    inset:auto!important;
    top:var(--apee-vv-top,0px)!important;right:0!important;bottom:auto!important;left:0!important;
    width:100%!important;max-width:100%!important;
    height:var(--apee-vv-height,100dvh)!important;max-height:var(--apee-vv-height,100dvh)!important;
    margin:0!important;border:0!important;border-radius:0!important;
    padding:0!important;box-sizing:border-box!important;
    display:flex!important;flex-direction:column!important;
    z-index:2147483646!important;
  }
  .apee-assistente-head{flex:0 0 auto;min-width:0;padding-top:calc(13px + env(safe-area-inset-top))}
  .apee-assistente-body{flex:1 1 auto;min-height:0!important;overflow-x:hidden;overflow-y:auto}
  .apee-assistente-choices{min-width:0;width:100%}
  .apee-assistente-choices button{max-width:100%;box-sizing:border-box;text-align:left;white-space:normal}
  .apee-assistente-form{flex:0 0 auto;width:100%;box-sizing:border-box;gap:8px}
  .apee-assistente-input{font-size:16px!important;min-width:0!important}
  .apee-assistente-send{flex:0 0 auto!important;max-width:32%!important}
  .apee-assistente-foot{flex:0 0 auto;padding-bottom:calc(10px + env(safe-area-inset-bottom))}
  body.apee-assistente-aberto,html.apee-assistente-aberto{overflow:hidden!important;overscroll-behavior:none!important}
  body.apee-assistente-aberto #apee-assistente-abrir{visibility:hidden!important;pointer-events:none!important}
}
@media(prefers-reduced-motion:reduce){.apee-assistente *{scroll-behavior:auto!important}}
`;document.head.appendChild(style);
const open=el('button');open.id='apee-assistente-abrir';open.type='button';open.setAttribute('aria-label','Abrir Assistente APEE');open.setAttribute('aria-expanded','false');open.textContent='💬 Assistente APEE';
const panel=el('section','apee-assistente');panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Assistente virtual APEE');panel.setAttribute('aria-modal','false');panel.dataset.open='false';
const header=el('div','apee-assistente-head'),logo=el('span','apee-assistente-logo'),titles=el('div','apee-assistente-head-text');
const logoImg=el('img');logoImg.src='/_external/d2ol7oe51mr4n9.cloudfront.net/user_3EbWYhy0t8ty8Wz9RPVrhpDHVlB/6c0a90e1-f63f-4e2c-8a73-48d8610f6db5.jpg';logoImg.alt='Logótipo oficial da APEE Bairro do Restelo';logoImg.style.cssText='width:100%;height:100%;object-fit:contain;border-radius:50%;display:block';logo.append(logoImg);
titles.innerHTML='<strong>Assistente APEE</strong><small>Perguntas sobre a escola · IA experimental</small>';
const close=el('button','apee-assistente-close','×');close.type='button';close.setAttribute('aria-label','Fechar chat');
header.append(logo,titles,close);
const body=el('div','apee-assistente-body');body.setAttribute('aria-live','polite');body.setAttribute('aria-relevant','additions');
const form=el('form','apee-assistente-form'),input=el('input','apee-assistente-input');input.type='text';input.maxLength=220;input.placeholder='Escreve a tua pergunta...';input.setAttribute('aria-label','Pergunta ao Assistente APEE');input.autocomplete='off';
const send=el('button','apee-assistente-send','Enviar');send.type='submit';form.append(input,send);
const foot=el('div','apee-assistente-foot','IA experimental: pode cometer erros. Não escrevas dados pessoais ou de crianças.');panel.append(header,body,form,foot);document.body.append(panel,open);
let greeted=false;
function message(text,who='bot'){const m=el('div','apee-assistente-bubble '+(who==='user'?'apee-assistente-user':'apee-assistente-bot'),text);body.appendChild(m);body.scrollTop=body.scrollHeight;return m}
function link(href,label){const wrap=el('div','apee-assistente-links'),a=el('a','',label+' →');a.href=base+href;wrap.append(a);body.append(wrap);body.scrollTop=body.scrollHeight}
async function ask(q){
 const text=String(q||'').trim().slice(0,220);if(!text)return;
 message(text,'user');
 const n=norm(text);
 let best=null,score=0;
 for(const item of knowledge){let v=0;for(const k of item.keys){const term=norm(k);if(n.includes(term))v+=term.includes(' ')?4:term.length>5?3:2}if(v>score){score=v;best=item}}
 if(/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(text)||/\b\d{9,}\b/.test(text)||/\b(?:nif|morada|palavra.passe|numero de processo|processo individual)\b/i.test(n)){
   message('Por proteção dos dados pessoais, utiliza os contactos oficiais da APEE para esta questão.');
   link('contactos.html','Contactar a APEE');return;
 }
 const thinking=message('A consultar a informação da APEE…');
 try{
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),18000);
  let res;
  try{res=await fetch('https://apee-assistente-demo-ai.xtvback2.workers.dev/api/chat',{
     method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:text}),signal:controller.signal
  })}finally{clearTimeout(timeout)}
  const data=await res.json();
  if(res.ok&&data.ok&&typeof data.answer==='string'&&data.answer.trim()){
   thinking.textContent=data.answer.trim();
   if(score>0&&best)link(best.link,best.label);
   return;
  }
 }catch(e){}
 thinking.remove();
 if(score>0&&best){message('Resposta automática: '+best.answer);link(best.link,best.label)}
 else{message('Não tenho informação confirmada sobre essa questão. Consulta os contactos oficiais da APEE.');link('contactos.html','Contactar a APEE')}
}
function syncVisibleViewport(){
  if(!window.matchMedia('(max-width:760px)').matches||panel.dataset.open!=='true')return;
  const v=window.visualViewport;
  if(!v)return;
  panel.style.setProperty('--apee-vv-top',Math.round(v.offsetTop)+'px');
  panel.style.setProperty('--apee-vv-height',Math.round(v.height)+'px');
}
if(window.visualViewport){
  window.visualViewport.addEventListener('resize',syncVisibleViewport,{passive:true});
  window.visualViewport.addEventListener('scroll',syncVisibleViewport,{passive:true});
}
function toggle(v){document.documentElement.classList.toggle('apee-assistente-aberto',v);document.body.classList.toggle('apee-assistente-aberto',v);panel.dataset.open=String(v);syncVisibleViewport();open.setAttribute('aria-expanded',String(v));if(v){if(!greeted){greeted=true;message('Olá! 👋 Sou o Assistente Virtual da APEE Bairro do Restelo. Posso ajudar a encontrar informações no site.');const choices=el('div','apee-assistente-choices');prompts.forEach(q=>{const b=el('button','apee-assistente-question',q);b.type='button';b.addEventListener('click',()=>ask(q));choices.append(b)});body.append(choices)}if(!window.matchMedia('(max-width:760px)').matches)input.focus()}else open.focus({preventScroll:true})}
open.addEventListener('click',()=>toggle(panel.dataset.open!=='true'));close.addEventListener('click',()=>toggle(false));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel.dataset.open==='true')toggle(false)});
form.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();const q=input.value;input.value='';ask(q)},true);
})();
