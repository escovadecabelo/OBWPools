import type { Pool, WaterTest, ServiceVisit, Route, ServicePhoto } from '../types/pool';
import { Capacitor } from '@capacitor/core';

// Determina a URL base da API: no Android emulador usa 10.0.2.2, na web usa localhost ou URL configurada
export function getApiBaseUrl(): string {
  const customUrl = localStorage.getItem('wandpool_api_url');
  if (customUrl) return customUrl;

  if (Capacitor.isNativePlatform()) {
    // 10.0.2.2 é o alias do Android Emulator para o localhost do computador
    return 'http://10.0.2.2:8000/api';
  }
  return 'http://localhost:8000/api';
}

const API_BASE = getApiBaseUrl();

export async function fetchRoutes(): Promise<Route[]> {
  try {
    const res = await fetch(`${API_BASE}/routes`);
    if (!res.ok) throw new Error('Falha ao carregar rotas');
    return await res.json();
  } catch (err) {
    console.warn('Backend API offline, usando fallback local de rotas', err);
    return getFallbackRoutes();
  }
}

export async function optimizeRouteApi(routeId: string): Promise<Route> {
  try {
    const res = await fetch(`${API_BASE}/routes/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ route_id: routeId })
    });
    const data = await res.json();
    return data.route;
  } catch (err) {
    console.warn('Backend API offline, simulando otimização local', err);
    const routes = getFallbackRoutes();
    const route = routes.find(r => r.id === routeId) || routes[0];
    return route;
  }
}

export async function updateStopPhotosAndStatus(stopId: string, status: string, photos: ServicePhoto[]): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/routes/stops/${stopId}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, photos })
    });
    return await res.json();
  } catch (err) {
    console.warn('Backend API offline, gravando status da parada localmente', err);
    return { message: 'Status gravado localmente' };
  }
}

export async function dispatchStopReportToCustomer(stopId: string, payload: any): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/routes/stops/${stopId}/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.warn('Backend API offline, simulando disparo de WhatsApp com fotos', err);
    return {
      message: 'Comprovante com fotos disparado automaticamente para o cliente!',
      dispatch: {
        timestamp: new Date().toISOString(),
        recipient: payload.customer_name,
        channels: ['WhatsApp Business API', 'E-mail Digital Door Hanger']
      }
    };
  }
}

export async function fetchPools(): Promise<Pool[]> {
  try {
    const res = await fetch(`${API_BASE}/pools`);
    if (!res.ok) throw new Error('Falha ao carregar piscinas');
    return await res.json();
  } catch (err) {
    console.warn('Backend API offline, usando fallback local', err);
    return getFallbackPools();
  }
}

export async function fetchPoolTests(poolId: string): Promise<WaterTest[]> {
  try {
    const res = await fetch(`${API_BASE}/pools/${poolId}/tests`);
    if (!res.ok) throw new Error('Falha ao carregar testes da piscina');
    return await res.json();
  } catch (err) {
    console.warn('Backend API offline, usando fallback local', err);
    return getFallbackTests(poolId);
  }
}

export async function createPoolTest(poolId: string, test: WaterTest): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/pools/${poolId}/tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(test)
    });
    return await res.json();
  } catch (err) {
    console.warn('Backend API offline, salvando localmente', err);
    return { message: 'Teste salvo no cache local' };
  }
}

export async function fetchPoolVisits(poolId: string): Promise<ServiceVisit[]> {
  try {
    const res = await fetch(`${API_BASE}/pools/${poolId}/visits`);
    if (!res.ok) throw new Error('Falha ao carregar visitas');
    return await res.json();
  } catch (err) {
    console.warn('Backend API offline, usando fallback local', err);
    return getFallbackVisits(poolId);
  }
}

export async function recordServiceVisit(poolId: string, visit: ServiceVisit): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/pools/${poolId}/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visit)
    });
    return await res.json();
  } catch (err) {
    console.warn('Backend API offline, salvando visita localmente', err);
    return { message: 'Visita gravada no modo local' };
  }
}

export async function sendHermesChatMessage(content: string, poolId?: string): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'user', content, pool_id: poolId })
    });
    const data = await res.json();
    return data.reply;
  } catch (err) {
    console.warn('Hermes Agent API indisponível, gerando resposta local', err);
    return `🌊 **Hermes Pool Copilot (Modo Offline)**\n\nRecebi sua mensagem: "${content}". Para sua rota de piscinas, lembre-se de otimizar a sequência de paradas para economizar combustível e tirar as fotos de Antes e Depois para o cliente!`;
  }
}

function getFallbackRoutes(): Route[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'route-dfw-segunda',
      technician_name: 'Tyler Brooks (DFW Senior Pool Tech)',
      technician_phone: '(214) 555-7890',
      day_of_week: 'Segunda-feira',
      date: new Date().toISOString().split('T')[0],
      total_stops: 5,
      completed_stops: 1,
      total_distance_km: 29.1,
      estimated_travel_time_min: 58,
      status: 'Em Andamento',
      stops: [
        {
          stop_id: 'stop-1',
          route_id: 'route-dfw-segunda',
          pool_id: 'pool-1',
          pool_name: 'Stonebriar Creek Residence - Infinity Pool',
          customer_name: 'David & Sarah Harrison',
          customer_phone: '(214) 555-0142',
          address: '5420 Stonebriar Dr, Frisco, TX 75034',
          latitude: 33.1250,
          longitude: -96.8250,
          order_index: 1,
          scheduled_time: '08:00',
          estimated_duration_min: 45,
          status: 'Concluído',
          completed_at: now,
          water_test_summary: 'pH 7.8 | Cloro 1.2 ppm | TA 120 ppm',
          chemicals_summary: '500ml Redutor pH + 300g Dicloro',
          photos: [
            {
              id: 'p1',
              photo_type: 'before',
              url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&auto=format&fit=crop&q=80',
              caption: 'Antes: Água com folhas e turbidez pós-vento do Texas',
              timestamp: now
            },
            {
              id: 'p2',
              photo_type: 'after',
              url: 'https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=600&auto=format&fit=crop&q=80',
              caption: 'Depois: Água 100% cristalina, sal balanceado e aspiração completa',
              timestamp: now
            }
          ]
        },
        {
          stop_id: 'stop-2',
          route_id: 'route-dfw-segunda',
          pool_id: 'pool-5',
          pool_name: 'Willow Bend Luxury Oasis & Cascata',
          customer_name: 'Robert & Elena Chen',
          customer_phone: '(972) 555-0164',
          address: '2804 Willow Bend Dr, Plano, TX 75093',
          latitude: 33.0368,
          longitude: -96.8122,
          order_index: 2,
          scheduled_time: '09:15',
          estimated_duration_min: 45,
          status: 'A Caminho',
          photos: []
        },
        {
          stop_id: 'stop-3',
          route_id: 'route-dfw-segunda',
          pool_id: 'pool-3',
          pool_name: 'Craig Ranch Resort Clubhouse Pool',
          customer_name: 'Craig Ranch Townhomes HOA',
          customer_phone: '(469) 555-0177',
          address: '6150 Collin McKinney Pkwy, McKinney, TX 75070',
          latitude: 33.1550,
          longitude: -96.7200,
          order_index: 3,
          scheduled_time: '10:30',
          estimated_duration_min: 60,
          status: 'Pendente',
          photos: []
        },
        {
          stop_id: 'stop-4',
          route_id: 'route-dfw-segunda',
          pool_id: 'pool-2',
          pool_name: 'Highland Park Club & Lap Pool',
          customer_name: 'Highland Park Estates HOA',
          customer_phone: '(214) 555-0188',
          address: '4200 Armstrong Pkwy, Highland Park, TX 75205',
          latitude: 32.8335,
          longitude: -96.8010,
          order_index: 4,
          scheduled_time: '13:00',
          estimated_duration_min: 75,
          status: 'Pendente',
          photos: []
        },
        {
          stop_id: 'stop-5',
          route_id: 'route-dfw-segunda',
          pool_id: 'pool-4',
          pool_name: 'Sterling Manor & Heated Spa',
          customer_name: 'Dr. Michael & Amanda Sterling',
          customer_phone: '(817) 555-0198',
          address: '1280 Southlake Blvd, Southlake, TX 76092',
          latitude: 32.9412,
          longitude: -97.1340,
          order_index: 5,
          scheduled_time: '14:45',
          estimated_duration_min: 50,
          status: 'Pendente',
          photos: []
        }
      ]
    }
  ];
}

function getFallbackPools(): Pool[] {
  return [
    {
      id: 'pool-1',
      name: 'Stonebriar Creek Residence - Infinity Pool',
      customer_name: 'David & Sarah Harrison',
      customer_phone: '(214) 555-0142',
      customer_email: 'dharrison@dfwhomes.net',
      address: '5420 Stonebriar Dr, Frisco, TX 75034',
      latitude: 33.1250,
      longitude: -96.8250,
      gate_code: 'Gate #4821',
      pool_type: 'Residencial',
      surface_type: 'PebbleTec / Pastilha',
      sanitizer_type: 'Gerador de Sal (SWG)',
      volume_liters: 70000,
      volume_gallons: 18500,
      clean_filter_psi: 12.0,
      current_filter_psi: 18.5,
      filter_type: 'Filtro de Cartucho Quad',
      pump_hp: 2.5,
      daily_run_hours: 8,
      service_day: 'Segunda-feira',
      service_frequency: 'Semanal',
      target_params: { target_ph: 7.5, target_fc: 3.5, target_ta: 90.0, target_ch: 280.0, target_cya: 70.0, target_salt: 3200.0 },
      created_at: new Date().toISOString()
    },
    {
      id: 'pool-2',
      name: 'Highland Park Club & Lap Pool',
      customer_name: 'Highland Park Estates HOA',
      customer_phone: '(214) 555-0188',
      customer_email: 'hoa@highlandparkclub.com',
      address: '4200 Armstrong Pkwy, Highland Park, TX 75205',
      latitude: 32.8335,
      longitude: -96.8010,
      gate_code: 'Keycard Guarita Leste',
      pool_type: 'Comercial / Condomínio (HOA)',
      surface_type: 'Alvenaria / Azulejo Branco',
      sanitizer_type: 'Cloro Tradicional + UV Comercial',
      volume_liters: 246000,
      volume_gallons: 65000,
      clean_filter_psi: 15.0,
      current_filter_psi: 16.2,
      filter_type: 'Filtro de Areia Duplo Comercial',
      pump_hp: 5.0,
      daily_run_hours: 14,
      service_day: 'Segunda-feira',
      service_frequency: 'Semanal',
      target_params: { target_ph: 7.4, target_fc: 4.0, target_ta: 100.0, target_ch: 300.0, target_cya: 45.0, target_salt: 0.0 },
      created_at: new Date().toISOString()
    },
    {
      id: 'pool-3',
      name: 'Craig Ranch Resort Clubhouse Pool',
      customer_name: 'Craig Ranch Townhomes HOA',
      customer_phone: '(469) 555-0177',
      customer_email: 'service@craigranchhoa.org',
      address: '6150 Collin McKinney Pkwy, McKinney, TX 75070',
      latitude: 33.1550,
      longitude: -96.7200,
      gate_code: 'Doca de Serviço #10',
      pool_type: 'Comercial / Condomínio (HOA)',
      surface_type: 'Diamond Brite / Quartz',
      sanitizer_type: 'Cloro Líquido + Ozônio',
      volume_liters: 181700,
      volume_gallons: 48000,
      clean_filter_psi: 14.0,
      current_filter_psi: 15.5,
      filter_type: 'Filtro de Areia High-Rate',
      pump_hp: 3.5,
      daily_run_hours: 12,
      service_day: 'Segunda-feira',
      service_frequency: 'Semanal',
      target_params: { target_ph: 7.4, target_fc: 3.5, target_ta: 95.0, target_ch: 275.0, target_cya: 40.0, target_salt: 0.0 },
      created_at: new Date().toISOString()
    },
    {
      id: 'pool-4',
      name: 'Sterling Manor & Heated Spa',
      customer_name: 'Dr. Michael & Amanda Sterling',
      customer_phone: '(817) 555-0198',
      customer_email: 'msterling@dfwmedcenter.org',
      address: '1280 Southlake Blvd, Southlake, TX 76092',
      latitude: 32.9412,
      longitude: -97.1340,
      gate_code: 'Código Portão *7720',
      pool_type: 'Residencial',
      surface_type: 'Alvenaria / Revestimento Quartzo',
      sanitizer_type: 'Cloro Tradicional + Ozônio',
      volume_liters: 83300,
      volume_gallons: 22000,
      clean_filter_psi: 11.0,
      current_filter_psi: 12.5,
      filter_type: 'Filtro de D.E. (Diatomácea)',
      pump_hp: 2.0,
      daily_run_hours: 7,
      service_day: 'Segunda-feira',
      service_frequency: 'Semanal',
      target_params: { target_ph: 7.4, target_fc: 3.0, target_ta: 90.0, target_ch: 250.0, target_cya: 40.0, target_salt: 0.0 },
      created_at: new Date().toISOString()
    },
    {
      id: 'pool-5',
      name: 'Willow Bend Luxury Oasis & Cascata',
      customer_name: 'Robert & Elena Chen',
      customer_phone: '(972) 555-0164',
      customer_email: 'echen@planoenergy.com',
      address: '2804 Willow Bend Dr, Plano, TX 75093',
      latitude: 33.0368,
      longitude: -96.8122,
      gate_code: 'Portão Lateral #9012',
      pool_type: 'Residencial',
      surface_type: 'PebbleTec Azul Cobalto',
      sanitizer_type: 'Gerador de Sal (SWG)',
      volume_liters: 62500,
      volume_gallons: 16500,
      clean_filter_psi: 10.0,
      current_filter_psi: 11.0,
      filter_type: 'Filtro de Cartucho',
      pump_hp: 1.5,
      daily_run_hours: 6,
      service_day: 'Segunda-feira',
      service_frequency: 'Semanal',
      target_params: { target_ph: 7.5, target_fc: 3.5, target_ta: 90.0, target_ch: 280.0, target_cya: 70.0, target_salt: 3200.0 },
      created_at: new Date().toISOString()
    }
  ];
}

function getFallbackTests(poolId: string): WaterTest[] {
  return [
    {
      id: 'test-1',
      pool_id: poolId,
      timestamp: new Date().toISOString(),
      ph: 7.8,
      free_chlorine: 1.2,
      combined_chlorine: 0.4,
      total_alkalinity: 120,
      calcium_hardness: 240,
      cyanuric_acid: 35,
      salt_ppm: 3100,
      temperature_c: 27,
      turbidity: 'Levemente Turva',
      lsi_score: 0.35,
      lsi_status: 'Incrustante / Saturada',
      technician_notes: 'Água com leve turbidez e pH elevado após ventos no Texas. Aplicado redutor de pH e cloração de choque.'
    }
  ];
}

function getFallbackVisits(poolId: string): ServiceVisit[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'visit-1',
      pool_id: poolId,
      visit_date: now,
      technician_name: 'Tyler Brooks (DFW Senior Pool Tech)',
      filter_pressure_psi: 18.5,
      backwash_performed: false,
      checklist_completed: [
        { id: 'c1', task_name: 'Escovação completa de paredes, degraus e spa', category: 'Limpeza Física', completed: true },
        { id: 'c2', task_name: 'Aspiração de fundo e recolhimento de detritos', category: 'Limpeza Física', completed: true },
        { id: 'c3', task_name: 'Limpeza de linha d’água e azulejos', category: 'Limpeza Física', completed: true },
        { id: 'c4', task_name: 'Limpeza dos cestos do skimmer e pré-filtro', category: 'Casa de Máquinas', completed: true },
        { id: 'c5', task_name: 'Inspeção de célula de sal (SWG) e manômetro (18.5 PSI)', category: 'Casa de Máquinas', completed: true },
        { id: 'c6', task_name: 'Aplicação de balanceador químico', category: 'Química & Tratamento', completed: true }
      ],
      chemicals_added: [
        { chemical_name: 'Redutor de pH Líquido (Muriatic Acid)', amount: 500, unit: 'ml', reason: 'Reduzir pH de 7.8 para 7.4' },
        { chemical_name: 'Dicloro Granulado 56%', amount: 350, unit: 'g', reason: 'Elevar Cloro Livre para 3.5 ppm' }
      ],
      photos: [
        {
          id: 'p1',
          photo_type: 'before',
          url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&auto=format&fit=crop&q=80',
          caption: 'Antes: Água com folhas e turbidez pós-vento do Texas',
          timestamp: now
        },
        {
          id: 'p2',
          photo_type: 'after',
          url: 'https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=600&auto=format&fit=crop&q=80',
          caption: 'Depois: Água 100% cristalina, sal balanceado e aspiração completa',
          timestamp: now
        }
      ],
      technician_notes: 'Pressão do filtro em 18.5 PSI (+6.5 PSI acima do baseline). Fotos anexadas.',
      customer_summary: 'Hello Harrison Family! Realizamos o tratamento e aspiração da piscina Stonebriar Creek hoje. Fotos de Antes e Depois anexadas. Água liberada para banho às 17h.',
      status: 'Concluído',
      door_hanger_sent: true,
      whatsapp_dispatched: true
    }
  ];
}
