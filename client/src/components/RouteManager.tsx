import React, { useState, useEffect } from 'react';
import type { Route, RouteStop, ServicePhoto, Technician, Pool } from '../types/pool';
import { 
  fetchRoutes, optimizeRouteApi, updateStopPhotosAndStatus, 
  fetchTechnicians, updateRouteApi, createRouteApi, addStopToRouteApi, 
  removeStopFromRouteApi, reassignStopApi, fetchPools,
  saveTechnicianApi, updateTechnicianApi, deleteTechnicianApi
} from '../lib/api';
import { PhotoProofManager } from './PhotoProofManager';
import { EditRouteModal } from './EditRouteModal';
import { EditTechnicianModal } from './EditTechnicianModal';
import { 
  Navigation, MapPin, Sparkles, 
  Camera, RefreshCw, User, Users, Edit3, Plus, Clock, UserCheck, Trash2
} from 'lucide-react';
import { safeOpenUrl } from '../lib/security';
import confetti from 'canvas-confetti';

interface RouteManagerProps {
  onSelectPoolForLab?: (poolId: string) => void;
}

export const RouteManager: React.FC<RouteManagerProps> = ({ onSelectPoolForLab }) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [activeStopForPhotos, setActiveStopForPhotos] = useState<RouteStop | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isTechModalOpen, setIsTechModalOpen] = useState<boolean>(false);
  const [techToEdit, setTechToEdit] = useState<Technician | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizeMessage, setOptimizeMessage] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      const [routesData, techsData, poolsData] = await Promise.all([
        fetchRoutes(),
        fetchTechnicians(),
        fetchPools()
      ]);
      setRoutes(routesData);
      setTechnicians(techsData);
      setPools(poolsData);
      if (routesData.length > 0) {
        setSelectedRoute(routesData[0]);
      }
    }
    loadData();
  }, []);

  const handleOptimizeRoute = async (routeId?: string) => {
    const targetId = routeId || selectedRoute?.id;
    if (!targetId) return;
    setIsOptimizing(true);
    try {
      const optimized = await optimizeRouteApi(targetId);
      if (selectedRoute && selectedRoute.id === targetId) {
        setSelectedRoute(optimized);
      }
      setRoutes(prev => prev.map(r => r.id === optimized.id ? optimized : r));
      setOptimizeMessage('⚡ Rota reordenada pelo algoritmo TSP para o menor trajeto em milhas!');
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

  const handleSaveRoute = async (updated: Route) => {
    setSelectedRoute(updated);
    setRoutes(prev => prev.map(r => r.id === updated.id ? updated : r));
    await updateRouteApi(updated.id, updated);
  };

  const handleAddStopToRoute = async (routeId: string, poolId: string, scheduledTime: string = '10:00') => {
    await addStopToRouteApi(routeId, poolId, scheduledTime);
    const updatedRoutes = await fetchRoutes();
    setRoutes(updatedRoutes);
    const curr = updatedRoutes.find(r => r.id === routeId);
    if (curr) setSelectedRoute(curr);
  };

  const handleRemoveStop = async (stopId: string) => {
    await removeStopFromRouteApi(stopId);
    const updatedRoutes = await fetchRoutes();
    setRoutes(updatedRoutes);
    if (selectedRoute) {
      const curr = updatedRoutes.find(r => r.id === selectedRoute.id);
      if (curr) setSelectedRoute(curr);
    }
  };

  const handleReassignStop = async (stopId: string, targetRouteId: string) => {
    await reassignStopApi(stopId, targetRouteId);
    const updatedRoutes = await fetchRoutes();
    setRoutes(updatedRoutes);
    if (selectedRoute) {
      const curr = updatedRoutes.find(r => r.id === selectedRoute.id);
      if (curr) setSelectedRoute(curr);
    }
  };

  const handleSaveTechnician = async (tech: Technician) => {
    if (techToEdit) {
      await updateTechnicianApi(tech.id, tech);
    } else {
      await saveTechnicianApi(tech);
    }
    const [updatedTechs, updatedRoutes] = await Promise.all([
      fetchTechnicians(),
      fetchRoutes()
    ]);
    setTechnicians(updatedTechs);
    setRoutes(updatedRoutes);

    if (selectedRoute) {
      const match = updatedRoutes.find(r => r.id === selectedRoute.id);
      if (match) {
        setSelectedRoute(match);
      } else if (techToEdit && (selectedRoute.technician_name === techToEdit.name || selectedRoute.technician_name.includes(techToEdit.name.split(' ')[0]))) {
        setSelectedRoute({
          ...selectedRoute,
          technician_name: tech.name,
          technician_phone: tech.phone
        });
      }
    }
    setOptimizeMessage(`✅ Perfil de ${tech.name} salvo com sucesso!`);
    setTimeout(() => setOptimizeMessage(''), 4000);
    setIsTechModalOpen(false);
  };

  const [showTeamRoster, setShowTeamRoster] = useState<boolean>(false);

  const handleDeleteTechnician = async (techId: string) => {
    await deleteTechnicianApi(techId);
    const [updatedTechs, updatedRoutes] = await Promise.all([
      fetchTechnicians(),
      fetchRoutes()
    ]);
    setTechnicians(updatedTechs);
    setRoutes(updatedRoutes);
    if (updatedRoutes.length > 0) {
      setSelectedRoute(updatedRoutes[0]);
    } else if (updatedTechs.length > 0) {
      const fallbackRoute: Route = {
        id: `route-${Date.now()}`,
        technician_name: updatedTechs[0].name,
        technician_phone: updatedTechs[0].phone,
        day_of_week: 'Segunda-feira',
        date: new Date().toISOString().split('T')[0],
        total_stops: 0,
        completed_stops: 0,
        total_distance_km: 0.0,
        estimated_travel_time_min: 0,
        status: 'Planejada',
        stops: []
      };
      await createRouteApi(fallbackRoute);
      setSelectedRoute(fallbackRoute);
      setRoutes([fallbackRoute]);
    }
    setOptimizeMessage('🗑️ Funcionário e rotas vinculadas excluídos com sucesso!');
    setTimeout(() => setOptimizeMessage(''), 4000);
    setIsTechModalOpen(false);
  };

  const handleEditActiveTech = () => {
    if (!selectedRoute) return;
    const tech = technicians.find(t => 
      t.name === selectedRoute.technician_name || 
      selectedRoute.technician_name.includes(t.name.split(' ')[0]) ||
      t.name.includes(selectedRoute.technician_name.split(' ')[0])
    ) || technicians[0] || {
      id: `tech-${Date.now()}`,
      name: selectedRoute.technician_name,
      phone: selectedRoute.technician_phone || '(214) 555-0000',
      role: 'Técnico de Rotas (DFW)'
    };
    setTechToEdit(tech);
    setIsTechModalOpen(true);
  };

  const handleCreateNewRoute = async () => {
    const tech = technicians[0] || { name: 'Novo Técnico', phone: '(214) 555-0000' };
    const newRoute: Partial<Route> = {
      id: `route-${Date.now()}`,
      technician_name: tech.name,
      technician_phone: tech.phone,
      day_of_week: 'Segunda-feira',
      date: new Date().toISOString().split('T')[0],
      total_stops: 0,
      completed_stops: 0,
      total_distance_km: 0.0,
      estimated_travel_time_min: 0,
      status: 'Planejada',
      stops: []
    };
    await createRouteApi(newRoute);
    const updatedRoutes = await fetchRoutes();
    setRoutes(updatedRoutes);
    const created = updatedRoutes.find(r => r.id === newRoute.id) || updatedRoutes[updatedRoutes.length - 1];
    setSelectedRoute(created);
    setIsEditModalOpen(true);
  };

  if (!selectedRoute) {
    return (
      <div style={{ textAlign: 'center', padding: 50, color: '#00f2fe' }}>
        <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
        <h3>Carregando Rotas de Limpeza dos Técnicos...</h3>
      </div>
    );
  }

  const completionPercentage = Math.round((selectedRoute.completed_stops / Math.max(1, selectedRoute.total_stops)) * 100);

  // Dynamic projection calculations for SVG Map
  const stops = selectedRoute.stops || [];
  const minLat = stops.length > 0 ? Math.min(...stops.map(s => s.latitude)) : 32.7;
  const maxLat = stops.length > 0 ? Math.max(...stops.map(s => s.latitude)) : 33.3;
  const minLng = stops.length > 0 ? Math.min(...stops.map(s => s.longitude)) : -97.2;
  const maxLng = stops.length > 0 ? Math.max(...stops.map(s => s.longitude)) : -96.7;

  const latSpan = Math.max(0.04, maxLat - minLat);
  const lngSpan = Math.max(0.04, maxLng - minLng);

  const getSvgCoords = (lat: number, lng: number) => {
    const normX = (lng - minLng) / lngSpan;
    const normY = (maxLat - lat) / latSpan; // Invert Y for SVG coordinates
    return {
      x: 70 + (normX * 660),
      y: 60 + (normY * 260)
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* 1. EMPLOYEE / TECHNICIAN SELECTOR BAR */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={18} color="#00f2fe" />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Rotas por Funcionário / Técnico
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button 
              className="btn-secondary"
              onClick={() => setShowTeamRoster(!showTeamRoster)}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                borderRadius: 8,
                background: showTeamRoster ? 'rgba(0, 242, 254, 0.2)' : undefined,
                borderColor: showTeamRoster ? '#00f2fe' : undefined,
                color: showTeamRoster ? '#00f2fe' : undefined
              }}
            >
              <Users size={14} /> {showTeamRoster ? 'Ocultar Equipe' : `Equipe (${technicians.length})`}
            </button>

            <button 
              className="btn-secondary"
              onClick={() => {
                setTechToEdit(null);
                setIsTechModalOpen(true);
              }}
              style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: 8 }}
            >
              <Plus size={14} /> Novo Funcionário
            </button>

            <button 
              className="btn-secondary"
              onClick={handleCreateNewRoute}
              style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: 8 }}
            >
              <Plus size={14} /> Nova Rota
            </button>
          </div>
        </div>

        {/* Team Roster Grid (When Expanded) */}
        {showTeamRoster && (
          <div style={{
            background: 'rgba(5, 11, 20, 0.8)',
            border: '1px solid rgba(0, 242, 254, 0.25)',
            borderRadius: 12,
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#00f2fe' }}>
                Quadro Geral de Funcionários & Técnicos ({technicians.length})
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Clique para editar dados ou excluir permanentemente
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
              {technicians.map((tech) => (
                <div
                  key={tech.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 10,
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 8
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img
                      src={tech.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={tech.name}
                      style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '1px solid #00f2fe' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tech.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#00f2fe' }}>
                        {tech.role}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        📞 {tech.phone}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setTechToEdit(tech);
                        setIsTechModalOpen(true);
                      }}
                      style={{ flex: 1, padding: '6px 8px', fontSize: '0.75rem', justifyContent: 'center' }}
                    >
                      <Edit3 size={12} color="#00f2fe" /> Editar
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Tem certeza que deseja excluir o funcionário ${tech.name} e desvincular suas rotas?`)) {
                          handleDeleteTechnician(tech.id);
                        }
                      }}
                      style={{
                        background: 'rgba(244, 63, 94, 0.15)',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        color: '#fb7185',
                        borderRadius: 6,
                        padding: '6px 10px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Trash2 size={12} /> Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technician Route Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 10
        }}>
          {routes.map((r) => {
            const isSelected = selectedRoute.id === r.id;
            const progress = Math.round((r.completed_stops / Math.max(1, r.total_stops)) * 100);
            return (
              <div
                key={r.id}
                onClick={() => setSelectedRoute(r)}
                style={{
                  background: isSelected ? 'rgba(0, 242, 254, 0.12)' : 'rgba(5, 11, 20, 0.6)',
                  border: isSelected ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: isSelected ? '0 0 15px rgba(0, 242, 254, 0.2)' : 'none',
                  borderRadius: 12,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: isSelected ? '#00f2fe' : '#ffffff' }}>
                    {r.technician_name.split(' ')[0]} {r.technician_name.split(' ')[1] || ''}
                  </span>
                  <span className={`badge ${r.status === 'Em Andamento' ? 'badge-amber' : r.status === 'Finalizada' ? 'badge-emerald' : 'badge-cyan'}`} style={{ fontSize: '0.65rem' }}>
                    {r.day_of_week.split('-')[0]}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <span>{r.total_stops} paradas ({r.completed_stops} feitas)</span>
                  <span>{r.total_distance_km} mi</span>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: '#00f2fe', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Top Banner / Header of Selected Route */}
      <div className="glass-panel" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 242, 254, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(0, 242, 254, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Navigation size={20} color="#00f2fe" />
              </div>
              <h1 style={{ fontSize: '1.5rem', color: '#ffffff', margin: 0 }}>
                Rota: {selectedRoute.technician_name}
              </h1>
              <span className="badge badge-cyan">{selectedRoute.day_of_week}</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
              Contato do Técnico: <strong style={{ color: '#00f2fe' }}>{selectedRoute.technician_phone || '(214) 555-7890'}</strong> • {selectedRoute.total_stops} atendimentos programados
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button 
              className="btn-secondary"
              onClick={handleEditActiveTech}
              style={{ padding: '10px 14px', borderRadius: 10 }}
            >
              <UserCheck size={16} color="#00f2fe" /> Editar Perfil Técnico
            </button>

            <button 
              className="btn-secondary"
              onClick={() => setIsEditModalOpen(true)}
              style={{ padding: '10px 14px', borderRadius: 10 }}
            >
              <Edit3 size={16} color="#00f2fe" /> Editar Rota
            </button>

            <button 
              className="btn-primary" 
              onClick={() => handleOptimizeRoute()}
              disabled={isOptimizing}
              style={{ padding: '10px 18px', borderRadius: 10 }}
            >
              <Sparkles size={16} />
              {isOptimizing ? 'Calculando Menor Caminho...' : 'Otimizar Trajeto (TSP)'}
            </button>
          </div>
        </div>

        {optimizeMessage && (
          <div style={{
            marginTop: 16,
            background: 'rgba(0, 242, 254, 0.15)',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            borderRadius: 8,
            padding: '10px 14px',
            color: '#00f2fe',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <Sparkles size={16} />
            <span>{optimizeMessage}</span>
          </div>
        )}
      </div>

      {/* 3. Metric Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {/* Total Stops & Progress */}
        <div className="glass-panel" style={{ padding: 18 }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Progresso da Rota</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
            {selectedRoute.completed_stops} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/ {selectedRoute.total_stops} piscinas</span>
          </div>
          <div style={{ width: '100%', height: 6, background: '#152945', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ width: `${completionPercentage}%`, height: '100%', background: 'linear-gradient(90deg, #00f2fe, #4facfe)', borderRadius: 3 }} />
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
            Média de 14 min entre atendimentos
          </div>
        </div>

        {/* Status */}
        <div className="glass-panel" style={{ padding: 18 }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Status Geral</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>
            {selectedRoute.status}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
            {selectedRoute.total_stops - selectedRoute.completed_stops} atendimentos restantes
          </div>
        </div>
      </div>

      {/* 4. Interactive Map & Stop Sequencing (TSP Path) */}
      <div className="glass-panel" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={18} color="#00f2fe" />
            <h2 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>
              Trajeto Otimizado no DFW Metroplex
            </h2>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Projeção GPS • Frisco, Plano, McKinney, Highland Park & Southlake
          </span>
        </div>

        {/* Dynamic SVG Map */}
        <div style={{
          width: '100%',
          height: 340,
          background: 'rgba(5, 11, 20, 0.85)',
          borderRadius: 12,
          border: '1px solid rgba(0, 242, 254, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <svg width="100%" height="100%" viewBox="0 0 800 380" fill="none">
            {/* Grid Lines */}
            <line x1="50" y1="100" x2="750" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="50" y1="200" x2="750" y2="200" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="50" y1="300" x2="750" y2="300" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            
            {/* Draw Path Lines between sequential stops */}
            {stops.map((stop, idx) => {
              if (idx === stops.length - 1) return null;
              const next = stops[idx + 1];
              const p1 = getSvgCoords(stop.latitude, stop.longitude);
              const p2 = getSvgCoords(next.latitude, next.longitude);
              return (
                <g key={`line-${stop.stop_id}`}>
                  <line 
                    x1={p1.x} y1={p1.y} 
                    x2={p2.x} y2={p2.y} 
                    stroke="rgba(0, 242, 254, 0.4)" 
                    strokeWidth="3" 
                    strokeDasharray="6 4" 
                  />
                </g>
              );
            })}

            {/* Draw Stop Pin Nodes */}
            {stops.map((stop, idx) => {
              const coords = getSvgCoords(stop.latitude, stop.longitude);
              const isDone = stop.status === 'Concluído';
              const isEnRoute = stop.status === 'A Caminho';
              return (
                <g key={stop.stop_id} transform={`translate(${coords.x}, ${coords.y})`}>
                  <circle 
                    r={isEnRoute ? 18 : 14} 
                    fill={isDone ? '#10b981' : isEnRoute ? '#00f2fe' : '#1e293b'} 
                    stroke={isDone ? '#34d399' : '#00f2fe'} 
                    strokeWidth="2.5" 
                  />
                  <text 
                    y="4" 
                    fill={isDone || isEnRoute ? '#031224' : '#ffffff'} 
                    fontSize="11" 
                    fontWeight="800" 
                    textAnchor="middle"
                  >
                    {idx + 1}
                  </text>
                  <text 
                    y="28" 
                    fill="#f1f5f9" 
                    fontSize="10" 
                    fontWeight="600" 
                    textAnchor="middle"
                  >
                    {stop.pool_name.split(' ')[0]} {stop.pool_name.split(' ')[1] || ''}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 5. Detailed Stops List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', margin: 0 }}>
            Lista de Paradas em Sequência ({stops.length})
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Toque na câmera para anexar fotos de Antes / Depois
          </span>
        </div>

        {stops.map((stop, index) => {
          const isDone = stop.status === 'Concluído';
          const isEnRoute = stop.status === 'A Caminho';

          return (
            <div
              key={stop.stop_id}
              className="glass-panel"
              style={{
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                border: isEnRoute ? '1px solid #00f2fe' : isDone ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                background: isEnRoute ? 'rgba(0, 242, 254, 0.04)' : 'var(--bg-card)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: isDone ? '#10b981' : isEnRoute ? '#00f2fe' : 'rgba(255, 255, 255, 0.08)',
                    color: isDone || isEnRoute ? '#031224' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1rem'
                  }}>
                    {index + 1}
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
                      {stop.pool_name}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <User size={13} color="#00f2fe" /> {stop.customer_name} • <MapPin size={13} color="#4facfe" /> {stop.address}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {/* Status Dropdown */}
                  <select
                    className="input-control"
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      background: isDone ? 'rgba(16, 185, 129, 0.2)' : isEnRoute ? 'rgba(0, 242, 254, 0.2)' : 'rgba(15, 23, 42, 0.8)',
                      borderColor: isDone ? '#10b981' : isEnRoute ? '#00f2fe' : 'rgba(255,255,255,0.1)'
                    }}
                    value={stop.status}
                    onChange={(e) => handleUpdateStopStatus(stop, e.target.value as any)}
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="A Caminho">A Caminho</option>
                    <option value="Em Atendimento">Em Atendimento</option>
                    <option value="Concluído">Concluído</option>
                  </select>

                  {/* GPS Navigation Button */}
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`;
                      safeOpenUrl(url, '_blank');
                    }}
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    title="Abrir GPS no Google Maps / Waze"
                  >
                    <Navigation size={14} color="#00f2fe" />
                    <span>GPS</span>
                  </button>

                  {/* Photo Proof Trigger Button */}
                  <button
                    className="btn-secondary"
                    onClick={() => setActiveStopForPhotos(stop)}
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    <Camera size={15} color="#00f2fe" />
                    <span>Fotos ({stop.photos?.length || 0})</span>
                  </button>

                  {/* Lab Navigation Button */}
                  {onSelectPoolForLab && (
                    <button
                      className="btn-primary"
                      onClick={() => onSelectPoolForLab(stop.pool_id)}
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      Laboratório
                    </button>
                  )}
                </div>
              </div>

              {/* Stop Info Footer */}
              <div style={{
                background: 'rgba(5, 11, 20, 0.5)',
                padding: '10px 14px',
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8,
                fontSize: '0.8rem',
                color: '#94a3b8'
              }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span><Clock size={13} style={{ display: 'inline', marginRight: 4 }} /> Horário Estimado: <strong style={{ color: '#ffffff' }}>{stop.scheduled_time}</strong></span>
                  <span>Duração: <strong style={{ color: '#ffffff' }}>{stop.estimated_duration_min} min</strong></span>
                </div>

                {stop.water_test_summary && (
                  <div style={{ color: '#00f2fe', fontSize: '0.75rem' }}>
                    🧪 {stop.water_test_summary}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Photo Proof Modal Dialog */}
      {activeStopForPhotos && (
        <PhotoProofManager
          stop={activeStopForPhotos}
          onClose={() => setActiveStopForPhotos(null)}
          onPhotosUpdated={(stopId, photos) => handlePhotosUpdated(stopId, photos)}
        />
      )}

      {/* Edit Route Modal Dialog */}
      <EditRouteModal
        route={selectedRoute}
        technicians={technicians}
        pools={pools}
        allRoutes={routes}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaveRoute={handleSaveRoute}
        onAddStop={handleAddStopToRoute}
        onRemoveStop={handleRemoveStop}
        onReassignStop={handleReassignStop}
        onOptimizeRoute={handleOptimizeRoute}
      />

      {/* Edit Technician Modal Dialog */}
      <EditTechnicianModal
        technician={techToEdit}
        isOpen={isTechModalOpen}
        onClose={() => setIsTechModalOpen(false)}
        onSave={handleSaveTechnician}
        onDelete={handleDeleteTechnician}
      />

    </div>
  );
};
