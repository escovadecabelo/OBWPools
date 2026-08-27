# 📡 OBW Pools - REST API Reference Manual

Base URL: `http://localhost:8000` (Local) / `/api` (Proxied in Client)  
Interactive Swagger Documentation: `http://localhost:8000/docs`  
ReDoc Documentation: `http://localhost:8000/redoc`

---

## 🏊 1. Pools & Clients Endpoints

### `GET /api/pools`
Returns list of all active pools registered in the system.
- **Response**: `200 OK`
```json
[
  {
    "id": "pool-1",
    "name": "Piscina Principal Resort",
    "customer_name": "Dr. Fernando Castelo",
    "customer_phone": "(754) 235-1214",
    "customer_email": "castelo@example.com",
    "address": "4500 Legacy Dr - Frisco, TX",
    "latitude": 33.1507,
    "longitude": -96.8236,
    "gate_code": "#1984",
    "pool_type": "Residencial",
    "surface_type": "Alvenaria / Azulejo",
    "sanitizer_type": "Gerador de Sal (SWG)",
    "volume_liters": 45000,
    "volume_gallons": 11888,
    "clean_filter_psi": 12.0,
    "current_filter_psi": 14.0,
    "filter_type": "Filtro de Cartucho",
    "pump_hp": 1.5,
    "daily_run_hours": 8,
    "service_day": "Segunda-feira",
    "service_frequency": "Semanal"
  }
]
```

### `GET /api/pools/{pool_id}`
Returns details for a specific pool by ID.

### `POST /api/pools`
Registers a new pool and customer.
- **Request Body**:
```json
{
  "id": "pool-unique-uuid",
  "name": "Piscina Residencial Frisco",
  "customer_name": "Robert Miller",
  "customer_phone": "(754) 235-1214",
  "customer_email": "robert@example.com",
  "address": "7800 Stonebrook Pkwy, Frisco, TX",
  "latitude": 33.1507,
  "longitude": -96.8236,
  "gate_code": "1234",
  "pool_type": "Residencial",
  "surface_type": "Alvenaria",
  "sanitizer_type": "Gerador de Sal (SWG)",
  "volume_liters": 45000,
  "volume_gallons": 11888,
  "clean_filter_psi": 12.0,
  "current_filter_psi": 13.5,
  "filter_type": "Filtro de Areia",
  "pump_hp": 1.5,
  "daily_run_hours": 8,
  "service_day": "Segunda-feira",
  "service_frequency": "Semanal"
}
```

### `PUT /api/pools/{pool_id}`
Updates existing pool attributes.

---

## 🧪 2. Water Chemistry & Test Logs

### `GET /api/pools/{pool_id}/tests`
Retrieves chronological water chemistry tests for a pool.

### `POST /api/pools/{pool_id}/tests`
Records a new water chemistry measurement.
- **Request Body**:
```json
{
  "ph": 7.5,
  "free_chlorine": 3.0,
  "total_chlorine": 3.2,
  "combined_chlorine": 0.2,
  "total_alkalinity": 90.0,
  "calcium_hardness": 280.0,
  "cyanuric_acid": 40.0,
  "salt_ppm": 3200.0,
  "temperature_c": 26.0,
  "temperature_f": 78.8,
  "technician_notes": "Água cristalina e equilibrada."
}
```

### `POST /api/calculate/lsi`
Calculates LSI and returns diagnostic advice.
- **Request**:
```json
{
  "ph": 7.4,
  "temperature_c": 26.0,
  "calcium_hardness_ppm": 250.0,
  "total_alkalinity_ppm": 100.0,
  "cyanuric_acid_ppm": 35.0,
  "total_dissolved_solids_ppm": 1000.0
}
```
- **Response**:
```json
{
  "lsi": 0.04,
  "status_code": "balanced",
  "status_label": "Equilibrada (Ideal)",
  "corrosion_risk": "Nenhum",
  "scaling_risk": "Nenhum",
  "recommendations": "Parâmetros perfeitos para nado e conservação de equipamentos."
}
```

---

## 🗺️ 3. Routes & Logistics

### `GET /api/routes`
Returns all routes with ordered stops for each technician.

### `POST /api/routes/optimize`
Runs the Nearest-Neighbor TSP algorithm on route stops using Haversine geodesic distance.
- **Request**:
```json
{
  "route_id": "route-mon-01",
  "start_latitude": 33.1507,
  "start_longitude": -96.8236
}
```
- **Response**: Returns reordered route object with updated `order_index` (1, 2, 3... N) and recalculated arrival times.

### `POST /api/routes/stops/{stop_id}/update`
Updates status (`Pendente` ➔ `A Caminho` ➔ `Em Atendimento` ➔ `Concluído`) and attaches service photo URLs.

### `POST /api/routes/stops/{stop_id}/dispatch`
Generates and dispatches the Digital Door Hanger summary with photo links to the customer's WhatsApp/email.

---

## 🤖 4. AI Hermes Agent Tools

### `POST /api/agent/chat`
Conversational endpoint interfacing with Nous Research Hermes Agent. Supports automatic tool calling for pool diagnostics, dosage calculations, and symptom troubleshooting.
