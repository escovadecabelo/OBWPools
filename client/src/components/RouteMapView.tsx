import React, { useState } from 'react';
import type { Route, RouteStop } from '../types/pool';
import { 
  Navigation, ExternalLink, Sparkles, Compass
} from 'lucide-react';

interface RouteMapViewProps {
  route: Route;
  onSelectStop?: (stop: RouteStop) => void;
  onOptimize?: () => void;
}

export const RouteMapView: React.FC<RouteMapViewProps> = ({
  route,
  onSelectStop,
  onOptimize
}) => {
  const [selectedStop, setSelectedStop] = useState<RouteStop | null>(
    route.stops.length > 0 ? route.stops[0] : null
  );

  const stops = route.stops || [];

  // DFW Geo Bounds Calculation
  const lats = stops.map(s => s.latitude);
  const lngs = stops.map(s => s.longitude);
  const minLat = lats.length > 0 ? Math.min(...lats) - 0.04 : 32.7;
  const maxLat = lats.length > 0 ? Math.max(...lats) + 0.04 : 33.3;
  const minLng = lngs.length > 0 ? Math.min(...lngs) - 0.04 : -97.2;
  const maxLng = lngs.length > 0 ? Math.max(...lngs) + 0.04 : -96.6;

  const latSpan = Math.max(0.01, maxLat - minLat);
  const lngSpan = Math.max(0.01, maxLng - minLng);

  const getSvgCoords = (lat: number, lng: number) => {
    const normX = (lng - minLng) / lngSpan;
    const normY = (maxLat - lat) / latSpan;
    return {
      x: 60 + (normX * 680),
      y: 50 + (normY * 260)
    };
  };

  const handleOpenGoogleMaps = (stop: RouteStop) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`;
    window.open(url, '_blank');
  };

  const handleOpenWaze = (stop: RouteStop) => {
    const url = `https://waze.com/ul?ll=${stop.latitude},${stop.longitude}&navigate=yes`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* Map Container */}
      <div className="glass-panel" style={{
        padding: 20,
        position: 'relative',
        background: 'radial-gradient(ellipse at bottom, rgba(0, 242, 254, 0.05) 0%, rgba(5, 11, 20, 0.95) 70%)',
        overflow: 'hidden'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Compass size={20} color="#00f2fe" />
            <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
              Mapa Geoespacial de Rotas & GPS ({route.technician_name.split(' ')[0]})
            </h3>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
              📍 {stops.length} paradas • {route.total_distance_km} milhas estimadas
            </span>
            {onOptimize && (
              <button className="btn-primary" onClick={onOptimize} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                <Sparkles size={14} /> Reotimizar TSP
              </button>
            )}
          </div>
        </div>

        {/* Vector Map Canvas */}
        <div style={{
          width: '100%',
          height: 340,
          background: 'linear-gradient(180deg, #030812 0%, #061224 100%)',
          borderRadius: 14,
          border: '1px solid rgba(0, 242, 254, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle Map Grid lines */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(0, 242, 254, 0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            opacity: 0.6
          }} />

          {/* DFW Regional Waterway Landmark Curves */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            {/* Lake Lewisville / Ray Hubbard aesthetic water silhouette */}
            <path
              d="M 50,40 Q 250,80 350,30 T 700,90"
              fill="none"
              stroke="rgba(0, 242, 254, 0.12)"
              strokeWidth="16"
              strokeLinecap="round"
            />
            
            {/* Route Path Polyline */}
            {stops.length > 1 && (
              <polyline
                points={stops.map(s => {
                  const pt = getSvgCoords(s.latitude, s.longitude);
                  return `${pt.x},${pt.y}`;
                }).join(' ')}
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="3.5"
                strokeDasharray="6,4"
              />
            )}

            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f2fe" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* Stop Pins on Map */}
            {stops.map((stop) => {
              const pt = getSvgCoords(stop.latitude, stop.longitude);
              const isSelected = selectedStop?.stop_id === stop.stop_id;
              const isDone = stop.status === 'Concluído';
              const isInProgress = stop.status === 'Em Atendimento';

              return (
                <g
                  key={stop.stop_id}
                  transform={`translate(${pt.x}, ${pt.y})`}
                  onClick={() => {
                    setSelectedStop(stop);
                    if (onSelectStop) onSelectStop(stop);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Pulse Ring for active */}
                  {isInProgress && (
                    <circle r="22" fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.6">
                      <animate attributeName="r" values="14;26;14" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Pin Circle */}
                  <circle
                    r={isSelected ? 16 : 13}
                    fill={isDone ? '#10b981' : isInProgress ? '#f59e0b' : '#00f2fe'}
                    stroke="#030812"
                    strokeWidth="3"
                    filter="drop-shadow(0 2px 8px rgba(0,0,0,0.8))"
                  />

                  {/* Pin Sequence Number */}
                  <text
                    textAnchor="middle"
                    dy="4"
                    fill="#030812"
                    fontSize={isSelected ? '12' : '10'}
                    fontWeight="800"
                  >
                    {stop.order_index}
                  </text>

                  {/* Stop Name Label */}
                  <text
                    x="20"
                    y="4"
                    fill={isSelected ? '#00f2fe' : '#e2e8f0'}
                    fontSize="11"
                    fontWeight={isSelected ? '700' : '500'}
                    filter="drop-shadow(0 1px 3px rgba(0,0,0,0.9))"
                  >
                    {stop.pool_name.split(' ')[0]} {stop.pool_name.split(' ')[1] || ''}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Stop Details & GPS Launchers */}
        {selectedStop && (
          <div style={{
            marginTop: 14,
            background: 'rgba(5, 11, 20, 0.85)',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            borderRadius: 12,
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
                  Parada #{selectedStop.order_index} ({selectedStop.scheduled_time})
                </span>
                <span className={`badge ${selectedStop.status === 'Concluído' ? 'badge-emerald' : selectedStop.status === 'Em Atendimento' ? 'badge-amber' : 'badge-cyan'}`} style={{ fontSize: '0.75rem' }}>
                  {selectedStop.status}
                </span>
              </div>

              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                {selectedStop.pool_name} • <span style={{ color: '#00f2fe' }}>{selectedStop.customer_name}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                📍 {selectedStop.address}
              </div>
            </div>

            {/* GPS 1-Click Launch Buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn-primary"
                onClick={() => handleOpenGoogleMaps(selectedStop)}
                style={{ padding: '8px 14px', fontSize: '0.8rem', borderRadius: 8 }}
              >
                <Navigation size={14} /> Google Maps
              </button>

              <button
                className="btn-secondary"
                onClick={() => handleOpenWaze(selectedStop)}
                style={{ padding: '8px 14px', fontSize: '0.8rem', borderRadius: 8 }}
              >
                <ExternalLink size={14} color="#00f2fe" /> Waze GPS
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
