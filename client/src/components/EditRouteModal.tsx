import React, { useState, useEffect } from 'react';
import type { Route, Technician, Pool } from '../types/pool';
import { X, User, MapPin, Plus, Trash2, Zap, Clock } from 'lucide-react';

interface EditRouteModalProps {
  route: Route | null;
  technicians: Technician[];
  pools: Pool[];
  allRoutes: Route[];
  isOpen: boolean;
  onClose: () => void;
  onSaveRoute: (updatedRoute: Route) => void;
  onAddStop: (routeId: string, poolId: string, scheduledTime: string) => Promise<void>;
  onRemoveStop: (stopId: string) => Promise<void>;
  onReassignStop: (stopId: string, targetRouteId: string) => Promise<void>;
  onOptimizeRoute: (routeId: string) => Promise<void>;
}

export const EditRouteModal: React.FC<EditRouteModalProps> = ({
  route,
  technicians,
  pools,
  allRoutes,
  isOpen,
  onClose,
  onSaveRoute,
  onAddStop,
  onRemoveStop,
  onReassignStop,
  onOptimizeRoute
}) => {
  const [technicianName, setTechnicianName] = useState<string>('');
  const [technicianPhone, setTechnicianPhone] = useState<string>('');
  const [dayOfWeek, setDayOfWeek] = useState<string>('Segunda-feira');
  const [date, setDate] = useState<string>('');
  const [status, setStatus] = useState<'Planejada' | 'Em Andamento' | 'Finalizada'>('Planejada');
  
  const [selectedPoolToAdd, setSelectedPoolToAdd] = useState<string>('');
  const [newStopTime, setNewStopTime] = useState<string>('11:00');
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (route) {
      setTechnicianName(route.technician_name || '');
      setTechnicianPhone(route.technician_phone || '');
      setDayOfWeek(route.day_of_week || 'Segunda-feira');
      setDate(route.date || new Date().toISOString().split('T')[0]);
      setStatus(route.status || 'Planejada');
    }
  }, [route]);

  if (!isOpen || !route) return null;

  const handleTechChange = (techName: string) => {
    setTechnicianName(techName);
    const tech = technicians.find(t => t.name === techName);
    if (tech) {
      setTechnicianPhone(tech.phone);
    }
  };

  const handleSaveHeader = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Route = {
      ...route,
      technician_name: technicianName,
      technician_phone: technicianPhone,
      day_of_week: dayOfWeek,
      date,
      status
    };
    onSaveRoute(updated);
    setActionSuccess('Dados da rota e técnico atualizados!');
    setTimeout(() => setActionSuccess(null), 2500);
  };

  const handleAddStopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoolToAdd) return;
    await onAddStop(route.id, selectedPoolToAdd, newStopTime);
    setSelectedPoolToAdd('');
    setActionSuccess('Cliente adicionado à rota com sucesso!');
    setTimeout(() => setActionSuccess(null), 2500);
  };

  const handleTriggerOptimize = async () => {
    setIsOptimizing(true);
    await onOptimizeRoute(route.id);
    setIsOptimizing(false);
    setActionSuccess('Trajeto reotimizado via algoritmo TSP!');
    setTimeout(() => setActionSuccess(null), 2500);
  };

  const otherRoutes = allRoutes.filter(r => r.id !== route.id);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(3, 7, 18, 0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 12
    }}>
      <div className="glass-panel" style={{
        maxWidth: 720,
        width: '100%',
        maxHeight: '94vh',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
        border: '1px solid rgba(0, 242, 254, 0.3)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(0, 242, 254, 0.25)',
        borderRadius: 16
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(5, 11, 20, 0.8)'
        }}>
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
              <User size={20} color="#00f2fe" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: '#ffffff', margin: 0 }}>
                Editar Rota do Funcionário
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                {route.technician_name} • {route.day_of_week} ({route.stops?.length || 0} paradas)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 6 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Feedback Alert */}
        {actionSuccess && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.2)',
            borderBottom: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            padding: '10px 20px',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            ✅ {actionSuccess}
          </div>
        )}

        {/* Modal Body */}
        <div style={{ overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* SECTION 1: Technician Assignment & Schedule */}
          <form onSubmit={handleSaveHeader} style={{ background: 'rgba(5, 11, 20, 0.6)', padding: 18, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: '1rem', color: '#f1f5f9', margin: 0, fontWeight: 700 }}>
                Funcionário Responsável & Agenda
              </h3>
              <button type="submit" className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                Salvar Dados da Rota
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                  Técnico Atribuído *
                </label>
                <select
                  className="input-control"
                  value={technicianName}
                  onChange={(e) => handleTechChange(e.target.value)}
                >
                  {technicians.map(t => (
                    <option key={t.id} value={t.name}>
                      👤 {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                  Telefone do Técnico
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={technicianPhone}
                  onChange={(e) => setTechnicianPhone(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                  Dia da Semana
                </label>
                <select
                  className="input-control"
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                >
                  <option value="Segunda-feira">Segunda-feira</option>
                  <option value="Terça-feira">Terça-feira</option>
                  <option value="Quarta-feira">Quarta-feira</option>
                  <option value="Quinta-feira">Quinta-feira</option>
                  <option value="Sexta-feira">Sexta-feira</option>
                  <option value="Sábado">Sábado</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                  Status da Rota
                </label>
                <select
                  className="input-control"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="Planejada">Planejada</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Finalizada">Finalizada</option>
                </select>
              </div>
            </div>
          </form>

          {/* SECTION 2: Add New Pool Stop to this Route */}
          <form onSubmit={handleAddStopSubmit} style={{ background: 'rgba(0, 242, 254, 0.04)', padding: 18, borderRadius: 12, border: '1px solid rgba(0, 242, 254, 0.15)' }}>
            <h3 style={{ fontSize: '0.95rem', color: '#00f2fe', margin: '0 0 12px 0', fontWeight: 700 }}>
              + Adicionar Parada de Cliente à Rota
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 10, alignItems: 'flex-end' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                  Selecionar Piscina / Cliente
                </label>
                <select
                  className="input-control"
                  value={selectedPoolToAdd}
                  onChange={(e) => setSelectedPoolToAdd(e.target.value)}
                  required
                >
                  <option value="">-- Escolha um cliente --</option>
                  {pools.map(p => (
                    <option key={p.id} value={p.id}>
                      🏊 {p.name} ({p.customer_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                  Horário Estimado
                </label>
                <input
                  type="time"
                  className="input-control"
                  value={newStopTime}
                  onChange={(e) => setNewStopTime(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '10px 16px' }}>
                <Plus size={16} /> Inserir
              </button>
            </div>
          </form>

          {/* SECTION 3: Current Stops List with Reassign / Remove Actions */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: '1rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
                Paradas da Rota ({route.stops?.length || 0})
              </h3>

              <button
                type="button"
                className="btn-secondary"
                onClick={handleTriggerOptimize}
                disabled={isOptimizing || !route.stops || route.stops.length === 0}
                style={{ padding: '6px 14px', fontSize: '0.8rem', borderColor: 'rgba(0, 242, 254, 0.4)' }}
              >
                <Zap size={14} color="#00f2fe" />
                {isOptimizing ? 'Otimizando...' : 'Reotimizar Ordem (TSP)'}
              </button>
            </div>

            {(!route.stops || route.stops.length === 0) ? (
              <div style={{ background: 'rgba(5, 11, 20, 0.4)', padding: 24, textAlign: 'center', borderRadius: 10, color: '#64748b' }}>
                Nenhuma parada atribuída a esta rota. Utilize o formulário acima para adicionar clientes.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {route.stops.map((stop, index) => (
                  <div
                    key={stop.stop_id}
                    style={{
                      background: 'rgba(5, 11, 20, 0.7)',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 240 }}>
                      <span style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'rgba(0, 242, 254, 0.15)',
                        color: '#00f2fe',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {index + 1}
                      </span>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                          {stop.pool_name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <MapPin size={13} color="#4facfe" /> {stop.address}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                          <Clock size={12} style={{ display: 'inline', marginRight: 3 }} />
                          Horário: <strong>{stop.scheduled_time}</strong> • Status: <span style={{ color: stop.status === 'Concluído' ? '#10b981' : '#00f2fe' }}>{stop.status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Reassign to other technician & Remove */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {otherRoutes.length > 0 && (
                        <select
                          className="input-control"
                          style={{ fontSize: '0.75rem', padding: '6px 10px', width: 170 }}
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              onReassignStop(stop.stop_id, e.target.value);
                            }
                          }}
                        >
                          <option value="" disabled>➔ Transferir p/ Técnico</option>
                          {otherRoutes.map(r => (
                            <option key={r.id} value={r.id}>
                              {r.technician_name.split(' ')[0]} ({r.day_of_week})
                            </option>
                          ))}
                        </select>
                      )}

                      <button
                        type="button"
                        onClick={() => onRemoveStop(stop.stop_id)}
                        style={{
                          background: 'rgba(244, 63, 94, 0.15)',
                          border: '1px solid rgba(244, 63, 94, 0.3)',
                          color: '#fb7185',
                          borderRadius: 8,
                          padding: '7px 10px',
                          cursor: 'pointer'
                        }}
                        title="Remover parada desta rota"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'flex-end',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(5, 11, 20, 0.8)'
        }}>
          <button type="button" className="btn-primary" onClick={onClose} style={{ padding: '10px 24px' }}>
            Concluir Edição
          </button>
        </div>
      </div>
    </div>
  );
};
