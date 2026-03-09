# Sistema Interno de Tickets de Reclamação (Marketplace)

## Stack
- Next.js + React + TypeScript
- PostgreSQL + Prisma ORM
- Supabase Auth (sessão real)
- Deploy compatível com Render (`output: standalone`)

## Arquitetura
- `src/app`: páginas e rotas API (App Router)
- `src/lib`: autenticação, RBAC, auditoria, validação, serviços, erros e logging
- `src/components`: UI por domínio (auth, dashboard, tickets, admin)
- `prisma`: schema, migrations e seed

## Segurança e autenticação
- Sessão real via Supabase (`createServerComponentClient`, `createRouteHandlerClient`, `createMiddlewareClient`).
- Middleware protege páginas e APIs sem sessão.
- Sem fallback de admin automático.
- Usuário precisa estar provisionado na tabela `Usuario` e ativo.

## Autorização
- RBAC por perfil (`ATENDENTE`, `SUPERVISOR`, `ADMIN`).
- Bloqueio de campos sensíveis no PATCH de tickets para perfis sem `ticket.update_sensitive`.
- Escopo de dados por perfil (`ATENDENTE` restrito a tickets próprios/responsável).
- Exportações e relatórios protegidos por permissões.

## Auditoria
- CREATE / UPDATE / STATUS_CHANGE / SOFT_DELETE por ticket.
- Registro por campo alterado com valor antigo/novo, usuário e timestamp.

## Banco e migrations
- `Usuario`, `Ticket`, `TicketAuditoria`
- Enums fechados de domínio
- Campos calculados persistidos: `mesReclamacao`, `anoReclamacao`, `slaStatus`
- FK de responsável (`Ticket.responsavelId -> Usuario.id`)

## Setup local
1. `cp .env.example .env`
2. Configure variáveis de Supabase e PostgreSQL
3. `npm install`
4. `npm run prisma:generate`
5. `npm run prisma:migrate:dev`
6. `npm run prisma:seed`
7. `npm run dev`

## Variáveis de ambiente
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_BASE_URL`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `GOOGLE_SHEETS_SPREADSHEET_ID`
- `GOOGLE_SHEETS_SHEET_NAME` (opcional, default `Tickets`)

## Deploy no Render
### Web Service
- Build: `npm install && npm run build`
- Start: `npm run start` (usa `node .next/standalone/server.js`)
- Runtime: Node 20+

### Banco
- Render PostgreSQL
- Executar migrations: `npm run prisma:migrate`
- Seed opcional: `npm run prisma:seed`


### Troubleshooting Render + Banco
- Se aparecer `Address not in tenant allow_list`, o banco está bloqueando o IP de saída do Render.
- Ação: incluir o(s) outbound IP(s) do serviço Render na allow-list do provedor do PostgreSQL/Supabase.
- Enquanto bloqueado, autenticação/API podem retornar `503` com mensagem de indisponibilidade do banco.

## Checklist de prontidão para Render
- [ ] Variáveis de ambiente configuradas por ambiente (dev/homolog/prod)
- [ ] Serviço Supabase Auth configurado com provedores/senha
- [ ] Usuários provisionados na tabela `Usuario` com `authUserId` válido
- [ ] Migrations aplicadas no banco de produção
- [ ] Health check de login + CRUD + exportações validado
- [ ] Política de backup e retenção de banco definida
- [ ] Alertas de erro/logging conectados no ambiente de produção


## Backup automático em Google Sheets
- A sincronização roda no backend após criar/editar/excluir logicamente ticket.
- Fluxo:
  1. Ticket é salvo no banco (fonte primária).
  2. Sistema tenta sincronizar com Google Sheets.
  3. Em sucesso: grava `backupSheetRowNumber`, `backupSyncStatus=SYNCED`, `backupLastSyncedAt`.
  4. Em falha: mantém ticket salvo e grava `backupSyncStatus=FAILED` + `backupSyncError` para rastreio.

### Configuração
1. Crie uma **Service Account** no Google Cloud com acesso à API Google Sheets.
2. Gere uma chave JSON da Service Account e use:
   - `client_email` -> `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` -> `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
3. Compartilhe a planilha com o e-mail da service account (permissão Editor).
4. Defina `GOOGLE_SHEETS_SPREADSHEET_ID` com o trecho da URL entre `/d/` e `/edit`.
5. (Opcional) Defina `GOOGLE_SHEETS_SHEET_NAME` (aba da planilha), padrão `Tickets`.

### Observações importantes
- **Não use OAuth Client ID** (`...apps.googleusercontent.com`) em `GOOGLE_SERVICE_ACCOUNT_EMAIL`; esse campo precisa ser o e-mail da service account (`...iam.gserviceaccount.com`).
- A chave privada deve ficar somente em variável de ambiente (`GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`) e nunca em arquivo versionado.
