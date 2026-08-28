"""
WandPool SQLite Database Layer
Administração de rotas, otimização de trajeto, cadastro de piscinas, comprovantes digitais e fotos.
Camada de segurança: Multi-tenant Scoping, Blindagem Anti-IDOR e Proteção de Gate Codes.
"""

import sqlite3
import json
import os
import math
from typing import List, Dict, Any, Optional
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "wandpool.db")
DEFAULT_TENANT_ID = os.getenv("DEFAULT_TENANT_ID", "org-obw-dfw")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Tabela de Piscinas / Clientes com Latitude, Longitude e Tenant
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pools (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT,
        customer_email TEXT,
        address TEXT NOT NULL,
        latitude REAL DEFAULT 32.7767,
        longitude REAL DEFAULT -96.7970,
        gate_code TEXT,
        pool_type TEXT DEFAULT 'Residencial',
        surface_type TEXT DEFAULT 'Alvenaria / Azulejo',
        sanitizer_type TEXT DEFAULT 'Cloro Tradicional',
        volume_liters INTEGER DEFAULT 45000,
        volume_gallons INTEGER DEFAULT 11888,
        clean_filter_psi REAL DEFAULT 12.0,
        current_filter_psi REAL DEFAULT 14.0,
        filter_type TEXT DEFAULT 'Filtro de Areia',
        pump_hp REAL DEFAULT 1.0,
        daily_run_hours INTEGER DEFAULT 6,
        service_day TEXT DEFAULT 'Segunda-feira',
        service_frequency TEXT DEFAULT 'Semanal',
        target_params TEXT,
        tenant_id TEXT DEFAULT 'org-obw-dfw',
        created_at TEXT
    )
    """)

    # Tabela de Técnicos / Funcionários (Technicians)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS technicians (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        avatar_url TEXT,
        role TEXT DEFAULT 'Técnico de Rotas',
        tenant_id TEXT DEFAULT 'org-obw-dfw',
        created_at TEXT
    )
    """)

    # Tabela de Rotas de Atendimento (Route Management)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS routes (
        id TEXT PRIMARY KEY,
        technician_id TEXT,
        technician_name TEXT NOT NULL,
        technician_phone TEXT,
        day_of_week TEXT NOT NULL,
        date TEXT NOT NULL,
        total_stops INTEGER DEFAULT 0,
        completed_stops INTEGER DEFAULT 0,
        total_distance_km REAL DEFAULT 0.0,
        estimated_travel_time_min INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Em Andamento',
        tenant_id TEXT DEFAULT 'org-obw-dfw',
        created_at TEXT
    )
    """)

    # Tabela de Paradas da Rota (Route Stops)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS route_stops (
        stop_id TEXT PRIMARY KEY,
        route_id TEXT NOT NULL,
        pool_id TEXT NOT NULL,
        pool_name TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT,
        address TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        order_index INTEGER NOT NULL,
        scheduled_time TEXT,
        estimated_duration_min INTEGER DEFAULT 45,
        status TEXT DEFAULT 'Pendente',
        completed_at TEXT,
        photos_json TEXT,
        water_test_summary TEXT,
        chemicals_summary TEXT,
        tenant_id TEXT DEFAULT 'org-obw-dfw',
        FOREIGN KEY (route_id) REFERENCES routes (id),
        FOREIGN KEY (pool_id) REFERENCES pools (id)
    )
    """)

    # Tabela de Testes Químicos da Água
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS water_tests (
        id TEXT PRIMARY KEY,
        pool_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        ph REAL NOT NULL,
        free_chlorine REAL NOT NULL,
        combined_chlorine REAL DEFAULT 0.0,
        total_alkalinity REAL NOT NULL,
        calcium_hardness REAL DEFAULT 250.0,
        cyanuric_acid REAL DEFAULT 30.0,
        salt_ppm REAL DEFAULT 0.0,
        temperature_c REAL DEFAULT 26.0,
        turbidity TEXT DEFAULT 'Cristalina',
        lsi_score REAL,
        lsi_status TEXT,
        technician_notes TEXT,
        tenant_id TEXT DEFAULT 'org-obw-dfw',
        FOREIGN KEY (pool_id) REFERENCES pools (id)
    )
    """)

    # Tabela de Visitas Técnicas com Fotos e Disparo Automático
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS service_visits (
        id TEXT PRIMARY KEY,
        pool_id TEXT NOT NULL,
        visit_date TEXT NOT NULL,
        technician_name TEXT NOT NULL,
        filter_pressure_psi REAL,
        backwash_performed INTEGER DEFAULT 0,
        water_test_id TEXT,
        checklist_json TEXT,
        chemicals_json TEXT,
        photos_json TEXT,
        technician_notes TEXT,
        customer_summary TEXT,
        status TEXT DEFAULT 'Concluído',
        door_hanger_sent INTEGER DEFAULT 1,
        whatsapp_dispatched INTEGER DEFAULT 1,
        tenant_id TEXT DEFAULT 'org-obw-dfw',
        FOREIGN KEY (pool_id) REFERENCES pools (id)
    )
    """)

    # Tabela de Histórico de Conversas com o Hermes Agent
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pool_id TEXT,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        tenant_id TEXT DEFAULT 'org-obw-dfw',
        timestamp TEXT NOT NULL
    )
    """)

    # Migrações automáticas para bancos existentes (garantir tenant_id)
    tables = ['pools', 'technicians', 'routes', 'route_stops', 'water_tests', 'service_visits', 'chat_history']
    for table in tables:
        try:
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN tenant_id TEXT DEFAULT 'org-obw-dfw'")
        except sqlite3.OperationalError:
            pass # Coluna já existe

    conn.commit()

    # Seed se o banco estiver vazio
    cursor.execute("SELECT COUNT(*) as count FROM pools")
    if cursor.fetchone()["count"] == 0:
        seed_pools_data(cursor)
        conn.commit()

    cursor.execute("SELECT COUNT(*) as count FROM routes")
    if cursor.fetchone()["count"] == 0:
        seed_routes_data(cursor)
        conn.commit()

    conn.close()

def seed_data(cursor):
    seed_pools_data(cursor)
    seed_routes_data(cursor)

def seed_pools_data(cursor):
    now = datetime.now().isoformat()

    # Dados anonimizados e seguros (Mocks Sintéticos para demonstração segura)
    # 1. Frisco - Stonebriar Creek Residence (Residencial)
    target_1 = json.dumps({
        "target_ph": 7.5, "target_fc": 3.5, "target_ta": 90.0, "target_ch": 280.0, "target_cya": 70.0, "target_salt": 3200.0
    })
    cursor.execute("""
    INSERT OR REPLACE INTO pools (id, name, customer_name, customer_phone, customer_email, address, latitude, longitude, gate_code, pool_type, surface_type, sanitizer_type, volume_liters, volume_gallons, clean_filter_psi, current_filter_psi, filter_type, pump_hp, daily_run_hours, service_day, service_frequency, target_params, tenant_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "pool-1",
        "Stonebriar Creek Residence - Infinity Pool",
        "David & Sarah Harrison",
        "(214) 555-0142",
        "dharrison@dfwhomes.net",
        "5420 Stonebriar Dr, Frisco, TX 75034",
        33.1250,
        -96.8250,
        "MOCK-GATE-#1001",
        "Residencial",
        "PebbleTec / Pastilha",
        "Gerador de Sal (SWG)",
        70000,
        18500,
        12.0,
        18.5,
        "Filtro de Cartucho Quad",
        2.5,
        8,
        "Segunda-feira",
        "Semanal",
        target_1,
        DEFAULT_TENANT_ID,
        now
    ))

    # 2. Highland Park, Dallas - Condomínio / HOA Lap Pool
    target_2 = json.dumps({
        "target_ph": 7.4, "target_fc": 4.0, "target_ta": 100.0, "target_ch": 300.0, "target_cya": 45.0, "target_salt": 0.0
    })
    cursor.execute("""
    INSERT OR REPLACE INTO pools (id, name, customer_name, customer_phone, customer_email, address, latitude, longitude, gate_code, pool_type, surface_type, sanitizer_type, volume_liters, volume_gallons, clean_filter_psi, current_filter_psi, filter_type, pump_hp, daily_run_hours, service_day, service_frequency, target_params, tenant_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "pool-2",
        "Highland Park Club & Lap Pool",
        "Highland Park Estates HOA",
        "(214) 555-0188",
        "hoa@highlandparkclub.com",
        "4200 Armstrong Pkwy, Highland Park, TX 75205",
        32.8335,
        -96.8010,
        "MOCK-KEYCARD-HP",
        "Comercial / Condomínio (HOA)",
        "Alvenaria / Azulejo Branco",
        "Cloro Tradicional + UV Comercial",
        246000,
        65000,
        15.0,
        16.2,
        "Filtro de Areia Duplo Comercial",
        5.0,
        14,
        "Segunda-feira",
        "Semanal",
        target_2,
        DEFAULT_TENANT_ID,
        now
    ))

    # 3. McKinney - Craig Ranch Resort Clubhouse HOA
    target_3 = json.dumps({
        "target_ph": 7.4, "target_fc": 3.5, "target_ta": 95.0, "target_ch": 275.0, "target_cya": 40.0, "target_salt": 0.0
    })
    cursor.execute("""
    INSERT OR REPLACE INTO pools (id, name, customer_name, customer_phone, customer_email, address, latitude, longitude, gate_code, pool_type, surface_type, sanitizer_type, volume_liters, volume_gallons, clean_filter_psi, current_filter_psi, filter_type, pump_hp, daily_run_hours, service_day, service_frequency, target_params, tenant_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "pool-3",
        "Craig Ranch Resort Clubhouse Pool",
        "Craig Ranch Townhomes HOA",
        "(469) 555-0177",
        "service@craigranchhoa.org",
        "6150 Collin McKinney Pkwy, McKinney, TX 75070",
        33.1550,
        -96.7200,
        "MOCK-DOCK-#3003",
        "Comercial / Condomínio (HOA)",
        "Diamond Brite / Quartz",
        "Cloro Líquido + Ozônio",
        181700,
        48000,
        14.0,
        15.5,
        "Filtro de Areia High-Rate",
        3.5,
        12,
        "Segunda-feira",
        "Semanal",
        target_3,
        DEFAULT_TENANT_ID,
        now
    ))

    # 4. Southlake - Sterling Manor & Heated Spa
    target_4 = json.dumps({
        "target_ph": 7.4, "target_fc": 3.0, "target_ta": 90.0, "target_ch": 250.0, "target_cya": 40.0, "target_salt": 0.0
    })
    cursor.execute("""
    INSERT OR REPLACE INTO pools (id, name, customer_name, customer_phone, customer_email, address, latitude, longitude, gate_code, pool_type, surface_type, sanitizer_type, volume_liters, volume_gallons, clean_filter_psi, current_filter_psi, filter_type, pump_hp, daily_run_hours, service_day, service_frequency, target_params, tenant_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "pool-4",
        "Sterling Manor & Heated Spa",
        "Dr. Michael & Amanda Sterling",
        "(817) 555-0198",
        "msterling@dfwmedcenter.org",
        "1280 Southlake Blvd, Southlake, TX 76092",
        32.9412,
        -97.1340,
        "MOCK-CODE-#4004",
        "Residencial",
        "Alvenaria / Revestimento Quartzo",
        "Cloro Tradicional + Ozônio",
        83300,
        22000,
        11.0,
        12.5,
        "Filtro de D.E. (Diatomácea)",
        2.0,
        7,
        "Segunda-feira",
        "Semanal",
        target_4,
        DEFAULT_TENANT_ID,
        now
    ))

    # 5. Plano - Willow Bend Luxury Oasis & Cascata
    target_5 = json.dumps({
        "target_ph": 7.5, "target_fc": 3.5, "target_ta": 90.0, "target_ch": 280.0, "target_cya": 70.0, "target_salt": 3200.0
    })
    cursor.execute("""
    INSERT OR REPLACE INTO pools (id, name, customer_name, customer_phone, customer_email, address, latitude, longitude, gate_code, pool_type, surface_type, sanitizer_type, volume_liters, volume_gallons, clean_filter_psi, current_filter_psi, filter_type, pump_hp, daily_run_hours, service_day, service_frequency, target_params, tenant_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "pool-5",
        "Willow Bend Luxury Oasis & Cascata",
        "Robert & Elena Chen",
        "(972) 555-0164",
        "echen@planoenergy.com",
        "2804 Willow Bend Dr, Plano, TX 75093",
        33.0368,
        -96.8122,
        "MOCK-SIDE-GATE-#5005",
        "Residencial",
        "PebbleTec Azul Cobalto",
        "Gerador de Sal (SWG)",
        62500,
        16500,
        10.0,
        11.0,
        "Filtro de Cartucho",
        1.5,
        6,
        "Segunda-feira",
        "Semanal",
        target_5,
        DEFAULT_TENANT_ID,
        now
    ))

def seed_routes_data(cursor):
    now = datetime.now().isoformat()
    today_str = datetime.now().strftime("%Y-%m-%d")

    # 1. Cadastro dos Técnicos / Funcionários
    technicians_data = [
        ("tech-1", "Tyler Brooks (DFW Senior Pool Tech)", "(214) 555-7890", "tyler@wandpool.com", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", "Senior Tech (Frisco & Plano)", DEFAULT_TENANT_ID, now),
        ("tech-2", "Marcus Rodriguez (North DFW Tech)", "(469) 555-3211", "marcus@wandpool.com", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", "Route Tech (McKinney & Allen)", DEFAULT_TENANT_ID, now),
        ("tech-3", "Jake Wilson (Dallas Tech)", "(214) 555-6543", "jake@wandpool.com", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", "Route Tech (Highland Park & Dallas)", DEFAULT_TENANT_ID, now),
        ("tech-4", "Sarah Jenkins (West DFW Tech)", "(817) 555-9012", "sarah@wandpool.com", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", "Route Tech (Southlake & Fort Worth)", DEFAULT_TENANT_ID, now),
    ]

    for t in technicians_data:
        cursor.execute("""
        INSERT OR REPLACE INTO technicians (id, name, phone, email, avatar_url, role, tenant_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, t)

    # 2. Rotas por Técnico
    route_tyler = "route-tyler-segunda"
    cursor.execute("""
    INSERT OR REPLACE INTO routes (id, technician_id, technician_name, technician_phone, day_of_week, date, total_stops, completed_stops, total_distance_km, estimated_travel_time_min, status, tenant_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        route_tyler, "tech-1", "Tyler Brooks (DFW Senior Pool Tech)", "(214) 555-7890",
        "Segunda-feira", today_str, 3, 1, 18.4, 38, "Em Andamento", DEFAULT_TENANT_ID, now
    ))

    route_marcus = "route-marcus-segunda"
    cursor.execute("""
    INSERT OR REPLACE INTO routes (id, technician_id, technician_name, technician_phone, day_of_week, date, total_stops, completed_stops, total_distance_km, estimated_travel_time_min, status, tenant_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        route_marcus, "tech-2", "Marcus Rodriguez (North DFW Tech)", "(469) 555-3211",
        "Segunda-feira", today_str, 2, 0, 14.2, 28, "Planejada", DEFAULT_TENANT_ID, now
    ))

    # Fotos de Exemplo
    photos_stop1 = json.dumps([
        {
          "id": "photo-1",
          "photo_type": "before",
          "url": "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&auto=format&fit=crop&q=80",
          "caption": "Estado Inicial: Água com folhas e turbidez",
          "timestamp": now
        },
        {
          "id": "photo-2",
          "photo_type": "after",
          "url": "https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=600&auto=format&fit=crop&q=80",
          "caption": "Finalização: Água 100% cristalina e sal balanceado",
          "timestamp": now
        }
    ])

    stops_tyler = [
        ("stop-1", route_tyler, "pool-1", "Stonebriar Creek Residence", "David & Sarah Harrison", "(214) 555-0142", "5420 Stonebriar Dr, Frisco, TX", 33.1250, -96.8250, 1, "08:00", 45, "Concluído", now, photos_stop1, "pH 7.8 | Cloro 1.2 ppm | TA 120", "500ml Redutor pH + 300g Dicloro", DEFAULT_TENANT_ID),
        ("stop-2", route_tyler, "pool-5", "Willow Bend Luxury Oasis", "Robert & Elena Chen", "(972) 555-0164", "2804 Willow Bend Dr, Plano, TX", 33.0368, -96.8122, 2, "09:15", 45, "A Caminho", None, "[]", "Aguardando medição", "Aguardando medição", DEFAULT_TENANT_ID),
        ("stop-3", route_tyler, "pool-2", "Highland Park Club & Lap Pool", "Highland Park Estates HOA", "(214) 555-0188", "4200 Armstrong Pkwy, Highland Park, TX", 32.8335, -96.8010, 3, "11:00", 75, "Pendente", None, "[]", "Aguardando medição", "Aguardando medição", DEFAULT_TENANT_ID),
    ]

    for s in stops_tyler:
        cursor.execute("""
        INSERT OR REPLACE INTO route_stops (stop_id, route_id, pool_id, pool_name, customer_name, customer_phone, address, latitude, longitude, order_index, scheduled_time, estimated_duration_min, status, completed_at, photos_json, water_test_summary, chemicals_summary, tenant_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, s)

# ==========================================
# FUNÇÕES DE CONSULTA E MUTATION PROTEGIDAS
# ==========================================

def get_all_pools(tenant_id: str = DEFAULT_TENANT_ID, mask_gate_code: bool = True) -> List[Dict[str, Any]]:
    """Retorna todas as piscinas pertencentes ao tenant informado."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM pools WHERE tenant_id = ? ORDER BY name ASC", (tenant_id,))
    rows = cursor.fetchall()
    result = []
    for r in rows:
        d = dict(r)
        if d.get("target_params"):
            d["target_params"] = json.loads(d["target_params"])
        if mask_gate_code and d.get("gate_code"):
            # Mascara código de portão em listagem geral
            d["gate_code"] = "🔒 [Acesso Restrito ao Técnico]"
        result.append(d)
    conn.close()
    return result

def get_pool_by_id(pool_id: str, tenant_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Retorna detalhes da piscina validando o isolamento de tenant."""
    conn = get_connection()
    cursor = conn.cursor()
    if tenant_id:
        cursor.execute("SELECT * FROM pools WHERE id = ? AND tenant_id = ?", (pool_id, tenant_id))
    else:
        cursor.execute("SELECT * FROM pools WHERE id = ?", (pool_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None
    d = dict(row)
    if d.get("target_params"):
        d["target_params"] = json.loads(d["target_params"])
    conn.close()
    return d

def save_pool_in_db(pool_data: Dict[str, Any], tenant_id: str = DEFAULT_TENANT_ID) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    target_json = json.dumps(pool_data.get("target_params") or {})
    pool_tenant = pool_data.get("tenant_id") or tenant_id
    
    cursor.execute("""
    INSERT OR REPLACE INTO pools (
        id, name, customer_name, customer_phone, customer_email, address, latitude, longitude,
        gate_code, pool_type, surface_type, sanitizer_type, volume_liters, volume_gallons,
        clean_filter_psi, current_filter_psi, filter_type, pump_hp, daily_run_hours,
        service_day, service_frequency, target_params, tenant_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        pool_data.get("id"),
        pool_data.get("name"),
        pool_data.get("customer_name"),
        pool_data.get("customer_phone"),
        pool_data.get("customer_email"),
        pool_data.get("address"),
        pool_data.get("latitude", 32.7767),
        pool_data.get("longitude", -96.7970),
        pool_data.get("gate_code"),
        pool_data.get("pool_type", "Residencial"),
        pool_data.get("surface_type", "PebbleTec / Pastilha"),
        pool_data.get("sanitizer_type", "Gerador de Sal (SWG)"),
        pool_data.get("volume_liters", 70000),
        pool_data.get("volume_gallons", 18500),
        pool_data.get("clean_filter_psi", 12.0),
        pool_data.get("current_filter_psi", 12.0),
        pool_data.get("filter_type", "Filtro de Cartucho"),
        pool_data.get("pump_hp", 1.5),
        pool_data.get("daily_run_hours", 8),
        pool_data.get("service_day", "Segunda-feira"),
        pool_data.get("service_frequency", "Semanal"),
        target_json,
        pool_tenant,
        pool_data.get("created_at") or datetime.now().isoformat()
    ))
    conn.commit()
    conn.close()
    return pool_data

def update_pool_in_db(pool_id: str, pool_data: Dict[str, Any], tenant_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Anti-IDOR: Valida a posse do registro antes de atualizar."""
    existing = get_pool_by_id(pool_id, tenant_id=tenant_id)
    if not existing:
        return None
    merged = {**existing, **pool_data, "id": pool_id, "tenant_id": existing.get("tenant_id", DEFAULT_TENANT_ID)}
    return save_pool_in_db(merged, tenant_id=merged["tenant_id"])

def get_routes(tenant_id: str = DEFAULT_TENANT_ID) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM routes WHERE tenant_id = ? ORDER BY date DESC", (tenant_id,))
    route_rows = cursor.fetchall()
    routes = []
    for r in route_rows:
        rd = dict(r)
        cursor.execute("SELECT * FROM route_stops WHERE route_id = ? AND tenant_id = ? ORDER BY order_index ASC", (rd["id"], tenant_id))
        stops_rows = cursor.fetchall()
        stops = []
        for s in stops_rows:
            sd = dict(s)
            sd["photos"] = json.loads(sd.get("photos_json") or "[]")
            stops.append(sd)
        rd["stops"] = stops
        routes.append(rd)
    conn.close()
    return routes

def get_route_by_id(route_id: str, tenant_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    if tenant_id:
        cursor.execute("SELECT * FROM routes WHERE id = ? AND tenant_id = ?", (route_id, tenant_id))
    else:
        cursor.execute("SELECT * FROM routes WHERE id = ?", (route_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None
    rd = dict(row)
    cursor.execute("SELECT * FROM route_stops WHERE route_id = ? ORDER BY order_index ASC", (route_id,))
    stops_rows = cursor.fetchall()
    stops = []
    for s in stops_rows:
        sd = dict(s)
        sd["photos"] = json.loads(sd.get("photos_json") or "[]")
        stops.append(sd)
    rd["stops"] = stops
    conn.close()
    return rd

def optimize_route_path(route_id: str, start_lat: float = 32.7767, start_lng: float = -96.7970, tenant_id: Optional[str] = None) -> Dict[str, Any]:
    route = get_route_by_id(route_id, tenant_id=tenant_id)
    if not route:
        return {"error": "Rota não encontrada"}

    stops = route["stops"]
    if not stops:
        return route

    def haversine_distance(lat1, lon1, lat2, lon2):
        R = 3958.8
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    unvisited = list(stops)
    optimized_stops = []
    current_lat = start_lat
    current_lng = start_lng
    total_miles = 0.0

    while unvisited:
        nearest_idx = 0
        min_dist = float('inf')
        for idx, stop in enumerate(unvisited):
            dist = haversine_distance(current_lat, current_lng, stop["latitude"], stop["longitude"])
            if dist < min_dist:
                min_dist = dist
                nearest_idx = idx

        next_stop = unvisited.pop(nearest_idx)
        total_miles += min_dist
        current_lat = next_stop["latitude"]
        current_lng = next_stop["longitude"]
        optimized_stops.append(next_stop)

    conn = get_connection()
    cursor = conn.cursor()
    base_time_hours = 8
    base_time_mins = 0

    for idx, stop in enumerate(optimized_stops):
        order = idx + 1
        hours = base_time_hours + ((base_time_mins + (idx * 55)) // 60)
        mins = (base_time_mins + (idx * 55)) % 60
        sched_time = f"{hours:02d}:{mins:02d}"
        
        stop["order_index"] = order
        stop["scheduled_time"] = sched_time
        cursor.execute("UPDATE route_stops SET order_index = ?, scheduled_time = ? WHERE stop_id = ?", (order, sched_time, stop["stop_id"]))

    total_miles_rounded = round(total_miles, 1)
    estimated_mins = int(total_miles * 2.8)
    cursor.execute("UPDATE routes SET total_distance_km = ?, estimated_travel_time_min = ? WHERE id = ?", (total_miles_rounded, estimated_mins, route_id))
    conn.commit()
    conn.close()

    route["stops"] = optimized_stops
    route["total_distance_km"] = total_miles_rounded
    route["estimated_travel_time_min"] = estimated_mins
    return route

def update_stop_photos_and_status(stop_id: str, status: str, photos: List[Dict[str, Any]], tenant_id: Optional[str] = None) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    
    if tenant_id:
        cursor.execute("SELECT stop_id FROM route_stops WHERE stop_id = ? AND tenant_id = ?", (stop_id, tenant_id))
        if not cursor.fetchone():
            conn.close()
            return False

    photos_json = json.dumps(photos)
    now = datetime.now().isoformat() if status == "Concluído" else None
    cursor.execute("""
    UPDATE route_stops
    SET status = ?, photos_json = ?, completed_at = COALESCE(?, completed_at)
    WHERE stop_id = ?
    """, (status, photos_json, now, stop_id))
    
    cursor.execute("""
    UPDATE routes SET completed_stops = (
        SELECT COUNT(*) FROM route_stops WHERE route_id = (SELECT route_id FROM route_stops WHERE stop_id = ?) AND status = 'Concluído'
    ) WHERE id = (SELECT route_id FROM route_stops WHERE stop_id = ?)
    """, (stop_id, stop_id))

    conn.commit()
    conn.close()
    return True

def get_pool_tests(pool_id: str, tenant_id: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    if tenant_id:
        cursor.execute("SELECT * FROM water_tests WHERE pool_id = ? AND tenant_id = ? ORDER BY timestamp DESC", (pool_id, tenant_id))
    else:
        cursor.execute("SELECT * FROM water_tests WHERE pool_id = ? ORDER BY timestamp DESC", (pool_id,))
    rows = cursor.fetchall()
    result = [dict(r) for r in rows]
    conn.close()
    return result

def get_pool_visits(pool_id: str, tenant_id: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    if tenant_id:
        cursor.execute("SELECT * FROM service_visits WHERE pool_id = ? AND tenant_id = ? ORDER BY visit_date DESC", (pool_id, tenant_id))
    else:
        cursor.execute("SELECT * FROM service_visits WHERE pool_id = ? ORDER BY visit_date DESC", (pool_id,))
    rows = cursor.fetchall()
    result = []
    for r in rows:
        d = dict(r)
        if d.get("checklist_json"):
            d["checklist_completed"] = json.loads(d["checklist_json"])
        if d.get("chemicals_json"):
            d["chemicals_added"] = json.loads(d["chemicals_json"])
        if d.get("photos_json"):
            d["photos"] = json.loads(d["photos_json"])
        result.append(d)
    conn.close()
    return result

def get_all_technicians(tenant_id: str = DEFAULT_TENANT_ID) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM technicians WHERE tenant_id = ? ORDER BY name ASC", (tenant_id,))
    tech_rows = cursor.fetchall()
    technicians = []
    for t in tech_rows:
        td = dict(t)
        cursor.execute("SELECT COUNT(*), SUM(total_stops) FROM routes WHERE (technician_name LIKE ? OR technician_id = ?) AND tenant_id = ?", (f"%{td['name'].split()[0]}%", td["id"], tenant_id))
        rc = cursor.fetchone()
        td["assigned_routes_count"] = rc[0] if rc else 0
        td["active_stops_count"] = rc[1] if rc and rc[1] else 0
        technicians.append(td)
    conn.close()
    return technicians

def get_technician_by_id(tech_id: str, tenant_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    if tenant_id:
        cursor.execute("SELECT * FROM technicians WHERE id = ? AND tenant_id = ?", (tech_id, tenant_id))
    else:
        cursor.execute("SELECT * FROM technicians WHERE id = ?", (tech_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def save_technician(tech_data: Dict[str, Any], tenant_id: str = DEFAULT_TENANT_ID) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    tech_id = tech_data.get("id") or f"tech-{datetime.now().strftime('%M%S')}"
    tech_tenant = tech_data.get("tenant_id") or tenant_id
    
    cursor.execute("""
    INSERT OR REPLACE INTO technicians (id, name, phone, email, avatar_url, role, tenant_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        tech_id,
        tech_data.get("name"),
        tech_data.get("phone", "(214) 555-0000"),
        tech_data.get("email"),
        tech_data.get("avatar_url", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"),
        tech_data.get("role", "Técnico de Rotas"),
        tech_tenant,
        tech_data.get("created_at") or datetime.now().isoformat()
    ))
    conn.commit()
    conn.close()
    tech_data["id"] = tech_id
    tech_data["tenant_id"] = tech_tenant
    return tech_data

def update_technician_in_db(tech_id: str, tech_data: Dict[str, Any], tenant_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Anti-IDOR: Valida a posse do técnico antes de atualizar."""
    existing = get_technician_by_id(tech_id, tenant_id=tenant_id)
    if not existing:
        return None
    merged = {**existing, **tech_data, "id": tech_id, "tenant_id": existing.get("tenant_id", DEFAULT_TENANT_ID)}
    saved = save_technician(merged, tenant_id=merged["tenant_id"])
    
    conn = get_connection()
    cursor = conn.cursor()
    new_name = merged.get("name")
    new_phone = merged.get("phone")
    old_first_name = existing["name"].split()[0]
    cursor.execute("""
    UPDATE routes
    SET technician_name = ?, technician_phone = ?
    WHERE (technician_id = ? OR technician_name LIKE ?) AND tenant_id = ?
    """, (new_name, new_phone, tech_id, f"%{old_first_name}%", merged["tenant_id"]))
    conn.commit()
    conn.close()
    return saved

def delete_technician_from_db(tech_id: str, tenant_id: Optional[str] = None) -> bool:
    """Anti-IDOR: Valida a posse do técnico antes de deletar."""
    conn = get_connection()
    cursor = conn.cursor()
    existing = get_technician_by_id(tech_id, tenant_id=tenant_id)
    if not existing:
        conn.close()
        return False

    name = existing.get("name", "")
    old_first_name = name.split()[0] if name else ""
    t_id = existing.get("tenant_id", DEFAULT_TENANT_ID)
    
    cursor.execute("DELETE FROM routes WHERE (technician_id = ? OR technician_name = ? OR technician_name LIKE ?) AND tenant_id = ?", (tech_id, name, f"%{old_first_name}%", t_id))
    cursor.execute("DELETE FROM technicians WHERE id = ? AND tenant_id = ?", (tech_id, t_id))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def create_or_update_route(route_data: Dict[str, Any], tenant_id: str = DEFAULT_TENANT_ID) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    route_id = route_data.get("id") or f"route-{datetime.now().strftime('%M%S')}"
    route_tenant = route_data.get("tenant_id") or tenant_id
    
    cursor.execute("""
    INSERT OR REPLACE INTO routes (
        id, technician_id, technician_name, technician_phone, day_of_week, date,
        total_stops, completed_stops, total_distance_km, estimated_travel_time_min, status, tenant_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        route_id,
        route_data.get("technician_id"),
        route_data.get("technician_name"),
        route_data.get("technician_phone"),
        route_data.get("day_of_week", "Segunda-feira"),
        route_data.get("date") or datetime.now().strftime("%Y-%m-%d"),
        route_data.get("total_stops", 0),
        route_data.get("completed_stops", 0),
        route_data.get("total_distance_km", 0.0),
        route_data.get("estimated_travel_time_min", 0),
        route_data.get("status", "Planejada"),
        route_tenant,
        route_data.get("created_at") or datetime.now().isoformat()
    ))
    conn.commit()
    conn.close()
    return get_route_by_id(route_id, tenant_id=route_tenant) or route_data

def add_stop_to_route(route_id: str, pool_id: str, scheduled_time: str = "10:00", tenant_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    pool = get_pool_by_id(pool_id, tenant_id=tenant_id)
    if not pool:
        return None
    
    conn = get_connection()
    cursor = conn.cursor()
    t_id = pool.get("tenant_id", DEFAULT_TENANT_ID)
    
    cursor.execute("SELECT MAX(order_index) FROM route_stops WHERE route_id = ?", (route_id,))
    max_order = cursor.fetchone()[0] or 0
    new_order = max_order + 1
    
    stop_id = f"stop-{pool_id}-{datetime.now().strftime('%M%S')}"
    cursor.execute("""
    INSERT INTO route_stops (
        stop_id, route_id, pool_id, pool_name, customer_name, customer_phone, address,
        latitude, longitude, order_index, scheduled_time, estimated_duration_min, status, photos_json, tenant_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendente', '[]', ?)
    """, (
        stop_id, route_id, pool["id"], pool["name"], pool["customer_name"], pool.get("customer_phone"),
        pool["address"], pool.get("latitude", 32.7767), pool.get("longitude", -96.7970),
        new_order, scheduled_time, 45, t_id
    ))
    
    cursor.execute("""
    UPDATE routes SET total_stops = (
        SELECT COUNT(*) FROM route_stops WHERE route_id = ?
    ) WHERE id = ?
    """, (route_id, route_id))
    
    conn.commit()
    conn.close()
    return optimize_route_path(route_id, tenant_id=t_id)

def remove_stop_from_route(stop_id: str, tenant_id: Optional[str] = None) -> bool:
    """Anti-IDOR: Valida a posse da parada antes de remover."""
    conn = get_connection()
    cursor = conn.cursor()
    
    if tenant_id:
        cursor.execute("SELECT route_id, tenant_id FROM route_stops WHERE stop_id = ? AND tenant_id = ?", (stop_id, tenant_id))
    else:
        cursor.execute("SELECT route_id, tenant_id FROM route_stops WHERE stop_id = ?", (stop_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return False
    
    route_id = row[0]
    cursor.execute("DELETE FROM route_stops WHERE stop_id = ?", (stop_id,))
    
    cursor.execute("""
    UPDATE routes SET total_stops = (
        SELECT COUNT(*) FROM route_stops WHERE route_id = ?
    ) WHERE id = ?
    """, (route_id, route_id))
    
    conn.commit()
    conn.close()
    optimize_route_path(route_id)
    return True

def reassign_stop_to_route(stop_id: str, target_route_id: str, tenant_id: Optional[str] = None) -> bool:
    """Anti-IDOR: Valida que a parada e a rota de destino pertençam ao mesmo tenant."""
    conn = get_connection()
    cursor = conn.cursor()
    
    if tenant_id:
        cursor.execute("SELECT route_id, tenant_id FROM route_stops WHERE stop_id = ? AND tenant_id = ?", (stop_id, tenant_id))
    else:
        cursor.execute("SELECT route_id, tenant_id FROM route_stops WHERE stop_id = ?", (stop_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return False
    
    old_route_id = row[0]
    
    # Valida rota de destino
    if tenant_id:
        cursor.execute("SELECT id FROM routes WHERE id = ? AND tenant_id = ?", (target_route_id, tenant_id))
        if not cursor.fetchone():
            conn.close()
            return False

    cursor.execute("UPDATE route_stops SET route_id = ?, status = 'Pendente' WHERE stop_id = ?", (target_route_id, stop_id))
    cursor.execute("UPDATE routes SET total_stops = (SELECT COUNT(*) FROM route_stops WHERE route_id = ?) WHERE id = ?", (old_route_id, old_route_id))
    cursor.execute("UPDATE routes SET total_stops = (SELECT COUNT(*) FROM route_stops WHERE route_id = ?) WHERE id = ?", (target_route_id, target_route_id))
    
    conn.commit()
    conn.close()
    
    optimize_route_path(old_route_id)
    optimize_route_path(target_route_id)
    return True
