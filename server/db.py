"""
WandPool SQLite Database Layer
Administração de rotas, otimização de trajeto, cadastro de piscinas, comprovantes digitais e fotos.
"""

import sqlite3
import json
import os
import math
from typing import List, Dict, Any, Optional
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "wandpool.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Tabela de Piscinas / Clientes com Latitude e Longitude
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
        created_at TEXT
    )
    """)

    # Tabela de Rotas de Atendimento (Route Management)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS routes (
        id TEXT PRIMARY KEY,
        technician_name TEXT NOT NULL,
        technician_phone TEXT,
        day_of_week TEXT NOT NULL,
        date TEXT NOT NULL,
        total_stops INTEGER DEFAULT 0,
        completed_stops INTEGER DEFAULT 0,
        total_distance_km REAL DEFAULT 0.0,
        estimated_travel_time_min INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Em Andamento',
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
        timestamp TEXT NOT NULL
    )
    """)

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

    # 1. Frisco - Stonebriar Creek Residence (Residencial)
    target_1 = json.dumps({
        "target_ph": 7.5, "target_fc": 3.5, "target_ta": 90.0, "target_ch": 280.0, "target_cya": 70.0, "target_salt": 3200.0
    })
    cursor.execute("""
    INSERT OR REPLACE INTO pools (id, name, customer_name, customer_phone, customer_email, address, latitude, longitude, gate_code, pool_type, surface_type, sanitizer_type, volume_liters, volume_gallons, clean_filter_psi, current_filter_psi, filter_type, pump_hp, daily_run_hours, service_day, service_frequency, target_params, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "pool-1",
        "Stonebriar Creek Residence - Infinity Pool",
        "David & Sarah Harrison",
        "(214) 555-0142",
        "dharrison@dfwhomes.net",
        "5420 Stonebriar Dr, Frisco, TX 75034",
        33.1250,
        -96.8250,
        "Gate #4821",
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
        now
    ))

    # 2. Highland Park, Dallas - Condomínio / HOA Lap Pool
    target_2 = json.dumps({
        "target_ph": 7.4, "target_fc": 4.0, "target_ta": 100.0, "target_ch": 300.0, "target_cya": 45.0, "target_salt": 0.0
    })
    cursor.execute("""
    INSERT OR REPLACE INTO pools (id, name, customer_name, customer_phone, customer_email, address, latitude, longitude, gate_code, pool_type, surface_type, sanitizer_type, volume_liters, volume_gallons, clean_filter_psi, current_filter_psi, filter_type, pump_hp, daily_run_hours, service_day, service_frequency, target_params, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "pool-2",
        "Highland Park Club & Lap Pool",
        "Highland Park Estates HOA",
        "(214) 555-0188",
        "hoa@highlandparkclub.com",
        "4200 Armstrong Pkwy, Highland Park, TX 75205",
        32.8335,
        -96.8010,
        "Keycard Guarita Leste",
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
        now
    ))

    # 3. McKinney - Craig Ranch Resort Clubhouse HOA
    target_3 = json.dumps({
        "target_ph": 7.4, "target_fc": 3.5, "target_ta": 95.0, "target_ch": 275.0, "target_cya": 40.0, "target_salt": 0.0
    })
    cursor.execute("""
    INSERT OR REPLACE INTO pools (id, name, customer_name, customer_phone, customer_email, address, latitude, longitude, gate_code, pool_type, surface_type, sanitizer_type, volume_liters, volume_gallons, clean_filter_psi, current_filter_psi, filter_type, pump_hp, daily_run_hours, service_day, service_frequency, target_params, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "pool-3",
        "Craig Ranch Resort Clubhouse Pool",
        "Craig Ranch Townhomes HOA",
        "(469) 555-0177",
        "service@craigranchhoa.org",
        "6150 Collin McKinney Pkwy, McKinney, TX 75070",
        33.1550,
        -96.7200,
        "Doca de Serviço #10",
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
        now
    ))

    # 4. Southlake - Sterling Manor & Heated Spa
    target_4 = json.dumps({
        "target_ph": 7.4, "target_fc": 3.0, "target_ta": 90.0, "target_ch": 250.0, "target_cya": 40.0, "target_salt": 0.0
    })
    cursor.execute("""
    INSERT OR REPLACE INTO pools (id, name, customer_name, customer_phone, customer_email, address, latitude, longitude, gate_code, pool_type, surface_type, sanitizer_type, volume_liters, volume_gallons, clean_filter_psi, current_filter_psi, filter_type, pump_hp, daily_run_hours, service_day, service_frequency, target_params, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "pool-4",
        "Sterling Manor & Heated Spa",
        "Dr. Michael & Amanda Sterling",
        "(817) 555-0198",
        "msterling@dfwmedcenter.org",
        "1280 Southlake Blvd, Southlake, TX 76092",
        32.9412,
        -97.1340,
        "Código Portão *7720",
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
        now
    ))

    # 5. Plano - Willow Bend Luxury Oasis & Cascata
    target_5 = json.dumps({
        "target_ph": 7.5, "target_fc": 3.5, "target_ta": 90.0, "target_ch": 280.0, "target_cya": 70.0, "target_salt": 3200.0
    })
    cursor.execute("""
    INSERT OR REPLACE INTO pools (id, name, customer_name, customer_phone, customer_email, address, latitude, longitude, gate_code, pool_type, surface_type, sanitizer_type, volume_liters, volume_gallons, clean_filter_psi, current_filter_psi, filter_type, pump_hp, daily_run_hours, service_day, service_frequency, target_params, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "pool-5",
        "Willow Bend Luxury Oasis & Cascata",
        "Robert & Elena Chen",
        "(972) 555-0164",
        "echen@planoenergy.com",
        "2804 Willow Bend Dr, Plano, TX 75093",
        33.0368,
        -96.8122,
        "Portão Lateral #9012",
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
        now
    ))

def seed_routes_data(cursor):
    now = datetime.now().isoformat()
    today_str = datetime.now().strftime("%Y-%m-%d")

    # Rota DFW Norte (Segunda-feira)
    route_id = "route-dfw-segunda"
    cursor.execute("""
    INSERT OR REPLACE INTO routes (id, technician_name, technician_phone, day_of_week, date, total_stops, completed_stops, total_distance_km, estimated_travel_time_min, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        route_id,
        "Tyler Brooks (DFW Senior Pool Tech)",
        "(214) 555-7890",
        "Segunda-feira",
        today_str,
        5,
        1,
        29.1,
        58,
        "Em Andamento",
        now
    ))

    # Fotos de Exemplo com visual Before / After
    photos_stop1 = json.dumps([
        {
          "id": "photo-1",
          "photo_type": "before",
          "url": "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&auto=format&fit=crop&q=80",
          "caption": "Estado Inicial: Água com folhas e turbidez pós-vento do Texas",
          "timestamp": now
        },
        {
          "id": "photo-2",
          "photo_type": "after",
          "url": "https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=600&auto=format&fit=crop&q=80",
          "caption": "Finalização: Água 100% cristalina, sal balanceado e bordas limpas",
          "timestamp": now
        },
        {
          "id": "photo-3",
          "photo_type": "equipment",
          "url": "https://images.unsplash.com/photo-1584467735815-f778f274e296?w=600&auto=format&fit=crop&q=80",
          "caption": "Manômetro em 18.5 PSI (Alerta de limpeza do cartucho)",
          "timestamp": now
        }
    ])

    # Paradas da Rota DFW
    stops_data = [
        ("stop-1", route_id, "pool-1", "Stonebriar Creek Residence", "David & Sarah Harrison", "(214) 555-0142", "5420 Stonebriar Dr, Frisco, TX", 33.1250, -96.8250, 1, "08:00", 45, "Concluído", now, photos_stop1, "pH 7.8 | Cloro 1.2 ppm | TA 120", "500ml Redutor pH + 300g Dicloro"),
        ("stop-2", route_id, "pool-5", "Willow Bend Luxury Oasis", "Robert & Elena Chen", "(972) 555-0164", "2804 Willow Bend Dr, Plano, TX", 33.0368, -96.8122, 2, "09:15", 45, "A Caminho", None, "[]", "Aguardando medição", "Aguardando medição"),
        ("stop-3", route_id, "pool-3", "Craig Ranch Resort Clubhouse", "Craig Ranch Townhomes HOA", "(469) 555-0177", "6150 Collin McKinney Pkwy, McKinney, TX", 33.1550, -96.7200, 3, "10:30", 60, "Pendente", None, "[]", "Aguardando medição", "Aguardando medição"),
        ("stop-4", route_id, "pool-2", "Highland Park Club & Lap Pool", "Highland Park Estates HOA", "(214) 555-0188", "4200 Armstrong Pkwy, Highland Park, TX", 32.8335, -96.8010, 4, "13:00", 75, "Pendente", None, "[]", "Aguardando medição", "Aguardando medição"),
        ("stop-5", route_id, "pool-4", "Sterling Manor & Heated Spa", "Dr. Michael & Amanda Sterling", "(817) 555-0198", "1280 Southlake Blvd, Southlake, TX", 32.9412, -97.1340, 5, "14:45", 50, "Pendente", None, "[]", "Aguardando medição", "Aguardando medição"),
    ]

    for s in stops_data:
        cursor.execute("""
        INSERT OR REPLACE INTO route_stops (stop_id, route_id, pool_id, pool_name, customer_name, customer_phone, address, latitude, longitude, order_index, scheduled_time, estimated_duration_min, status, completed_at, photos_json, water_test_summary, chemicals_summary)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, s)

    # Testes Químicos Iniciais
    cursor.execute("""
    INSERT OR REPLACE INTO water_tests (id, pool_id, timestamp, ph, free_chlorine, combined_chlorine, total_alkalinity, calcium_hardness, cyanuric_acid, salt_ppm, temperature_c, turbidity, lsi_score, lsi_status, technician_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "test-1", "pool-1", now, 7.8, 1.2, 0.4, 120.0, 240.0, 35.0, 3100.0, 27.0, "Levemente Turva", 0.35, "Incrustante / Saturada", "Filtro com pressão de 18.5 PSI no Stonebriar. Aplicado redutor de pH e cloração."
    ))

    # Visita com Fotos
    checklist_demo = json.dumps([
        {"id": "c1", "task_name": "Escovação completa de paredes, degraus e spa", "category": "Limpeza Física", "completed": True},
        {"id": "c2", "task_name": "Aspiração de fundo e recolhimento de detritos", "category": "Limpeza Física", "completed": True},
        {"id": "c3", "task_name": "Limpeza de linha d'água e azulejos decorativos", "category": "Limpeza Física", "completed": True},
        {"id": "c4", "task_name": "Limpeza dos cestos do skimmer e pré-filtro da bomba", "category": "Casa de Máquinas", "completed": True},
        {"id": "c5", "task_name": "Inspeção da célula geradora de sal (SWG) e manômetro", "category": "Casa de Máquinas", "completed": True},
        {"id": "c6", "task_name": "Registro fotográfico (Antes / Depois / Equipamento)", "category": "Evidência & Fotos", "completed": True},
        {"id": "c7", "task_name": "Aplicação de balanceador de pH e choque químico", "category": "Química & Tratamento", "completed": True}
    ])
    chems_demo = json.dumps([
        {"chemical_name": "Redutor de pH Líquido (Muriatic Acid)", "amount": 500, "unit": "ml", "reason": "Reduzir pH de 7.8 para 7.4"},
        {"chemical_name": "Dicloro Granulado 56%", "amount": 350, "unit": "g", "reason": "Elevar Cloro Livre para 3.5 ppm"}
    ])

    cursor.execute("""
    INSERT OR REPLACE INTO service_visits (id, pool_id, visit_date, technician_name, filter_pressure_psi, backwash_performed, water_test_id, checklist_json, chemicals_json, photos_json, technician_notes, customer_summary, status, door_hanger_sent, whatsapp_dispatched)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "visit-1",
        "pool-1",
        now,
        "Tyler Brooks (DFW Senior Pool Tech)",
        18.5,
        0,
        "test-1",
        checklist_demo,
        chems_demo,
        photos_stop1,
        "Pressão do filtro em 18.5 PSI (+6.5 PSI acima do baseline). Fotos de Antes/Depois registradas.",
        "Hello Harrison Family! Realizamos a manutenção completa da piscina Stonebriar Creek hoje. Fotos de Antes e Depois anexadas. A água estará liberada para banho às 17h.",
        "Concluído",
        1,
        1
    ))

# Helper Functions
def get_all_pools() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM pools ORDER BY name ASC")
    rows = cursor.fetchall()
    result = []
    for r in rows:
        d = dict(r)
        if d.get("target_params"):
            d["target_params"] = json.loads(d["target_params"])
        result.append(d)
    conn.close()
    return result

def get_pool_by_id(pool_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
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

def get_routes() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM routes ORDER BY date DESC")
    route_rows = cursor.fetchall()
    routes = []
    for r in route_rows:
        rd = dict(r)
        # Buscar paradas da rota
        cursor.execute("SELECT * FROM route_stops WHERE route_id = ? ORDER BY order_index ASC", (rd["id"],))
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

def get_route_by_id(route_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
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

def optimize_route_path(route_id: str, start_lat: float = 32.7767, start_lng: float = -96.7970) -> Dict[str, Any]:
    """
    Algoritmo de Otimização de Rota (Nearest Neighbor TSP / Haversine)
    Calcula a melhor ordem geográfica de paradas para minimizar tempo e combustível.
    """
    route = get_route_by_id(route_id)
    if not route:
        return {"error": "Rota não encontrada"}

    stops = route["stops"]
    if not stops:
        return route

    def haversine_distance(lat1, lon1, lat2, lon2):
        # Raio da Terra em Milhas (US Miles)
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
        # Encontra a parada mais próxima
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

    # Atualizar índices de ordem no SQLite
    conn = get_connection()
    cursor = conn.cursor()
    base_time_hours = 8 # Inicia às 08:00
    base_time_mins = 0

    for idx, stop in enumerate(optimized_stops):
        order = idx + 1
        # Calcula horário estimado (média 55 min por atendimento)
        hours = base_time_hours + ((base_time_mins + (idx * 55)) // 60)
        mins = (base_time_mins + (idx * 55)) % 60
        sched_time = f"{hours:02d}:{mins:02d}"
        
        stop["order_index"] = order
        stop["scheduled_time"] = sched_time
        cursor.execute("UPDATE route_stops SET order_index = ?, scheduled_time = ? WHERE stop_id = ?", (order, sched_time, stop["stop_id"]))

    total_miles_rounded = round(total_miles, 1)
    estimated_mins = int(total_miles * 2.8) # ~2.8 min por milha no tráfego urbano de DFW
    cursor.execute("UPDATE routes SET total_distance_km = ?, estimated_travel_time_min = ? WHERE id = ?", (total_miles_rounded, estimated_mins, route_id))
    conn.commit()
    conn.close()

    route["stops"] = optimized_stops
    route["total_distance_km"] = total_miles_rounded
    route["estimated_travel_time_min"] = estimated_mins
    return route

def update_stop_photos_and_status(stop_id: str, status: str, photos: List[Dict[str, Any]]) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    photos_json = json.dumps(photos)
    now = datetime.now().isoformat() if status == "Concluído" else None
    cursor.execute("""
    UPDATE route_stops
    SET status = ?, photos_json = ?, completed_at = COALESCE(?, completed_at)
    WHERE stop_id = ?
    """, (status, photos_json, now, stop_id))
    
    # Atualiza contagem de paradas concluídas na rota
    cursor.execute("""
    UPDATE routes SET completed_stops = (
        SELECT COUNT(*) FROM route_stops WHERE route_id = (SELECT route_id FROM route_stops WHERE stop_id = ?) AND status = 'Concluído'
    ) WHERE id = (SELECT route_id FROM route_stops WHERE stop_id = ?)
    """, (stop_id, stop_id))

    conn.commit()
    conn.close()
    return True

def get_pool_tests(pool_id: str) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM water_tests WHERE pool_id = ? ORDER BY timestamp DESC", (pool_id,))
    rows = cursor.fetchall()
    result = [dict(r) for r in rows]
    conn.close()
    return result

def get_pool_visits(pool_id: str) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
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

def save_pool_in_db(pool_data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    target_json = json.dumps(pool_data.get("target_params") or {})
    
    cursor.execute("""
    INSERT OR REPLACE INTO pools (
        id, name, customer_name, customer_phone, customer_email, address, latitude, longitude,
        gate_code, pool_type, surface_type, sanitizer_type, volume_liters, volume_gallons,
        clean_filter_psi, current_filter_psi, filter_type, pump_hp, daily_run_hours,
        service_day, service_frequency, target_params, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        pool_data.get("created_at") or datetime.now().isoformat()
    ))
    conn.commit()
    conn.close()
    return pool_data

def update_pool_in_db(pool_id: str, pool_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    existing = get_pool_by_id(pool_id)
    if not existing:
        return None
    merged = {**existing, **pool_data, "id": pool_id}
    return save_pool_in_db(merged)


