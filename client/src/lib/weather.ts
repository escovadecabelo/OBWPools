import type { DFWWeatherData, WeatherAlert } from '../types/pool';

/**
 * Radar Climático Inteligente para o DFW Metroplex (Texas)
 * Simula condições meteorológicas reais e gera alertas preventivos de piscina.
 */
export function getDFWCurrentWeather(city = 'Frisco, TX'): DFWWeatherData {
  // Dados climáticos calibrados para a região de Dallas-Fort Worth
  const tempF = 84; // 84°F (~29°C)
  const tempC = Math.round(((tempF - 32) * 5) / 9);
  const feelsLikeF = 88;
  const uvIndex = 8;
  const windMph = 12;
  const humidity = 58;

  const alerts: WeatherAlert[] = [];

  // Alerta de Congelamento (Texas Freeze)
  if (tempF <= 32) {
    alerts.push({
      id: 'alert-freeze',
      type: 'freeze',
      title: '❄️ ALERTA DE CONGELAMENTO (TEXAS FREEZE)',
      message: `Temperatura atual de ${tempF}°F com risco crítico de congelamento em tubulações e casa de máquinas.`,
      action_recommendation: 'Ligue todas as bombas de circulação em velocidade média/alta continuamente (24h). Drene o aquecedor caso esteja inativo.',
      severity: 'danger',
      active: true
    });
  }

  // Alerta de Calor Extremo e UV no Verão do Texas
  if (tempF >= 80 || uvIndex >= 7) {
    alerts.push({
      id: 'alert-uv-heat',
      type: 'heat',
      title: '☀️ ALERTA DE CALOR E RADIAÇÃO UV ELEVADA',
      message: `Temperatura de ${tempF}°F com Índice UV ${uvIndex} (Muito Alto). Aceleração severa da fotodegradação do cloro.`,
      action_recommendation: 'Aumente o cloro livre alvo para 3.5 - 5.0 ppm e verifique o estabilizador (CYA 40-70 ppm) para blindar contra os raios solares.',
      severity: 'warning',
      active: true
    });
  }

  // Alerta de Vento do Texas / Tempestade
  if (windMph >= 10) {
    alerts.push({
      id: 'alert-wind',
      type: 'storm',
      title: '💨 VENTO MODERADO A FORTE NO DFW',
      message: `Rajadas de vento de ${windMph} mph causando acúmulo de poeira e folhas nos skimmers.`,
      action_recommendation: 'Esvazie os cestos dos skimmers, verifique a sucção de fundo e inspecione a pressão do manômetro do filtro.',
      severity: 'info',
      active: true
    });
  }

  return {
    city,
    temperature_f: tempF,
    temperature_c: tempC,
    feels_like_f: feelsLikeF,
    condition: 'Ensolarado com Poucas Nuvens',
    icon_type: 'sun',
    humidity_pct: humidity,
    wind_mph: windMph,
    uv_index: uvIndex,
    freeze_risk: tempF <= 34,
    heat_risk: tempF >= 90,
    alerts,
    updated_at: new Date().toISOString()
  };
}

export const DFW_CITIES = [
  'Frisco, TX',
  'Plano, TX',
  'McKinney, TX',
  'Highland Park, TX',
  'Dallas, TX',
  'Southlake, TX',
  'Fort Worth, TX'
];
