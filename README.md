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

## Deploy no Render
### Web Service
- Build: `npm install && npm run build`
- Start: `npm run start`
- Runtime: Node 20+

### Banco
- Render PostgreSQL
- Executar migrations: `npm run prisma:migrate`
- Seed opcional: `npm run prisma:seed`

## Checklist de prontidão para Render
- [ ] Variáveis de ambiente configuradas por ambiente (dev/homolog/prod)
- [ ] Serviço Supabase Auth configurado com provedores/senha
- [ ] Usuários provisionados na tabela `Usuario` com `authUserId` válido
- [ ] Migrations aplicadas no banco de produção
- [ ] Health check de login + CRUD + exportações validado
- [ ] Política de backup e retenção de banco definida
- [ ] Alertas de erro/logging conectados no ambiente de produção
