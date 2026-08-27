"""
WandPool Pydantic Data Models
Administração de rotas, otimização de trajeto, envio automático de fotos e gestão de piscinas.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class PoolTargetParams(BaseModel):
    target_ph: float = 7.4
    target_fc: float = 3.0
    target_ta: float = 100.0
    target_ch: float = 250.0
    target_cya: float = 40.0
    target_salt: float = 3200.0

class ServicePhoto(BaseModel):
    id: str
    photo_type: str # "before" (antes), "after" (depois), "equipment" (manômetro/bomba), "issue" (avaria)
    url: str # data URL or image path
    caption: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

class Pool(BaseModel):
    id: str
    name: str
    customer_name: str
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    address: str
    latitude: Optional[float] = 32.7767 # Coordenadas padrão DFW (Dallas-Fort Worth)
    longitude: Optional[float] = -96.7970
    gate_code: Optional[str] = None
    pool_type: str = "Residencial"
    surface_type: str = "Alvenaria / Azulejo"
    sanitizer_type: str = "Cloro Tradicional"
    volume_liters: int = 45000
    volume_gallons: int = 11888
    clean_filter_psi: float = 12.0
    current_filter_psi: float = 14.0
    filter_type: str = "Filtro de Areia"
    pump_hp: float = 1.0
    daily_run_hours: int = 6
    service_day: str = "Segunda-feira" # Dia da semana da rota
    service_frequency: str = "Semanal" # Semanal, Quinzenal, 2x por semana
    target_params: PoolTargetParams = Field(default_factory=PoolTargetParams)
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())

class RouteStop(BaseModel):
    stop_id: str
    pool_id: str
    pool_name: str
    customer_name: str
    customer_phone: Optional[str] = None
    address: str
    latitude: float
    longitude: float
    order_index: int
    scheduled_time: str # "08:30"
    estimated_duration_min: int = 45
    status: str = "Pendente" # "Pendente", "A Caminho", "Em Atendimento", "Concluído"
    completed_at: Optional[str] = None
    photos: List[ServicePhoto] = []
    water_test_summary: Optional[str] = None
    chemicals_summary: Optional[str] = None

class Route(BaseModel):
    id: str
    technician_name: str
    technician_phone: Optional[str] = None
    day_of_week: str # Segunda-feira, Terça-feira, etc.
    date: str # YYYY-MM-DD
    total_stops: int = 0
    completed_stops: int = 0
    total_distance_km: float = 0.0
    estimated_travel_time_min: int = 0
    stops: List[RouteStop] = []
    status: str = "Em Andamento" # "Planejada", "Em Andamento", "Finalizada"

class WaterTest(BaseModel):
    id: Optional[str] = None
    pool_id: str
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    ph: float
    free_chlorine: float
    combined_chlorine: float = 0.0
    total_alkalinity: float
    calcium_hardness: float = 250.0
    cyanuric_acid: float = 30.0
    salt_ppm: float = 0.0
    temperature_c: float = 26.0
    turbidity: str = "Cristalina"
    lsi_score: Optional[float] = None
    lsi_status: Optional[str] = None
    technician_notes: Optional[str] = None

class ChemicalDoseItem(BaseModel):
    chemical_name: str
    amount: float
    unit: str
    reason: str

class ChecklistItem(BaseModel):
    id: str
    task_name: str
    category: str
    completed: bool = False

class ServiceVisit(BaseModel):
    id: str
    pool_id: str
    visit_date: str = Field(default_factory=lambda: datetime.now().isoformat())
    technician_name: str
    filter_pressure_psi: float
    backwash_performed: bool = False
    water_test: Optional[WaterTest] = None
    checklist_completed: List[ChecklistItem] = []
    chemicals_added: List[ChemicalDoseItem] = []
    photos: List[ServicePhoto] = []
    technician_notes: str = ""
    customer_summary: str = ""
    status: str = "Concluído"
    door_hanger_sent: bool = True
    whatsapp_dispatched: bool = True

class RouteOptimizeRequest(BaseModel):
    route_id: str
    start_latitude: Optional[float] = -23.5505
    start_longitude: Optional[float] = -46.6333

class VolumeCalcRequest(BaseModel):
    shape: str
    length_m: float
    width_m: float = 0.0
    diameter_m: float = 0.0
    shallow_depth_m: float = 1.0
    deep_depth_m: float = 1.6

class DosageCalcRequest(BaseModel):
    volume_liters: float
    current_ph: float
    target_ph: float = 7.4
    current_fc: float = 1.0
    target_fc: float = 3.0
    current_ta: float = 80.0
    target_ta: float = 100.0
    current_ch: float = 200.0
    target_ch: float = 250.0
    current_cya: float = 20.0
    target_cya: float = 40.0
    current_salt: float = 0.0
    target_salt: float = 0.0

class LSICalcRequest(BaseModel):
    ph: float
    temperature_c: float = 25.0
    calcium_hardness_ppm: float = 250.0
    total_alkalinity_ppm: float = 100.0
    cyanuric_acid_ppm: float = 30.0
    total_dissolved_solids_ppm: float = 1000.0

class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    pool_id: Optional[str] = None
