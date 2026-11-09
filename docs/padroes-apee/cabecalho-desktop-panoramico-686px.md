# Modelo APEE — Cabeçalho fotográfico desktop panorâmico 686 px

**Aprovado:** 09-11-2026.  
**Referência:** página «Famílias», https://apeebairrodorestelo.com/familias.html  
**Código original em produção:** `proposta/site.css`, secção que começa por `/* Cabeçalho Famílias · desktop panorâmico 686px.`.  
**Versão da folha de estilos HTML:** `familias-desktop-686-20261109-v3`.

## Características obrigatórias

- Desktop (largura >= 761 px): hero com **686 px de altura**, texto verticalmente centrado e imagem panorâmica por trás.
- Fotografia com `object-fit: cover` e `object-position: center 42%`, ajustável só se necessário para uma nova fotografia.
- Névoa e desfoque do lado esquerdo (`backdrop-filter: blur(7px)`) com a direita mais nítida, e título diretamente no fundo, **sem caixa branca**.
- A versão móvel aprovada permanece **intacta**: este bloco atua apenas no desktop.
- Ao trocar a imagem, usar a fotografia original sem alterar rostos nem conteúdo. Preservar os textos, a legibilidade e as ligações.
- Rever visualmente em **desktop (1440 px)** e **móvel (390 px)** antes de confirmar a publicação.

## CSS exato aprovado

```css
/* Cabeçalho Famílias · desktop panorâmico 686px. O móvel aprovado mantém-se intacto. */
@media(min-width:761px){
  main#conteudo > .page-hero.family-photo-hero{
    height:686px;
    min-height:686px;
    padding:0;
    display:flex;
    align-items:center;
  }
  main#conteudo > .page-hero.family-photo-hero .family-photo-hero-image{
    position:absolute;
    inset:0;
    width:100%;
    height:100%;
    max-width:none;
    object-fit:cover;
    object-position:center 42%;
    aspect-ratio:auto;
  }
  main#conteudo > .page-hero.family-photo-hero .family-photo-hero-text{
    position:relative;
    z-index:2;
    width:min(460px,calc(100% - 48px));
    margin-left:max(24px,calc((100% - 1150px)/2));
    margin-right:auto;
  }
  main#conteudo > .page-hero.family-photo-hero::before{
    content:"";
    position:absolute;
    inset:0;
    z-index:1;
    background:linear-gradient(90deg,rgba(248,251,255,.97) 0%,rgba(248,251,255,.88) 20%,rgba(248,251,255,.59) 38%,rgba(248,251,255,.18) 56%,rgba(248,251,255,0) 72%);
    -webkit-backdrop-filter:blur(7px);
    backdrop-filter:blur(7px);
    -webkit-mask-image:linear-gradient(90deg,#000 0%,#000 26%,rgba(0,0,0,.63) 48%,transparent 73%);
    mask-image:linear-gradient(90deg,#000 0%,#000 26%,rgba(0,0,0,.63) 48%,transparent 73%);
  }
}
```

## Como reutilizar

Para outro cabeçalho, copiar este bloco CSS e a estrutura do hero existente, substituir os três seletores de classe `family-photo-hero`, `family-photo-hero-image` e `family-photo-hero-text` pelos nomes específicos dessa nova página, e atualizar o `src` da imagem e os textos. Não sobrescrever o estilo aprovado da página «Famílias». Se a nova fotografia precisar de posicionamento diferente, alterar apenas `object-position`, preservando o resto.

**Frase para pedir:** «Aplica o modelo APEE desktop panorâmico 686 px da página Famílias».

**Nota:** este ficheiro é documentação de referência; guardá-lo não altera o aspeto do site em produção.
