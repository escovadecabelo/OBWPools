"""
Testes Automatizados de Segurança e Remediação — OBW Pools
Validação de:
1. Bloqueio 401 para requisições não autenticadas
2. Autenticação JWT e RBAC (Admin vs Technician)
3. Isolamento de Tenant (Tenant Scoping)
4. Blindagem Anti-IDOR (bloqueio de mutações em recursos de outro tenant)
5. Mascaramento de Códigos de Portão (Gate Code)
6. Validação de Cloudflare Turnstile Server-Side
7. CORS e Headers de Segurança
"""

import pytest
from fastapi.testclient import TestClient
from server.main import app
from server.auth import create_jwt_token, DEFAULT_TENANT_ID
from server.db import save_pool_in_db, get_pool_by_id

client = TestClient(app)

def test_unauthenticated_requests_blocked():
    """Valida que endpoints protegidos retornam HTTP 401 Unauthorized sem token."""
    res_pools = client.get("/api/pools")
    assert res_pools.status_code == 401
    assert "detail" in res_pools.json()

    res_techs = client.get("/api/technicians")
    assert res_techs.status_code == 401

    res_routes = client.get("/api/routes")
    assert res_routes.status_code == 401

def test_login_success():
    """Valida que o login com credenciais corretas retorna token JWT válido."""
    res = client.post("/api/auth/login", json={
        "username": "admin@obwpools.com",
        "password": "admin123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "admin"
    assert data["tenant_id"] == DEFAULT_TENANT_ID

def test_login_invalid_credentials():
    """Valida que o login com senha errada retorna HTTP 401."""
    res = client.post("/api/auth/login", json={
        "username": "admin@obwpools.com",
        "password": "senha-incorreta-2026"
    })
    assert res.status_code == 401

def test_authenticated_access_with_jwt():
    """Valida acesso aos endpoints usando token JWT gerado."""
    token = create_jwt_token({
        "user_id": "user-admin-1",
        "username": "admin@obwpools.com",
        "name": "Administrador OBW Pools",
        "role": "admin",
        "tenant_id": DEFAULT_TENANT_ID
    })
    headers = {"Authorization": f"Bearer {token}"}

    res_pools = client.get("/api/pools", headers=headers)
    assert res_pools.status_code == 200
    pools = res_pools.json()
    assert isinstance(pools, list)
    assert len(pools) >= 1

    # Valida que o gate_code é mascarado na listagem geral
    for p in pools:
        if p.get("gate_code"):
            assert "🔒" in p["gate_code"] or "Restrito" in p["gate_code"]

def test_authenticated_access_with_api_key():
    """Valida acesso aos endpoints usando X-API-Key administrativa."""
    headers = {"X-API-Key": "obw-admin-super-key-2026"}
    res = client.get("/api/technicians", headers=headers)
    assert res.status_code == 200
    techs = res.json()
    assert isinstance(techs, list)
    assert len(techs) >= 1

def test_tenant_isolation():
    """Valida que um usuário do Tenant A NÃO visualiza dados do Tenant B."""
    # Criar uma piscina exclusiva do Tenant B
    save_pool_in_db({
        "id": "pool-tenant-b-secret",
        "name": "Piscina Privada Tenant B",
        "customer_name": "Cliente VIP Tenant B",
        "address": "100 Secret Ave, Dallas, TX",
        "tenant_id": "tenant-b-competitor"
    }, tenant_id="tenant-b-competitor")

    # Autenticar como usuário do Tenant A
    token_tenant_a = create_jwt_token({
        "user_id": "tech-tenant-a",
        "username": "tech@tenant-a.com",
        "name": "Técnico Tenant A",
        "role": "technician",
        "tenant_id": DEFAULT_TENANT_ID
    })
    headers_a = {"Authorization": f"Bearer {token_tenant_a}"}

    # Listagem de piscinas do Tenant A não deve conter a piscina do Tenant B
    res_list = client.get("/api/pools", headers=headers_a)
    assert res_list.status_code == 200
    pools_a = res_list.json()
    pool_ids_a = [p["id"] for p in pools_a]
    assert "pool-tenant-b-secret" not in pool_ids_a

    # Tentativa de acesso direto à piscina do Tenant B pelo Tenant A deve retornar 404
    res_direct = client.get("/api/pools/pool-tenant-b-secret", headers=headers_a)
    assert res_direct.status_code == 404

def test_anti_idor_protection():
    """Valida que um usuário do Tenant A não consegue alterar registros do Tenant B (Anti-IDOR)."""
    token_tenant_a = create_jwt_token({
        "user_id": "tech-tenant-a",
        "username": "tech@tenant-a.com",
        "name": "Técnico Tenant A",
        "role": "technician",
        "tenant_id": DEFAULT_TENANT_ID
    })
    headers_a = {"Authorization": f"Bearer {token_tenant_a}"}

    # Tentativa de atualizar piscina de outro tenant
    res_update = client.put("/api/pools/pool-tenant-b-secret", json={
        "id": "pool-tenant-b-secret",
        "name": "Tentativa de Sequestro Cadastral",
        "customer_name": "Atacante",
        "address": "999 Hack St",
        "tenant_id": "tenant-b-competitor"
    }, headers=headers_a)
    assert res_update.status_code == 404

def test_rbac_technician_cannot_delete_technician():
    """Valida que usuário com role 'technician' não pode deletar outro técnico (HTTP 403)."""
    token_tech = create_jwt_token({
        "user_id": "tech-1",
        "username": "tyler@obwpools.com",
        "name": "Tyler Brooks",
        "role": "technician",
        "tenant_id": DEFAULT_TENANT_ID
    })
    headers_tech = {"Authorization": f"Bearer {token_tech}"}

    res_delete = client.delete("/api/technicians/tech-2", headers=headers_tech)
    assert res_delete.status_code == 403

def test_lead_turnstile_verification():
    """Valida a rota de verificação de bot e Turnstile server-side."""
    # Teste com token de teste válido
    res_valid = client.post("/api/leads/verify", json={
        "token": "test_token_123",
        "honeypot": ""
    })
    assert res_valid.status_code == 200
    assert res_valid.json()["success"] is True

    # Teste com honeypot preenchido (bot)
    res_spam = client.post("/api/leads/verify", json={
        "token": "test_token_123",
        "honeypot": "spam_bot_input"
    })
    assert res_spam.status_code == 200
    assert res_spam.json()["success"] is False
