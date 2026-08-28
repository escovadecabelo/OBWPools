# Plano de Remediação de Segurança — OBW Pools

Este plano estabelece a implementação técnica completa para sanar **todos os 10 achados de segurança** identificados na auditoria do projeto OBW Pools, abrangendo as cinco categorias críticas: **Banco Sem Tranca (Isolamento de Tenant)**, **Permissão no Navegador (RBAC no Backend)**, **IDOR (Controle de Acesso por Objeto)**, **Chaves/Credenciais Expostas** e **Inputs/Sanitização de URLs**.

---

## User Review Required

> [!IMPORTANT]
> **Autenticação no Backend:** Será introduzido um módulo `server/auth.py` com suporte a JWT (`HS256`) e API Key (`X-API-Key`).
> Para garantir retrocompatibilidade com o modo de desenvolvimento local e aplicativo mobile offline, o sistema incluirá contas padrão pré-configuradas (Admin e Técnico) e token de fallback gerenciado no `localStorage` do frontend.

> [!WARNING]
> **Sanitização de Dados Sensíveis:** Todos os códigos reais de acesso físico (`gate_code`) e dados de demonstração serão anonimizados e substituídos por dados sintéticos seguros (mock data) tanto no backend quanto nos fallbacks estáticos do frontend.

---

## Proposed Changes

### 1. Camada de Autenticação, RBAC e Segurança da API (FastAPI)

#### [NEW] [server/auth.py](file:///c:/ai-project/OBWPools/server/auth.py)
- Criação de funções para geração e validação de tokens JWT (`python-jose` / `jwt` / `hashlib`/`hmac` seguro embutido).
- Dependências FastAPI:
  - `get_current_user`: extrai e valida o token Bearer ou chave de API, retornando o usuário autenticado (`user_id`, `role`, `tenant_id`).
  - `require_admin`: garante que apenas usuários com `role == "admin"` acessem operações destrutivas ou de gerenciamento de equipe.
- Endpoint de login: `POST /api/auth/login` aceitando credenciais e retornando o token JWT.
- Endpoint de perfil: `GET /api/auth/me`.

#### [MODIFY] [server/main.py](file:///c:/ai-project/OBWPools/server/main.py)
- Restrição do middleware CORS: substituição de `allow_origins=["*"]` por origens explícitas seguras (localhost, domínios de produção, esquemas Capacitor `capacitor://localhost`).
- Proteção de todos os 14 endpoints de CRUD e mutação com `Depends(get_current_user)` e `Depends(require_admin)` nas rotas de técnicos e configuração.
- Validação de inicialização no lifespan do FastAPI para verificar variáveis de ambiente obrigatórias (`JWT_SECRET`, `ALLOWED_ORIGINS`).

---

### 2. Isolamento de Tenant e Prevenção de IDOR no Banco de Dados (SQLite)

#### [MODIFY] [server/db.py](file:///c:/ai-project/OBWPools/server/db.py)
- Adição da coluna `tenant_id TEXT DEFAULT 'default-org'` nas tabelas `pools`, `technicians`, `routes`, `route_stops`, `water_tests`, `service_visits`.
- Atualização das funções de consulta (`get_all_pools`, `get_routes`, `get_all_technicians`) para filtrar obrigatoriamente por `tenant_id = ?`.
- Ocultação do campo `gate_code` em listagens gerais públicas, liberando-o apenas em consultas detalhadas autenticadas.
- Validação de propriedade (Anti-IDOR) em `update_pool_in_db`, `delete_technician_from_db`, `remove_stop_from_route` e `reassign_stop_to_route`, garantindo que um chamador só possa alterar recursos do seu próprio `tenant_id`.
- Substituição dos códigos reais de portão no `seed_pools_data` por códigos sintéticos seguros.

#### [MODIFY] [server/models.py](file:///c:/ai-project/OBWPools/server/models.py)
- Inclusão dos campos opcionais `tenant_id` e `created_by` nos schemas Pydantic de `Pool`, `Route`, `Technician`.
- Criação dos schemas `LoginRequest`, `LoginResponse` e `TokenData`.

---

### 3. Validação de Bots Server-Side (Cloudflare Turnstile)

#### [NEW] [server/lead_verification.py](file:///c:/ai-project/OBWPools/server/lead_verification.py)
- Função para validação do token do Cloudflare Turnstile no servidor via `https://challenges.cloudflare.com/turnstile/v0/siteverify` com suporte a bypass seguro para chaves de teste (`1x00000000000000000000AA`).
- Endpoint `POST /api/leads/verify` no FastAPI.

---

### 4. Higienização e Segurança no Frontend (React + TypeScript)

#### [NEW] [client/src/lib/security.ts](file:///c:/ai-project/OBWPools/client/src/lib/security.ts)
- Utilitário de sanitização de URLs externas (`sanitizeWhatsAppUrl`, `sanitizeMapsUrl`, `safeOpenUrl`) garantindo esquemas `https:` e prevenindo `javascript:` ou injeção de parâmetros maliciosos.

#### [MODIFY] [client/src/lib/api.ts](file:///c:/ai-project/OBWPools/client/src/lib/api.ts)
- Injeção automática do cabeçalho `Authorization: Bearer <token>` em todas as chamadas `fastFetch`.
- Anonimização de todos os fallbacks estáticos em `getFallbackPools()`, `getFallbackRoutes()` e `getFallbackTechnicians()`, removendo telefones e códigos de portão reais.

#### [MODIFY] [client/src/components/ServiceChecklist.tsx](file:///c:/ai-project/OBWPools/client/src/components/ServiceChecklist.tsx), [CustomerManager.tsx](file:///c:/ai-project/OBWPools/client/src/components/CustomerManager.tsx), [BillingManager.tsx](file:///c:/ai-project/OBWPools/client/src/components/BillingManager.tsx), [WorkOrderManager.tsx](file:///c:/ai-project/OBWPools/client/src/components/WorkOrderManager.tsx), [PoolHistoryModal.tsx](file:///c:/ai-project/OBWPools/client/src/components/PoolHistoryModal.tsx)
- Utilização de `safeOpenUrl` e sanitizadores de WhatsApp e Google Maps em todas as chamadas `window.open`.

#### [MODIFY] [.gitignore](file:///c:/ai-project/OBWPools/.gitignore)
- Adição de regras para ignorar arquivos de variáveis locais e segredos (`.env*.local`, `*.pem`, `*.key`).

---

## Verification Plan

### Automated Tests
1. **Testes Unitários e de Integração de Segurança (Pytest):**
   - Executar `pytest tests/test_security_remediation.py -v`
   - Validar:
     - Bloqueio HTTP 401 em endpoints não autenticados (`/api/pools`, `/api/technicians`, `/api/routes`).
     - Login com sucesso gerando JWT válido.
     - Isolamento de Tenant (Tenant A não consegue visualizar nem alterar piscinas do Tenant B).
     - Proteção contra IDOR (rejeição de alteração/exclusão de registros de outro tenant).
     - Validação de Turnstile e CORS seguro.
2. **Testes do Frontend (TypeScript):**
   - Executar `npm --prefix client run lint` e `npx oxlint` para validar tipos e sanitização de código.

### Manual Verification
- Testar a navegação no cliente React, autenticação no portal e verificação de que nenhuma requisição falha indevidamente.
- Reexecutar o script `docs/security-audit/generate_audit_report.py` para conferir a integridade do ambiente.
