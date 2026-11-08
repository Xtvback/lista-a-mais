# Espaço Associado — APEE Bairro do Restelo

**Portal ativo no endereço técnico; domínio oficial em configuração. Publicação e convites autorizados. Sincronização e emails automáticos operacionais; documentação real ainda por disponibilizar. Sem R2, Resend ou ativação de faturação.**

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
- `APEE_PUBLIC_ORIGIN`: `https://associados.apeebairrodorestelo.com` depois de o domínio estar ativo; os botões usam este endereço, mantendo o transporte interno autenticado separado.
- `APEE_INVITE_CAMPAIGN`: manter 1 até terminar o domínio. O utilizador autorizou um reenvio final; passar a 2 apenas depois de concluir e verificar a publicação. Preserva os registos antigos e envia uma vez por associado nesta campanha.
- `APEE_TEST_EMAIL`: vazio em produção; usar o endereço interno autorizado apenas durante testes, o que bloqueia convites automáticos.
- `APEE_TEST_API_ORIGIN` e `APEE_TEST_BRIDGE_SECRET`: apenas para teste interno no ambiente isolado; remover quando deixar de ser necessário.

`authorizeApeeBridge` verifica permissões sem enviar mensagens nem criar acionadores. `installApeeBridge` sincroniza e cria no máximo um acionador de cinco em cinco minutos; nunca envia emails na instalação. `testApeeMail` só pode enviar à caixa da APEE e exige configuração de testes separada. O Worker de testes mantém os envios desligados. Não executar novos testes reais sem a autorização necessária.

A sincronização só transmite alterações e não redefine passwords. Emails/números em conflito exigem revisão e não são reatribuídos automaticamente. Ausência de uma linha na folha não desativa automaticamente um associado: revogações devem ser tratadas explicitamente pela Direção.

Os pedidos de recuperação têm prioridade sobre os convites. Convites e recuperação passam a usar botões HTML, sem URLs de alojamento visíveis ou referência ao GitHub. Nomes são escapados no HTML. O envio para quando restam 25 destinatários de quota, preservando margem para os cartões. Regista entregas no próprio projeto para evitar reenvio se o ack falhar. Falha/crash entre entrega Gmail e registo local ainda pode produzir duplicação; não existe transação conjunta Gmail+D1. A fila usa leases de dois minutos e até cinco tentativas. Mensagens expiradas não são enviadas.

Convites: a lista vem dos cartões com estado Enviado e só é processada depois de a sincronização terminar sem conflitos. O projeto guarda um registo privado `APEE_INVITED_<hash de origem/número/email>` antes de tentar o envio e confirma-o como `sent` quando MailApp termina. Um envio incerto/crash fica `pending` para revisão, sem repetição automática. Quando a quota é baixa, os restantes convites aguardam o ciclo seguinte. O convite contém uma ligação permanente ao portal e instruções, sem token de autenticação ou password. Não apaga nem altera cartões ou dados da folha.

## Limites e custos

- Workers Free: 100 mil pedidos/dia e limite de CPU por invocação. A API confirmou que esta conta está no plano Free ao rejeitar limites de CPU configuráveis, que são exclusivos do plano pago. Não houve upgrade.
- D1 Free: cinco milhões de linhas lidas/dia, 100 mil escritas/dia, 5 GB por conta e 500 MB por base. A aplicação limita a sincronização a 50 associados e cada PDF a 1,8 MB.
- Google Apps Script na conta Gmail gratuita: quota de 100 destinatários/dia, partilhada com os outros scripts, incluindo cartões. Pedidos de recuperação podem ficar indisponíveis/expirar se a quota se esgotar.
- Quotas são da conta; outros projetos também as consomem. Exceder limites Free pode causar indisponibilidade, não autoriza mudar de plano ou ativar faturação.

## Validação realizada

- 27 testes em Node/workerd/Miniflare, com D1 local e serviços Google simulados: primeiro acesso, autenticação, recuperação, revogação, estado de associado, PDFs privados, limites, origem, permissões internas, sincronização, fila de email, quotas, convites, botões HTML e reenvio sem duplicação.
- 15 verificações de integração no Workers Free e D1 EU isolado, incluindo definição de password, entrada, cookies, PDF privado e saída. Oito verificações adicionais confirmaram o comportamento com envios desligados. Sem emails a associados nestes testes.
- Teste real autorizado para a caixa interna APEE: entrega recebida, definição de password pelo utilizador sem a revelar ao agente, token consumido, entrada pela interface e consulta de documento sintético. Após sair, zero sessões ativas. O ambiente de testes voltou a ter envios desligados.
- Em 08/11/2026, 20 verificações na produção confirmaram HTTPS válido no domínio oficial, portal 200/no-store e CSP, sessão anónima ausente, documentos e endpoints internos protegidos, recusa de origem alheia, credenciais inexistentes recusadas, saída segura, redirecionamento antigo e raiz/www funcionais. Nenhum email enviado por estes testes.
- Uma ligação antiga com fragmento sintético abriu o formulário de ativação no domínio oficial; o fragmento foi retirado do endereço pela página. Não foram alteradas credenciais reais.
- Interface verificada em Chrome. Safari/iPhone não foi validado neste ambiente.

## Operação e publicação

Publicação, sincronização e convites aos associados atuais e futuros foram explicitamente autorizados. Worker principal ativo; previews desligados. A integração lê o registo de cartões e possui um acionador de cinco minutos. Os cartões, QR, folha e acionadores anteriores permanecem inalterados. A D1 de produção contém oito associados ativos em 08/11/2026; as credenciais existentes foram preservadas.

Os primeiros seis convites foram enviados às 10:54 UTC, com receção confirmada pelo utilizador. O registo privado de envio passou entretanto a oito entregas confirmadas, sem pendentes. O utilizador autorizou um reenvio final após a conclusão do domínio; a campanha 2 permite esse envio uma única vez por associado, preservando todos os marcadores anteriores. Confirmar a contagem no projeto Google após a execução. Não apagar marcadores para forçar novos envios.

Não foram ativados planos pagos, faturação ou R2. O exemplo Wrangler mantém publicação e email desligados por defeito; em produção ambos estão ativos por autorização. O endereço workers.dev permanece disponível para o transporte interno autenticado e redireciona as páginas públicas para o domínio oficial.

## Domínio oficial

Zona `apeebairrodorestelo.com`, ID `341519dd095e1efcd659aedf475163f8`, no plano Free Website, preço 0, sem subscrição/faturação. Após autorização expressa no passo de gravação, os nameservers foram alterados na Namecheap para `penny.ns.cloudflare.com` e `quincy.ns.cloudflare.com`. Zona ativa desde 08/11/2026 às 11:44 UTC. Certificado Universal SSL ativo, HTTPS validado sem ignorar erros de certificado.

Foram preservados onze registos existentes: quatro A do site, www CNAME, cinco MX Namecheap e TXT SPF. Foi confirmado que não existiam encaminhamentos de email configurados na Namecheap. Acresce o registo gerido do portal. Raiz e www mantêm DNS-only, com HTTPS e redirecionamento de www para a raiz; o portal usa o Custom Domain do Worker. TLS mínimo 1.2 e SSL strict configurados.

Portal: `https://associados.apeebairrodorestelo.com/`, Custom Domain `764c52a09ebd01b9f34e5704fa4d568883b091fe`. `SITE_ORIGIN` e `PUBLIC_ORIGIN` usam este domínio. `API_ORIGIN` mantém o endereço interno anterior para o transporte autenticado. As chamadas internas não são redirecionadas; páginas públicas antigas são redirecionadas com HTTP 308.

O módulo Google foi atualizado e lido de volta, confirmando a correspondência integral com o código do repositório. `APEE_PUBLIC_ORIGIN` configurado no domínio oficial; a verificação executada no Google confirmou botão canónico e ausência de workers.dev no HTML gerado. Os emails usam botões, sem URLs técnicas no texto visível. Os três links públicos de navegação/entrada foram corrigidos; o rastreio de HTML/JS públicos não encontrou outros endereços GitHub ou workers.dev.

Não redefinir passwords nem substituir `SESSION_PEPPER` durante manutenção. As sessões antigas têm cookies limitados ao hostname anterior; o associado pode voltar a entrar no domínio oficial com a palavra-passe que já definiu.

## Documentação identificada

Foi localizada a última ata com adenda e correção de Andrea, datada de 04/11/2026, com cerca de 1,22 MB, compatível com o limite de armazenamento. Contém um anexo de presenças com emails e dados de alunos; não foi carregada nem disponibilizada. A versão de estatutos encontrada na Drive é anterior à Assembleia Geral de 30/10/2026 e não foi tratada como versão oficial final. O site atual também identifica os documentos oficiais como pendentes. O portal pode ficar preparado para receber documentos, mantendo a lista vazia até definir as versões adequadas para consulta.

## Próximos passos e manutenção

1. Confirmar o reenvio final da campanha 2 no registo privado. Definir/carregar apenas as versões de documentação para consulta, sem expor PDFs privados no repositório. A lista principal está vazia. PDFs acima de 1,8 MB precisam de otimização ou avaliação específica.
2. Interface real verificada em Chrome; Safari/iPhone não foi validado neste ambiente. Recuperação, entrada, saída, expiração, estado desativado e PDFs foram verificados nos testes descritos.
3. Rever acessos, cópias de segurança e retenção de dados. Limpeza diária configurada. Não adicionar faturação nem mudar DNS/nameservers sem instrução explícita.
4. Para suspender convites, definir APEE_SEND_INVITES=false. Para suspender todo o envio pelo módulo, APEE_SEND_EMAILS=false; MAIL_DISPATCH_ENABLED=false no Worker também impede novos pedidos de recuperação/claim. RELEASE_ENABLED=false fecha o portal público, mantendo os endpoints internos autenticados para manutenção.
5. Antes de reenviar um convite pending, confirmar a situação de entrega. Não apagar marcadores em massa: esses registos impedem convites duplicados.

Referências: [Workers](https://developers.cloudflare.com/workers/platform/limits/), [D1](https://developers.cloudflare.com/d1/platform/limits/), [Apps Script](https://developers.google.com/apps-script/guides/services/quotas).
