/* Perfis dos órgãos sociais APEE — apresentação acessível sem sair da página. */
(() => {
  const dialog = document.getElementById('apeeProfileDialog');
  if (!dialog) return;
  const title = document.getElementById('apeeProfileTitle');
  const role = document.getElementById('apeeProfileRole');
  const group = document.getElementById('apeeProfileGroup');
  const body = document.getElementById('apeeProfileBody');
  const image = document.getElementById('apeeProfileImage');
  const closeButton = dialog.querySelector('.apee-profile-close');
  let originButton = null;

  const profiles = {
    'Matilde Lino': [
      '34 anos, mãe de cinco filhos, CEO e gestora. Há seis anos que faço parte da comunidade escolar do Bairro do Restelo, conhecendo de perto os seus desafios, necessidades e potencial.',
      'Assumo a presidência da Associação de Pais com a vontade de contribuir para uma escola pública mais inclusiva, participativa, acolhedora e cheia de oportunidades, onde todas as crianças tenham espaço para crescer e todas as famílias sintam que têm voz.',
      'Acredito que, com união, dedicação e espírito de comunidade, podemos fazer a diferença. Porque juntos somamos mais!'
    ]
  };

  function openProfile(button) {
    const card = button.closest('.person-card');
    if (!card) return;
    const name = card.querySelector('h3')?.textContent?.trim() || 'Apresentação';
    const position = card.querySelector('.person-role')?.textContent?.trim() || '';
    const section = card.closest('.team-section')?.querySelector('.section-head h2')?.textContent?.trim() || 'Órgãos sociais';
    const src = card.querySelector('.person-photo img')?.getAttribute('src');
    originButton = button;
    title.textContent = name;
    role.textContent = position + ' · ' + section;
    group.textContent = 'Órgãos sociais · Mandato 2026/2027';
    body.replaceChildren();
    const paragraphs = profiles[name] || ['A apresentação deste membro estará disponível em breve.'];
    paragraphs.forEach(text => {
      const p = document.createElement('p');
      p.textContent = text;
      body.appendChild(p);
    });
    if (src) {
      image.src = src;
      image.alt = 'Retrato de ' + name;
      image.parentElement.hidden = false;
      image.onerror = () => { image.parentElement.hidden = true; };
    } else {
      image.removeAttribute('src');
      image.parentElement.hidden = true;
    }
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open','');
    closeButton.focus();
  }

  document.querySelectorAll('[data-person-profile]').forEach(button => {
    button.addEventListener('click', () => openProfile(button));
  });

  function closeProfile() {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }
  closeButton.addEventListener('click', closeProfile);
  dialog.addEventListener('click', e => { if (e.target === dialog) closeProfile(); });
  dialog.addEventListener('close', () => {
    image.removeAttribute('src');
    originButton?.focus({preventScroll:true});
  });
})();
