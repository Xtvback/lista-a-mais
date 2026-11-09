const b=document.getElementById('menuButton'),m=document.getElementById('mainMenu');
if(b&&m){
  b.classList.add('apee-menu-trigger');
  const renderButton=open=>{
    b.setAttribute('aria-expanded',String(open));
    b.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'+(open?'<path d="M5 5 19 19M19 5 5 19"/>':'<path d="M4 6h16M4 12h16M4 18h16"/>')+'</svg><span>'+(open?'Fechar':'Menu')+'</span>';
  };
  renderButton(m.classList.contains('open'));
  b.addEventListener('click',()=>renderButton(m.classList.toggle('open')));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&m.classList.contains('open')){m.classList.remove('open');renderButton(false);b.focus();}});
  m.addEventListener('click',e=>{if(e.target.closest('a')&&m.classList.contains('open')){m.classList.remove('open');renderButton(false);}});
  /* Fechar menus abertos ao tocar fora, sem impedir a navegação normal. */
  document.addEventListener('pointerdown',e=>{
    if(m.classList.contains('open')&&!m.contains(e.target)&&!b.contains(e.target)){
      m.classList.remove('open');renderButton(false);
    }
  });
  /* A navegação por teclado deve regressar ao botão do menu após saída. */
  document.addEventListener('focusin',e=>{
    if(m.classList.contains('open')&&!m.contains(e.target)&&e.target!==b){
      m.classList.remove('open');renderButton(false);
    }
  });
  const setMobileMenuState=()=>{
    if(window.matchMedia('(min-width: 761px)').matches&&m.classList.contains('open')){
      m.classList.remove('open');renderButton(false);
    }
  };
  window.addEventListener('resize',setMobileMenuState,{passive:true});
}

/* Barra móvel APEE · atalhos relevantes com identidade visual consistente. */
(function(){
  const path=location.pathname;
  const whatsapp='https://chat.whatsapp.com/FZplXzSkR070aoK6Q6TWVz';
  const items=[
    {href:'https://associados.apeebairrodorestelo.com/',text:'Espaço Associados',label:'Espaço Associados',tone:'blue',active:false,
      icon:'<path d="M15 19a6 6 0 0 0-12 0v2h12v-2Z"/><circle cx="9" cy="8" r="4"/><path d="M19 8v8m-4-4h8"/>'},
    {href:whatsapp,text:'Comunidade',label:'Aderir à comunidade WhatsApp da APEE',tone:'green',external:true,
      icon:'<path d="M20 11.5a8.5 8.5 0 0 1-12.5 7.5L3 20l1.2-4.4a8.5 8.5 0 1 1 15.8-4.1Z"/><path d="M9 9.1c.6 2.2 2.1 3.7 4.3 4.3l1.7-1.3"/>'},
    {href:'/contactos.html',text:'Contactos',label:'Contactos da APEE',tone:'red',active:path.endsWith('/contactos.html'),
      icon:'<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="m3.5 7 8.5 6 8.5-6"/>'},
    {href:'/agenda.html',text:'Agenda',label:'Agenda da APEE',tone:'yellow',active:path.endsWith('/agenda.html'),
      icon:'<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M7 3v4m10-4v4M3 10h18m-12 5h5"/>'}
  ];
  if(document.querySelector('.mobile-bottom-nav'))return;
  const nav=document.createElement('nav');
  nav.className='mobile-bottom-nav mobile-bottom-nav--apee';
  nav.setAttribute('aria-label','Acessos rápidos da APEE');
  items.forEach(item=>{
    const a=document.createElement('a');
    a.href=item.href;a.className='mobile-quick-link mobile-quick-link--'+item.tone;
    a.setAttribute('aria-label',item.label);
    if(item.active)a.setAttribute('aria-current','page');
    if(item.external){a.target='_blank';a.rel='noopener noreferrer'}
    a.innerHTML='<span class="mobile-quick-icon" aria-hidden="true"><svg viewBox="0 0 24 24">'+item.icon+'</svg></span><span class="mobile-quick-label">'+item.text+'</span>';
    nav.appendChild(a);
  });
  document.body.appendChild(nav);
  document.body.classList.add('has-mobile-bottom-nav');
  /* Evitar que o teclado virtual cubra formulários e botões. */
  const setEditing=el=>{
    const active=!!el&&el.matches&&el.matches('input:not([type=hidden]), textarea, select, [contenteditable=true]');
    document.body.classList.toggle('apee-editing',active);
  };
  document.addEventListener('focusin',event=>setEditing(event.target));
  document.addEventListener('focusout',()=>{
    if(document.activeElement&&document.activeElement.matches&&document.activeElement.matches('input:not([type=hidden]), textarea, select, [contenteditable=true]'))return;
    document.body.classList.remove('apee-editing');
  });
})();

/* Inscrição gratuita visível em todas as páginas, mesmo em menus antigos. */
(function(){
 const nav=document.querySelector('#mainMenu');
 if(nav&&!nav.querySelector('a[href="/inscricao.html"]')){
  const a=document.createElement('a');a.href='/inscricao.html';a.textContent='Inscrição de Associados';a.className='signup-nav-link';
  if(location.pathname.endsWith('/inscricao.html'))a.setAttribute('aria-current','page');
  const before=nav.querySelector('a[href="/contactos.html"]');nav.insertBefore(a,before);
 }
 const footer=document.querySelector('.foot-links');
 if(footer){for(const link of [{href:'/inscricao.html',text:'Inscrição de Associados'},{href:'/privacidade.html',text:'Privacidade'}]){
  if(!footer.querySelector('a[href="'+link.href+'"]')){const a=document.createElement('a');a.href=link.href;a.textContent=link.text;footer.appendChild(a)}
 }}
})();

/* Guia das Famílias integrado na entrada principal Famílias. */
(function(){
 const nav=document.getElementById('mainMenu');
 if(!nav)return;
 nav.querySelectorAll('a[href="/guia-familias.html"]').forEach(link=>link.remove());
 if(/\/(guia-(familias|plataformas|aaaf-caf|horarios|refeicoes|mensalidades|contactos)\.html)$/.test(location.pathname)){
  nav.querySelectorAll('a[aria-current="page"]').forEach(link=>link.removeAttribute('aria-current'));
  nav.querySelector('a[href="/familias.html"]')?.setAttribute('aria-current','page');
 }
})();
/* Agenda discoverable in desktop menu and footer, without replacing any existing link. */
(function(){
  const menu=document.querySelector('#mainMenu');
  if(menu&&!menu.querySelector('a[href="/agenda.html"]')){
    const link=document.createElement('a');link.href='/agenda.html';link.textContent='Agenda';
    if(location.pathname.endsWith('/agenda.html'))link.setAttribute('aria-current','page');
    const before=menu.querySelector('a[href="/familias.html"]');
    menu.insertBefore(link,before);
  }
  const footer=document.querySelector('.foot-links');
  if(footer&&!footer.querySelector('a[href="/agenda.html"]')){
    const link=document.createElement('a');link.href='/agenda.html';link.textContent='Agenda';footer.appendChild(link);
  }
})();


/* Montra pública das parcerias; benefícios continuam na área reservada. */
(function(){
 const nav=document.getElementById('mainMenu');
 if(nav&&!nav.querySelector('a[href="/parcerias.html"]')){
  const a=document.createElement('a');a.href='/parcerias.html';a.textContent='Parcerias';
  const next=nav.querySelector('a[href="/noticias.html"]');
  next?nav.insertBefore(a,next):nav.appendChild(a);
 }
 if(location.pathname==='/parcerias.html'){
  const a=nav?.querySelector('a[href="/parcerias.html"]');
  if(a)a.setAttribute('aria-current','page');
 }
})();

/* Recursos autónomos disponíveis de qualquer página, sem recurso ao site anterior. */
(function(){
 const links=document.querySelector('.foot-links');
 if(links){
  for(const item of [{href:'/familias.html#guia',label:'Guia das Famílias'},{href:'/historia-escola.html',label:'História da escola'},{href:'/arquivo-historico.html',label:'Arquivo de mandatos anteriores'}]){
   if(!links.querySelector('a[href="'+item.href+'"]')){
    const a=document.createElement('a');a.href=item.href;a.textContent=item.label;links.appendChild(a);
   }
  }
 }
})();



/* Donativos: acesso público consistente em todos os menus e rodapés. */
(function(){
 const nav=document.getElementById('mainMenu');
 if(nav&&!nav.querySelector('a[href="/doacoes.html"]')){
  const a=document.createElement('a');a.href='/doacoes.html';a.textContent='Donativos';
  const before=nav.querySelector('a[href="/contactos.html"]');before?nav.insertBefore(a,before):nav.appendChild(a);
 }
 if(location.pathname.endsWith('/doacoes.html')){
  nav?.querySelectorAll('a[aria-current="page"]').forEach(a=>a.removeAttribute('aria-current'));
  nav?.querySelector('a[href="/doacoes.html"]')?.setAttribute('aria-current','page');
 }
 const footer=document.querySelector('.foot-links');
 if(footer&&!footer.querySelector('a[href="/doacoes.html"]')){
  const a=document.createElement('a');a.href='/doacoes.html';a.textContent='Donativos';footer.appendChild(a);
 }
})();

/* Estilo B: menu principal moderno com ícones leves e seleção colorida.
   Os links originais continuam iguais; só acrescentamos a apresentação. */
(function(){
 const nav=document.getElementById('mainMenu');
 if(!nav)return;
 nav.classList.add('apee-menu-modern');
 const icons={
  '/':'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  '/associacao.html':'<circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M17 11a3 3 0 1 0-1-5.8M17 15a5 5 0 0 1 4 5"/>',
  '/projetos.html':'<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M7 10l3 3 7-7M7 17h10"/>',
  '/parcerias.html':'<path d="M8 12l3 3 5-6"/><path d="M12 2 14.7 4.3l3.5.3.7 3.4L21 11l-2.1 3 .1 3.5-3.4.8L12 21l-3.5-2.7-3.4-.8.1-3.5L3 11l2.1-3 .7-3.4 3.5-.3z"/>',
  '/noticias.html':'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  '/agenda.html':'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18m-12 5h6"/>',
  '/familias.html':'<path d="M3 20v-5a5 5 0 0 1 10 0v5M15 20v-4a4 4 0 0 1 6 0v4"/><circle cx="8" cy="7" r="3"/><circle cx="18" cy="9" r="2"/>',
  '/guia-familias.html':'<path d="M12 6a9 9 0 0 0-9-2v16a9 9 0 0 1 9 2 9 9 0 0 1 9-2V4a9 9 0 0 0-9 2Zm0 0v16"/>',
  '/historia.html':'<path d="M3 12a9 9 0 1 1 2.6 6.4M3 18v-6h6M12 7v5l4 2"/>',
  '/documentos.html':'<path d="M6 2h8l5 5v15H6zM14 2v6h5M9 13h7M9 17h7"/>',
  '/inscricao.html':'<circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M19 8v8M15 12h8"/>',
  '/contactos.html':'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 6 9-6"/>',
  '/doacoes.html':'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>'
 };
 const palette=['blue','green','red','yellow'];
 const links=[...nav.querySelectorAll('a[href]')];
 links.forEach((link,i)=>{
  const href=link.getAttribute('href');
  if(!Object.hasOwn(icons,href))return;
  if(link.querySelector('.apee-menu-icon'))return;
  link.classList.add('apee-menu-item','apee-menu-tone-'+palette[i%palette.length]);
  const label=link.textContent.trim();
  const svg=document.createElement('span');svg.className='apee-menu-icon';svg.setAttribute('aria-hidden','true');
  svg.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+icons[href]+'</svg>';
  const name=document.createElement('span');name.className='apee-menu-label';name.textContent=label;
  const chevron=document.createElement('span');chevron.className='apee-menu-chevron';chevron.setAttribute('aria-hidden','true');chevron.textContent=link.getAttribute('aria-current')==='page'?'↗':'›';
  link.replaceChildren(svg,name,chevron);
 });
})();

/* Renovação visual: descarregar as ilustrações mais recentes, sem alterar fotografias reais. */
(function(){
 const version='diversidade-20261022';
 const images=document.querySelectorAll('img[src*="ilustracoes/"]');
 images.forEach(img=>{
  try{
   const url=new URL(img.getAttribute('src'),document.baseURI);
   if(!url.pathname.endsWith('.svg'))return;
   url.searchParams.set('v',version);
   const rel=url.pathname;
   img.setAttribute('src',rel+url.search);
   img.setAttribute('decoding','async');
  }catch(_){}
 });
})();


/* Inscrição na barra superior apenas no desktop. No telemóvel permanece no menu. */
(function(){
  const nav=document.getElementById('mainMenu');
  const signup=nav&&nav.querySelector('a.signup-nav-link[href="/inscricao.html"]');
  const topbar=document.querySelector('.topline .container');
  if(!signup||!topbar||!nav)return;
  const originalNext=signup.nextSibling;
  const desktop=window.matchMedia('(min-width: 761px)');
  const positionSignup=()=>{
    if(desktop.matches){
      topbar.appendChild(signup);
      signup.classList.add('apee-signup-top');
    }else{
      nav.insertBefore(signup,originalNext);
      signup.classList.remove('apee-signup-top');
    }
  };
  positionSignup();
  if(desktop.addEventListener)desktop.addEventListener('change',positionSignup);
  else desktop.addListener(positionSignup);
})();


/* Espaço Associado: o login e os documentos usam a mesma origem do Worker. */
(function(){
 const href='https://associados.apeebairrodorestelo.com/';
 for(const nav of document.querySelectorAll('#mainMenu, .foot-links')){
  if(nav.querySelector('a[href="'+href+'"]'))continue;
  const link=document.createElement('a');link.href=href;link.textContent='Espaço Associado';
  nav.insertBefore(link,nav.id==='mainMenu'?nav.querySelector('.signup-nav-link'):null);
 }
})();

/* APEE: inscricao primeiro, acesso reservado em botao a seguir. */
(function(){
 const nav=document.getElementById('mainMenu');
 const signup=document.querySelector('a.signup-nav-link[href="/inscricao.html"]');
 const access=nav&&nav.querySelector('a[href="https://associados.apeebairrodorestelo.com/"]');
 if(!nav||!signup||!access)return;
 access.classList.add('apee-menu-item','apee-associado-button','apee-menu-tone-blue');
 access.setAttribute('aria-label','Espaço Associado — entrar na área reservada');
 if(!access.querySelector('.apee-menu-icon')){
  const icon=document.createElement('span');icon.className='apee-menu-icon';icon.setAttribute('aria-hidden','true');
  icon.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M16 12l2 2 4-4"/></svg>';
  const name=document.createElement('span');name.className='apee-menu-label';name.textContent='Espaço Associado';
  const chevron=document.createElement('span');chevron.className='apee-menu-chevron';chevron.setAttribute('aria-hidden','true');chevron.textContent='›';
  access.replaceChildren(icon,name,chevron);
 }
 for(const [link,caption] of [[signup,'Ainda não é associado? Inscreva-se'],[access,'Entrar na minha área reservada']]){
   const label=link.querySelector('.apee-menu-label');
   if(label&&!label.querySelector('small')){
     const small=document.createElement('small');small.className='apee-menu-caption';small.textContent=caption;label.appendChild(small);
   }
 }
 const desktop=window.matchMedia('(min-width: 761px)');
 const position=()=>{
  if(desktop.matches){
    signup.insertAdjacentElement('afterend',access);
    access.classList.add('apee-associado-top');
  }else{
    const contacts=nav.querySelector('a[href="/contactos.html"]');
    if(contacts)nav.insertBefore(signup,contacts);
    signup.insertAdjacentElement('afterend',access);
    access.classList.remove('apee-associado-top');
  }
 };
 position();
 if(desktop.addEventListener)desktop.addEventListener('change',position);
 else desktop.addListener(position);
 const css=[
 '.apee-menu-caption{display:none}',
 '@media(min-width:761px){',
 '.topline .apee-associado-top{display:inline-flex!important;align-items:center;min-height:38px;padding:10px 17px!important;border-radius:10px!important;background:#234f80!important;color:#fff!important;text-decoration:none!important;font-weight:800!important;font-size:.86rem!important;white-space:nowrap}',
 '.topline .apee-associado-top .apee-menu-icon,.topline .apee-associado-top .apee-menu-chevron{display:none!important}',
 '.topline .apee-signup-top .apee-menu-icon,.topline .apee-signup-top .apee-menu-chevron{display:none!important}',
 '}',
 '@media(max-width:760px){',
 '.main-menu.apee-menu-modern .apee-associado-button{display:flex!important;align-items:center!important;gap:13px!important;width:100%;min-height:70px!important;padding:11px 12px!important;margin-top:7px!important;background:#234f80!important;color:#fff!important;border:1px solid #234f80!important;border-radius:13px!important;box-shadow:0 4px 10px rgba(18,55,100,.12)!important}',
 '.main-menu.apee-menu-modern .apee-associado-button .apee-menu-icon{background:rgba(255,255,255,.16)!important;color:#fff!important}',
 '.main-menu.apee-menu-modern .apee-associado-button .apee-menu-chevron,.main-menu.apee-menu-modern .apee-associado-button .apee-menu-label{color:#fff!important}',
 '.main-menu.apee-menu-modern a[href="/inscricao.html"].apee-menu-item{min-height:70px!important}',
 '.main-menu.apee-menu-modern .apee-menu-label{display:flex;flex-direction:column;align-items:flex-start;gap:3px}',
 '.main-menu.apee-menu-modern .apee-menu-caption{display:block;font-size:.73em;font-weight:550;line-height:1.25;opacity:.93}',
 '.main-menu.apee-menu-modern .apee-associado-button:focus-visible{outline:3px solid #4c9dff!important;outline-offset:2px}',
 '}'
 ].join('\n');
 const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
})();

/* Pesquisa do Guia das Famílias: filtros imediatos, acessíveis e sem recolha de dados. */
(function(){
 const input=document.getElementById('fhSearch');
 const grid=document.getElementById('fhGrid');
 const counter=document.getElementById('fhCount');
 const empty=document.getElementById('fhEmpty');
 if(!input||!grid||!counter||!empty)return;
 const cards=[...grid.querySelectorAll('.fh-card')];
 const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const filter=()=>{
  const tokens=normalize(input.value.trim()).split(/\s+/).filter(Boolean);
  let visibleCount=0;
  cards.forEach(card=>{
   const text=normalize(card.textContent+' '+(card.dataset.search||''));
   const match=tokens.every(token=>text.includes(token));
   card.hidden=!match;
   if(match)visibleCount++;
  });
  counter.textContent=visibleCount===1?'1 tema':visibleCount+' temas';
  empty.hidden=visibleCount!==0;
 };
 input.addEventListener('input',filter);
})();
