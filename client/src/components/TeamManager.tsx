import React, { useState, useEffect } from 'react';
import type { Technician, Route } from '../types/pool';
import { 
  fetchTechnicians, fetchRoutes, saveTechnicianApi, 
  updateTechnicianApi, deleteTechnicianApi 
} from '../lib/api';
import { EditTechnicianModal } from './EditTechnicianModal';
import { 
  Users, UserPlus, Phone, Mail, Navigation, 
  Edit3, Trash2, CheckCircle2, MapPin, AlertCircle
} from 'lucide-react';

interface TeamManagerProps {
  onNavigateToRoute?: (technicianName: string) => void;
}

export const TeamManager: React.FC<TeamManagerProps> = ({ onNavigateToRoute }) => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [techToDelete, setTechToDelete] = useState<Technician | null>(null);
  const [notification, setNotification] = useState<string>('');

  const loadData = async () => {
    const [tData, rData] = await Promise.all([fetchTechnicians(), fetchRoutes()]);
    setTechnicians(tData);
    setRoutes(rData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingTech(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tech: Technician) => {
    setEditingTech(tech);
    setIsModalOpen(true);
  };

  const handleSaveTechnician = async (tech: Technician) => {
    if (editingTech) {
      await updateTechnicianApi(tech.id, tech);
      setNotification(`✅ Funcionário "${tech.name}" atualizado com sucesso!`);
    } else {
      await saveTechnicianApi(tech);
      setNotification(`🎉 Novo funcionário "${tech.name}" cadastrado com sucesso!`);
    }
    await loadData();
    setIsModalOpen(false);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleConfirmDelete = async () => {
    if (!techToDelete) return;
    await deleteTechnicianApi(techToDelete.id);
    setNotification(`🗑️ Funcionário "${techToDelete.name}" removido com sucesso.`);
    setTechToDelete(null);
    await loadData();
    setTimeout(() => setNotification(''), 4000);
  };

  const totalAssignedStops = technicians.reduce((acc, t) => acc + (t.active_stops_count || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* 1. TOP HEADER */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(0, 242, 254, 0.35)'
            }}>
              <Users size={24} color="#031224" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', color: '#ffffff', margin: 0, fontWeight: 800 }}>
                Equipe & Funcionários (*Field Technicians*)
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                Cadastro simplificado, edição de perfil, telefone e atribuição de rotas
              </p>
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={handleOpenCreateModal}
            style={{ padding: '10px 20px', borderRadius: 10, fontSize: '0.9rem' }}
          >
            <UserPlus size={16} /> Cadastrar Novo Funcionário
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          color: '#34d399',
          padding: '12px 18px',
          borderRadius: 10,
          fontSize: '0.9rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <CheckCircle2 size={18} /> {notification}
        </div>
      )}

      {/* 2. TEAM STATS BAR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <div className="glass-panel" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0, 242, 254, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} color="#00f2fe" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total de Funcionários</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
              {technicians.length} técnicos
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Navigation size={20} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Rotas Ativas no DFW</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
              {routes.length} rotas
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={20} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Paradas Atribuídas</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>
              {totalAssignedStops} piscinas
            </div>
          </div>
        </div>
      </div>

      {/* 3. TECHNICIANS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {technicians.map((tech) => {
          const techRoutes = routes.filter(r => 
            r.technician_name === tech.name || 
            r.technician_name.includes(tech.name.split(' ')[0])
          );
          const stopsCount = techRoutes.reduce((acc, r) => acc + (r.stops?.length || 0), 0);

          return (
            <div
              key={tech.id}
              className="glass-panel"
              style={{
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 16,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                position: 'relative'
              }}
            >
              <div>
                {/* Header: Photo + Name + Role */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <img
                    src={tech.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={tech.name}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #00f2fe',
                      boxShadow: '0 0 12px rgba(0, 242, 254, 0.25)'
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
                      {tech.name}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: '#00f2fe', fontWeight: 600, marginTop: 2 }}>
                      {tech.role || 'Técnico de Rotas'}
                    </div>
                  </div>
                </div>

                {/* Contact & Route Details */}
                <div style={{
                  background: 'rgba(5, 11, 20, 0.6)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  fontSize: '0.85rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#cbd5e1' }}>
                    <Phone size={14} color="#00f2fe" />
                    <span>{tech.phone}</span>
                  </div>

                  {tech.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#cbd5e1' }}>
                      <Mail size={14} color="#4facfe" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tech.email}
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8, marginTop: 2 }}>
                    <Navigation size={13} color="#10b981" />
                    <span>{techRoutes.length} rota(s) • <strong style={{ color: '#ffffff' }}>{stopsCount} paradas</strong> ativas</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                <button
                  className="btn-primary"
                  onClick={() => handleOpenEditModal(tech)}
                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', justifyContent: 'center' }}
                >
                  <Edit3 size={14} /> Editar
                </button>

                {onNavigateToRoute && techRoutes.length > 0 && (
                  <button
                    className="btn-secondary"
                    onClick={() => onNavigateToRoute(tech.name)}
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', justifyContent: 'center' }}
                    title="Ver rotas deste funcionário"
                  >
                    <Navigation size={14} color="#00f2fe" /> Rotas
                  </button>
                )}

                <button
                  className="btn-secondary"
                  onClick={() => setTechToDelete(tech)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    color: '#fb7185',
                    borderColor: 'rgba(244, 63, 94, 0.3)',
                    background: 'rgba(244, 63, 94, 0.08)'
                  }}
                  title="Excluir funcionário"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Criação / Edição de Funcionário */}
      <EditTechnicianModal
        technician={editingTech}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTech(null);
        }}
        onSave={handleSaveTechnician}
      />

      {/* Confirmation Modal for Deletion */}
      {techToDelete && (
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
          zIndex: 120,
          padding: 16
        }}>
          <div className="glass-panel" style={{
            maxWidth: 420,
            width: '100%',
            padding: 24,
            border: '1px solid rgba(244, 63, 94, 0.4)',
            textAlign: 'center'
          }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <AlertCircle size={28} color="#fb7185" />
            </div>

            <h3 style={{ fontSize: '1.2rem', color: '#ffffff', margin: '0 0 8px 0', fontWeight: 800 }}>
              Excluir Funcionário?
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              Tem certeza que deseja excluir <strong>{techToDelete.name}</strong>? As rotas associadas a este funcionário serão reatribuídas.
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn-secondary"
                onClick={() => setTechToDelete(null)}
                style={{ flex: 1, padding: 10, justifyContent: 'center' }}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleConfirmDelete}
                style={{ flex: 1, padding: 10, justifyContent: 'center', background: '#e11d48', borderColor: '#f43f5e' }}
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
