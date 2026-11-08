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
2. Executar `migrations/001_espaco_associado.sql` em D1.
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
