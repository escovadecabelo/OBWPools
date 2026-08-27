export interface Technician {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar_url?: string;
  role: string;
  assigned_routes_count?: number;
  active_stops_count?: number;
}

export interface PoolTargetParams {
  target_ph: number;
  target_fc: number;
  target_ta: number;
  target_ch: number;
  target_cya: number;
  target_salt: number;
}

export interface ServicePhoto {
  id: string;
  photo_type: 'before' | 'after' | 'equipment' | 'issue';
  url: string;
  caption?: string;
  timestamp: string;
}

export interface RouteStop {
  stop_id: string;
  route_id: string;
  pool_id: string;
  pool_name: string;
  customer_name: string;
  customer_phone?: string;
  address: string;
  latitude: number;
  longitude: number;
  order_index: number;
  scheduled_time: string;
  estimated_duration_min: number;
  status: 'Pendente' | 'A Caminho' | 'Em Atendimento' | 'Concluído';
  completed_at?: string;
  photos: ServicePhoto[];
  water_test_summary?: string;
  chemicals_summary?: string;
}

export interface Route {
  id: string;
  technician_name: string;
  technician_phone?: string;
  day_of_week: string;
  date: string;
  total_stops: number;
  completed_stops: number;
  total_distance_km: number;
  estimated_travel_time_min: number;
  status: 'Planejada' | 'Em Andamento' | 'Finalizada';
  stops: RouteStop[];
}

export interface Pool {
  id: string;
  name: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  gate_code?: string;
  pool_type: string;
  surface_type: string;
  sanitizer_type: string;
  volume_liters: number;
  volume_gallons: number;
  clean_filter_psi: number;
  current_filter_psi: number;
  filter_type: string;
  pump_hp: number;
  daily_run_hours: number;
  service_day?: string;
  service_frequency?: string;
  target_params: PoolTargetParams;
  created_at: string;
}

export interface WaterTest {
  id?: string;
  pool_id: string;
  timestamp: string;
  ph: number;
  free_chlorine: number;
  combined_chlorine: number;
  total_alkalinity: number;
  calcium_hardness: number;
  cyanuric_acid: number;
  salt_ppm: number;
  temperature_c: number;
  turbidity: string;
  lsi_score?: number;
  lsi_status?: string;
  technician_notes?: string;
}

export interface ChemicalDoseItem {
  chemical_name: string;
  amount: number;
  unit: string;
  reason: string;
}

export interface ChecklistItem {
  id: string;
  task_name: string;
  category: string;
  completed: boolean;
}

export interface ServiceVisit {
  id: string;
  pool_id: string;
  visit_date: string;
  technician_name: string;
  filter_pressure_psi: number;
  backwash_performed: boolean;
  water_test?: WaterTest;
  checklist_completed: ChecklistItem[];
  chemicals_added: ChemicalDoseItem[];
  photos: ServicePhoto[];
  technician_notes: string;
  customer_summary: string;
  status: string;
  door_hanger_sent: boolean;
  whatsapp_dispatched: boolean;
}

export interface LSISolution {
  lsi: number;
  status: string;
  status_code: 'corrosive' | 'balanced' | 'scaling';
  description: string;
  recommendation: string;
  badge_color: 'red' | 'emerald' | 'amber';
  factors: {
    temperature_f: number;
    temperature_factor: number;
    calcium_factor: number;
    alkalinity_factor: number;
    carbonate_alkalinity: number;
    tds_constant: number;
  };
}

export interface ChemicalRecommendation {
  parameter: string;
  chemical: string;
  amount: number;
  unit: string;
  amount_formatted: string;
  alternative?: string;
  instructions: string;
  priority: 'Crítica' | 'Alta' | 'Média' | 'Baixa';
}

export interface DosageResult {
  volume_liters: number;
  recommendations: ChemicalRecommendation[];
  total_actions: number;
}
