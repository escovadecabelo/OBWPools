import React, { useState } from 'react';
import { getDFWCurrentWeather, DFW_CITIES } from '../lib/weather';
import { 
  Sun, Wind, AlertTriangle, 
  MapPin, ShieldAlert, Thermometer, ShieldCheck, ChevronRight
} from 'lucide-react';

interface WeatherAlertsBannerProps {
  onNavigateToTab?: (tab: string) => void;
}

export const WeatherAlertsBanner: React.FC<WeatherAlertsBannerProps> = ({ onNavigateToTab }) => {
  const [selectedCity, setSelectedCity] = useState<string>('Frisco, TX');
  const weather = getDFWCurrentWeather(selectedCity);

  return (
    <div className="glass-panel" style={{
      padding: '16px 20px',
      background: 'radial-gradient(ellipse at top right, rgba(0, 242, 254, 0.08) 0%, rgba(5, 11, 20, 0.9) 70%)',
      border: '1px solid rgba(0, 242, 254, 0.25)',
      borderRadius: 14,
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }}>
      {/* Top Header: Weather City Selector & Quick Metrics */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'rgba(0, 242, 254, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sun size={22} color="#00f2fe" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                Radar Climático DFW & Cuidados de Campo
              </span>
              <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                Tempo Real
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={12} color="#00f2fe" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#00f2fe',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {DFW_CITIES.map(c => (
                  <option key={c} value={c} style={{ background: '#0a101d', color: '#ffffff' }}>
                    {c}
                  </option>
                ))}
              </select>
              <span>• {weather.condition}</span>
            </div>
          </div>
        </div>

        {/* Live Weather Metrics Pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '6px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Thermometer size={14} color="#f59e0b" />
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
              {weather.temperature_f}°F
            </span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>({weather.temperature_c}°C)</span>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '6px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sun size={14} color="#00f2fe" />
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Índice UV:</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: weather.uv_index >= 7 ? '#fb7185' : '#10b981' }}>
              {weather.uv_index} (Alto)
            </span>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '6px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Wind size={14} color="#38bdf8" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
              {weather.wind_mph} mph
            </span>
          </div>
        </div>
      </div>

      {/* Weather Alerts List */}
      {weather.alerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {weather.alerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                background: alert.severity === 'danger'
                  ? 'rgba(244, 63, 94, 0.12)'
                  : alert.severity === 'warning'
                  ? 'rgba(245, 158, 11, 0.12)'
                  : 'rgba(0, 242, 254, 0.08)',
                border: `1px solid ${
                  alert.severity === 'danger' ? 'rgba(244, 63, 94, 0.35)' :
                  alert.severity === 'warning' ? 'rgba(245, 158, 11, 0.35)' :
                  'rgba(0, 242, 254, 0.2)'
                }`,
                borderRadius: 10,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12
              }}
            >
              <div style={{ marginTop: 2 }}>
                {alert.severity === 'danger' ? (
                  <ShieldAlert size={18} color="#fb7185" />
                ) : alert.severity === 'warning' ? (
                  <AlertTriangle size={18} color="#f59e0b" />
                ) : (
                  <ShieldCheck size={18} color="#00f2fe" />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: alert.severity === 'danger' ? '#fb7185' : alert.severity === 'warning' ? '#f59e0b' : '#00f2fe' }}>
                  {alert.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '2px 0 4px' }}>
                  {alert.message}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: 6 }}>
                  💡 <strong>Recomendação de Campo:</strong> {alert.action_recommendation}
                </div>
              </div>

              {onNavigateToTab && (
                <button
                  className="btn-secondary"
                  onClick={() => onNavigateToTab('lab')}
                  style={{ padding: '4px 8px', fontSize: '0.7rem', whiteSpace: 'nowrap' }}
                >
                  Ir para Lab <ChevronRight size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
