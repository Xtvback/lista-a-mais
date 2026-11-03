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
    ],
    'Miguel Boavida': [
      "40 anos. Formado em gestão de marketing, com mestrado em gestão empresarial.",
      "Tenho 2 filhos, um deles frequenta a EB Bairro do Restelo desde o ano passado. Este ano está no 1.º ano.",
      "Aceitei o desafio de integrar a associação de pais porque acredito que a cooperação e o envolvimento de todos na comunidade escolar podem fazer a diferença na vida das crianças.",
      "Acredito que a escola pública deve ser um local seguro, de aprendizagem, onde se possam construir boas memórias e onde todos possam ter acesso às mesmas oportunidades.",
      "Valorizo muito o trabalho em equipa e pessoas comunicativas e com boa disposição."
    ],
    'André M. Fernandes': [
      "39 anos. Office manager, com 17 anos de experiência na área da saúde, Escritor.",
      "Sou pai de cinco filhos e tenho duas filhas na EB Bairro do Restelo. A nossa ligação à escola já dura há 6 anos. Acredito que a cooperação e o envolvimento de todos na comunidade escolar pode fazer a diferença na vida das crianças.",
      "Acredito que a escola pública deve ser um local seguro, de aprendizagem e de boas memórias, onde todas as crianças têm acesso às mesmas oportunidades. A minha experiência na gestão de rotinas diárias, e a vida de uma família numerosa, ensinaram-me a organizar, a priorizar e a fazer render cada recurso. É isso que quero levar para a associação, com rigor e transparência.",
      "Valorizo o trabalho em equipa, a comunicação aberta e as pessoas com boa disposição."
    ],
    'Gonçalo Ramos': [
      "41 anos, sou consultor na área dos seguros.",
      "Há cerca de 7 anos que a EB1+JI Bairro do Restelo faz parte da minha vida. Foi aqui que o meu filho deu os primeiros passos na escola e é aqui que a minha filha continua hoje essa caminhada.",
      "Nos tempos livres jogo andebol, onde aprendi que nenhuma vitória se conquista sozinho, e os meus melhores momentos são sempre passados em família.",
      "Juntei-me à Associação de Pais para retribuir à escola tudo o que tem dado aos meus filhos, com energia e espírito de equipa.",
      "Uma escola feliz faz crianças felizes, e é isso que queremos construir juntos."
    ],
    'Joana Telhada': [
      "40 anos, tenho o Mestrado em Ciências Farmacêuticas e sou Diretora Técnica da Farmácia Moura, na Ajuda.",
      "Sou mãe de dois rapazes, um dos quais frequenta a Escola Básica do Bairro do Restelo. Sou uma pessoa dinâmica, determinada e persistente. Adoro estar com a família e os amigos, jogar padel e aproveitar os pequenos momentos da vida.",
      "Gosto de desafios, de conhecer pessoas, de criar pontes e, sobretudo, de ajudar. Não gosto de ficar à espera que as coisas aconteçam. Gosto de fazer com que aconteçam!",
      "A minha entrada na Associação de Pais nasce da vontade de contribuir ativamente para uma escola mais próxima, participativa e feliz, onde as famílias e a comunidade escolar caminhem lado a lado.",
      "Acredito que, com dedicação, criatividade, espírito de equipa e muita vontade, conseguimos transformar ideias em projetos e criar oportunidades que façam a diferença na vida das nossas crianças.",
      "É com entusiasmo, compromisso e muita vontade de fazer acontecer que abraço este desafio.",
      "Porque acredito que, quando nos unimos por aquilo que realmente importa, conseguimos ir muito mais longe!",
      "Acredito verdadeiramente que Juntos, Somamos Mais!"
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
