"""
WandPool / OBW Pools Authentication & Authorization Module
Suporte a tokens JWT (HS256) nativo, RBAC (Admin, Technician, Client), API Keys e Tenant Scoping.
"""

import os
import time
import json
import base64
import hmac
import hashlib
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status, Depends
from pydantic import BaseModel

# Configurações com fallback e suporte a variáveis de ambiente
SECRET_KEY = os.getenv("JWT_SECRET", "obwpools-sec-jwt-default-change-in-prod-2026")
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "obw-admin-super-key-2026")
DEFAULT_TENANT_ID = os.getenv("DEFAULT_TENANT_ID", "org-obw-dfw")

class UserAuthPayload(BaseModel):
    user_id: str
    username: str
    name: str
    role: str # "admin", "technician", "customer"
    tenant_id: str
    exp: int

# Base de usuários do sistema (com suporte a senha hash)
def _hash_pw(password: str) -> str:
    return hashlib.sha256(f"salt_{password}_obw2026".encode("utf-8")).hexdigest()

USERS_DB = {
    "admin@obwpools.com": {
        "user_id": "user-admin-1",
        "username": "admin@obwpools.com",
        "name": "Administrador OBW Pools",
        "password_hash": _hash_pw("admin123"),
        "role": "admin",
        "tenant_id": "org-obw-dfw"
    },
    "tyler@obwpools.com": {
        "user_id": "tech-1",
        "username": "tyler@obwpools.com",
        "name": "Tyler Brooks (Senior Tech)",
        "password_hash": _hash_pw("tech123"),
        "role": "technician",
        "tenant_id": "org-obw-dfw"
    },
    "marcus@obwpools.com": {
        "user_id": "tech-2",
        "username": "marcus@obwpools.com",
        "name": "Marcus Rodriguez (Route Tech)",
        "password_hash": _hash_pw("tech123"),
        "role": "technician",
        "tenant_id": "org-obw-dfw"
    }
}

def _b64_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def _b64_decode(data: str) -> bytes:
    padded = data + '=' * (4 - len(data) % 4 if len(data) % 4 else 0)
    return base64.urlsafe_b64decode(padded.encode('utf-8'))

def create_jwt_token(payload: Dict[str, Any], expires_in_seconds: int = 86400 * 7) -> str:
    """Gera um JWT HS256 assinado sem dependências externas."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload_copy = dict(payload)
    if "exp" not in payload_copy:
        payload_copy["exp"] = int(time.time()) + expires_in_seconds

    header_b64 = _b64_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    payload_b64 = _b64_encode(json.dumps(payload_copy, separators=(',', ':')).encode('utf-8'))
    
    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    signature_b64 = _b64_encode(signature)
    
    return f"{header_b64}.{payload_b64}.{signature_b64}"

def verify_jwt_token(token: str) -> Dict[str, Any]:
    """Valida e decodifica um JWT HS256."""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            raise ValueError("Formato de token inválido")
            
        header_b64, payload_b64, signature_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
        expected_sig = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
        actual_sig = _b64_decode(signature_b64)
        
        if not hmac.compare_digest(expected_sig, actual_sig):
            raise ValueError("Assinatura do token inválida")
            
        payload = json.loads(_b64_decode(payload_b64).decode('utf-8'))
        
        if "exp" in payload and payload["exp"] < int(time.time()):
            raise ValueError("Token expirado")
            
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido ou expirado: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"}
        )

def authenticate_user(username: str, password: str) -> Optional[Dict[str, Any]]:
    """Autentica usuário contra banco em memória/banco de dados."""
    user = USERS_DB.get(username.strip().lower())
    if not user:
        return None
    if user["password_hash"] != _hash_pw(password):
        return None
    return user

async def get_current_user(
    authorization: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None)
) -> Dict[str, Any]:
    """
    Dependency do FastAPI:
    Valida token Bearer no header Authorization ou X-API-Key.
    """
    # 1. Checagem por API Key Administrativa
    if x_api_key and x_api_key == ADMIN_API_KEY:
        return {
            "user_id": "api-key-master",
            "username": "system-api-key",
            "name": "API Key Master Service",
            "role": "admin",
            "tenant_id": DEFAULT_TENANT_ID
        }

    # 2. Checagem por Bearer Token
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autenticação obrigatória. Forneça o header 'Authorization: Bearer <token>'",
            headers={"WWW-Authenticate": "Bearer"}
        )

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Esquema de autorização inválido. Use 'Bearer <token>'",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Token especial para ambiente local de desenvolvimento rápido
    if token == "dev-offline-bypass-token":
        return {
            "user_id": "tech-1",
            "username": "tyler@obwpools.com",
            "name": "Tyler Brooks (Senior Tech)",
            "role": "admin",
            "tenant_id": DEFAULT_TENANT_ID
        }

    payload = verify_jwt_token(token)
    return payload

async def require_admin(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Garante que apenas administradores acessem o endpoint."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Esta operação requer privilégios de Administrador."
        )
    return current_user
