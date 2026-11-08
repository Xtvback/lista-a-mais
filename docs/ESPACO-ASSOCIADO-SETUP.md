# Espaço Associado — APEE Bairro do Restelo
**Estado: implementação em desenvolvimento; NÃO publicada.**

## Arquitetura
- Página estática `espaco-associado.html` no site existente.
- Cloudflare Worker em domínio próprio `associados-api.apeebairrodorestelo.com`.
- D1 para associados, hashes de palavras-passe, sessões e metadados.
- R2 privado para ficheiros. Nunca colocar documentação reservada no repositório público.
- Resend para mensagens de ativação/recuperação.

## Preparação antes da publicação
1. Criar recursos Cloudflare D1 e R2 numa conta controlada pela associação.
2. Executar as migrações `001` e `002`, por ordem, em D1. A segunda acrescenta controlo de versões das credenciais e limites persistentes de pedidos.
3. Configurar bindings D1 `DB` e R2 `DOCS` no Worker; configurar secrets `RESEND_API_KEY` e `SESSION_PEPPER` (valor aleatório >=32 bytes); vars `SITE_ORIGIN=https://apeebairrodorestelo.com`, `API_ORIGIN=https://associados-api.apeebairrodorestelo.com`, `MAIL_FROM` (remetente verificado).
4. Configurar rota e DNS do subdomínio API. Testar CORS, cookies, reset, expiração, recuperação e bloqueios antes de ativar a página.
5. Importar associados do sistema de inscrições depois de validar autorização e email; **não** publicar/exportar emails para GitHub.
6. Inserir metadados de documentos e carregar PDFs no R2 PRIVADO. Só publicar os que a Direção autorizar.
7. Testar com contas internas; só depois adicionar link ao menu e enviar convites.
8. Criar procedimento de cópias de segurança, retenção/apagamento e revisão de acessos RGPD.

## Segurança / limitações
- O número de associado **não é password**. Palavra-passe escolhida pelo associado.
- Não está integrado com a Sheets nem com a automatização do cartão.
- Não existe ainda painel de administração nem importação automática.
- Emails têm limite de envio do provedor e poderão exigir verificação de domínio.
- Este projeto NÃO deve ser considerado produção até que as etapas acima sejam concluídas e testadas.


## Revisão técnica de 8 de novembro de 2026

**Ainda bloqueado para publicação.** A autenticação Google foi validada no dispositivo do titular, mas a Cloudflare devolveu “Unable to sign in. Try again or use your email and password.” Não foram criados recursos nem alterados DNS, faturação, inscrições, cartões ou automatizações.

Correções preparadas na branch:
- Cookies `__Host-apee_session`, HttpOnly, Secure e sem Domain; sessão restrita ao host da API.
- Primeiro acesso/recuperação por link com token em fragmento; o frontend retira-o do endereço e guarda-o apenas em memória até à submissão. Abrir o link não consome o token.
- Palavra-passe escolhida pelo associado (15–128 caracteres), scrypt N=16384, r=8, p=5 e HMAC com secret externo à base de dados. O PBKDF2 anterior, com 310000 iterações, excedia o teto de Workers. Não existem contas de produção nem hashes a migrar neste projeto. Hashes antigos exigem recuperação, sem conversão silenciosa.
- Alteração de palavra-passe condicionada à existência de token válido no mesmo batch D1 que o elimina e revoga sessões; versões das credenciais impedem criar uma sessão a partir de uma palavra-passe acabada de substituir.
- Limites D1 atómicos por IP/email e orçamento global para recuperação (40/h, 60/dia); chaves derivadas com secret, sem IP/email em texto na tabela de contadores. Limpeza diária de tokens/contadores expirados pelo scheduled handler.
- Corpos JSON limitados a 4096 bytes antes de autenticação; respostas genéricas para email existente/desconhecido; sem detalhes internos nos erros.

### Validação realizada

`cd cloudflare && npm ci && npm test`: oito testes de integração no runtime workerd/Miniflare, com D1 e R2 locais. Testam autenticação, recuperação, consumo único, logout, revogação, associação desativada, documentação privada, origem inválida, limites de tamanho e tentativas simultâneas. O transporte Resend é intercetado localmente; **nenhum email real é enviado**.

### Pendências obrigatórias no ambiente real

- Confirmar conta Cloudflare, plano Workers Free, base D1 e bindings. O exemplo `cloudflare/wrangler.example.jsonc` contém um ID deliberadamente inválido até à criação dos recursos; não é configuração de produção.
- **Não ativar subscrição R2 nem checkout/faturação sem autorização específica.** R2 inclui uma franquia gratuita, mas exige subscrição com faturação por utilização. Manter o bucket privado e sem r2.dev/domínio público.
- Medir o consumo de CPU da criação/verificação de palavras-passe no plano Workers Free. Os testes locais não reproduzem o limite de CPU do plano. Se exceder, parar e rever a arquitetura; não reduzir a segurança nem mudar para plano pago automaticamente.
- Verificar remetente/domínio Resend e testar entrega/recuperação apenas com conta interna autorizada. Nenhum convite está autorizado.
- Inspecionar a automatização real e a folha de associados; só depois implementar/importar os dados mínimos (número, nome e email). Não alterar os cartões, os QR nem os gatilhos de envio existentes sem validar a integração. Não publicar dados pessoais, PDFs ou secrets no GitHub.
- Confirmar política para emails partilhados por várias inscrições e para revogação/alteração de email. Ainda não existe sincronização nem painel de administração.
- Testar CORS, cookies e download no domínio real (incluindo Safari/iPhone), permissões, recuperação, revogação e expiração. Só depois integrar o menu/publicar e apenas enviar convites com autorização separada.

Referências oficiais: [runtime crypto](https://developers.cloudflare.com/workers/runtime-apis/nodejs/crypto/), [limites Workers](https://developers.cloudflare.com/workers/platform/limits/), [ativação R2](https://developers.cloudflare.com/r2/get-started/).
