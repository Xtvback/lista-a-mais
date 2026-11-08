# Espaço Associado — APEE Bairro do Restelo

**Portal principal ativo, com publicação e convites autorizados. Sincronização e emails automáticos operacionais; documentação real ainda por disponibilizar. Sem R2, Resend ou ativação de faturação.**

## Arquitetura gratuita

- Workers Free serve o formulário e a API no mesmo endereço `https://apee-associados.xtvback2.workers.dev`. Cookies host-only funcionam sem depender de cookies entre o GitHub Pages e outro domínio.
- D1 guarda os associados, credenciais, sessões, PDFs e fila de emails. Cada PDF tem um limite de aplicação de 1,8 MB, abaixo do limite de 2 MB por linha D1. Nunca colocar documentos privados no GitHub público.
- Projeto Google Apps Script independente na conta APEE: lê o `Registo_Cartoes` e sincroniza número permanente, nome e email de registos com cartão enviado. Não escreve na folha nem altera cartões, QR, formulário, código ou acionadores do projeto original.
- Convite de boas-vindas automático, uma vez por associado, depois de o cartão constar como enviado. O convite leva ao portal, sem password ou token. A ligação para definir/recuperar a palavra-passe é pedida pelo próprio utilizador e enviada apenas ao email do registo.

## Recursos confirmados

| Recurso | Identificador/estado |
| --- | --- |
| D1 principal | `apee-associados`, `20f14590-277f-4634-a77e-f48e95498aab`, jurisdição EU |
| D1 de testes | `apee-associados-testes`, `845f1be2-bd5a-457c-a1f2-f4892c665481`, jurisdição EU |
| Migrações principal | 001, 002 e 003 aplicadas e registadas em `d1_migrations` |
| Associados principal | Seis registos, números 0001–0006, sincronizados sem passwords predefinidas; seis convites enviados após autorização |
| Worker principal | Ativo em workers.dev; `RELEASE_ENABLED=true`, `MAIL_DISPATCH_ENABLED=true`; previews desativados |
| Worker de testes | `apee-associados-testes`, conta sintética e conta interna APEE com password escolhida pelo utilizador; entrada/saída verificadas e envios desativados |
| R2 | Continua desativado. Não faz parte desta solução |
| Apps Script novo | Projeto `1NuifHAN-B3W7u-fBkZhzlrUG2Ni-qM-5zSlvqSg63lz0-L-4ICu4CCAf`; Google Sheets API ativa; um acionador apeeBridgeTick de cinco em cinco minutos; ligação principal, fila e convites verificados |
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

As propriedades de ligação principal/teste estão guardadas no novo projeto, com `APEE_SEND_EMAILS=true`, `APEE_SEND_INVITES=true` e `APEE_TEST_EMAIL` vazio em produção. A chave BRIDGE_SECRET principal foi renovada e configurada no Worker e no Apps Script; ADMIN_SECRET e SESSION_PEPPER foram preservados. A ligação principal foi verificada pelo próprio Apps Script: sincronização e levantamento da fila concluídos com sucesso. A conta interna de teste existe apenas na D1 de testes; a password foi escolhida pelo utilizador, sem ficar visível ao agente.

Propriedades privadas necessárias:

- `APEE_API_ORIGIN`: endereço do Worker principal.
- `APEE_BRIDGE_SECRET`: chave exclusiva de integração, correspondente ao Worker. Nunca usar o ADMIN_SECRET.
- `APEE_SEND_EMAILS`: `true` em produção; `false` desativa os envios pelo módulo.
- `APEE_SEND_INVITES`: `true` em produção, após autorização explícita para os associados existentes e futuros.
- `APEE_TEST_EMAIL`: vazio em produção; usar o endereço interno autorizado apenas durante testes, o que bloqueia convites automáticos.
- `APEE_TEST_API_ORIGIN` e `APEE_TEST_BRIDGE_SECRET`: apenas para teste interno no ambiente isolado; remover quando deixar de ser necessário.

`authorizeApeeBridge` verifica permissões sem enviar mensagens nem criar acionadores. `installApeeBridge` sincroniza e cria no máximo um acionador de cinco em cinco minutos; nunca envia emails na instalação. `testApeeMail` só pode enviar à caixa da APEE e exige configuração de testes separada. O Worker de testes mantém os envios desligados. Não executar novos testes reais sem a autorização necessária.

A sincronização só transmite alterações e não redefine passwords. Emails/números em conflito exigem revisão e não são reatribuídos automaticamente. Ausência de uma linha na folha não desativa automaticamente um associado: revogações devem ser tratadas explicitamente pela Direção.

Os pedidos de recuperação têm prioridade sobre os convites. O envio para quando restam 25 destinatários de quota, preservando margem para os cartões. Regista entregas no próprio projeto para evitar reenvio se o ack falhar. Falha/crash entre entrega Gmail e registo local ainda pode produzir duplicação; não existe transação conjunta Gmail+D1. A fila usa leases de dois minutos e até cinco tentativas. Mensagens expiradas não são enviadas.

Convites: a lista vem dos cartões com estado Enviado e só é processada depois de a sincronização terminar sem conflitos. O projeto guarda um registo privado `APEE_INVITED_<hash de origem/número/email>` antes de tentar o envio e confirma-o como `sent` quando MailApp termina. Um envio incerto/crash fica `pending` para revisão, sem repetição automática. Quando a quota é baixa, os restantes convites aguardam o ciclo seguinte. O convite contém uma ligação permanente ao portal e instruções, sem token de autenticação ou password. Não apaga nem altera cartões ou dados da folha.

## Limites e custos

- Workers Free: 100 mil pedidos/dia e limite de CPU por invocação. A API confirmou que esta conta está no plano Free ao rejeitar limites de CPU configuráveis, que são exclusivos do plano pago. Não houve upgrade.
- D1 Free: cinco milhões de linhas lidas/dia, 100 mil escritas/dia, 5 GB por conta e 500 MB por base. A aplicação limita a sincronização a 50 associados e cada PDF a 1,8 MB.
- Google Apps Script na conta Gmail gratuita: quota de 100 destinatários/dia, partilhada com os outros scripts, incluindo cartões. Pedidos de recuperação podem ficar indisponíveis/expirar se a quota se esgotar.
- Quotas são da conta; outros projetos também as consomem. Exceder limites Free pode causar indisponibilidade, não autoriza mudar de plano ou ativar faturação.

## Validação realizada

- `npm test --prefix cloudflare`: 24 testes locais em Node/workerd/Miniflare, com D1 local e testes do módulo Apps Script através de serviços Google simulados. Incluem autenticação, primeiro acesso, replay concorrente, recuperação, revogação, estado de associado, PDFs D1, origem, tamanho, rate limiting, scopes internos, sincronização e leases da fila. O bloqueio antes de publicação foi testado. Incluem também leitura apenas dos intervalos necessários, separação do token Google/chave Cloudflare, interrupção da sincronização quando a leitura é recusada e quatro casos de convites: envio único e novos associados, quota/reserva para cartões, ativação explícita/ambiente e entrega incerta sem duplicação automática.
- 15 verificações de integração numa versão de testes no Cloudflare Workers Free e D1 EU isolado: definir password, login, cookie, documento privado e logout, sem emails reais.
- Oito verificações adicionais da versão com envios desativados: confirma 503 na recuperação/claim, login, PDF D1 com CSP sandbox e revogação. Sem emails reais.
- Prova sintética inicial de scrypt no Workers Free concluída com HTTP 200. O Worker temporário de runtime ficou inacessível publicamente depois do teste.
- As chamadas HTTP identificam a aplicação com User-Agent descritivo, conforme documentação Cloudflare; o cliente urllib predefinido é rejeitado com 1010 em workers.dev.
- Teste real de email autorizado em 08/11/2026: um pedido para a conta interna APEE na D1 de testes, uma tentativa de entrega confirmada e payload cifrado apagado após ack. A mensagem foi recebida na caixa APEE às 10:24 UTC; a ligação recebida abriu o formulário de definição de palavra-passe no Worker de testes e o fragmento foi removido do endereço. Envios do Worker de testes voltaram a `false` logo após a entrega. Nesse teste não foram enviadas mensagens aos associados.
- O seletor de funções do editor Google falhou durante o teste; foi usada uma chamada temporária à função `testApeeMail` a partir da função já selecionada. O código foi integralmente restaurado e conferido com o SHA-256 da versão no repositório (`c168538d518061aa78fbd0da19c5125974c72fdbf4c4f709509b92d755bce064`). Não foi criado acionador durante esse teste; o acionador definitivo foi instalado depois, com autorização de publicação.
- O utilizador definiu a password pela ligação recebida. A interface confirmou o sucesso; a D1 confirmou `credential_version=1`, password presente e zero tokens de recuperação. A entrada foi feita através do formulário seguro, mostrou a área reservada e o documento sintético; após sair, a D1 confirmou zero sessões ativas. A password não foi lida pelo agente. Corrigida também a mensagem após sair e a limpeza do campo de nova password depois de uma definição bem-sucedida; sintaxe e versão servida verificadas.
- Menu/rodapé e página de entrada apontam para o Worker principal; esta alteração acompanha a publicação do PR.
- Produção: cinco verificações HTTP confirmaram portal 200/no-store, ausência de sessão anónima, listagem/download de documentos protegidos e endpoint interno sem acesso anónimo.
- Sincronização real integrou o sexto associado do registo, preservando os anteriores e sem definir passwords. Um acionador de cinco minutos foi instalado; a fila principal foi consultada com sucesso.
- Após autorização para enviar e automatizar convites, MailApp confirmou seis envios e zero entregas pendentes em 08/11/2026 às 10:54 UTC. O utilizador confirmou receção. O módulo definitivo foi restaurado após a configuração e coincide com o código versionado.

## Operação e publicação

A publicação e a sincronização foram explicitamente autorizadas em 08/11/2026. Worker principal ativo, previews desligados; entrega de acesso/recuperação ativa apenas para pedidos recebidos. O utilizador autorizou depois o envio dos convites aos associados atuais e o envio automático aos próximos; o interruptor separado APEE_SEND_INVITES está ativo. Não foram ativados planos pagos, faturação ou R2.

## Documentação identificada

Foi localizada a última ata com adenda e correção de Andrea, datada de 04/11/2026, com cerca de 1,22 MB, compatível com o limite de armazenamento. Contém um anexo de presenças com emails e dados de alunos; não foi carregada nem disponibilizada. A versão de estatutos encontrada na Drive é anterior à Assembleia Geral de 30/10/2026 e não foi tratada como versão oficial final. O site atual também identifica os documentos oficiais como pendentes. O portal pode ficar preparado para receber documentos, mantendo a lista vazia até definir as versões adequadas para consulta.

## Próximos passos e manutenção

1. Definir/carregar apenas as versões de documentação para consulta, sem expor PDFs privados no repositório. A lista principal está vazia. PDFs acima de 1,8 MB precisam de otimização ou avaliação específica.
2. Interface real verificada em Chrome; Safari/iPhone não foi validado neste ambiente. Recuperação, entrada, saída, expiração, estado desativado e PDFs foram verificados nos testes descritos.
3. Rever acessos, cópias de segurança e retenção de dados. Limpeza diária configurada. Não adicionar faturação nem mudar DNS/nameservers sem instrução explícita.
4. Para suspender convites, definir APEE_SEND_INVITES=false. Para suspender todo o envio pelo módulo, APEE_SEND_EMAILS=false; MAIL_DISPATCH_ENABLED=false no Worker também impede novos pedidos de recuperação/claim. RELEASE_ENABLED=false fecha o portal público, mantendo os endpoints internos autenticados para manutenção.
5. Antes de reenviar um convite pending, confirmar a situação de entrega. Não apagar marcadores em massa: esses registos impedem convites duplicados.

Referências: [Workers](https://developers.cloudflare.com/workers/platform/limits/), [D1](https://developers.cloudflare.com/d1/platform/limits/), [Apps Script](https://developers.google.com/apps-script/guides/services/quotas).
