# Espaço Associado — APEE Bairro do Restelo

**Em preparação. Não publicado no site; envios desativados após um único teste interno autorizado. Sem R2, Resend ou ativação de faturação.**

## Arquitetura gratuita

- Workers Free serve o formulário e a API no mesmo endereço `https://apee-associados.xtvback2.workers.dev`. Cookies host-only funcionam sem depender de cookies entre o GitHub Pages e outro domínio.
- D1 guarda os associados, credenciais, sessões, PDFs e fila de emails. Cada PDF tem um limite de aplicação de 1,8 MB, abaixo do limite de 2 MB por linha D1. Nunca colocar documentos privados no GitHub público.
- Projeto Google Apps Script independente na conta APEE: lê o `Registo_Cartoes` e sincroniza número permanente, nome e email de registos com cartão enviado. Não escreve na folha nem altera cartões, QR, formulário, código ou acionadores do projeto original.
- Mensagens de primeiro acesso/recuperação são pedidas pelo próprio utilizador. Não existem convites automáticos nem envios em massa.

## Recursos confirmados

| Recurso | Identificador/estado |
| --- | --- |
| D1 principal | `apee-associados`, `20f14590-277f-4634-a77e-f48e95498aab`, jurisdição EU |
| D1 de testes | `apee-associados-testes`, `845f1be2-bd5a-457c-a1f2-f4892c665481`, jurisdição EU |
| Migrações principal | 001, 002 e 003 aplicadas e registadas em `d1_migrations` |
| Associados principal | Cinco registos, números 0001–0005, importados sem passwords ou mensagens de ativação |
| Worker principal | Código e binding D1 criados; `RELEASE_ENABLED=false`, `MAIL_DISPATCH_ENABLED=false`; workers.dev e previews desativados |
| Worker de testes | `apee-associados-testes`, conta sintética e conta interna APEE sem password; envios desativados |
| R2 | Continua desativado. Não faz parte desta solução |
| Apps Script novo | Projeto `1NuifHAN-B3W7u-fBkZhzlrUG2Ni-qM-5zSlvqSg63lz0-L-4ICu4CCAf`; Google Sheets API ativa; diagnóstico concluído com 5 associados; propriedades privadas guardadas; sem acionador nem envios |
| Limpeza diária | Cron `17 3 * * *` nos dois Workers, confirmado pela API; remove apenas tokens/contadores/fila expirados e entregas antigas |
| Apps Script dos cartões | `1qjC1RtV1yAr4mCgE1eJLGmJf9EIm9y8J7yaCs1M6jglHEnHHhmffkUqk`; consultado, sem alterações |

Os identificadores acima não são credenciais. Não guardar secrets, emails dos associados ou PDFs no repositório.

## Segurança

- Primeiro acesso por ligação enviada ao email do registo; palavra-passe escolhida pelo associado, 15–128 caracteres. O número de associado nunca é password.
- scrypt nativo (N=16384, r=8, p=5), salt individual e HMAC/pepper fora da base de dados; comparação em tempo constante. Sem redução automática do custo para caber no plano gratuito.
- Tokens aleatórios de 256 bits. D1 só guarda hashes dos tokens de sessão/recuperação. Sessões HttpOnly/Secure/SameSite=Lax, sem Domain e com prefixo `__Host-`.
- Links de recuperação expiram em 30 minutos, usam fragmento em vez de query e são retirados do endereço pelo frontend. Definir password consome o token atomicamente e revoga sessões anteriores. Versão de credenciais impede criar sessão com password acabada de substituir.
- PDFs só são devolvidos a associados ativos com sessão válida. Headers no-store/nosniff e CSP sandbox; desativar um associado bloqueia imediatamente os seus pedidos.
- CORS/origem estritos nos pedidos públicos que alteram estado, limites de tamanho JSON e contadores D1 atómicos por IP/email. Chaves de rate limit não contêm IP/email em texto.
- Recuperação limitada globalmente a 40 pedidos/h e 60/dia. Fila contém payload cifrado com AES-GCM; os links não ficam em texto simples na base de dados.
- `BRIDGE_SECRET` autoriza sincronização/entrega de emails, mas não consulta nem carrega PDFs. `ADMIN_SECRET` é separado. Guardar os secrets apenas nas configurações privadas dos serviços.
- Publicação controlada por `RELEASE_ENABLED`. Envio/levantamento da fila controlado por `MAIL_DISPATCH_ENABLED`, além do interruptor separado no Apps Script.

## Apps Script

Código em `integrations/apps-script/Code.gs` e manifesto em `appsscript.json` na mesma pasta.

Permissões declaradas: ler Google Sheets; pedidos externos; enviar email; gerir acionadores do próprio projeto. Não pede leitura da caixa de entrada nem escrita nas folhas. O código limita a leitura ao registo de cartões indicado.

A leitura usa Google Sheets REST `values:batchGet` com `FORMATTED_VALUE` (preserva 0001) e apenas os intervalos B:D e F:F. O token OAuth Google só é enviado a sheets.googleapis.com; a sincronização Cloudflare usa uma chave distinta. `SpreadsheetApp.openById` foi substituído porque exige o scope de escrita, mesmo quando usado apenas para ler. O consentimento para os quatro scopes foi concedido e Google Sheets API foi ativada após autorização explícita dos termos Google APIs. O diagnóstico real terminou com sucesso, confirmando 5 associados e permissões de email/acionadores, sem enviar mensagens nem criar acionadores nessa verificação.

As seis propriedades de ligação principal/teste estão guardadas no novo projeto, com `APEE_SEND_EMAILS=false` e filtro interno para a caixa APEE. A chave BRIDGE_SECRET principal foi renovada e configurada no Worker e no Apps Script; ADMIN_SECRET e SESSION_PEPPER foram preservados. A conectividade principal só poderá ser validada quando o endereço técnico estiver habilitado, mantendo o bloqueio de publicação até concluir os testes. A conta interna de teste existe apenas na D1 de testes e não tem password.

Propriedades privadas necessárias:

- `APEE_API_ORIGIN`: endereço do Worker principal.
- `APEE_BRIDGE_SECRET`: chave exclusiva de integração, correspondente ao Worker. Nunca usar o ADMIN_SECRET.
- `APEE_SEND_EMAILS`: manter `false` durante configuração.
- `APEE_TEST_EMAIL`: manter o endereço interno autorizado durante testes.
- `APEE_TEST_API_ORIGIN` e `APEE_TEST_BRIDGE_SECRET`: apenas para teste interno no ambiente isolado; remover quando deixar de ser necessário.

`authorizeApeeBridge` verifica permissões sem enviar mensagens nem criar acionadores. `installApeeBridge` sincroniza e cria no máximo um acionador de cinco em cinco minutos; nunca envia emails na instalação. `testApeeMail` só pode enviar à caixa da APEE e exige configuração de testes separada. Não executar teste real sem a autorização necessária.

A sincronização só transmite alterações e não redefine passwords. Emails/números em conflito exigem revisão e não são reatribuídos automaticamente. Ausência de uma linha na folha não desativa automaticamente um associado: revogações devem ser tratadas explicitamente pela Direção.

O envio para quando restam 25 destinatários de quota, preservando margem para os cartões. Regista entregas no próprio projeto para evitar reenvio se o ack falhar. Falha/crash entre entrega Gmail e registo local ainda pode produzir duplicação; não existe transação conjunta Gmail+D1. A fila usa leases de dois minutos e até cinco tentativas. Mensagens expiradas não são enviadas.

## Limites e custos

- Workers Free: 100 mil pedidos/dia e limite de CPU por invocação. A API confirmou que esta conta está no plano Free ao rejeitar limites de CPU configuráveis, que são exclusivos do plano pago. Não houve upgrade.
- D1 Free: cinco milhões de linhas lidas/dia, 100 mil escritas/dia, 5 GB por conta e 500 MB por base. A aplicação limita a sincronização a 50 associados e cada PDF a 1,8 MB.
- Google Apps Script na conta Gmail gratuita: quota de 100 destinatários/dia, partilhada com os outros scripts, incluindo cartões. Pedidos de recuperação podem ficar indisponíveis/expirar se a quota se esgotar.
- Quotas são da conta; outros projetos também as consomem. Exceder limites Free pode causar indisponibilidade, não autoriza mudar de plano ou ativar faturação.

## Validação realizada

- `npm test --prefix cloudflare`: 20 testes locais em Node/workerd/Miniflare, com D1 local e testes do módulo Apps Script através de serviços Google simulados. Incluem autenticação, primeiro acesso, replay concorrente, recuperação, revogação, estado de associado, PDFs D1, origem, tamanho, rate limiting, scopes internos, sincronização e leases da fila. O bloqueio antes de publicação foi testado. O teste adicional confirma leitura GET apenas dos intervalos necessários, separação do token Google/chave Cloudflare e interrupção da sincronização quando a leitura é recusada.
- 15 verificações de integração numa versão de testes no Cloudflare Workers Free e D1 EU isolado: definir password, login, cookie, documento privado e logout, sem emails reais.
- Oito verificações adicionais da versão com envios desativados: confirma 503 na recuperação/claim, login, PDF D1 com CSP sandbox e revogação. Sem emails reais.
- Prova sintética inicial de scrypt no Workers Free concluída com HTTP 200. O Worker temporário de runtime ficou inacessível publicamente depois do teste.
- As chamadas HTTP identificam a aplicação com User-Agent descritivo, conforme documentação Cloudflare; o cliente urllib predefinido é rejeitado com 1010 em workers.dev.
- Teste real de email autorizado em 08/11/2026: um pedido para a conta interna APEE na D1 de testes, uma tentativa de entrega confirmada e payload cifrado apagado após ack. A mensagem foi recebida na caixa APEE às 10:24 UTC; a ligação recebida abriu o formulário de definição de palavra-passe no Worker de testes e o fragmento foi removido do endereço. Envios do Worker de testes voltaram a `false` logo após a entrega. Nenhum associado recebeu mensagens.
- O seletor de funções do editor Google falhou durante o teste; foi usada uma chamada temporária à função `testApeeMail` a partir da função já selecionada. O código foi integralmente restaurado e conferido com o SHA-256 da versão no repositório (`c168538d518061aa78fbd0da19c5125974c72fdbf4c4f709509b92d755bce064`). Nenhum acionador foi criado. A introdução de uma password para esta conta interna de teste aguarda o utilizador.

## Pendências antes da publicação

1. Validar conectividade Apps Script/Worker principal e instalar o acionador de cinco em cinco minutos, quando o endereço técnico estiver disponível. Ainda não foi criado acionador no novo projeto.
2. Concluir a definição de password pela ligação já recebida na conta interna de testes; verificar consumo do token e acesso. Entrega/receção e abertura do formulário já confirmadas. A autorização abrangeu um único email interno; novos envios de teste exigem autorização específica. Nenhum convite a associados está autorizado.
3. Carregar apenas documentação identificada/aprovada, sem expor os ficheiros no repositório. PDFs acima de 1,8 MB precisam de otimização ou avaliação específica.
4. Testar a interface em Safari/iPhone, recuperação real, expiração, estado desativado e consulta dos documentos finais.
5. Só depois abrir o Worker principal, ativar o acesso e integrar o link/menu no site. A tentativa de abrir workers.dev antes desta fase foi bloqueada pela revisão automática e não foi contornada.
6. Rever acessos, cópias de segurança e retenção de dados. Limpeza diária já configurada e confirmada. Não adicionar faturação nem mudar DNS/nameservers.

Referências: [Workers](https://developers.cloudflare.com/workers/platform/limits/), [D1](https://developers.cloudflare.com/d1/platform/limits/), [Apps Script](https://developers.google.com/apps-script/guides/services/quotas).
