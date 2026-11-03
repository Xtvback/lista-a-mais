const b=document.getElementById('menuButton'),m=document.getElementById('mainMenu');if(b&&m){b.addEventListener('click',()=>{const open=m.classList.toggle('open');b.setAttribute('aria-expanded',String(open));b.textContent=open?'✕  Fechar':'☰  Menu'});document.addEventListener('keydown',e=>{if(e.key==='Escape'){m.classList.remove('open');b.setAttribute('aria-expanded','false');b.textContent='☰  Menu'}});}

/* Barra móvel APEE · atalhos relevantes com identidade visual consistente. */
(function(){
  const path=location.pathname;
  const whatsapp='https://chat.whatsapp.com/FZplXzSkR070aoK6Q6TWVz';
  const items=[
    {href:'/inscricao.html',text:'Associados',label:'Inscrição de Associados',tone:'blue',active:path.endsWith('/inscricao.html'),
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

/* Guia das Famílias acessível no menu principal de todas as páginas. */
(function(){
 const nav=document.getElementById('mainMenu');
 if(!nav)return;
 const path=location.pathname;
 const isGuide=/\/(guia-(familias|plataformas|aaaf-caf|horarios|refeicoes|mensalidades|contactos)\.html)$/.test(path);
 let link=nav.querySelector('a[href="/guia-familias.html"]');
 if(!link){
  link=document.createElement('a');link.href='/guia-familias.html';link.textContent='Guia das Famílias';
  const after=nav.querySelector('a[href="/familias.html"]');
  if(after)after.insertAdjacentElement('afterend',link);
  else nav.appendChild(link);
 }
 if(isGuide){
  nav.querySelectorAll('a[aria-current="page"]').forEach(a=>a.removeAttribute('aria-current'));
  link.setAttribute('aria-current','page');
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


/* Recursos autónomos disponíveis de qualquer página, sem recurso ao site anterior. */
(function(){
 const links=document.querySelector('.foot-links');
 if(links){
  for(const item of [{href:'/guia-familias.html',label:'Guia das famílias'},{href:'/historia-escola.html',label:'História da escola'},{href:'/arquivo-historico.html',label:'Arquivo de mandatos anteriores'}]){
   if(!links.querySelector('a[href="'+item.href+'"]')){
    const a=document.createElement('a');a.href=item.href;a.textContent=item.label;links.appendChild(a);
   }
  }
 }
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
