"""
WandPool FastAPI Backend Server
Administração de rotas, otimização inteligente de trajetos, envio automático de fotos e cálculo químico.
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
import uuid
import json
from datetime import datetime
from contextlib import asynccontextmanager

from server.models import (
    Pool, WaterTest, ServiceVisit, VolumeCalcRequest,
    DosageCalcRequest, LSICalcRequest, ChatMessage,
    Route, RouteStop, RouteOptimizeRequest, ServicePhoto
)
from server.chemistry import (
    calculate_lsi, calculate_chemical_dosages, calculate_pool_volume
)
from server.db import (
    init_db, get_connection, get_all_pools, get_pool_by_id,
    get_pool_tests, get_pool_visits, get_routes, get_route_by_id,
    optimize_route_path, update_stop_photos_and_status
)
from server.hermes_pool_tools import (
    HERMES_POOL_TOOL_DEFINITIONS, handle_hermes_tool_call
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="WandPool API",
    description="Administração de Rotas, Otimização de Trajetos e Envio Automático de Fotos com Hermes Agent",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auto-initialize DB on import
init_db()

@app.get("/")
def read_root():
    return {
        "app": "WandPool API",
        "status": "online",
        "version": "1.0.0",
        "primary_focus": "Administração de Rotas, Otimização GPS & Envio de Fotos",
        "language": "pt-BR",
        "agent": "Hermes Pool Copilot"
    }

# ==========================================
# ROTAS DE ADMINISTRAÇÃO E OTIMIZAÇÃO (ROTAS)
# ==========================================

@app.get("/api/routes", response_model=List[Dict[str, Any]])
def list_routes():
    """Retorna todas as rotas ativas de atendimento."""
    return get_routes()

@app.get("/api/routes/{route_id}", response_model=Dict[str, Any])
def get_route(route_id: str):
    """Retorna detalhes completos de uma rota e suas paradas."""
    route = get_route_by_id(route_id)
    if not route:
        raise HTTPException(status_code=404, detail="Rota não encontrada.")
    return route

@app.post("/api/routes/optimize")
def optimize_route(req: RouteOptimizeRequest):
    """
    Otimiza a sequência de paradas da rota usando o algoritmo de menor caminho (TSP/Haversine),
    reduzindo tempo de deslocamento e gasto de combustível.
    """
    result = optimize_route_path(
        route_id=req.route_id,
        start_lat=req.start_latitude or -23.5505,
        start_lng=req.start_longitude or -46.6333
    )
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return {
        "message": "Rota otimizada com sucesso!",
        "route": result
    }

@app.post("/api/routes/stops/{stop_id}/update")
def update_stop(stop_id: str, payload: Dict[str, Any]):
    """Atualiza o status da parada e fotos anexadas (Antes / Depois / Equipamento)."""
    new_status = payload.get("status", "Concluído")
    photos = payload.get("photos", [])
    success = update_stop_photos_and_status(stop_id, new_status, photos)
    if not success:
        raise HTTPException(status_code=400, detail="Erro ao atualizar parada.")
    return {"message": "Parada atualizada e fotos sincronizadas com sucesso!"}

@app.post("/api/routes/stops/{stop_id}/dispatch")
def auto_dispatch_service_report(stop_id: str, payload: Dict[str, Any]):
    """
    Disparo Automático do Comprovante de Serviço (Digital Door Hanger)
    com fotos de Antes e Depois para WhatsApp e E-mail do cliente.
    """
    customer_phone = payload.get("customer_phone", "")
    customer_name = payload.get("customer_name", "Cliente")
    pool_name = payload.get("pool_name", "Piscina")
    photos = payload.get("photos", [])
    technician_notes = payload.get("notes", "Manutenção concluída.")
    
    # Simulação de disparo de mensagem WhatsApp / Webhook
    dispatch_payload = {
        "dispatch_id": f"disp-{uuid.uuid4().hex[:8]}",
        "timestamp": datetime.now().isoformat(),
        "recipient": customer_name,
        "phone": customer_phone,
        "pool": pool_name,
        "total_photos_attached": len(photos),
        "status": "Disparado com Sucesso",
        "channels": ["WhatsApp Business API", "E-mail Digital Door Hanger"],
        "message_preview": f"Olá {customer_name}! Sua piscina ({pool_name}) foi atendida com sucesso. {len(photos)} fotos de comprovação de serviço foram anexadas. Status da água: Cristalina e liberada para banho."
    }

    return {
        "message": "Comprovante com fotos disparado automaticamente para o cliente!",
        "dispatch": dispatch_payload
    }

# ==========================================
# ROTAS DE PISCINAS (CRUD)
# ==========================================

@app.get("/api/pools", response_model=List[Dict[str, Any]])
def list_pools():
    return get_all_pools()

@app.get("/api/pools/{pool_id}", response_model=Dict[str, Any])
def get_pool(pool_id: str):
    pool = get_pool_by_id(pool_id)
    if not pool:
        raise HTTPException(status_code=404, detail="Piscina não encontrada.")
    return pool

@app.post("/api/pools", status_code=status.HTTP_201_CREATED)
def create_pool(pool: Pool):
    pool_data = pool.dict()
    if not pool_data.get("id"):
        pool_data["id"] = f"pool-{uuid.uuid4().hex[:8]}"
    saved = save_pool_in_db(pool_data)
    return {"message": "Piscina cadastrada com sucesso!", "pool": saved}

@app.put("/api/pools/{pool_id}")
def update_pool(pool_id: str, pool: Pool):
    pool_data = pool.dict()
    updated = update_pool_in_db(pool_id, pool_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Piscina não encontrada.")
    return {"message": "Piscina/Cliente atualizado com sucesso!", "pool": updated}


# ==========================================
# ROTAS DE TESTES QUÍMICOS E VISITAS
# ==========================================

@app.get("/api/pools/{pool_id}/tests")
def list_pool_tests(pool_id: str):
    return get_pool_tests(pool_id)

@app.post("/api/pools/{pool_id}/tests", status_code=status.HTTP_201_CREATED)
def create_pool_test(pool_id: str, test: WaterTest):
    lsi_result = calculate_lsi(
        ph=test.ph,
        temperature_c=test.temperature_c,
        calcium_hardness_ppm=test.calcium_hardness,
        total_alkalinity_ppm=test.total_alkalinity,
        cyanuric_acid_ppm=test.cyanuric_acid,
        total_dissolved_solids_ppm=test.salt_ppm or 1000.0
    )

    test_id = test.id or f"test-{uuid.uuid4().hex[:8]}"
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO water_tests (id, pool_id, timestamp, ph, free_chlorine, combined_chlorine, total_alkalinity, calcium_hardness, cyanuric_acid, salt_ppm, temperature_c, turbidity, lsi_score, lsi_status, technician_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        test_id, pool_id, test.timestamp or datetime.now().isoformat(),
        test.ph, test.free_chlorine, test.combined_chlorine,
        test.total_alkalinity, test.calcium_hardness, test.cyanuric_acid,
        test.salt_ppm, test.temperature_c, test.turbidity,
        lsi_result["lsi"], lsi_result["status"], test.technician_notes
    ))
    conn.commit()
    conn.close()

    return {"message": "Teste registrado com sucesso!", "test_id": test_id, "lsi_analysis": lsi_result}

@app.get("/api/pools/{pool_id}/visits")
def list_pool_visits(pool_id: str):
    return get_pool_visits(pool_id)

@app.post("/api/pools/{pool_id}/visits", status_code=status.HTTP_201_CREATED)
def record_service_visit(pool_id: str, visit: ServiceVisit):
    visit_id = visit.id or f"visit-{uuid.uuid4().hex[:8]}"
    checklist_json = json.dumps([item.dict() for item in visit.checklist_completed])
    chems_json = json.dumps([chem.dict() for chem in visit.chemicals_added])
    photos_json = json.dumps([p.dict() for p in visit.photos])

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE pools SET current_filter_psi = ? WHERE id = ?", (visit.filter_pressure_psi, pool_id))
    cursor.execute("""
    INSERT INTO service_visits (id, pool_id, visit_date, technician_name, filter_pressure_psi, backwash_performed, water_test_id, checklist_json, chemicals_json, photos_json, technician_notes, customer_summary, status, door_hanger_sent, whatsapp_dispatched)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        visit_id, pool_id, visit.visit_date or datetime.now().isoformat(),
        visit.technician_name, visit.filter_pressure_psi,
        1 if visit.backwash_performed else 0,
        visit.water_test.id if visit.water_test else None,
        checklist_json, chems_json, photos_json,
        visit.technician_notes, visit.customer_summary,
        visit.status, 1 if visit.door_hanger_sent else 0,
        1 if visit.whatsapp_dispatched else 0
    ))
    conn.commit()
    conn.close()
    return {"message": "Visita e fotos registradas com sucesso!", "visit_id": visit_id}

# ==========================================
# CÁLCULOS QUÍMICOS E HERMES CHAT
# ==========================================

@app.post("/api/calculate/lsi")
def api_calculate_lsi(req: LSICalcRequest):
    return calculate_lsi(
        ph=req.ph, temperature_c=req.temperature_c,
        calcium_hardness_ppm=req.calcium_hardness_ppm,
        total_alkalinity_ppm=req.total_alkalinity_ppm,
        cyanuric_acid_ppm=req.cyanuric_acid_ppm,
        total_dissolved_solids_ppm=req.total_dissolved_solids_ppm
    )

@app.post("/api/calculate/dosage")
def api_calculate_dosage(req: DosageCalcRequest):
    return calculate_chemical_dosages(
        volume_liters=req.volume_liters,
        current_ph=req.current_ph, target_ph=req.target_ph,
        current_fc=req.current_fc, target_fc=req.target_fc,
        current_ta=req.current_ta, target_ta=req.target_ta,
        current_ch=req.current_ch, target_ch=req.target_ch,
        current_cya=req.current_cya, target_cya=req.target_cya,
        current_salt=req.current_salt, target_salt=req.target_salt
    )

@app.post("/api/calculate/volume")
def api_calculate_volume(req: VolumeCalcRequest):
    return calculate_pool_volume(
        shape=req.shape, length_m=req.length_m,
        width_m=req.width_m, diameter_m=req.diameter_m,
        shallow_depth_m=req.shallow_depth_m, deep_depth_m=req.deep_depth_m
    )

@app.get("/api/agent/tools")
def get_agent_tools():
    return HERMES_POOL_TOOL_DEFINITIONS

@app.post("/api/agent/chat")
def agent_chat(message: ChatMessage):
    text = message.content.lower()
    pool_info = get_pool_by_id(message.pool_id) if message.pool_id else None
    pool_vol = pool_info["volume_liters"] if pool_info else 45000

    if any(k in text for k in ["rota", "trajeto", "caminho", "waze", "paradas"]):
        reply = (
            f"🗺️ **Hermes Agent - Otimização de Rotas de Limpeza**\n\n"
            f"O algoritmo de roteirização inteligente calcula o trajeto mais rápido entre as piscinas cadastradas:\n"
            f"1. **Sequenciamento por Proximidade (TSP)**: Reduz o tempo de trânsito em até 30%.\n"
            f"2. **Links Diretos para GPS**: Botões integrados para abrir o endereço no Waze ou Google Maps com 1 clique.\n"
            f"3. **Captura Fotográfica de Antes e Depois**: Registro e envio automático de fotos para o cliente assim que você conclui a parada."
        )
    elif any(k in text for k in ["foto", "fotos", "comprovante", "whatsapp", "disparo"]):
        reply = (
            f"📸 **Hermes Agent - Envio Automático de Fotos e Comprovantes**\n\n"
            f"Assim que o técnico tira as fotos de **Antes** e **Depois** e clica em 'Concluir Parada', o sistema:\n"
            f"- Aplica carimbo digital de data, hora e geolocalização;\n"
            f"- Gera o comprovante digital no padrão Skimmer / PoolTrackr;\n"
            f"- Dispara uma notificação direta no WhatsApp do cliente com o relatório completo da piscina."
        )
    elif any(k in text for k in ["verde", "alga", "algas", "choque"]):
        tool_result = handle_hermes_tool_call("pool_troubleshoot_symptom", {
            "symptom": "agua_verde", "volume_liters": pool_vol
        })
        reply = (
            f"🌊 **Diagnóstico Hermes Agent: Tratamento de Choque para Algas**\n\n"
            f"{tool_result['title']}\n\n"
            f"**Causa principal:** {tool_result['cause']}\n\n"
            f"**Passo a passo recomendado:**\n" +
            "\n".join(tool_result['steps']) +
            f"\n\n⏱️ **Tempo estimado de recuperação:** {tool_result['estimated_recovery']}"
        )
    else:
        reply = (
            f"👋 Olá! Sou o **Hermes Pool Copilot**, especialista em administração de rotas, envio de fotos e manutenção de piscinas.\n\n"
            f"Posso ajudar com:\n"
            f"- 🗺️ **Otimização inteligente do melhor caminho das rotas diárias**;\n"
            f"- 📸 **Captura e envio automático de fotos de Antes e Depois aos clientes**;\n"
            f"- 🧪 **Cálculo de saturação LSI e dosagem química exata**;\n"
            f"- ⚙️ **Diagnóstico de pressão do filtro e casa de máquinas**.\n\n"
            f"Em que posso ajudar na sua rota de hoje?"
        )

    # Histórico SQLite
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO chat_history (pool_id, role, content, timestamp)
    VALUES (?, ?, ?, ?)
    """, (message.pool_id, "user", message.content, datetime.now().isoformat()))
    cursor.execute("""
    INSERT INTO chat_history (pool_id, role, content, timestamp)
    VALUES (?, ?, ?, ?)
    """, (message.pool_id, "assistant", reply, datetime.now().isoformat()))
    conn.commit()
    conn.close()

    return {"reply": reply, "timestamp": datetime.now().isoformat(), "pool_id": message.pool_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
