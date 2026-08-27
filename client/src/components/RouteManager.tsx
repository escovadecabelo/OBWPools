import React, { useState, useEffect } from 'react';
import type { Route, RouteStop, ServicePhoto } from '../types/pool';
import { fetchRoutes, optimizeRouteApi, updateStopPhotosAndStatus } from '../lib/api';
import { PhotoProofManager } from './PhotoProofManager';
import { 
  Navigation, MapPin, Sparkles, CheckCircle2, 
  Camera, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RouteManagerProps {
  onSelectPoolForLab?: (poolId: string) => void;
}

export const RouteManager: React.FC<RouteManagerProps> = () => {
  const [, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [activeStopForPhotos, setActiveStopForPhotos] = useState<RouteStop | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizeMessage, setOptimizeMessage] = useState<string>('');

  useEffect(() => {
    async function loadRoutes() {
      const data = await fetchRoutes();
      setRoutes(data);
      if (data.length > 0) {
        setSelectedRoute(data[0]);
      }
    }
    loadRoutes();
  }, []);

  const handleOptimizeRoute = async () => {
    if (!selectedRoute) return;
    setIsOptimizing(true);
    try {
      const optimized = await optimizeRouteApi(selectedRoute.id);
      setSelectedRoute(optimized);
      setRoutes(prev => prev.map(r => r.id === optimized.id ? optimized : r));
      setOptimizeMessage('⚡ Rota reordenada pelo algoritmo TSP para o menor trajeto e menor consumo de combustível!');
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.5 }
      });
      setTimeout(() => setOptimizeMessage(''), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleUpdateStopStatus = async (stop: RouteStop, newStatus: 'Pendente' | 'A Caminho' | 'Em Atendimento' | 'Concluído') => {
    try {
      await updateStopPhotosAndStatus(stop.stop_id, newStatus, stop.photos || []);
      if (selectedRoute) {
        const updatedStops = selectedRoute.stops.map(s => s.stop_id === stop.stop_id ? { ...s, status: newStatus } : s);
        const completedCount = updatedStops.filter(s => s.status === 'Concluído').length;
        const updatedRoute: Route = {
          ...selectedRoute,
          completed_stops: completedCount,
          stops: updatedStops
        };
        setSelectedRoute(updatedRoute);
        setRoutes(prev => prev.map(r => r.id === updatedRoute.id ? updatedRoute : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhotosUpdated = (stopId: string, photos: ServicePhoto[]) => {
    if (!selectedRoute) return;
    const updatedStops = selectedRoute.stops.map(s => s.stop_id === stopId ? { ...s, photos } : s);
    const updatedRoute = { ...selectedRoute, stops: updatedStops };
    setSelectedRoute(updatedRoute);
    setRoutes(prev => prev.map(r => r.id === updatedRoute.id ? updatedRoute : r));
  };

  if (!selectedRoute) {
    return (
      <div style={{ textAlign: 'center', padding: 50, color: '#00f2fe' }}>
        <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
        <h3>Carregando Rotas de Limpeza...</h3>
      </div>
    );
  }

  const completionPercentage = Math.round((selectedRoute.completed_stops / Math.max(1, selectedRoute.total_stops)) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Header */}
      <div className="glass-panel" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.4)'
          }}>
            <Navigation size={24} color="#031224" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: '1.6rem', color: '#ffffff' }}>Administração & Otimização de Rotas</h1>
              <span className="badge badge-cyan">{selectedRoute.day_of_week}</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Técnico Responsável: <strong>{selectedRoute.technician_name}</strong> • Data: {selectedRoute.date}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            onClick={handleOptimizeRoute}
            disabled={isOptimizing}
            style={{ boxShadow: '0 0 20px rgba(0, 242, 254, 0.4)' }}
          >
            {isOptimizing ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
            <span>⚡ Otimizar Melhor Caminho (IA)</span>
          </button>
        </div>
      </div>

      {/* Optimize Alert Message */}
      {optimizeMessage && (
        <div style={{
          background: 'rgba(0, 242, 254, 0.12)',
          border: '1px solid rgba(0, 242, 254, 0.4)',
          padding: '14px 20px',
          borderRadius: 12,
          color: '#00f2fe',
          fontSize: '0.9rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <Sparkles size={20} />
          <span>{optimizeMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {/* Progress */}
        <div className="glass-panel" style={{ padding: 18 }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Progresso da Rota</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
              {selectedRoute.completed_stops} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/ {selectedRoute.total_stops}</span>
            </span>
            <span className={`badge ${completionPercentage === 100 ? 'badge-emerald' : 'badge-cyan'}`}>
              {completionPercentage}%
            </span>
          </div>
          <div style={{ height: 6, background: '#152945', borderRadius: 3, marginTop: 10, overflow: 'hidden' }}>
            <div style={{ width: `${completionPercentage}%`, height: '100%', background: 'linear-gradient(to right, #00f2fe, #10b981)', transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* Total Distance */}
        <div className="glass-panel" style={{ padding: 18 }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Distância Total Otimizada</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#00f2fe' }}>
            {selectedRoute.total_distance_km} <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>milhas (mi)</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: 4 }}>
            📉 ~3.8 mi economizadas via TSP
          </div>
        </div>

        {/* Travel Time */}
        <div className="glass-panel" style={{ padding: 18 }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Tempo de Deslocamento</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
            {selectedRoute.estimated_travel_time_min} <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>minutos</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
            Média de 13 min entre paradas
          </div>
        </div>

        {/* Technician Status */}
        <div className="glass-panel" style={{ padding: 18 }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Status Geral</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>
            {selectedRoute.status}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
            GPS & WhatsApp ativos
          </div>
        </div>
      </div>

      {/* Main Stops Sequence & Map Trajectory View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24 }}>
        
        {/* LEFT: Ordered Stops List with Field Actions */}
        <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 12 }}>
            <h2 style={{ fontSize: '1.2rem', color: '#f1f5f9' }}>
              Sequência de Atendimentos ({selectedRoute.stops.length} Piscinas)
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Ordem do Melhor Caminho</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {selectedRoute.stops.map((stop) => {
              const isCompleted = stop.status === 'Concluído';
              const isInProgress = stop.status === 'Em Atendimento';
              const isEnRoute = stop.status === 'A Caminho';

              const wazeUrl = `https://waze.com/ul?ll=${stop.latitude},${stop.longitude}&navigate=yes`;
              const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`;

              return (
                <div
                  key={stop.stop_id}
                  style={{
                    background: isCompleted 
                      ? 'rgba(16, 185, 129, 0.05)'
                      : isInProgress
                      ? 'rgba(0, 242, 254, 0.1)'
                      : 'rgba(10, 21, 38, 0.8)',
                    border: isCompleted
                      ? '1px solid rgba(16, 185, 129, 0.3)'
                      : isInProgress
                      ? '1px solid rgba(0, 242, 254, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 14,
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    boxShadow: isInProgress ? '0 0 20px rgba(0, 242, 254, 0.2)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Top Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: isCompleted ? '#10b981' : isInProgress ? '#00f2fe' : 'rgba(255, 255, 255, 0.1)',
                        color: isCompleted || isInProgress ? '#031224' : '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {stop.order_index}
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#00f2fe' }}>
                        ⏰ Previsto: {stop.scheduled_time} ({stop.estimated_duration_min} min)
                      </span>
                    </div>

                    <span className={`badge ${isCompleted ? 'badge-emerald' : isInProgress ? 'badge-cyan' : isEnRoute ? 'badge-amber' : 'badge-amber'}`} style={{ opacity: isCompleted || isInProgress ? 1 : 0.7 }}>
                      {stop.status}
                    </span>
                  </div>

                  {/* Pool & Customer Info */}
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: 2 }}>{stop.pool_name}</h3>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={14} color="#4facfe" />
                      <span>{stop.address}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>
                      Proprietário: <strong>{stop.customer_name}</strong> {stop.customer_phone && `• ${stop.customer_phone}`}
                    </div>
                  </div>

                  {/* Photos Preview Indicator */}
                  {stop.photos && stop.photos.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {stop.photos.map((p, pi) => (
                          <img
                            key={pi}
                            src={p.url}
                            alt="Foto"
                            style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', border: '1px solid rgba(0, 242, 254, 0.3)' }}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                        {stop.photos.length} fotos anexadas
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 8,
                    paddingTop: 10,
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    {/* GPS Navigation Links */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a
                        href={wazeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                      >
                        🚗 Waze
                      </a>
                      <a
                        href={gmapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                      >
                        🗺️ Maps
                      </a>
                    </div>

                    {/* Status & Photo Triggers */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn-secondary"
                        onClick={() => setActiveStopForPhotos(stop)}
                        style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: stop.photos?.length ? '#10b981' : undefined }}
                      >
                        <Camera size={14} color="#00f2fe" />
                        <span>Fotos ({stop.photos?.length || 0})</span>
                      </button>

                      {stop.status === 'Pendente' && (
                        <button
                          className="btn-secondary"
                          onClick={() => handleUpdateStopStatus(stop, 'A Caminho')}
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                        >
                          A Caminho
                        </button>
                      )}

                      {stop.status === 'A Caminho' && (
                        <button
                          className="btn-primary"
                          onClick={() => handleUpdateStopStatus(stop, 'Em Atendimento')}
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                        >
                          Cheguei
                        </button>
                      )}

                      {stop.status === 'Em Atendimento' && (
                        <button
                          className="btn-primary"
                          onClick={() => setActiveStopForPhotos(stop)}
                          style={{ padding: '6px 10px', fontSize: '0.75rem', background: 'linear-gradient(135deg, #10b981, #00f2fe)' }}
                        >
                          📸 Fotos & Concluir
                        </button>
                      )}

                      {stop.status === 'Concluído' && (
                        <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                          <CheckCircle2 size={14} /> Finalizado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Visual Route Trajectory Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>Trajeto Geográfico Otimizado</h3>
              <span className="badge badge-emerald">Menor Caminho TSP</span>
            </div>

            <div style={{
              width: '100%',
              height: 280,
              background: 'radial-gradient(circle at 50% 50%, rgba(0, 242, 254, 0.05) 0%, rgba(5, 11, 20, 0.95) 100%)',
              borderRadius: 14,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              position: 'relative',
              overflow: 'hidden',
              padding: 16
            }}>
              {(() => {
                const stops = selectedRoute.stops;
                if (!stops || stops.length === 0) return null;

                const lats = stops.map(s => s.latitude);
                const lngs = stops.map(s => s.longitude);
                const minLat = Math.min(...lats);
                const maxLat = Math.max(...lats);
                const minLng = Math.min(...lngs);
                const maxLng = Math.max(...lngs);

                const getSvgCoords = (lat: number, lng: number) => {
                  const x = (maxLng === minLng) ? 200 : 55 + ((lng - minLng) / (maxLng - minLng)) * 290;
                  const y = (maxLat === minLat) ? 120 : 190 - ((lat - minLat) / (maxLat - minLat)) * 130;
                  return { x, y };
                };

                const sortedStops = [...stops].sort((a, b) => a.order_index - b.order_index);
                const pathD = sortedStops.map((s, i) => {
                  const { x, y } = getSvgCoords(s.latitude, s.longitude);
                  return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                }).join(' ');

                return (
                  <svg width="100%" height="100%" viewBox="0 0 400 240" fill="none">
                    {/* Grid Lines */}
                    <path d="M 0 60 L 400 60 M 0 120 L 400 120 M 0 180 L 400 180" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <path d="M 100 0 L 100 240 M 200 0 L 200 240 M 300 0 L 300 240" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                    {/* Dynamic Path */}
                    <path
                      d={pathD}
                      stroke="#00f2fe"
                      strokeWidth="3"
                      strokeDasharray="6 4"
                      style={{ filter: 'drop-shadow(0 0 8px #00f2fe)' }}
                    />

                    {/* Dynamic Nodes */}
                    {sortedStops.map((stop) => {
                      const { x, y } = getSvgCoords(stop.latitude, stop.longitude);
                      const isCompleted = stop.status === 'Concluído';
                      const isInProgress = stop.status === 'Em Atendimento';
                      const isEnRoute = stop.status === 'A Caminho';
                      const color = isCompleted ? '#10b981' : isInProgress ? '#00f2fe' : isEnRoute ? '#f59e0b' : '#38bdf8';

                      // Extrair nome curto da cidade / região DFW
                      const parts = stop.address.split(',');
                      let label = parts.length > 1 ? parts[1].trim() : stop.pool_name.split(' ')[0];
                      if (label.length > 14) label = label.slice(0, 12) + '..';

                      return (
                        <g key={stop.stop_id}>
                          <circle cx={x} cy={y} r="13" fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
                          <text x={x} y={y + 4} fill="#031224" fontSize="11" fontWeight="bold" textAnchor="middle">{stop.order_index}</text>
                          <text x={x} y={y + 24} fill="#ffffff" fontSize="9.5" fontWeight="600" textAnchor="middle">
                            {label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                );
              })()}
            </div>

            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 14, textAlign: 'center' }}>
              Trajeto traçado por coordenadas GPS na região de <strong>DFW Metroplex (TX)</strong>. Ao clicar em <strong>Waze / Maps</strong>, o navegador abre diretamente na rota do próximo condomínio ou residência.
            </p>
          </div>

        </div>
      </div>

      {/* Modal de Captura de Fotos */}
      {activeStopForPhotos && (
        <PhotoProofManager
          stop={activeStopForPhotos}
          onPhotosUpdated={handlePhotosUpdated}
          onClose={() => setActiveStopForPhotos(null)}
        />
      )}
    </div>
  );
};
