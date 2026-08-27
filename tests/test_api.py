import pytest
from fastapi.testclient import TestClient
from server.main import app

client = TestClient(app)

def test_api_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "WandPool API"
    assert data["language"] == "pt-BR"

def test_api_list_pools():
    response = client.get("/api/pools")
    assert response.status_code == 200
    pools = response.json()
    assert isinstance(pools, list)
    assert len(pools) >= 1

def test_api_list_routes():
    response = client.get("/api/routes")
    assert response.status_code == 200
    routes = response.json()
    assert isinstance(routes, list)
    assert len(routes) >= 1
    assert "stops" in routes[0]
    assert len(routes[0]["stops"]) >= 2

def test_api_optimize_route():
    routes_res = client.get("/api/routes")
    route_id = routes_res.json()[0]["id"]
    
    response = client.post("/api/routes/optimize", json={
        "route_id": route_id,
        "start_latitude": -23.5505,
        "start_longitude": -46.6333
    })
    assert response.status_code == 200
    data = response.json()
    assert "route" in data
    assert len(data["route"]["stops"]) >= 2
    assert data["route"]["stops"][0]["order_index"] == 1

def test_api_update_stop_and_dispatch():
    routes_res = client.get("/api/routes")
    stop = routes_res.json()[0]["stops"][0]
    stop_id = stop["stop_id"]

    # Update stop status with photo
    update_res = client.post(f"/api/routes/stops/{stop_id}/update", json={
        "status": "Concluído",
        "photos": [
            {
                "id": "test-p1",
                "photo_type": "before",
                "url": "https://example.com/before.jpg",
                "caption": "Antes",
                "timestamp": "2026-08-27T10:00:00"
            }
        ]
    })
    assert update_res.status_code == 200

    # Auto dispatch report to customer
    dispatch_res = client.post(f"/api/routes/stops/{stop_id}/dispatch", json={
        "customer_name": stop["customer_name"],
        "customer_phone": stop.get("customer_phone", "11999999999"),
        "pool_name": stop["pool_name"],
        "photos": [{"id": "test-p1", "url": "https://example.com/before.jpg"}],
        "notes": "Serviço concluído com sucesso."
    })
    assert dispatch_res.status_code == 200
    dispatch_data = dispatch_res.json()
    assert "dispatch" in dispatch_data
    assert dispatch_data["dispatch"]["recipient"] == stop["customer_name"]

def test_api_calculate_lsi():
    response = client.post("/api/calculate/lsi", json={
        "ph": 7.5,
        "temperature_c": 26,
        "calcium_hardness_ppm": 250,
        "total_alkalinity_ppm": 100,
        "cyanuric_acid_ppm": 35,
        "total_dissolved_solids_ppm": 1000
    })
    assert response.status_code == 200
    data = response.json()
    assert -0.30 <= data["lsi"] <= 0.30
    assert data["status_code"] == "balanced"

def test_api_agent_chat():
    response = client.post("/api/agent/chat", json={
        "role": "user",
        "content": "Como funciona a otimização de rota e menor caminho?"
    })
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "Hermes" in data["reply"]
