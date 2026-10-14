import {
  p as D,
  T as A,
  g as V,
  i as T,
  c as B,
  r as f,
  j as e,
  a as H,
  b as o,
} from "./index-D1r3HTzQ-contactos.js";
function M(n) {
  if (Array.isArray(n)) return n.flatMap((I) => M(I));
  if (typeof n != "string") return [];
  const r = [];
  let s = 0,
    l,
    a,
    i,
    c,
    d;
  const N = () => {
      for (; s < n.length && /\s/.test(n.charAt(s)); ) s += 1;
      return s < n.length;
    },
    p = () => ((a = n.charAt(s)), a !== "=" && a !== ";" && a !== ",");
  for (; s < n.length; ) {
    for (l = s, d = !1; N(); )
      if (((a = n.charAt(s)), a === ",")) {
        for (i = s, s += 1, N(), c = s; s < n.length && p(); ) s += 1;
        s < n.length && n.charAt(s) === "="
          ? ((d = !0), (s = c), r.push(n.slice(l, i)), (l = s))
          : (s = i + 1);
      } else s += 1;
    (!d || s >= n.length) && r.push(n.slice(l));
  }
  return r;
}
function _(n) {
  return n instanceof Headers
    ? n
    : Array.isArray(n)
      ? new Headers(n)
      : typeof n == "object"
        ? new Headers(n)
        : null;
}
function W(...n) {
  return n.reduce((r, s) => {
    const l = _(s);
    if (!l) return r;
    for (const [a, i] of l.entries())
      a === "set-cookie"
        ? M(i).forEach((c) => r.append("set-cookie", c))
        : r.set(a, i);
    return r;
  }, new Headers());
}
function E(n) {
  return n !== "__proto__" && n !== "constructor" && n !== "prototype";
}
function w(n, r) {
  const s = Object.create(null);
  if (n) for (const l of Object.keys(n)) E(l) && (s[l] = n[l]);
  if (r && typeof r == "object")
    for (const l of Object.keys(r)) E(l) && (s[l] = r[l]);
  return s;
}
function P(n) {
  return Object.create(null);
}
var q = () => {
    throw new Error(
      "createServerOnlyFn() functions can only be called on the server!",
    );
  },
  L = (n, r) => {
    const s = r || n || {};
    typeof s.method > "u" && (s.method = "GET");
    const l = (c) => L(void 0, { ...s, validator: c, inputValidator: c });
    return Object.assign((c) => L(void 0, { ...s, ...c }), {
      options: s,
      middleware: (c) => {
        const d = [...(s.middleware || [])];
        c.map((p) => {
          A in p
            ? p.options.middleware && d.push(...p.options.middleware)
            : d.push(p);
        });
        const N = L(void 0, { ...s, middleware: d });
        return ((N[A] = !0), N);
      },
      validator: l,
      inputValidator: l,
      handler: (...c) => {
        const [d, N] = c,
          p = { ...s, extractedFn: d, serverFn: N },
          I = [...(p.middleware || []), U(p)];
        return (
          (d.method = s.method),
          Object.assign(
            async (m) => {
              const F = await z(I, "client", {
                  ...d,
                  ...p,
                  data: m?.data,
                  headers: m?.headers,
                  signal: m?.signal,
                  fetch: m?.fetch,
                  context: P(),
                }),
                j = D(F.error);
              if (j) throw j;
              if (F.error) throw F.error;
              return F.result;
            },
            {
              ...d,
              method: s.method,
              __executeServer: async (m) => {
                const F = q(),
                  j = F.contextAfterGlobalMiddlewares;
                return await z(I, "server", {
                  ...d,
                  ...m,
                  serverFnMeta: d.serverFnMeta,
                  context: w(m.context, j),
                  request: F.request,
                }).then((v) => ({
                  result: v.result,
                  error: v.error,
                  context: v.sendContext,
                }));
              },
            },
          )
        );
      },
    });
  };
async function z(n, r, s) {
  let l = J([...(V()?.functionMiddleware || []), ...n]);
  if (r === "server") {
    const i = q();
    i?.executedRequestMiddlewares &&
      (l = l.filter((c) => !i.executedRequestMiddlewares.has(c)));
  }
  const a = async (i) => {
    const c = l.shift();
    if (!c) return i;
    try {
      let d = "validator" in c.options ? c.options.validator : void 0;
      (!d && "inputValidator" in c.options && (d = c.options.inputValidator),
        d && r === "server" && (i.data = await $(d, i.data)));
      let N;
      if (
        (r === "client"
          ? "client" in c.options && (N = c.options.client)
          : "server" in c.options && (N = c.options.server),
        N)
      ) {
        const I = await N({
          ...i,
          next: async (m = {}) => {
            const F = await a({
              ...i,
              ...m,
              context: w(i.context, m.context),
              sendContext: w(i.sendContext, m.sendContext),
              headers: W(i.headers, m.headers),
              _callSiteFetch: i._callSiteFetch,
              fetch: i._callSiteFetch ?? m.fetch ?? i.fetch,
              result:
                m.result !== void 0
                  ? m.result
                  : m instanceof Response
                    ? m
                    : i.result,
              error: m.error ?? i.error,
            });
            if (F.error) throw F.error;
            return F;
          },
        });
        if (T(I)) return { ...i, error: I };
        if (I instanceof Response) return { ...i, result: I };
        if (!I)
          throw new Error(
            "User middleware returned undefined. You must call next() or return a result in your middlewares.",
          );
        return I;
      }
      return a(i);
    } catch (d) {
      return { ...i, error: d };
    }
  };
  return a({
    ...s,
    headers: s.headers || {},
    sendContext: s.sendContext || {},
    context: s.context || P(),
    _callSiteFetch: s.fetch,
  });
}
function J(n, r = 100) {
  const s = new Set(),
    l = [],
    a = (i, c) => {
      if (c > r)
        throw new Error(
          `Middleware nesting depth exceeded maximum of ${r}. Check for circular references.`,
        );
      i.forEach((d) => {
        (d.options.middleware && a(d.options.middleware, c + 1),
          s.has(d) || (s.add(d), l.push(d)));
      });
    };
  return (a(n, 0), l);
}
async function $(n, r) {
  if (n == null) return {};
  if ("~standard" in n) {
    const s = await n["~standard"].validate(r);
    if (s.issues) throw new Error(JSON.stringify(s.issues, void 0, 2));
    return s.value;
  }
  if ("parse" in n) return n.parse(r);
  if (typeof n == "function") return n(r);
  throw new Error("Invalid validator type!");
}
function U(n) {
  return {
    "~types": void 0,
    options: {
      inputValidator: n.validator ?? n.inputValidator,
      client: async ({ next: r, sendContext: s, fetch: l, ...a }) => {
        const i = { ...a, context: s, fetch: l };
        return r(await n.extractedFn?.(i));
      },
      server: async ({ next: r, ...s }) => {
        const l = await n.serverFn?.(s);
        return r({ ...s, result: l });
      },
    },
  };
}
const G = L({ method: "POST" }).handler(
    B("6d24085c7d2b84f1330aed075d73c9b80a9dd2c4636e16ba62dadc859e8f9468"),
  ),
  b = "apee.eb1bairrorestelo@gmail.com",
  Y = [
    {
      id: "I",
      slug: "etica",
      label: "Ética",
      title: "Cooperação institucional e ética pedagógica",
      items: [
        "Reuniões de Planeamento com a Direção: No início de cada período, reunimo-nos com a direção do agrupamento para perceber de perto o que a nossa escola mais precisa. Decidimos em conjunto onde investir os recursos pedagógicos e acompanhamos, com toda a transparência, a chegada dos professores, garantindo que nada falha na rotina dos nossos filhos.",
        "Comunicação Aberta e Sem Barreiras: Criar uma ponte direta e diária entre representantes de turma, professores, auxiliares e famílias. Queremos que a informação flua sem rodeios, por isso usamos a nossa app e a criação de uma comunidade WhatsApp.",
        "Uma Comunidade Unida pela Nossa Escola: Trabalhamos lado a lado e de mãos dadas com a Junta de Freguesia de Belém e a Câmara Municipal de Lisboa. Esta proximidade permite-nos encontrar os apoios e os recursos necessários para melhorar o espaço escolar e dar vida aos eventos das nossas crianças.",
        "Espaço de Escuta e Mediação Pedagógica: Um espaço seguro, ético e fiável onde cada família se pode expressar livremente. Estamos aqui para acolher as suas preocupações pedagógicas com empatia, mediar pequenos ou grandes conflitos com serenidade e assegurar, acima de tudo, o bem-estar e a felicidade dos alunos.",
      ],
    },
    {
      id: "II",
      slug: "inovacao",
      label: "Inovação",
      title: "Inovação pedagógica e espaços dinâmicos",
      items: [
        "A Nossa Biblioteca Viva e o Amor pelos Livros: Conversas com Autores e Feira do Livro. Queremos dar vida às histórias! Uma feira do livro anual em parceria com editoras e trazemos autores de literatura infantojuvenil à escola para momentos inesquecíveis de leitura, partilha e oficinas de escrita onde a imaginação não tem limites. Livros Livres e Troca com Coração. Criamos um cantinho de partilha comunitária e um mercado de troca de livros entre alunos. Mais do que reaproveitar e cuidar do planeta, ensinamos o valor de partilhar histórias que já nos fizeram sorrir.",
        "A Nossa Horta e o Respeito pela Natureza: Mãos na Terra: Aprender e Cuidar. Trazemos a horta para o dia a dia das nossas crianças. Todos os meses, em parceria com os projetos da escola (AEC e CAF), os alunos visitam a horta para semear, cuidar e colher, crescendo em contacto direto com a terra e com a sustentabilidade.",
        "Recreios para Todos e Acolhimento das Famílias: O Nosso Recreio, Um Espaço de Acolhimento. Queremos transformar o recreio num lugar onde todos se sintam bem. Um espaço exterior com cantos de leitura ao ar livre, pufes confortáveis e materiais modulares para brincar e relaxar. Apoio Especializado Sempre por Perto. Acompanhamos de perto a saúde emocional e o desenvolvimento de cada criança. Mantemos uma rede atualizada de terapeutas (fala, psicologia, terapia ocupacional) prontos para intervir na escola e apoiar com carinho e rapidez as famílias que precisem.",
      ],
    },
    {
      id: "III",
      slug: "saude-seguranca-inclusao",
      label: "Saúde, Segurança e Inclusão",
      title:
        "Aprender com Empatia, Cuidar com Preparação: A Escola que os Nossos Filhos Merecem",
      intro:
        "Acreditamos numa escola que não é apenas um lugar de passagem, mas um porto seguro. Queremos que cada criança, com as suas conquistas, desafios e particularidades, se sinta verdadeiramente vista, integrada e protegida. Para isso, precisamos de ir além do básico:",
      items: [
        "Acolher com Saber: Formação dedicada às nossas auxiliares para que saibam dar o apoio certo e afetuoso a crianças com necessidades especiais.",
        "Proteger com Coragem: Capacitação em primeiros socorros pediátricos para toda a equipa escolar, porque a segurança dos nossos filhos é inegociável.",
        "Equipar com Respeito: Criação de um verdadeiro espaço de primeiros socorros, equipado à altura de qualquer emergência.",
      ],
      outro: "Porque cuidar de uma criança é cuidar do futuro de todos.",
    },
    {
      id: "IV",
      slug: "apoio-social",
      label: "Apoio Social",
      title: "Funcionamento, apoio social e transição escolar",
      items: [
        "Alimentação com Cuidado e Transparência: Queremos garantir que os nossos filhos comem com qualidade. Acompanhamos de perto, todos os trimestres, o trabalho na cozinha e conversamos abertamente com as equipas do refeitório. Partilhamos depois com as famílias relatórios simples e claros sobre as ementas, a nutrição e todas as melhorias que vamos fazendo juntos.",
        "Todos Juntos pelo Bem-Estar das Crianças (AEC e CAF): Para que os nossos filhos se sintam felizes e acompanhados ao longo de todo o dia, mantemos uma relação de grande proximidade com as equipas das AEC e da CAF. Unimos esforços e partilhamos ideias para que as atividades extracurriculares sigam a mesma dedicação e os mesmos valores do projeto do nosso agrupamento.",
        "Uma Mão Amiga: Banco de Material Solidário. Nenhuma criança deve sentir a falta do essencial para aprender e crescer. Criámos uma rede permanente de doação e partilha de manuais e material escolar, pronta para apoiar com total carinho, dignidade e anonimato as famílias que estejam a passar por um momento mais difícil.",
        "Cartão APEE e Apoio ao Comércio Local: Vamos criar um cartão especial de associado que aproxima a nossa escola dos comerciantes do bairro. Ao utilizar este cartão, as famílias acedem a vantagens e descontos na comunidade, enquanto apoiamos e damos força aos negócios locais que nos rodeiam e que fazem parte do nosso dia a dia.",
        "Mentoria e Acolhimento na Transição para o 2.º Ciclo: A passagem para o 5.º ano é um grande passo e queremos que cada criança o dê com total confiança e sem medos. Organizamos momentos de mentoria e acompanhamento onde os alunos mais velhos e a equipa escolar acolhem os mais novos, tiram dúvidas, mostram os novos cantos da escola e garantem uma transição serena e cheia de entusiasmo.",
      ],
    },
  ],
  Q = [
    [
      "OUT",
      "Eleições e Lanche de Boas-Vindas",
      "Arranque do mandato, NIF próprio e acolhimento.",
    ],
    [
      "NOV",
      "Feira do Livro, Mercado Circular, Magusto e “Sabores do Forno”",
      "Leitura partilhada, oficinas, trocas sustentáveis, tradições portuguesas e workshops práticos.",
    ],
    [
      "DEZ",
      "Recolha Solidária e Convívio",
      "Cabazes de Natal e iniciativas de comunidade.",
    ],
    [
      "JAN",
      "Ciclo de Debates",
      "Inteligência emocional, ética escolar e saúde mental infantil.",
    ],
    [
      "FEV",
      "Carnaval das Nações",
      "Histórias, máscaras e cultura das famílias.",
    ],
    [
      "MAR",
      "Festa da Primavera",
      "Sementeiras familiares e compostagem escolar.",
    ],
    ["MAI", "Dia da Família e Roteiro", "Peddy-paper cultural por Belém."],
    [
      "JUN",
      "Dia da Criança e Arraial",
      "Festa e mentoria de transição para o 2.º ciclo.",
    ],
  ],
  Z =
    "_external/d2ol7oe51mr4n9.cloudfront.net/user_3EbWYhy0t8ty8Wz9RPVrhpDHVlB/ed568a85-3be8-48a8-a9df-53d0c9ad1edb.jpg",
  PHOTO_URLS = [
    "assets/team/andre-fernandes.jpg",
    "assets/team/andrea-gaudencio.jpg",
    "assets/team/goncalo-ramos.jpg",
    "assets/team/joana-telhada.jpg",
    "assets/team/luis-martins.jpg",
    "assets/team/margarida-almeida.jpg",
    "assets/team/margarida-fernandes.jpg",
    "assets/team/mariana-perry.jpg",
    "assets/team/matilde-lino.jpg",
    "assets/team/miguel-boavida.jpg",
    "assets/team/patricia-jorge.jpg",
    "assets/team/rui-fernandes.jpg",
    "assets/team/sara-vilar.jpg",
  ],
  K = {
    Direção: [
      ["Matilde Lino", "Presidente", 8, "Mãe de 1.º e 2.º ano"],
      ["Patrícia Jorge", "Vice-presidente", 10, "Mãe de JI"],
      ["Miguel Boavida", "Secretário", 9, "Pai de 1.º ano"],
      ["André Fernandes", "Tesoureiro", 0, "Pai de 1.º e 2.º ano"],
      ["Gonçalo Ramos", "Vogal", 2, "Pai de 2.º ano"],
      ["Joana Telhada", "Vogal", 3, "Mãe de 1.º ano"],
      ["Margarida Fernandes", "Vogal", 6, "Mãe de 1.º ano"],
    ],
    "Conselho Fiscal": [
      ["Margarida Almeida", "Presidente", 5, "Mãe de 2.º ano"],
      ["Rui Fernandes", "Vice-presidente", 11, "Pai de 3.º ano"],
      ["Mariana Perry", "Secretária", 7, "Mãe de 3.º ano"],
    ],
    "Mesa da Assembleia": [
      ["Andrea Gaudencio", "Presidente", 1, "Mãe de 2.º ano"],
      ["Sara Vilar", "Vice-presidente", 12, "Mãe de 1.º e 3.º ano"],
      ["Luís Martins", "1.º Vogal", 4, "Pai de 2.º ano"],
    ],
  };
function X(n) {
  const r = n % 4,
    s = Math.floor(n / 4);
  return `${(r / 3) * 100}% ${(s / 3) * 100}%`;
}
function oe() {
  const [n, r] = f.useState(!1),
    [s, l] = f.useState("inicio"),
    [proposalSlug, setProposalSlug] = f.useState(null),
    [a, i] = f.useState(!0),
    c = f.useRef(null),
    [d, N] = f.useState(!1),
    [p, I] = f.useState({ type: "idle", message: "" }),
    m = f.useMemo(() => new Date("2026-10-13T17:30:00+01:00"), []),
    [F, j] = f.useState(() => Math.max(0, m.getTime() - Date.now()));
  (f.useEffect(() => {
    const t = () => j(Math.max(0, m.getTime() - Date.now()));
    t();
    const u = window.setInterval(t, 1e3);
    return () => window.clearInterval(u);
  }, [m]),
    f.useEffect(() => {
      const t = c.current;
      if (!t) return;
      t.volume = 0.22;
      const u = () => {
        a &&
          t
            .play()
            .then(() => {
              (window.removeEventListener("pointerdown", u),
                window.removeEventListener("keydown", u));
            })
            .catch(() => {});
      };
      return (
        u(),
        window.addEventListener("pointerdown", u, { passive: !0 }),
        window.addEventListener("keydown", u),
        () => {
          (window.removeEventListener("pointerdown", u),
            window.removeEventListener("keydown", u));
        }
      );
    }, [a]));
  const v = () => {
      const t = c.current;
      t &&
        (a
          ? (t.pause(), i(!1))
          : ((t.volume = 0.22), t.play().catch(() => {}), i(!0)));
    },
    g = f.useMemo(() => {
      const t = Math.floor(F / 1e3);
      return {
        days: Math.floor(t / 86400),
        hours: Math.floor((t % 86400) / 3600),
        minutes: Math.floor((t % 3600) / 60),
        seconds: t % 60,
      };
    }, [F]),
    y =
      "_external/d2ol7oe51mr4n9.cloudfront.net/user_3EbWYhy0t8ty8Wz9RPVrhpDHVlB/6c0a90e1-f63f-4e2c-8a73-48d8610f6db5.jpg",
    x = (t) => {
      (l(t),
        t === "plano" && setProposalSlug(null),
        r(!1),
        window.scrollTo({ top: 0, behavior: "smooth" }));
    },
    selectedProposal = Y.find((t) => t.slug === proposalSlug),
    R = f.useMemo(
      () =>
        `mailto:${b}?subject=${encodeURIComponent("Inscrição para atualizações Lista A+")}&body=${encodeURIComponent(`Olá, quero receber atualizações da Lista A+ / APEE.

Nome: 
Email: `)}`,
      [],
    );
  async function S(t) {
    (t.preventDefault(), N(!0), I({ type: "idle", message: "" }));
    const u = new FormData(t.currentTarget),
      h = {
        name: String(u.get("name") ?? ""),
        email: String(u.get("email") ?? ""),
        consent: u.get("consent") === "on",
      };
    try {
      const C = await G({ data: h });
      (I({
        type: C.ok ? "success" : "error",
        message: C.message,
        mailto: C.mailto,
      }),
        C.ok && t.currentTarget.reset());
    } catch {
      I({
        type: "error",
        message:
          "Não foi possível registar automaticamente. Pode enviar o pedido por email.",
        mailto: R,
      });
    } finally {
      N(!1);
    }
  }
  return e.jsxs("div", {
    className: "app-shell",
    ref: o({
      nodeId: "km5lzn",
      componentName: "Index",
      sourceFile: "src/routes/index.tsx?tsr-split=component",
      tagName: "div",
      sourceLine: 140,
      sourceColumn: 10,
      routeFile: "index.tsx?tsr-split=component",
    }),
    children: [
      e.jsx("audio", {
        ref: H(
          c,
          o({
            nodeId: "fkjdnw",
            componentName: "Index",
            sourceFile: "src/routes/index.tsx?tsr-split=component",
            tagName: "audio",
            sourceLine: 141,
            sourceColumn: 3,
            routeFile: "index.tsx?tsr-split=component",
          }),
        ),
        src: "_external/d2ol7oe51mr4n9.cloudfront.net/user_3EbWYhy0t8ty8Wz9RPVrhpDHVlB/60588b02-3574-4d94-8e51-8c943c39d9bc.mp3",
        loop: !0,
        preload: "auto",
        playsInline: !0,
      }),
      e.jsxs("header", {
        className: "topbar",
        ref: o({
          nodeId: "epmylm",
          componentName: "Index",
          sourceFile: "src/routes/index.tsx?tsr-split=component",
          tagName: "header",
          sourceLine: 142,
          sourceColumn: 3,
          routeFile: "index.tsx?tsr-split=component",
        }),
        children: [
          e.jsxs("button", {
            className: "identity identity-button",
            onClick: () => x("inicio"),
            ref: o({
              nodeId: "89uznd",
              componentName: "Index",
              sourceFile: "src/routes/index.tsx?tsr-split=component",
              tagName: "button",
              sourceLine: 143,
              sourceColumn: 4,
              routeFile: "index.tsx?tsr-split=component",
            }),
            children: [
              e.jsx("img", {
                className: "header-logo",
                src: y,
                alt: "APEE Bairro do Restelo · EB1 + JI",
                ref: o({
                  nodeId: "enk2bv",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "img",
                  sourceLine: 143,
                  sourceColumn: 80,
                  routeFile: "index.tsx?tsr-split=component",
                }),
              }),
              e.jsxs("span", {
                ref: o({
                  nodeId: "dnxx4g",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "span",
                  sourceLine: 143,
                  sourceColumn: 170,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: [
                  e.jsx("strong", {
                    ref: o({
                      nodeId: "bn8m9q",
                      componentName: "Index",
                      sourceFile: "src/routes/index.tsx?tsr-split=component",
                      tagName: "strong",
                      sourceLine: 143,
                      sourceColumn: 176,
                      routeFile: "index.tsx?tsr-split=component",
                    }),
                    children: "Lista A+",
                  }),
                  e.jsx("small", {
                    ref: o({
                      nodeId: "hnm4rj",
                      componentName: "Index",
                      sourceFile: "src/routes/index.tsx?tsr-split=component",
                      tagName: "small",
                      sourceLine: 143,
                      sourceColumn: 201,
                      routeFile: "index.tsx?tsr-split=component",
                    }),
                    children: "APEE Bairro do Restelo",
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("nav", {
            className: n ? "desktop-nav open" : "desktop-nav",
            "aria-label": "Navegação principal",
            ref: o({
              nodeId: "x0z3er",
              componentName: "Index",
              sourceFile: "src/routes/index.tsx?tsr-split=component",
              tagName: "nav",
              sourceLine: 144,
              sourceColumn: 4,
              routeFile: "index.tsx?tsr-split=component",
            }),
            children: [
              e.jsx("button", {
                className: s === "inicio" ? "active" : "",
                onClick: () => x("inicio"),
                ref: o({
                  nodeId: "ulhj4m",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "button",
                  sourceLine: 145,
                  sourceColumn: 5,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: "Início",
              }),
              e.jsx("button", {
                className: s === "prioridades" ? "active" : "",
                onClick: () => x("prioridades"),
                ref: o({
                  nodeId: "rchkc5",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "button",
                  sourceLine: 146,
                  sourceColumn: 5,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: "Prioridades",
              }),
              e.jsx("button", {
                className: s === "novos-horizontes" ? "active" : "",
                onClick: () => x("novos-horizontes"),
                ref: o({
                  nodeId: "o3hljo",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "button",
                  sourceLine: 147,
                  sourceColumn: 5,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: "Novos Horizontes",
              }),
              e.jsx("button", {
                className: s === "plano" ? "active" : "",
                onClick: () => x("plano"),
                ref: o({
                  nodeId: "kuhmr7",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "button",
                  sourceLine: 148,
                  sourceColumn: 5,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: "A Nossa Proposta",
              }),
              e.jsx("button", {
                className: s === "agenda" ? "active" : "",
                onClick: () => x("agenda"),
                ref: o({
                  nodeId: "hlhnyq",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "button",
                  sourceLine: 149,
                  sourceColumn: 5,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: "Agenda",
              }),
              e.jsx("button", {
                className: s === "equipa" ? "active" : "",
                onClick: () => x("equipa"),
                ref: o({
                  nodeId: "h4mgjg",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "button",
                  sourceLine: 150,
                  sourceColumn: 5,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: "Equipa",
              }),
              e.jsx("button", {
                className: s === "parceiros" ? "active" : "",
                onClick: () => x("parceiros"),
                ref: o({
                  nodeId: "dvmhqz",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "button",
                  sourceLine: 151,
                  sourceColumn: 5,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: "Cartão APEE · Parceiros",
              }),
              e.jsx("button", {
                className: s === "contactos" ? "active" : "",
                onClick: () => x("contactos"),
                ref: o({
                  nodeId: "7dmk61",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "button",
                  sourceLine: 153,
                  sourceColumn: 5,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: "Contactos",
              }),
            ],
          }),
          e.jsxs("div", {
            className: "top-actions",
            ref: o({
              nodeId: "ah1gnf",
              componentName: "Index",
              sourceFile: "src/routes/index.tsx?tsr-split=component",
              tagName: "div",
              sourceLine: 155,
              sourceColumn: 4,
              routeFile: "index.tsx?tsr-split=component",
            }),
            children: [
              e.jsx("button", {
                className: "music-toggle",
                onClick: v,
                "aria-label": a ? "Desligar música" : "Ligar música",
                title: a ? "Desligar música" : "Ligar música",
                ref: o({
                  nodeId: "bso06m",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "button",
                  sourceLine: 155,
                  sourceColumn: 33,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: a ? "♪" : "♪̸",
              }),
              e.jsx("button", {
                className: "menu",
                onClick: () => r((t) => !t),
                "aria-expanded": n,
                ref: o({
                  nodeId: "lrxtg6",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "button",
                  sourceLine: 155,
                  sourceColumn: 336,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: "☰",
              }),
            ],
          }),
        ],
      }),
      e.jsxs("main", {
        ref: o({
          nodeId: "fifm6b",
          componentName: "Index",
          sourceFile: "src/routes/index.tsx?tsr-split=component",
          tagName: "main",
          sourceLine: 158,
          sourceColumn: 3,
          routeFile: "index.tsx?tsr-split=component",
        }),
        children: [
          s === "inicio" &&
            e.jsxs("section", {
              className: "welcome page-view",
              ref: o({
                nodeId: "w9mosp",
                componentName: "Index",
                sourceFile: "src/routes/index.tsx?tsr-split=component",
                tagName: "section",
                sourceLine: 159,
                sourceColumn: 26,
                routeFile: "index.tsx?tsr-split=component",
              }),
              children: [
                e.jsx("div", {
                  className: "soft-shape shape-a",
                  ref: o({
                    nodeId: "y2rot6",
                    componentName: "Index",
                    sourceFile: "src/routes/index.tsx?tsr-split=component",
                    tagName: "div",
                    sourceLine: 160,
                    sourceColumn: 5,
                    routeFile: "index.tsx?tsr-split=component",
                  }),
                }),
                e.jsx("div", {
                  className: "soft-shape shape-b",
                  ref: o({
                    nodeId: "8xp6e2",
                    componentName: "Index",
                    sourceFile: "src/routes/index.tsx?tsr-split=component",
                    tagName: "div",
                    sourceLine: 160,
                    sourceColumn: 43,
                    routeFile: "index.tsx?tsr-split=component",
                  }),
                }),
                e.jsxs("div", {
                  className: "wrap welcome-grid",
                  ref: o({
                    nodeId: "jedel5",
                    componentName: "Index",
                    sourceFile: "src/routes/index.tsx?tsr-split=component",
                    tagName: "div",
                    sourceLine: 161,
                    sourceColumn: 5,
                    routeFile: "index.tsx?tsr-split=component",
                  }),
                  children: [
                    e.jsxs("div", {
                      ref: o({
                        nodeId: "4pfbrr",
                        componentName: "Index",
                        sourceFile: "src/routes/index.tsx?tsr-split=component",
                        tagName: "div",
                        sourceLine: 162,
                        sourceColumn: 6,
                        routeFile: "index.tsx?tsr-split=component",
                      }),
                      children: [
                        e.jsx("p", {
                          className: "kicker",
                          ref: o({
                            nodeId: "r4669i",
                            componentName: "Index",
                            sourceFile:
                              "src/routes/index.tsx?tsr-split=component",
                            tagName: "p",
                            sourceLine: 163,
                            sourceColumn: 7,
                            routeFile: "index.tsx?tsr-split=component",
                          }),
                          children: "ELEIÇÕES APEE · 2026 / 2027",
                        }),
                        e.jsx("h1", {
                          ref: o({
                            nodeId: "c92vri",
                            componentName: "Index",
                            sourceFile:
                              "src/routes/index.tsx?tsr-split=component",
                            tagName: "h1",
                            sourceLine: 164,
                            sourceColumn: 7,
                            routeFile: "index.tsx?tsr-split=component",
                          }),
                          children: "Lista A+",
                        }),
                        e.jsx("p", {
                          className: "tagline",
                          ref: o({
                            nodeId: "r32l2s",
                            componentName: "Index",
                            sourceFile:
                              "src/routes/index.tsx?tsr-split=component",
                            tagName: "p",
                            sourceLine: 165,
                            sourceColumn: 7,
                            routeFile: "index.tsx?tsr-split=component",
                          }),
                          children: "Juntos, somamos mais",
                        }),
                        e.jsx("p", {
                          className: "intro-copy",
                          ref: o({
                            nodeId: "r2ishf",
                            componentName: "Index",
                            sourceFile:
                              "src/routes/index.tsx?tsr-split=component",
                            tagName: "p",
                            sourceLine: 166,
                            sourceColumn: 7,
                            routeFile: "index.tsx?tsr-split=component",
                          }),
                          children:
                            "Acreditamos que uma APEE ativa é decisiva para o sucesso e o bem-estar das nossas crianças. Candidatamo-nos para construir, com todas as famílias, uma comunidade escolar mais forte, transparente e colaborativa.",
                        }),
                        e.jsxs("div", {
                          className: "hero-actions",
                          ref: o({
                            nodeId: "2c061d",
                            componentName: "Index",
                            sourceFile:
                              "src/routes/index.tsx?tsr-split=component",
                            tagName: "div",
                            sourceLine: 167,
                            sourceColumn: 7,
                            routeFile: "index.tsx?tsr-split=component",
                          }),
                          children: [
                            e.jsx("button", {
                              className: "action primary",
                              onClick: () => x("plano"),
                              ref: o({
                                nodeId: "18t9rp",
                                componentName: "Index",
                                sourceFile:
                                  "src/routes/index.tsx?tsr-split=component",
                                tagName: "button",
                                sourceLine: 167,
                                sourceColumn: 37,
                                routeFile: "index.tsx?tsr-split=component",
                              }),
                              children: "Conhecer a nossa proposta",
                            }),
                          ],
                        }),
                      ],
                    }),
                    e.jsxs("aside", {
                      className: "status-card countdown-card",
                      ref: o({
                        nodeId: "r253yv",
                        componentName: "Index",
                        sourceFile: "src/routes/index.tsx?tsr-split=component",
                        tagName: "aside",
                        sourceLine: 169,
                        sourceColumn: 6,
                        routeFile: "index.tsx?tsr-split=component",
                      }),
                      children: [
                        e.jsx("span", {
                          className: "status-icon",
                          ref: o({
                            nodeId: "juwlws",
                            componentName: "Index",
                            sourceFile:
                              "src/routes/index.tsx?tsr-split=component",
                            tagName: "span",
                            sourceLine: 170,
                            sourceColumn: 7,
                            routeFile: "index.tsx?tsr-split=component",
                          }),
                          children: "i",
                        }),
                        e.jsxs("div", {
                          className: "countdown-content",
                          ref: o({
                            nodeId: "9gcnns",
                            componentName: "Index",
                            sourceFile:
                              "src/routes/index.tsx?tsr-split=component",
                            tagName: "div",
                            sourceLine: 171,
                            sourceColumn: 7,
                            routeFile: "index.tsx?tsr-split=component",
                          }),
                          children: [
                            e.jsx("small", {
                              ref: o({
                                nodeId: "lfy1q8",
                                componentName: "Index",
                                sourceFile:
                                  "src/routes/index.tsx?tsr-split=component",
                                tagName: "small",
                                sourceLine: 172,
                                sourceColumn: 8,
                                routeFile: "index.tsx?tsr-split=component",
                              }),
                              children: "Informação eleitoral",
                            }),
                            F > 0
                              ? e.jsxs(e.Fragment, {
                                  children: [
                                    e.jsx("strong", {
                                      className: "countdown-title",
                                      ref: o({
                                        nodeId: "30iz1h",
                                        componentName: "Index",
                                        sourceFile:
                                          "src/routes/index.tsx?tsr-split=component",
                                        tagName: "strong",
                                        sourceLine: 174,
                                        sourceColumn: 9,
                                        routeFile:
                                          "index.tsx?tsr-split=component",
                                      }),
                                      children: "Contagem decrescente",
                                    }),
                                    e.jsxs("div", {
                                      className: "countdown-grid",
                                      "aria-label":
                                        g.days +
                                        " dias, " +
                                        g.hours +
                                        " horas, " +
                                        g.minutes +
                                        " minutos e " +
                                        g.seconds +
                                        " segundos",
                                      ref: o({
                                        nodeId: "2u2o8i",
                                        componentName: "Index",
                                        sourceFile:
                                          "src/routes/index.tsx?tsr-split=component",
                                        tagName: "div",
                                        sourceLine: 175,
                                        sourceColumn: 9,
                                        routeFile:
                                          "index.tsx?tsr-split=component",
                                      }),
                                      children: [
                                        e.jsxs("span", {
                                          ref: o({
                                            nodeId: "cfqzor",
                                            componentName: "Index",
                                            sourceFile:
                                              "src/routes/index.tsx?tsr-split=component",
                                            tagName: "span",
                                            sourceLine: 176,
                                            sourceColumn: 10,
                                            routeFile:
                                              "index.tsx?tsr-split=component",
                                          }),
                                          children: [
                                            e.jsx("b", {
                                              ref: o({
                                                nodeId: "rvh32k",
                                                componentName: "Index",
                                                sourceFile:
                                                  "src/routes/index.tsx?tsr-split=component",
                                                tagName: "b",
                                                sourceLine: 176,
                                                sourceColumn: 16,
                                                routeFile:
                                                  "index.tsx?tsr-split=component",
                                              }),
                                              children: g.days,
                                            }),
                                            e.jsx("em", {
                                              ref: o({
                                                nodeId: "brihst",
                                                componentName: "Index",
                                                sourceFile:
                                                  "src/routes/index.tsx?tsr-split=component",
                                                tagName: "em",
                                                sourceLine: 176,
                                                sourceColumn: 39,
                                                routeFile:
                                                  "index.tsx?tsr-split=component",
                                              }),
                                              children: "dias",
                                            }),
                                          ],
                                        }),
                                        e.jsxs("span", {
                                          ref: o({
                                            nodeId: "trql86",
                                            componentName: "Index",
                                            sourceFile:
                                              "src/routes/index.tsx?tsr-split=component",
                                            tagName: "span",
                                            sourceLine: 177,
                                            sourceColumn: 10,
                                            routeFile:
                                              "index.tsx?tsr-split=component",
                                          }),
                                          children: [
                                            e.jsx("b", {
                                              ref: o({
                                                nodeId: "scipgr",
                                                componentName: "Index",
                                                sourceFile:
                                                  "src/routes/index.tsx?tsr-split=component",
                                                tagName: "b",
                                                sourceLine: 177,
                                                sourceColumn: 16,
                                                routeFile:
                                                  "index.tsx?tsr-split=component",
                                              }),
                                              children: String(
                                                g.hours,
                                              ).padStart(2, "0"),
                                            }),
                                            e.jsx("em", {
                                              ref: o({
                                                nodeId: "qhhlut",
                                                componentName: "Index",
                                                sourceFile:
                                                  "src/routes/index.tsx?tsr-split=component",
                                                tagName: "em",
                                                sourceLine: 177,
                                                sourceColumn: 65,
                                                routeFile:
                                                  "index.tsx?tsr-split=component",
                                              }),
                                              children: "horas",
                                            }),
                                          ],
                                        }),
                                        e.jsxs("span", {
                                          ref: o({
                                            nodeId: "y445z",
                                            componentName: "Index",
                                            sourceFile:
                                              "src/routes/index.tsx?tsr-split=component",
                                            tagName: "span",
                                            sourceLine: 178,
                                            sourceColumn: 10,
                                            routeFile:
                                              "index.tsx?tsr-split=component",
                                          }),
                                          children: [
                                            e.jsx("b", {
                                              ref: o({
                                                nodeId: "stkbuy",
                                                componentName: "Index",
                                                sourceFile:
                                                  "src/routes/index.tsx?tsr-split=component",
                                                tagName: "b",
                                                sourceLine: 178,
                                                sourceColumn: 16,
                                                routeFile:
                                                  "index.tsx?tsr-split=component",
                                              }),
                                              children: String(
                                                g.minutes,
                                              ).padStart(2, "0"),
                                            }),
                                            e.jsx("em", {
                                              ref: o({
                                                nodeId: "tv6vx8",
                                                componentName: "Index",
                                                sourceFile:
                                                  "src/routes/index.tsx?tsr-split=component",
                                                tagName: "em",
                                                sourceLine: 178,
                                                sourceColumn: 67,
                                                routeFile:
                                                  "index.tsx?tsr-split=component",
                                              }),
                                              children: "min",
                                            }),
                                          ],
                                        }),
                                        e.jsxs("span", {
                                          ref: o({
                                            nodeId: "rvicw8",
                                            componentName: "Index",
                                            sourceFile:
                                              "src/routes/index.tsx?tsr-split=component",
                                            tagName: "span",
                                            sourceLine: 179,
                                            sourceColumn: 10,
                                            routeFile:
                                              "index.tsx?tsr-split=component",
                                          }),
                                          children: [
                                            e.jsx("b", {
                                              ref: o({
                                                nodeId: "taly95",
                                                componentName: "Index",
                                                sourceFile:
                                                  "src/routes/index.tsx?tsr-split=component",
                                                tagName: "b",
                                                sourceLine: 179,
                                                sourceColumn: 16,
                                                routeFile:
                                                  "index.tsx?tsr-split=component",
                                              }),
                                              children: String(
                                                g.seconds,
                                              ).padStart(2, "0"),
                                            }),
                                            e.jsx("em", {
                                              ref: o({
                                                nodeId: "f6slp7",
                                                componentName: "Index",
                                                sourceFile:
                                                  "src/routes/index.tsx?tsr-split=component",
                                                tagName: "em",
                                                sourceLine: 179,
                                                sourceColumn: 67,
                                                routeFile:
                                                  "index.tsx?tsr-split=component",
                                              }),
                                              children: "seg",
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                    e.jsx("p", {
                                      ref: o({
                                        nodeId: "q76h6g",
                                        componentName: "Index",
                                        sourceFile:
                                          "src/routes/index.tsx?tsr-split=component",
                                        tagName: "p",
                                        sourceLine: 181,
                                        sourceColumn: 9,
                                        routeFile:
                                          "index.tsx?tsr-split=component",
                                      }),
                                      children: "Inicia a 13/10/2026 às 17h30",
                                    }),
                                  ],
                                })
                              : e.jsxs(e.Fragment, {
                                  children: [
                                    e.jsx("strong", {
                                      className: "countdown-title",
                                      ref: o({
                                        nodeId: "thdwsj",
                                        componentName: "Index",
                                        sourceFile:
                                          "src/routes/index.tsx?tsr-split=component",
                                        tagName: "strong",
                                        sourceLine: 183,
                                        sourceColumn: 9,
                                        routeFile:
                                          "index.tsx?tsr-split=component",
                                      }),
                                      children: "A votação já começou",
                                    }),
                                    e.jsx("p", {
                                      ref: o({
                                        nodeId: "q5j3ed",
                                        componentName: "Index",
                                        sourceFile:
                                          "src/routes/index.tsx?tsr-split=component",
                                        tagName: "p",
                                        sourceLine: 184,
                                        sourceColumn: 9,
                                        routeFile:
                                          "index.tsx?tsr-split=component",
                                      }),
                                      children: "13 de outubro de 2026 · 17h30",
                                    }),
                                  ],
                                }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          s === "novos-horizontes" &&
            e.jsx("section", {
              className: "section contact-page page-view",
              id: "novos-horizontes",
              ref: o({
                nodeId: "7gxdqk",
                componentName: "Index",
                sourceFile: "src/routes/index.tsx?tsr-split=component",
                tagName: "section",
                sourceLine: 191,
                sourceColumn: 36,
                routeFile: "index.tsx?tsr-split=component",
              }),
              children: e.jsxs("div", {
                className: "wrap contact-wrap",
                ref: o({
                  nodeId: "aps8ud",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "div",
                  sourceLine: 192,
                  sourceColumn: 5,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: [
                  e.jsxs("div", {
                    className: "section-title contact-heading",
                    ref: o({
                      nodeId: "peqbnr",
                      componentName: "Index",
                      sourceFile: "src/routes/index.tsx?tsr-split=component",
                      tagName: "div",
                      sourceLine: 193,
                      sourceColumn: 6,
                      routeFile: "index.tsx?tsr-split=component",
                    }),
                    children: [
                      e.jsxs("div", {
                        ref: o({
                          nodeId: "5be36n",
                          componentName: "Index",
                          sourceFile:
                            "src/routes/index.tsx?tsr-split=component",
                          tagName: "div",
                          sourceLine: 193,
                          sourceColumn: 37,
                          routeFile: "index.tsx?tsr-split=component",
                        }),
                        children: [
                          e.jsx("p", {
                            className: "kicker blue",
                            ref: o({
                              nodeId: "f7xfmw",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "p",
                              sourceLine: 193,
                              sourceColumn: 42,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: "NOVOS HORIZONTES",
                          }),
                          e.jsx("h2", {
                            ref: o({
                              nodeId: "pgbk8v",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "h2",
                              sourceLine: 193,
                              sourceColumn: 89,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children:
                              "Mais proximidade, mais acesso, mais participação",
                          }),
                        ],
                      }),
                      e.jsx("p", {
                        ref: o({
                          nodeId: "pcew5b",
                          componentName: "Index",
                          sourceFile:
                            "src/routes/index.tsx?tsr-split=component",
                          tagName: "p",
                          sourceLine: 193,
                          sourceColumn: 153,
                          routeFile: "index.tsx?tsr-split=component",
                        }),
                        children:
                          "Novas ferramentas pensadas para aproximar a APEE das famílias e facilitar o acesso à informação.",
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "priority-group app-priority",
                    ref: o({
                      nodeId: "uxzg3c",
                      componentName: "Index",
                      sourceFile: "src/routes/index.tsx?tsr-split=component",
                      tagName: "div",
                      sourceLine: 194,
                      sourceColumn: 6,
                      routeFile: "index.tsx?tsr-split=component",
                    }),
                    children: [
                      e.jsxs("div", {
                        className: "priority-group-heading",
                        ref: o({
                          nodeId: "g91d9y",
                          componentName: "Index",
                          sourceFile:
                            "src/routes/index.tsx?tsr-split=component",
                          tagName: "div",
                          sourceLine: 195,
                          sourceColumn: 7,
                          routeFile: "index.tsx?tsr-split=component",
                        }),
                        children: [
                          e.jsxs("div", {
                            ref: o({
                              nodeId: "6qmx1o",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "div",
                              sourceLine: 195,
                              sourceColumn: 61,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: [
                              e.jsx("h3", {
                                ref: o({
                                  nodeId: "g7jylz",
                                  componentName: "Index",
                                  sourceFile:
                                    "src/routes/index.tsx?tsr-split=component",
                                  tagName: "h3",
                                  sourceLine: 195,
                                  sourceColumn: 93,
                                  routeFile: "index.tsx?tsr-split=component",
                                }),
                                children: "Aplicação móvel para Android e iOS",
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsx("p", {
                        className: "priority-intro",
                        ref: o({
                          nodeId: "pndxau",
                          componentName: "Index",
                          sourceFile:
                            "src/routes/index.tsx?tsr-split=component",
                          tagName: "p",
                          sourceLine: 196,
                          sourceColumn: 7,
                          routeFile: "index.tsx?tsr-split=component",
                        }),
                        children:
                          "Após a tomada de posse, a aplicação móvel estará disponível para Android e iOS (Apple), reunindo as seguintes funcionalidades:",
                      }),
                      e.jsxs("div", {
                        className: "app-feature-grid",
                        ref: o({
                          nodeId: "d3r764",
                          componentName: "Index",
                          sourceFile:
                            "src/routes/index.tsx?tsr-split=component",
                          tagName: "div",
                          sourceLine: 197,
                          sourceColumn: 7,
                          routeFile: "index.tsx?tsr-split=component",
                        }),
                        children: [
                          e.jsxs("article", {
                            ref: o({
                              nodeId: "h3ivkd",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "article",
                              sourceLine: 198,
                              sourceColumn: 8,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: [
                              e.jsx("span", {
                                ref: o({
                                  nodeId: "dzy83l",
                                  componentName: "Index",
                                  sourceFile:
                                    "src/routes/index.tsx?tsr-split=component",
                                  tagName: "span",
                                  sourceLine: 198,
                                  sourceColumn: 17,
                                  routeFile: "index.tsx?tsr-split=component",
                                }),
                                children: "01",
                              }),
                              e.jsxs("div", {
                                ref: o({
                                  nodeId: "7ajdkl",
                                  componentName: "Index",
                                  sourceFile:
                                    "src/routes/index.tsx?tsr-split=component",
                                  tagName: "div",
                                  sourceLine: 198,
                                  sourceColumn: 32,
                                  routeFile: "index.tsx?tsr-split=component",
                                }),
                                children: [
                                  e.jsx("h4", {
                                    ref: o({
                                      nodeId: "rqeog3",
                                      componentName: "Index",
                                      sourceFile:
                                        "src/routes/index.tsx?tsr-split=component",
                                      tagName: "h4",
                                      sourceLine: 198,
                                      sourceColumn: 37,
                                      routeFile:
                                        "index.tsx?tsr-split=component",
                                    }),
                                    children: "Notícias e Agenda",
                                  }),
                                  e.jsx("p", {
                                    ref: o({
                                      nodeId: "cuo0y6",
                                      componentName: "Index",
                                      sourceFile:
                                        "src/routes/index.tsx?tsr-split=component",
                                      tagName: "p",
                                      sourceLine: 198,
                                      sourceColumn: 63,
                                      routeFile:
                                        "index.tsx?tsr-split=component",
                                    }),
                                    children:
                                      "Acompanhamento de todas as novidades e eventos futuros.",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          e.jsxs("article", {
                            ref: o({
                              nodeId: "o7q9v8",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "article",
                              sourceLine: 199,
                              sourceColumn: 8,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: [
                              e.jsx("span", {
                                ref: o({
                                  nodeId: "r51t34",
                                  componentName: "Index",
                                  sourceFile:
                                    "src/routes/index.tsx?tsr-split=component",
                                  tagName: "span",
                                  sourceLine: 199,
                                  sourceColumn: 17,
                                  routeFile: "index.tsx?tsr-split=component",
                                }),
                                children: "02",
                              }),
                              e.jsxs("div", {
                                ref: o({
                                  nodeId: "ywy7cc",
                                  componentName: "Index",
                                  sourceFile:
                                    "src/routes/index.tsx?tsr-split=component",
                                  tagName: "div",
                                  sourceLine: 199,
                                  sourceColumn: 32,
                                  routeFile: "index.tsx?tsr-split=component",
                                }),
                                children: [
                                  e.jsx("h4", {
                                    ref: o({
                                      nodeId: "smb3b0",
                                      componentName: "Index",
                                      sourceFile:
                                        "src/routes/index.tsx?tsr-split=component",
                                      tagName: "h4",
                                      sourceLine: 199,
                                      sourceColumn: 37,
                                      routeFile:
                                        "index.tsx?tsr-split=component",
                                    }),
                                    children: "Parceiros e Descontos",
                                  }),
                                  e.jsx("p", {
                                    ref: o({
                                      nodeId: "cdmbl7",
                                      componentName: "Index",
                                      sourceFile:
                                        "src/routes/index.tsx?tsr-split=component",
                                      tagName: "p",
                                      sourceLine: 199,
                                      sourceColumn: 67,
                                      routeFile:
                                        "index.tsx?tsr-split=component",
                                    }),
                                    children:
                                      "Acesso à rede de parcerias e vantagens exclusivas.",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          e.jsxs("article", {
                            ref: o({
                              nodeId: "gico4r",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "article",
                              sourceLine: 200,
                              sourceColumn: 8,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: [
                              e.jsx("span", {
                                ref: o({
                                  nodeId: "bkqkv5",
                                  componentName: "Index",
                                  sourceFile:
                                    "src/routes/index.tsx?tsr-split=component",
                                  tagName: "span",
                                  sourceLine: 200,
                                  sourceColumn: 17,
                                  routeFile: "index.tsx?tsr-split=component",
                                }),
                                children: "03",
                              }),
                              e.jsxs("div", {
                                ref: o({
                                  nodeId: "sjk8kt",
                                  componentName: "Index",
                                  sourceFile:
                                    "src/routes/index.tsx?tsr-split=component",
                                  tagName: "div",
                                  sourceLine: 200,
                                  sourceColumn: 32,
                                  routeFile: "index.tsx?tsr-split=component",
                                }),
                                children: [
                                  e.jsx("h4", {
                                    ref: o({
                                      nodeId: "ntxlsr",
                                      componentName: "Index",
                                      sourceFile:
                                        "src/routes/index.tsx?tsr-split=component",
                                      tagName: "h4",
                                      sourceLine: 200,
                                      sourceColumn: 37,
                                      routeFile:
                                        "index.tsx?tsr-split=component",
                                    }),
                                    children: "Cartão Digital (QR Code)",
                                  }),
                                  e.jsx("p", {
                                    ref: o({
                                      nodeId: "m5963b",
                                      componentName: "Index",
                                      sourceFile:
                                        "src/routes/index.tsx?tsr-split=component",
                                      tagName: "p",
                                      sourceLine: 200,
                                      sourceColumn: 70,
                                      routeFile:
                                        "index.tsx?tsr-split=component",
                                    }),
                                    children:
                                      "Identificação rápida para validação de descontos nos parceiros.",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          e.jsxs("article", {
                            ref: o({
                              nodeId: "oswhau",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "article",
                              sourceLine: 201,
                              sourceColumn: 8,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: [
                              e.jsx("span", {
                                ref: o({
                                  nodeId: "ibdfxa",
                                  componentName: "Index",
                                  sourceFile:
                                    "src/routes/index.tsx?tsr-split=component",
                                  tagName: "span",
                                  sourceLine: 201,
                                  sourceColumn: 17,
                                  routeFile: "index.tsx?tsr-split=component",
                                }),
                                children: "04",
                              }),
                              e.jsxs("div", {
                                ref: o({
                                  nodeId: "a28he",
                                  componentName: "Index",
                                  sourceFile:
                                    "src/routes/index.tsx?tsr-split=component",
                                  tagName: "div",
                                  sourceLine: 201,
                                  sourceColumn: 32,
                                  routeFile: "index.tsx?tsr-split=component",
                                }),
                                children: [
                                  e.jsx("h4", {
                                    ref: o({
                                      nodeId: "95jbkq",
                                      componentName: "Index",
                                      sourceFile:
                                        "src/routes/index.tsx?tsr-split=component",
                                      tagName: "h4",
                                      sourceLine: 201,
                                      sourceColumn: 37,
                                      routeFile:
                                        "index.tsx?tsr-split=component",
                                    }),
                                    children: "Documentos e Galeria",
                                  }),
                                  e.jsx("p", {
                                    ref: o({
                                      nodeId: "mmapiq",
                                      componentName: "Index",
                                      sourceFile:
                                        "src/routes/index.tsx?tsr-split=component",
                                      tagName: "p",
                                      sourceLine: 201,
                                      sourceColumn: 66,
                                      routeFile:
                                        "index.tsx?tsr-split=component",
                                    }),
                                    children:
                                      "Consulta de documentos oficiais, ficheiros e registos fotográficos.",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          e.jsxs("article", {
                            ref: o({
                              nodeId: "4wyf8p",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "article",
                              sourceLine: 202,
                              sourceColumn: 8,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: [
                              e.jsx("span", {
                                ref: o({
                                  nodeId: "mtml9f",
                                  componentName: "Index",
                                  sourceFile:
                                    "src/routes/index.tsx?tsr-split=component",
                                  tagName: "span",
                                  sourceLine: 202,
                                  sourceColumn: 17,
                                  routeFile: "index.tsx?tsr-split=component",
                                }),
                                children: "05",
                              }),
                              e.jsxs("div", {
                                ref: o({
                                  nodeId: "t3opjl",
                                  componentName: "Index",
                                  sourceFile:
                                    "src/routes/index.tsx?tsr-split=component",
                                  tagName: "div",
                                  sourceLine: 202,
                                  sourceColumn: 32,
                                  routeFile: "index.tsx?tsr-split=component",
                                }),
                                children: [
                                  e.jsx("h4", {
                                    ref: o({
                                      nodeId: "5iuynb",
                                      componentName: "Index",
                                      sourceFile:
                                        "src/routes/index.tsx?tsr-split=component",
                                      tagName: "h4",
                                      sourceLine: 202,
                                      sourceColumn: 37,
                                      routeFile:
                                        "index.tsx?tsr-split=component",
                                    }),
                                    children: "Comunidade",
                                  }),
                                  e.jsx("p", {
                                    ref: o({
                                      nodeId: "n3boxe",
                                      componentName: "Index",
                                      sourceFile:
                                        "src/routes/index.tsx?tsr-split=component",
                                      tagName: "p",
                                      sourceLine: 202,
                                      sourceColumn: 56,
                                      routeFile:
                                        "index.tsx?tsr-split=component",
                                    }),
                                    children:
                                      "Espaço de participação e interação entre os membros.",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          e.jsxs("article", {
                            ref: o({
                              nodeId: "ymtbs8",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "article",
                              sourceLine: 203,
                              sourceColumn: 8,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: [
                              e.jsx("span", {
                                ref: o({
                                  nodeId: "72hfj0",
                                  componentName: "Index",
                                  sourceFile:
                                    "src/routes/index.tsx?tsr-split=component",
                                  tagName: "span",
                                  sourceLine: 203,
                                  sourceColumn: 17,
                                  routeFile: "index.tsx?tsr-split=component",
                                }),
                                children: "06",
                              }),
                              e.jsxs("div", {
                                ref: o({
                                  nodeId: "d3svdc",
                                  componentName: "Index",
                                  sourceFile:
                                    "src/routes/index.tsx?tsr-split=component",
                                  tagName: "div",
                                  sourceLine: 203,
                                  sourceColumn: 32,
                                  routeFile: "index.tsx?tsr-split=component",
                                }),
                                children: [
                                  e.jsx("h4", {
                                    ref: o({
                                      nodeId: "k798vc",
                                      componentName: "Index",
                                      sourceFile:
                                        "src/routes/index.tsx?tsr-split=component",
                                      tagName: "h4",
                                      sourceLine: 203,
                                      sourceColumn: 37,
                                      routeFile:
                                        "index.tsx?tsr-split=component",
                                    }),
                                    children: "Contactos",
                                  }),
                                  e.jsx("p", {
                                    ref: o({
                                      nodeId: "nkdakw",
                                      componentName: "Index",
                                      sourceFile:
                                        "src/routes/index.tsx?tsr-split=component",
                                      tagName: "p",
                                      sourceLine: 203,
                                      sourceColumn: 55,
                                      routeFile:
                                        "index.tsx?tsr-split=component",
                                    }),
                                    children:
                                      "Linhas diretas de comunicação e suporte.",
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsx("div", {
                        className: "app-preview-wrap",
                        ref: o({
                          nodeId: "lfbfpo",
                          componentName: "Index",
                          sourceFile:
                            "src/routes/index.tsx?tsr-split=component",
                          tagName: "div",
                          sourceLine: 205,
                          sourceColumn: 7,
                          routeFile: "index.tsx?tsr-split=component",
                        }),
                        children: e.jsx("img", {
                          className: "app-preview-image",
                          src: "_external/d2ol7oe51mr4n9.cloudfront.net/user_3EbWYhy0t8ty8Wz9RPVrhpDHVlB/b0fe8ec6-1468-4ef0-8d3a-f05a0493ae92.jpg",
                          alt: "Pré-visualização da aplicação móvel da Lista A+",
                          ref: o({
                            nodeId: "6qd93s",
                            componentName: "Index",
                            sourceFile:
                              "src/routes/index.tsx?tsr-split=component",
                            tagName: "img",
                            sourceLine: 206,
                            sourceColumn: 8,
                            routeFile: "index.tsx?tsr-split=component",
                          }),
                        }),
                      }),
                    ],
                  }),
                ],
              }),
            }),
          !1,
          s === "prioridades" &&
            e.jsx("section", {
              className: "section white page-view",
              id: "prioridades",
              ref: o({
                nodeId: "nkemo2",
                componentName: "Index",
                sourceFile: "src/routes/index.tsx?tsr-split=component",
                tagName: "section",
                sourceLine: 219,
                sourceColumn: 31,
                routeFile: "index.tsx?tsr-split=component",
              }),
              children: e.jsxs("div", {
                className: "wrap",
                ref: o({
                  nodeId: "xtyk2z",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "div",
                  sourceLine: 220,
                  sourceColumn: 5,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: [
                  e.jsxs("div", {
                    className: "section-title",
                    ref: o({
                      nodeId: "mi7f2r",
                      componentName: "Index",
                      sourceFile: "src/routes/index.tsx?tsr-split=component",
                      tagName: "div",
                      sourceLine: 221,
                      sourceColumn: 6,
                      routeFile: "index.tsx?tsr-split=component",
                    }),
                    children: [
                      e.jsxs("div", {
                        ref: o({
                          nodeId: "blp7uh",
                          componentName: "Index",
                          sourceFile:
                            "src/routes/index.tsx?tsr-split=component",
                          tagName: "div",
                          sourceLine: 221,
                          sourceColumn: 37,
                          routeFile: "index.tsx?tsr-split=component",
                        }),
                        children: [
                          e.jsx("p", {
                            className: "kicker blue",
                            ref: o({
                              nodeId: "j224y6",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "p",
                              sourceLine: 221,
                              sourceColumn: 42,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: "PRIORIDADES DA CAMPANHA",
                          }),
                          e.jsx("h2", {
                            ref: o({
                              nodeId: "mg4auv",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "h2",
                              sourceLine: 221,
                              sourceColumn: 96,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: "Prioridade para o início do mandato",
                          }),
                        ],
                      }),
                      e.jsx("p", {
                        ref: o({
                          nodeId: "mkjely",
                          componentName: "Index",
                          sourceFile:
                            "src/routes/index.tsx?tsr-split=component",
                          tagName: "p",
                          sourceLine: 221,
                          sourceColumn: 147,
                          routeFile: "index.tsx?tsr-split=component",
                        }),
                        children:
                          "Medidas essenciais para garantir uma associação formalizada, organizada e transparente desde o primeiro momento.",
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "priority-group app-priority",
                    ref: o({
                      nodeId: "6ul5db",
                      componentName: "Index",
                      sourceFile: "src/routes/index.tsx?tsr-split=component",
                      tagName: "div",
                      sourceLine: 223,
                      sourceColumn: 6,
                      routeFile: "index.tsx?tsr-split=component",
                    }),
                    children: [
                      e.jsxs("div", {
                        className: "priority-group-heading",
                        ref: o({
                          nodeId: "ljj86p",
                          componentName: "Index",
                          sourceFile:
                            "src/routes/index.tsx?tsr-split=component",
                          tagName: "div",
                          sourceLine: 224,
                          sourceColumn: 7,
                          routeFile: "index.tsx?tsr-split=component",
                        }),
                        children: [
                          e.jsx("span", {
                            ref: o({
                              nodeId: "klgrq",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "span",
                              sourceLine: 224,
                              sourceColumn: 47,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: "1",
                          }),
                          e.jsxs("div", {
                            ref: o({
                              nodeId: "sdaood",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "div",
                              sourceLine: 224,
                              sourceColumn: 61,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: [
                              e.jsx("small", {
                                ref: o({
                                  nodeId: "abtv4o",
                                  componentName: "Index",
                                  sourceFile:
                                    "src/routes/index.tsx?tsr-split=component",
                                  tagName: "small",
                                  sourceLine: 224,
                                  sourceColumn: 66,
                                  routeFile: "index.tsx?tsr-split=component",
                                }),
                                children: "PRIORIDADE 1",
                              }),
                              e.jsx("h3", {
                                ref: o({
                                  nodeId: "ll0muo",
                                  componentName: "Index",
                                  sourceFile:
                                    "src/routes/index.tsx?tsr-split=component",
                                  tagName: "h3",
                                  sourceLine: 224,
                                  sourceColumn: 93,
                                  routeFile: "index.tsx?tsr-split=component",
                                }),
                                children:
                                  "Formalização, organização e transparência",
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsxs("div", {
                        className: "priority-grid",
                        ref: o({
                          nodeId: "yt6jke",
                          componentName: "Index",
                          sourceFile:
                            "src/routes/index.tsx?tsr-split=component",
                          tagName: "div",
                          sourceLine: 225,
                          sourceColumn: 7,
                          routeFile: "index.tsx?tsr-split=component",
                        }),
                        children: [
                          e.jsxs("article", {
                            className: "priority-card",
                            ref: o({
                              nodeId: "mjjg9l",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "article",
                              sourceLine: 226,
                              sourceColumn: 8,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: [
                              e.jsx("span", {
                                className: "priority-number",
                                ref: o({
                                  nodeId: "9xazl8",
                                  componentName: "Index",
                                  sourceFile:
                                    "src/routes/index.tsx?tsr-split=component",
                                  tagName: "span",
                                  sourceLine: 226,
                                  sourceColumn: 43,
                                  routeFile: "index.tsx?tsr-split=component",
                                }),
                                children: "01",
                              }),
                              e.jsxs("div", {
                                ref: o({
                                  nodeId: "g09sku",
                                  componentName: "Index",
                                  sourceFile:
                                    "src/routes/index.tsx?tsr-split=component",
                                  tagName: "div",
                                  sourceLine: 226,
                                  sourceColumn: 86,
                                  routeFile: "index.tsx?tsr-split=component",
                                }),
                                children: [
                                  e.jsx("h3", {
                                    ref: o({
                                      nodeId: "k3c4ng",
                                      componentName: "Index",
                                      sourceFile:
                                        "src/routes/index.tsx?tsr-split=component",
                                      tagName: "h3",
                                      sourceLine: 226,
                                      sourceColumn: 91,
                                      routeFile:
                                        "index.tsx?tsr-split=component",
                                    }),
                                    children: "Registo da associação",
                                  }),
                                  e.jsx("p", {
                                    ref: o({
                                      nodeId: "k7pfw5",
                                      componentName: "Index",
                                      sourceFile:
                                        "src/routes/index.tsx?tsr-split=component",
                                      tagName: "p",
                                      sourceLine: 226,
                                      sourceColumn: 121,
                                      routeFile:
                                        "index.tsx?tsr-split=component",
                                    }),
                                    children:
                                      "Constituição e legalização da entidade jurídica.",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          e.jsxs("article", {
                            className: "priority-card",
                            ref: o({
                              nodeId: "76bg9y",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "article",
                              sourceLine: 227,
                              sourceColumn: 8,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: [
                              e.jsx("span", {
                                className: "priority-number",
                                ref: o({
                                  nodeId: "jyt177",
                                  componentName: "Index",
                                  sourceFile:
                                    "src/routes/index.tsx?tsr-split=component",
                                  tagName: "span",
                                  sourceLine: 227,
                                  sourceColumn: 43,
                                  routeFile: "index.tsx?tsr-split=component",
                                }),
                                children: "02",
                              }),
                              e.jsxs("div", {
                                ref: o({
                                  nodeId: "q77sc3",
                                  componentName: "Index",
                                  sourceFile:
                                    "src/routes/index.tsx?tsr-split=component",
                                  tagName: "div",
                                  sourceLine: 227,
                                  sourceColumn: 86,
                                  routeFile: "index.tsx?tsr-split=component",
                                }),
                                children: [
                                  e.jsx("h3", {
                                    ref: o({
                                      nodeId: "5exuff",
                                      componentName: "Index",
                                      sourceFile:
                                        "src/routes/index.tsx?tsr-split=component",
                                      tagName: "h3",
                                      sourceLine: 227,
                                      sourceColumn: 91,
                                      routeFile:
                                        "index.tsx?tsr-split=component",
                                    }),
                                    children: "Criação de NIF",
                                  }),
                                  e.jsx("p", {
                                    ref: o({
                                      nodeId: "5jbqfk",
                                      componentName: "Index",
                                      sourceFile:
                                        "src/routes/index.tsx?tsr-split=component",
                                      tagName: "p",
                                      sourceLine: 227,
                                      sourceColumn: 114,
                                      routeFile:
                                        "index.tsx?tsr-split=component",
                                    }),
                                    children:
                                      "Atribuição de NIF, emitido pela Autoridade Tributária.",
                                  }),
                                ],
                              }),
                            ],
                          }),
                          e.jsxs("article", {
                            className: "priority-card",
                            ref: o({
                              nodeId: "y4xp5n",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "article",
                              sourceLine: 228,
                              sourceColumn: 8,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: [
                              e.jsx("span", {
                                className: "priority-number",
                                ref: o({
                                  nodeId: "l66zzi",
                                  componentName: "Index",
                                  sourceFile:
                                    "src/routes/index.tsx?tsr-split=component",
                                  tagName: "span",
                                  sourceLine: 228,
                                  sourceColumn: 43,
                                  routeFile: "index.tsx?tsr-split=component",
                                }),
                                children: "03",
                              }),
                              e.jsxs("div", {
                                ref: o({
                                  nodeId: "2meoq4",
                                  componentName: "Index",
                                  sourceFile:
                                    "src/routes/index.tsx?tsr-split=component",
                                  tagName: "div",
                                  sourceLine: 228,
                                  sourceColumn: 86,
                                  routeFile: "index.tsx?tsr-split=component",
                                }),
                                children: [
                                  e.jsx("h3", {
                                    ref: o({
                                      nodeId: "99gfsm",
                                      componentName: "Index",
                                      sourceFile:
                                        "src/routes/index.tsx?tsr-split=component",
                                      tagName: "h3",
                                      sourceLine: 228,
                                      sourceColumn: 91,
                                      routeFile:
                                        "index.tsx?tsr-split=component",
                                    }),
                                    children:
                                      "Prestação aberta e clara de contas",
                                  }),
                                  e.jsx("p", {
                                    ref: o({
                                      nodeId: "953trj",
                                      componentName: "Index",
                                      sourceFile:
                                        "src/routes/index.tsx?tsr-split=component",
                                      tagName: "p",
                                      sourceLine: 228,
                                      sourceColumn: 134,
                                      routeFile:
                                        "index.tsx?tsr-split=component",
                                    }),
                                    children:
                                      "Transparência, rigor e auditabilidade na prestação de contas.",
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className: "priority-group app-priority",
                    children: [
                      e.jsxs("div", {
                        className: "priority-group-heading",
                        children: [
                          e.jsx("span", { children: "2" }),
                          e.jsxs("div", {
                            children: [
                              e.jsx("small", { children: "PRIORIDADE 2" }),
                              e.jsx("h3", { children: "Linha Aberta APEE" }),
                            ],
                          }),
                        ],
                      }),
                      e.jsx("article", {
                        className: "priority-card",
                        children: e.jsxs("div", {
                          children: [
                            e.jsx("h3", { children: "Linha Aberta APEE" }),
                            e.jsx("p", {
                              children:
                                "Vamos criar o WhatsApp Institucional da APEE para garantir que a sua voz chega até nós de forma rápida, simples e próxima. Queremos que este seja um espaço seguro e aberto para reportar qualquer situação, dar sugestões ou esclarecer dúvidas. Aqui, nenhuma preocupação é pequena demais. O nosso compromisso é ouvir cada pai, mãe e encarregado de educação com toda a atenção e carinho que a nossa comunidade merece. Precisa de falar connosco? Estamos à distância de uma mensagem.",
                            }),
                          ],
                        }),
                      }),
                    ],
                  }),
                ],
              }),
            }),
          s === "plano" &&
            e.jsx("section", {
              className: "section mist page-view",
              id: "plano",
              ref: o({
                nodeId: "dxk03c",
                componentName: "Index",
                sourceFile: "src/routes/index.tsx?tsr-split=component",
                tagName: "section",
                sourceLine: 236,
                sourceColumn: 25,
                routeFile: "index.tsx?tsr-split=component",
              }),
              children: selectedProposal
                ? e.jsxs("div", {
                    className: "wrap proposal-detail",
                    children: [
                      e.jsx("button", {
                        className: "proposal-back",
                        onClick: () => {
                          setProposalSlug(null);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        },
                        children: "← Voltar a A Nossa Proposta",
                      }),
                      e.jsxs("div", {
                        className: "proposal-detail-heading",
                        children: [
                          e.jsx("span", {
                            className: "proposal-detail-number",
                            children: selectedProposal.id,
                          }),
                          e.jsxs("div", {
                            children: [
                              e.jsx("p", {
                                className: "kicker blue",
                                children: selectedProposal.label,
                              }),
                              e.jsx("h2", {
                                children: selectedProposal.title,
                              }),
                            ],
                          }),
                        ],
                      }),
                      selectedProposal.intro &&
                        e.jsx("p", {
                          className: "proposal-intro",
                          children: selectedProposal.intro,
                        }),
                      e.jsx("div", {
                        className: "proposal-points",
                        children: selectedProposal.items.map((t, u) => {
                          const splitAt = t.indexOf(":");
                          return e.jsxs(
                            "article",
                            {
                              children: [
                                e.jsx("span", { children: u + 1 }),
                                e.jsxs("div", {
                                  children: [
                                    e.jsx("h3", {
                                      children:
                                        splitAt > -1
                                          ? t.slice(0, splitAt)
                                          : t,
                                    }),
                                    splitAt > -1 &&
                                      e.jsx("p", {
                                        children: t.slice(splitAt + 1).trim(),
                                      }),
                                  ],
                                }),
                              ],
                            },
                            t,
                          );
                        }),
                      }),
                      selectedProposal.outro &&
                        e.jsx("p", {
                          className: "proposal-outro",
                          children: selectedProposal.outro,
                        }),
                    ],
                  })
                : e.jsxs("div", {
                className: "wrap",
                ref: o({
                  nodeId: "nc4wr5",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "div",
                  sourceLine: 237,
                  sourceColumn: 5,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: [
                  e.jsx("div", {
                    className: "section-title",
                    ref: o({
                      nodeId: "x012el",
                      componentName: "Index",
                      sourceFile: "src/routes/index.tsx?tsr-split=component",
                      tagName: "div",
                      sourceLine: 238,
                      sourceColumn: 6,
                      routeFile: "index.tsx?tsr-split=component",
                    }),
                    children: e.jsxs("div", {
                      ref: o({
                        nodeId: "tmdnfx",
                        componentName: "Index",
                        sourceFile: "src/routes/index.tsx?tsr-split=component",
                        tagName: "div",
                        sourceLine: 238,
                        sourceColumn: 37,
                        routeFile: "index.tsx?tsr-split=component",
                      }),
                      children: [
                        e.jsx("p", {
                          className: "kicker blue",
                          ref: o({
                            nodeId: "12chys",
                            componentName: "Index",
                            sourceFile:
                              "src/routes/index.tsx?tsr-split=component",
                            tagName: "p",
                            sourceLine: 238,
                            sourceColumn: 42,
                            routeFile: "index.tsx?tsr-split=component",
                          }),
                          children: "A NOSSA PROPOSTA · 2026 / 2027",
                        }),
                        e.jsx("h2", {
                          ref: o({
                            nodeId: "wyf6ty",
                            componentName: "Index",
                            sourceFile:
                              "src/routes/index.tsx?tsr-split=component",
                            tagName: "h2",
                            sourceLine: 238,
                            sourceColumn: 90,
                            routeFile: "index.tsx?tsr-split=component",
                          }),
                          children:
                            "Quatro compromissos, quatro páginas para conhecer em detalhe",
                        }),
                      ],
                    }),
                  }),
                  e.jsx("div", {
                    className: "axis-list",
                    ref: o({
                      nodeId: "ibms6k",
                      componentName: "Index",
                      sourceFile: "src/routes/index.tsx?tsr-split=component",
                      tagName: "div",
                      sourceLine: 239,
                      sourceColumn: 6,
                      routeFile: "index.tsx?tsr-split=component",
                    }),
                    children: Y.map((t, u) =>
                      e.jsxs(
                        "button",
                        {
                          type: "button",
                          className: `axis-card axis-card-link tone-${u}`,
                          onClick: () => {
                            setProposalSlug(t.slug);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          },
                          "aria-label": `Abrir a página ${t.label}`,
                          ref: o({
                            nodeId: "ku2ay4",
                            componentName: "Index",
                            sourceFile:
                              "src/routes/index.tsx?tsr-split=component",
                            tagName: "article",
                            sourceLine: 239,
                            sourceColumn: 56,
                            routeFile: "index.tsx?tsr-split=component",
                          }),
                          children: [
                            e.jsx("div", {
                              className: "axis-number",
                              ref: o({
                                nodeId: "eejlm9",
                                componentName: "Index",
                                sourceFile:
                                  "src/routes/index.tsx?tsr-split=component",
                                tagName: "div",
                                sourceLine: 239,
                                sourceColumn: 113,
                                routeFile: "index.tsx?tsr-split=component",
                              }),
                              children: t.id,
                            }),
                            e.jsxs("div", {
                              ref: o({
                                nodeId: "gcx9kh",
                                componentName: "Index",
                                sourceFile:
                                  "src/routes/index.tsx?tsr-split=component",
                                tagName: "div",
                                sourceLine: 239,
                                sourceColumn: 157,
                                routeFile: "index.tsx?tsr-split=component",
                              }),
                              children: [
                                e.jsx("h3", {
                                  ref: o({
                                    nodeId: "1r119r",
                                    componentName: "Index",
                                    sourceFile:
                                      "src/routes/index.tsx?tsr-split=component",
                                    tagName: "h3",
                                    sourceLine: 239,
                                    sourceColumn: 162,
                                    routeFile: "index.tsx?tsr-split=component",
                                  }),
                                children: t.label,
                              }),
                                e.jsx("p", {
                                  className: "axis-summary",
                                  children: t.title,
                                }),
                                e.jsx("span", {
                                  className: "axis-open",
                                  children: "Conhecer esta proposta →",
                                }),
                              ],
                            }),
                          ],
                        },
                        t.id,
                      ),
                    ),
                  }),
                ],
              }),
            }),
          s === "parceiros" &&
            e.jsx("section", {
              className: "section white page-view",
              id: "parceiros",
              ref: o({
                nodeId: "k608h",
                componentName: "Index",
                sourceFile: "src/routes/index.tsx?tsr-split=component",
                tagName: "section",
                sourceLine: 244,
                sourceColumn: 29,
                routeFile: "index.tsx?tsr-split=component",
              }),
              children: e.jsxs("div", {
                className: "wrap",
                ref: o({
                  nodeId: "msytda",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "div",
                  sourceLine: 245,
                  sourceColumn: 5,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: [
                  e.jsxs("div", {
                    className: "section-title",
                    ref: o({
                      nodeId: "xj75sg",
                      componentName: "Index",
                      sourceFile: "src/routes/index.tsx?tsr-split=component",
                      tagName: "div",
                      sourceLine: 246,
                      sourceColumn: 6,
                      routeFile: "index.tsx?tsr-split=component",
                    }),
                    children: [
                      e.jsxs("div", {
                        ref: o({
                          nodeId: "owhhli",
                          componentName: "Index",
                          sourceFile:
                            "src/routes/index.tsx?tsr-split=component",
                          tagName: "div",
                          sourceLine: 246,
                          sourceColumn: 37,
                          routeFile: "index.tsx?tsr-split=component",
                        }),
                        children: [
                          e.jsx("p", {
                            className: "kicker blue",
                            ref: o({
                              nodeId: "cnyjgv",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "p",
                              sourceLine: 246,
                              sourceColumn: 42,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: "CARTÃO DA APEE · PARCEIROS",
                          }),
                          e.jsx("h2", {
                            ref: o({
                              nodeId: "xh24lz",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "h2",
                              sourceLine: 246,
                              sourceColumn: 99,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: "Parcerias fortes, benefícios reais",
                          }),
                        ],
                      }),
                      e.jsx("p", {
                        ref: o({
                          nodeId: "xlj3u9",
                          componentName: "Index",
                          sourceFile:
                            "src/routes/index.tsx?tsr-split=component",
                          tagName: "p",
                          sourceLine: 246,
                          sourceColumn: 149,
                          routeFile: "index.tsx?tsr-split=component",
                        }),
                        children:
                          "Conheça a rede completa que preparámos para si assim que tomarmos posse.",
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className:
                      "partner-card partner-page-card centered-partner-card",
                    ref: o({
                      nodeId: "iusvkf",
                      componentName: "Index",
                      sourceFile: "src/routes/index.tsx?tsr-split=component",
                      tagName: "div",
                      sourceLine: 247,
                      sourceColumn: 6,
                      routeFile: "index.tsx?tsr-split=component",
                    }),
                    children: [
                      e.jsxs("div", {
                        className: "partner-copy",
                        ref: o({
                          nodeId: "45usr1",
                          componentName: "Index",
                          sourceFile:
                            "src/routes/index.tsx?tsr-split=component",
                          tagName: "div",
                          sourceLine: 248,
                          sourceColumn: 7,
                          routeFile: "index.tsx?tsr-split=component",
                        }),
                        children: [
                          e.jsx("span", {
                            ref: o({
                              nodeId: "1vz9rb",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "span",
                              sourceLine: 248,
                              sourceColumn: 37,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: "Cartão APEE & comércio local",
                          }),
                          e.jsx("h3", {
                            ref: o({
                              nodeId: "45dsc5",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "h3",
                              sourceLine: 248,
                              sourceColumn: 78,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: "Rede de parceiros e vantagens",
                          }),
                          e.jsx("p", {
                            ref: o({
                              nodeId: "48sikv",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "p",
                              sourceLine: 248,
                              sourceColumn: 116,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children:
                              "O Cartão da APEE permitirá identificar os membros e validar os benefícios disponibilizados pela rede de parceiros.",
                          }),
                        ],
                      }),
                      e.jsx("img", {
                        className: "partner-card-image",
                        src: "_external/d2ol7oe51mr4n9.cloudfront.net/user_3EbWYhy0t8ty8Wz9RPVrhpDHVlB/309cabd2-aa21-46c5-83bc-4bd4d4ea0224.jpg",
                        alt: "Cartão APEE e Comércio Local — Parceiros e Benefícios",
                        ref: o({
                          nodeId: "aijl9i",
                          componentName: "Index",
                          sourceFile:
                            "src/routes/index.tsx?tsr-split=component",
                          tagName: "img",
                          sourceLine: 249,
                          sourceColumn: 7,
                          routeFile: "index.tsx?tsr-split=component",
                        }),
                      }),
                    ],
                  }),
                ],
              }),
            }),
          s === "agenda" &&
            e.jsx("section", {
              className: "section white page-view",
              id: "agenda",
              ref: o({
                nodeId: "d8dcy5",
                componentName: "Index",
                sourceFile: "src/routes/index.tsx?tsr-split=component",
                tagName: "section",
                sourceLine: 254,
                sourceColumn: 26,
                routeFile: "index.tsx?tsr-split=component",
              }),
              children: e.jsxs("div", {
                className: "wrap",
                ref: o({
                  nodeId: "jeirjn",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "div",
                  sourceLine: 255,
                  sourceColumn: 5,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: [
                  e.jsxs("div", {
                    className: "section-title",
                    ref: o({
                      nodeId: "4pkoq9",
                      componentName: "Index",
                      sourceFile: "src/routes/index.tsx?tsr-split=component",
                      tagName: "div",
                      sourceLine: 256,
                      sourceColumn: 6,
                      routeFile: "index.tsx?tsr-split=component",
                    }),
                    children: [
                      e.jsxs("div", {
                        ref: o({
                          nodeId: "4zmj6x",
                          componentName: "Index",
                          sourceFile:
                            "src/routes/index.tsx?tsr-split=component",
                          tagName: "div",
                          sourceLine: 256,
                          sourceColumn: 37,
                          routeFile: "index.tsx?tsr-split=component",
                        }),
                        children: [
                          e.jsx("p", {
                            className: "kicker blue",
                            ref: o({
                              nodeId: "rcctow",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "p",
                              sourceLine: 256,
                              sourceColumn: 42,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: "AGENDA",
                          }),
                          e.jsx("h2", {
                            ref: o({
                              nodeId: "4oj8qi",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "h2",
                              sourceLine: 256,
                              sourceColumn: 79,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: "Calendário 2026 / 2027",
                          }),
                        ],
                      }),
                      e.jsx("p", {
                        ref: o({
                          nodeId: "4ryl81",
                          componentName: "Index",
                          sourceFile:
                            "src/routes/index.tsx?tsr-split=component",
                          tagName: "p",
                          sourceLine: 256,
                          sourceColumn: 117,
                          routeFile: "index.tsx?tsr-split=component",
                        }),
                        children:
                          "Oito momentos previstos ao longo do ano letivo.",
                      }),
                    ],
                  }),
                  e.jsx("div", {
                    className: "agenda-list",
                    ref: o({
                      nodeId: "9ytlhs",
                      componentName: "Index",
                      sourceFile: "src/routes/index.tsx?tsr-split=component",
                      tagName: "div",
                      sourceLine: 257,
                      sourceColumn: 6,
                      routeFile: "index.tsx?tsr-split=component",
                    }),
                    children: Q.map(([t, u, h]) =>
                      e.jsxs(
                        "article",
                        {
                          ref: o({
                            nodeId: "bf0vvv",
                            componentName: "Index",
                            sourceFile:
                              "src/routes/index.tsx?tsr-split=component",
                            tagName: "article",
                            sourceLine: 257,
                            sourceColumn: 75,
                            routeFile: "index.tsx?tsr-split=component",
                          }),
                          children: [
                            e.jsx("div", {
                              className: "month",
                              ref: o({
                                nodeId: "3su65t",
                                componentName: "Index",
                                sourceFile:
                                  "src/routes/index.tsx?tsr-split=component",
                                tagName: "div",
                                sourceLine: 257,
                                sourceColumn: 104,
                                routeFile: "index.tsx?tsr-split=component",
                              }),
                              children: t,
                            }),
                            e.jsxs("div", {
                              ref: o({
                                nodeId: "2aejf2",
                                componentName: "Index",
                                sourceFile:
                                  "src/routes/index.tsx?tsr-split=component",
                                tagName: "div",
                                sourceLine: 257,
                                sourceColumn: 140,
                                routeFile: "index.tsx?tsr-split=component",
                              }),
                              children: [
                                e.jsx("h3", {
                                  ref: o({
                                    nodeId: "muoer4",
                                    componentName: "Index",
                                    sourceFile:
                                      "src/routes/index.tsx?tsr-split=component",
                                    tagName: "h3",
                                    sourceLine: 257,
                                    sourceColumn: 145,
                                    routeFile: "index.tsx?tsr-split=component",
                                  }),
                                  children: u,
                                }),
                                e.jsx("p", {
                                  ref: o({
                                    nodeId: "9wirhh",
                                    componentName: "Index",
                                    sourceFile:
                                      "src/routes/index.tsx?tsr-split=component",
                                    tagName: "p",
                                    sourceLine: 257,
                                    sourceColumn: 161,
                                    routeFile: "index.tsx?tsr-split=component",
                                  }),
                                  children: h,
                                }),
                              ],
                            }),
                          ],
                        },
                        t + u,
                      ),
                    ),
                  }),
                ],
              }),
            }),
          s === "equipa" &&
            e.jsx("section", {
              className: "section mist page-view",
              id: "equipa",
              ref: o({
                nodeId: "5q1pq",
                componentName: "Index",
                sourceFile: "src/routes/index.tsx?tsr-split=component",
                tagName: "section",
                sourceLine: 260,
                sourceColumn: 26,
                routeFile: "index.tsx?tsr-split=component",
              }),
              children: e.jsxs("div", {
                className: "wrap",
                ref: o({
                  nodeId: "lqmmlk",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "div",
                  sourceLine: 261,
                  sourceColumn: 5,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: [
                  e.jsx("div", {
                    className: "section-title",
                    ref: o({
                      nodeId: "yljck6",
                      componentName: "Index",
                      sourceFile: "src/routes/index.tsx?tsr-split=component",
                      tagName: "div",
                      sourceLine: 262,
                      sourceColumn: 6,
                      routeFile: "index.tsx?tsr-split=component",
                    }),
                    children: e.jsxs("div", {
                      ref: o({
                        nodeId: "840c9w",
                        componentName: "Index",
                        sourceFile: "src/routes/index.tsx?tsr-split=component",
                        tagName: "div",
                        sourceLine: 262,
                        sourceColumn: 37,
                        routeFile: "index.tsx?tsr-split=component",
                      }),
                      children: [
                        e.jsx("p", {
                          className: "kicker blue",
                          ref: o({
                            nodeId: "uwjfmz",
                            componentName: "Index",
                            sourceFile:
                              "src/routes/index.tsx?tsr-split=component",
                            tagName: "p",
                            sourceLine: 262,
                            sourceColumn: 42,
                            routeFile: "index.tsx?tsr-split=component",
                          }),
                          children: "EQUIPA",
                        }),
                        e.jsx("h2", {
                          ref: o({
                            nodeId: "ykhwkf",
                            componentName: "Index",
                            sourceFile:
                              "src/routes/index.tsx?tsr-split=component",
                            tagName: "h2",
                            sourceLine: 262,
                            sourceColumn: 79,
                            routeFile: "index.tsx?tsr-split=component",
                          }),
                          children: "Os órgãos da candidatura",
                        }),
                      ],
                    }),
                  }),
                  Object.entries(K).map(([t, u]) =>
                    e.jsxs(
                      "div",
                      {
                        className: "team-block",
                        ref: o({
                          nodeId: "lli779",
                          componentName: "Index",
                          sourceFile:
                            "src/routes/index.tsx?tsr-split=component",
                          tagName: "div",
                          sourceLine: 263,
                          sourceColumn: 53,
                          routeFile: "index.tsx?tsr-split=component",
                        }),
                        children: [
                          e.jsx("h3", {
                            ref: o({
                              nodeId: "jv3v2t",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "h3",
                              sourceLine: 263,
                              sourceColumn: 93,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: t,
                          }),
                          e.jsx("div", {
                            className: "people-grid",
                            ref: o({
                              nodeId: "tgv6s1",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "div",
                              sourceLine: 263,
                              sourceColumn: 109,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: u.map(([h, C, O, k]) =>
                              e.jsxs(
                                "article",
                                {
                                  className: "person-card",
                                  ref: o({
                                    nodeId: "jb5x0",
                                    componentName: "Index",
                                    sourceFile:
                                      "src/routes/index.tsx?tsr-split=component",
                                    tagName: "article",
                                    sourceLine: 263,
                                    sourceColumn: 189,
                                    routeFile: "index.tsx?tsr-split=component",
                                  }),
                                  children: [
                                    e.jsx("span", {
                                      className: "person-photo",
                                      role: "img",
                                      "aria-label": `Fotografia de ${h}`,
                                      style: {
                                        backgroundImage: `url(${PHOTO_URLS[O]})`,
                                        backgroundPosition: "center",
                                        backgroundSize: "cover",
                                      },
                                      ref: o({
                                        nodeId: "8vb4ic",
                                        componentName: "Index",
                                        sourceFile:
                                          "src/routes/index.tsx?tsr-split=component",
                                        tagName: "span",
                                        sourceLine: 263,
                                        sourceColumn: 233,
                                        routeFile:
                                          "index.tsx?tsr-split=component",
                                      }),
                                    }),
                                    e.jsxs("div", {
                                      ref: o({
                                        nodeId: "zfj5cc",
                                        componentName: "Index",
                                        sourceFile:
                                          "src/routes/index.tsx?tsr-split=component",
                                        tagName: "div",
                                        sourceLine: 266,
                                        sourceColumn: 22,
                                        routeFile:
                                          "index.tsx?tsr-split=component",
                                      }),
                                      children: [
                                        e.jsx("strong", {
                                          ref: o({
                                            nodeId: "9hgn81",
                                            componentName: "Index",
                                            sourceFile:
                                              "src/routes/index.tsx?tsr-split=component",
                                            tagName: "strong",
                                            sourceLine: 266,
                                            sourceColumn: 27,
                                            routeFile:
                                              "index.tsx?tsr-split=component",
                                          }),
                                          children: h,
                                        }),
                                        e.jsx("small", {
                                          ref: o({
                                            nodeId: "7favu8",
                                            componentName: "Index",
                                            sourceFile:
                                              "src/routes/index.tsx?tsr-split=component",
                                            tagName: "small",
                                            sourceLine: 266,
                                            sourceColumn: 50,
                                            routeFile:
                                              "index.tsx?tsr-split=component",
                                          }),
                                          children: C,
                                        }),
                                        k &&
                                          e.jsx("em", {
                                            className: "family-line",
                                            ref: o({
                                              nodeId: "o5ijzf",
                                              componentName: "Index",
                                              sourceFile:
                                                "src/routes/index.tsx?tsr-split=component",
                                              tagName: "em",
                                              sourceLine: 266,
                                              sourceColumn: 82,
                                              routeFile:
                                                "index.tsx?tsr-split=component",
                                            }),
                                            children: k,
                                          }),
                                      ],
                                    }),
                                  ],
                                },
                                h,
                              ),
                            ),
                          }),
                        ],
                      },
                      t,
                    ),
                  ),
                ],
              }),
            }),
          !1,
          s === "contactos" &&
            e.jsx("section", {
              className: "section white page-view",
              id: "contactos",
              ref: o({
                nodeId: "430mh9",
                componentName: "Index",
                sourceFile: "src/routes/index.tsx?tsr-split=component",
                tagName: "section",
                sourceLine: 301,
                sourceColumn: 29,
                routeFile: "index.tsx?tsr-split=component",
              }),
              children: e.jsxs("div", {
                className: "wrap",
                ref: o({
                  nodeId: "ocluds",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "div",
                  sourceLine: 302,
                  sourceColumn: 5,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: [
                  e.jsx("div", {
                    className: "section-title",
                    ref: o({
                      nodeId: "9nnrke",
                      componentName: "Index",
                      sourceFile: "src/routes/index.tsx?tsr-split=component",
                      tagName: "div",
                      sourceLine: 303,
                      sourceColumn: 6,
                      routeFile: "index.tsx?tsr-split=component",
                    }),
                    children: e.jsxs("div", {
                      ref: o({
                        nodeId: "ga1v70",
                        componentName: "Index",
                        sourceFile: "src/routes/index.tsx?tsr-split=component",
                        tagName: "div",
                        sourceLine: 303,
                        sourceColumn: 37,
                        routeFile: "index.tsx?tsr-split=component",
                      }),
                      children: [
                        e.jsx("p", {
                          className: "kicker blue",
                          ref: o({
                            nodeId: "in4zjn",
                            componentName: "Index",
                            sourceFile:
                              "src/routes/index.tsx?tsr-split=component",
                            tagName: "p",
                            sourceLine: 303,
                            sourceColumn: 42,
                            routeFile: "index.tsx?tsr-split=component",
                          }),
                          children: "CONTACTOS",
                        }),
                        e.jsx("h2", {
                          ref: o({
                            nodeId: "9llac1",
                            componentName: "Index",
                            sourceFile:
                              "src/routes/index.tsx?tsr-split=component",
                            tagName: "h2",
                            sourceLine: 303,
                            sourceColumn: 95,
                            routeFile: "index.tsx?tsr-split=component",
                          }),
                          children: "Fale connosco",
                        }),
                        e.jsx("p", {
                          className: "contact-intro",
                          children:
                            "Estamos disponíveis para esclarecer dúvidas, ouvir sugestões e receber ideias. Juntos, somamos mais por uma escola melhor.",
                        }),
                        e.jsx("div", {
                          className: "contact-note",
                          children: "A sua opinião também conta!",
                        }),
                      ],
                    }),
                  }),
                  e.jsxs("div", {
                    className: "contact-grid",
                    ref: o({
                      nodeId: "50qinn",
                      componentName: "Index",
                      sourceFile: "src/routes/index.tsx?tsr-split=component",
                      tagName: "div",
                      sourceLine: 304,
                      sourceColumn: 6,
                      routeFile: "index.tsx?tsr-split=component",
                    }),
                    children: [
                      e.jsxs("article", {
                        className: "contact-card contact-email",
                        ref: o({
                          nodeId: "200aoq",
                          componentName: "Index",
                          sourceFile:
                            "src/routes/index.tsx?tsr-split=component",
                          tagName: "article",
                          sourceLine: 305,
                          sourceColumn: 7,
                          routeFile: "index.tsx?tsr-split=component",
                        }),
                        children: [
                          e.jsx("span", {
                            className: "contact-icon",
                            ref: o({
                              nodeId: "q0hy2g",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "span",
                              sourceLine: 305,
                              sourceColumn: 16,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: "@",
                          }),
                          e.jsx("small", {
                            ref: o({
                              nodeId: "4hpwqs",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "small",
                              sourceLine: 305,
                              sourceColumn: 55,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: "EMAIL",
                          }),
                          e.jsx("strong", {
                            ref: o({
                              nodeId: "8k4ksc",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "strong",
                              sourceLine: 305,
                              sourceColumn: 75,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: b,
                          }),
                          e.jsx("p", {
                            children: "Escreva-nos a qualquer momento",
                          }),
                          e.jsx("a", {
                            className: "contact-action email-action",
                            href: `mailto:${b}`,
                            ref: o({
                              nodeId: "hoyen6",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "a",
                              sourceLine: 305,
                              sourceColumn: 99,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: "✉  Enviar email",
                          }),
                        ],
                      }),
                      e.jsxs("article", {
                        className: "contact-card contact-person",
                        children: [
                          e.jsx("span", {
                            className: "contact-photo",
                            role: "img",
                            "aria-label": "Matilde Lino",
                            style: {
                              backgroundImage: `url(${PHOTO_URLS[8]})`,
                              backgroundPosition: "center",
                              backgroundSize: "cover",
                            },
                          }),
                          e.jsxs("div", {
                            className: "contact-person-copy",
                            children: [
                              e.jsxs("div", {
                                className: "contact-person-label",
                                children: [
                                  e.jsx("small", { children: "CONTACTO DIRETO" }),
                                  e.jsx("span", {
                                    className: "contact-badge",
                                    children: "PRESIDENTE",
                                  }),
                                ],
                              }),
                              e.jsx("strong", { children: "Matilde Lino" }),
                              e.jsx("a", {
                                className: "contact-phone",
                                href: "tel:+351910224272",
                                children: "☎  +351 910 224 272",
                              }),
                              e.jsx("p", {
                                children:
                                  "Disponível para esclarecer dúvidas e conversar sobre as nossas propostas.",
                              }),
                              e.jsx("a", {
                                className: "contact-action whatsapp-action",
                                href: "https://wa.me/351910224272",
                                target: "_blank",
                                rel: "noreferrer",
                                children: "◉  Enviar mensagem no WhatsApp",
                              }),
                            ],
                          }),
                        ],
                      }),
                      e.jsxs("article", {
                        className: "contact-card contact-election",
                        ref: o({
                          nodeId: "rpulut",
                          componentName: "Index",
                          sourceFile:
                            "src/routes/index.tsx?tsr-split=component",
                          tagName: "article",
                          sourceLine: 306,
                          sourceColumn: 7,
                          routeFile: "index.tsx?tsr-split=component",
                        }),
                        children: [
                          e.jsx("span", {
                            className: "contact-icon",
                            ref: o({
                              nodeId: "f4i349",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "span",
                              sourceLine: 306,
                              sourceColumn: 16,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: "A",
                          }),
                          e.jsx("small", {
                            ref: o({
                              nodeId: "18pxyb",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "small",
                              sourceLine: 306,
                              sourceColumn: 55,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: "Ato eleitoral",
                          }),
                          e.jsx("strong", {
                            ref: o({
                              nodeId: "xd4ta8",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "strong",
                              sourceLine: 306,
                              sourceColumn: 83,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: "13 de outubro · 17h30",
                          }),
                          e.jsx("p", {
                            ref: o({
                              nodeId: "yb5p5a",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "p",
                              sourceLine: 306,
                              sourceColumn: 121,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: "EB Bairro do Restelo · sala a confirmar",
                          }),
                          e.jsx("a", {
                            className: "contact-calendar",
                            href: "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Elei%C3%A7%C3%B5es%20APEE%20Bairro%20do%20Restelo&dates=20261013T163000Z%2F20261013T180000Z&location=EB%20Bairro%20do%20Restelo",
                            target: "_blank",
                            rel: "noreferrer",
                            children: "▣  Adicionar ao calendário  ›",
                          }),
                        ],
                      }),
                      e.jsxs("article", {
                        className: "contact-card contact-mandate",
                        ref: o({
                          nodeId: "dlejks",
                          componentName: "Index",
                          sourceFile:
                            "src/routes/index.tsx?tsr-split=component",
                          tagName: "article",
                          sourceLine: 307,
                          sourceColumn: 7,
                          routeFile: "index.tsx?tsr-split=component",
                        }),
                        children: [
                          e.jsx("span", {
                            className: "contact-icon",
                            ref: o({
                              nodeId: "erlxo6",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "span",
                              sourceLine: 307,
                              sourceColumn: 16,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: "i",
                          }),
                          e.jsx("small", {
                            ref: o({
                              nodeId: "20a0u6",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "small",
                              sourceLine: 307,
                              sourceColumn: 55,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: "Mandato",
                          }),
                          e.jsx("strong", {
                            ref: o({
                              nodeId: "6rnpto",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "strong",
                              sourceLine: 307,
                              sourceColumn: 77,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: "2026 / 2027",
                          }),
                          e.jsx("p", {
                            ref: o({
                              nodeId: "m1l9m3",
                              componentName: "Index",
                              sourceFile:
                                "src/routes/index.tsx?tsr-split=component",
                              tagName: "p",
                              sourceLine: 307,
                              sourceColumn: 105,
                              routeFile: "index.tsx?tsr-split=component",
                            }),
                            children: "Lista A+ · APEE Bairro do Restelo",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            }),
        ],
      }),
      e.jsx("footer", {
        className: "footer",
        ref: o({
          nodeId: "3n72ta",
          componentName: "Index",
          sourceFile: "src/routes/index.tsx?tsr-split=component",
          tagName: "footer",
          sourceLine: 313,
          sourceColumn: 3,
          routeFile: "index.tsx?tsr-split=component",
        }),
        children: e.jsxs("div", {
          className: "wrap",
          ref: o({
            nodeId: "ofjxdl",
            componentName: "Index",
            sourceFile: "src/routes/index.tsx?tsr-split=component",
            tagName: "div",
            sourceLine: 313,
            sourceColumn: 30,
            routeFile: "index.tsx?tsr-split=component",
          }),
          children: [
            e.jsxs("div", {
              className: "identity",
              ref: o({
                nodeId: "pqafta",
                componentName: "Index",
                sourceFile: "src/routes/index.tsx?tsr-split=component",
                tagName: "div",
                sourceLine: 313,
                sourceColumn: 52,
                routeFile: "index.tsx?tsr-split=component",
              }),
              children: [
                e.jsx("img", {
                  className: "footer-logo",
                  src: y,
                  alt: "APEE Bairro do Restelo · EB1 + JI",
                  ref: o({
                    nodeId: "qrojyc",
                    componentName: "Index",
                    sourceFile: "src/routes/index.tsx?tsr-split=component",
                    tagName: "img",
                    sourceLine: 313,
                    sourceColumn: 78,
                    routeFile: "index.tsx?tsr-split=component",
                  }),
                }),
                e.jsxs("span", {
                  ref: o({
                    nodeId: "z40ppp",
                    componentName: "Index",
                    sourceFile: "src/routes/index.tsx?tsr-split=component",
                    tagName: "span",
                    sourceLine: 313,
                    sourceColumn: 168,
                    routeFile: "index.tsx?tsr-split=component",
                  }),
                  children: [
                    e.jsx("strong", {
                      ref: o({
                        nodeId: "fbbup",
                        componentName: "Index",
                        sourceFile: "src/routes/index.tsx?tsr-split=component",
                        tagName: "strong",
                        sourceLine: 313,
                        sourceColumn: 174,
                        routeFile: "index.tsx?tsr-split=component",
                      }),
                      children: "Lista A+",
                    }),
                    e.jsx("small", {
                      ref: o({
                        nodeId: "hx2zz2",
                        componentName: "Index",
                        sourceFile: "src/routes/index.tsx?tsr-split=component",
                        tagName: "small",
                        sourceLine: 313,
                        sourceColumn: 199,
                        routeFile: "index.tsx?tsr-split=component",
                      }),
                      children: "Juntos, somamos mais",
                    }),
                  ],
                }),
              ],
            }),
            e.jsx("p", {
              ref: o({
                nodeId: "j46jao",
                componentName: "Index",
                sourceFile: "src/routes/index.tsx?tsr-split=component",
                tagName: "p",
                sourceLine: 313,
                sourceColumn: 248,
                routeFile: "index.tsx?tsr-split=component",
              }),
              children: "APEE Bairro do Restelo · 2026/2027",
            }),
          ],
        }),
      }),
      e.jsxs("nav", {
        className: "mobile-nav",
        "aria-label": "Navegação principal",
        ref: o({
          nodeId: "mjzyla",
          componentName: "Index",
          sourceFile: "src/routes/index.tsx?tsr-split=component",
          tagName: "nav",
          sourceLine: 315,
          sourceColumn: 3,
          routeFile: "index.tsx?tsr-split=component",
        }),
        children: [
          e.jsxs("button", {
            className: s === "inicio" ? "active" : "",
            onClick: () => x("inicio"),
            ref: o({
              nodeId: "kx14nl",
              componentName: "Index",
              sourceFile: "src/routes/index.tsx?tsr-split=component",
              tagName: "button",
              sourceLine: 316,
              sourceColumn: 4,
              routeFile: "index.tsx?tsr-split=component",
            }),
            children: [
              e.jsx("span", {
                ref: o({
                  nodeId: "q0t4vo",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "span",
                  sourceLine: 316,
                  sourceColumn: 89,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: "⌂",
              }),
              e.jsx("small", {
                ref: o({
                  nodeId: "sczcmw",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "small",
                  sourceLine: 316,
                  sourceColumn: 103,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: "Início",
              }),
            ],
          }),
          e.jsxs("button", {
            className: s === "prioridades" ? "active" : "",
            onClick: () => x("prioridades"),
            ref: o({
              nodeId: "ho15v4",
              componentName: "Index",
              sourceFile: "src/routes/index.tsx?tsr-split=component",
              tagName: "button",
              sourceLine: 317,
              sourceColumn: 4,
              routeFile: "index.tsx?tsr-split=component",
            }),
            children: [
              e.jsx("span", {
                ref: o({
                  nodeId: "tsl6j2",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "span",
                  sourceLine: 317,
                  sourceColumn: 99,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: "1",
              }),
              e.jsx("small", {
                ref: o({
                  nodeId: "t97s48",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "small",
                  sourceLine: 317,
                  sourceColumn: 113,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: "Prioridades",
              }),
            ],
          }),
          e.jsxs("button", {
            className: s === "equipa" ? "active" : "",
            onClick: () => x("equipa"),
            ref: o({
              nodeId: "ef172n",
              componentName: "Index",
              sourceFile: "src/routes/index.tsx?tsr-split=component",
              tagName: "button",
              sourceLine: 318,
              sourceColumn: 4,
              routeFile: "index.tsx?tsr-split=component",
            }),
            children: [
              e.jsx("span", {
                ref: o({
                  nodeId: "1zpbu5",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "span",
                  sourceLine: 318,
                  sourceColumn: 95,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: "E",
              }),
              e.jsx("small", {
                ref: o({
                  nodeId: "ey2tu9",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "small",
                  sourceLine: 318,
                  sourceColumn: 110,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: "Equipa",
              }),
            ],
          }),
          e.jsxs("button", {
            className: s === "contactos" ? "active" : "",
            onClick: () => x("contactos"),
            ref: o({
              nodeId: "b618a6",
              componentName: "Index",
              sourceFile: "src/routes/index.tsx?tsr-split=component",
              tagName: "button",
              sourceLine: 319,
              sourceColumn: 4,
              routeFile: "index.tsx?tsr-split=component",
            }),
            children: [
              e.jsx("span", {
                ref: o({
                  nodeId: "qd2wpb",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "span",
                  sourceLine: 319,
                  sourceColumn: 89,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: "@",
              }),
              e.jsx("small", {
                ref: o({
                  nodeId: "ojo1or",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "small",
                  sourceLine: 319,
                  sourceColumn: 103,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: "Contactos",
              }),
            ],
          }),
          e.jsxs("button", {
            onClick: () => r((t) => !t),
            ref: o({
              nodeId: "ap60uw",
              componentName: "Index",
              sourceFile: "src/routes/index.tsx?tsr-split=component",
              tagName: "button",
              sourceLine: 320,
              sourceColumn: 4,
              routeFile: "index.tsx?tsr-split=component",
            }),
            children: [
              e.jsx("span", {
                ref: o({
                  nodeId: "kc5u75",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "span",
                  sourceLine: 320,
                  sourceColumn: 49,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: "☰",
              }),
              e.jsx("small", {
                ref: o({
                  nodeId: "vsxw7c",
                  componentName: "Index",
                  sourceFile: "src/routes/index.tsx?tsr-split=component",
                  tagName: "small",
                  sourceLine: 320,
                  sourceColumn: 63,
                  routeFile: "index.tsx?tsr-split=component",
                }),
                children: "Menu",
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
export { oe as component };
