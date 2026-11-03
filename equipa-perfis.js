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
      "34 anos, mãe de cinco filhos, licenciada em Contabilidade, CEO e Coordenadora Operacional, com experiência em gestão, liderança de equipas, organização e desenvolvimento de projetos.",
      "Ao longo de seis anos de envolvimento ativo na comunidade escolar do Bairro do Restelo, adquiri um conhecimento profundo da realidade educativa, dos desafios enfrentados pelas famílias e da importância de uma ligação sólida entre pais, escola e comunidade.",
      "Trago para a presidência da Associação de Pais a minha experiência profissional, capacidade de gestão, espírito de iniciativa e sentido de responsabilidade, aliados à perspetiva de mãe e à vontade de transformar ideias em ações concretas.",
      "Acredito numa escola pública mais inclusiva, inovadora, participativa e exigente na qualidade da educação, onde cada criança tenha oportunidades para desenvolver todo o seu potencial.",
      "Quero uma Associação de Pais presente, ativa e capaz de fazer acontecer, porque acredito que a experiência, o compromisso e o trabalho em equipa fazem a diferença."
    ],
    'Patrícia Jorge': [
      "43 anos, casada e mãe de dois filhos fantásticos! Licenciada em publicidade e marketing com pós-graduação em marketing desportivo.",
      "Adoro fazer exercício físico e cozinhar!",
      "Vivo em Belém há 10 anos e há 5 que faço parte da comunidade escolar do Bairro do Restelo.",
      "Ao integrar a associação de pais procuro trazer ideias que se transformem em momentos fantásticos e proporcionem as melhores memórias às nossas crianças."
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
