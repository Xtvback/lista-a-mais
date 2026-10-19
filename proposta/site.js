const b=document.getElementById('menuButton'),m=document.getElementById('mainMenu');if(b&&m){b.addEventListener('click',()=>{const open=m.classList.toggle('open');b.setAttribute('aria-expanded',String(open));b.textContent=open?'✕  Fechar':'☰  Menu'});document.addEventListener('keydown',e=>{if(e.key==='Escape'){m.classList.remove('open');b.setAttribute('aria-expanded','false');b.textContent='☰  Menu'}});}

/* Acesso rápido mobile partilhado por todas as páginas institucionais. */
(function(){
  const path=location.pathname.split('/').pop()||'index.html';
  const items=[
    {href:'index.html',text:'Início',icon:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>'},
    {href:'agenda.html',text:'Agenda',icon:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>'},
    {href:'noticias.html',text:'Notícias',icon:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h6m-6 4h10m-10 4h10"/>'},
    {href:'contactos.html',text:'Contactos',icon:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 7 9-7"/>'}
  ];
  const nav=document.createElement('nav');
  nav.className='mobile-bottom-nav';nav.setAttribute('aria-label','Acesso rápido no telemóvel');
  items.forEach(item=>{
    const a=document.createElement('a');a.href=item.href;
    if(path===item.href)a.setAttribute('aria-current','page');
    a.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+item.icon+'</svg><span>'+item.text+'</span>';
    nav.appendChild(a);
  });
  document.body.appendChild(nav);
  document.body.classList.add('has-mobile-bottom-nav');
})();


/* Agenda discoverable in desktop menu and footer, without replacing any existing link. */
(function(){
  const menu=document.querySelector('#mainMenu');
  if(menu&&!menu.querySelector('a[href="agenda.html"]')){
    const link=document.createElement('a');link.href='agenda.html';link.textContent='Agenda';
    if(location.pathname.endsWith('/agenda.html'))link.setAttribute('aria-current','page');
    const before=menu.querySelector('a[href="familias.html"]');
    menu.insertBefore(link,before);
  }
  const footer=document.querySelector('.foot-links');
  if(footer&&!footer.querySelector('a[href="agenda.html"]')){
    const link=document.createElement('a');link.href='agenda.html';link.textContent='Agenda';footer.appendChild(link);
  }
})();
