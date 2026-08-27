import React, { useState, useEffect } from 'react';
import type { Pool, ServiceVisit, WaterTest } from '../types/pool';
import { fetchPoolVisits, fetchPoolTests } from '../lib/api';
import { 
  X, User, Droplets, CheckCircle2, 
  FileText, Camera, Send, 
  ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';

interface PoolHistoryModalProps {
  pool: Pool | null;
  isOpen: boolean;
  onClose: () => void;
  onNewVisitClick?: (poolId: string) => void;
}

export const PoolHistoryModal: React.FC<PoolHistoryModalProps> = ({
  pool,
  isOpen,
  onClose,
  onNewVisitClick
}) => {
  const [visits, setVisits] = useState<ServiceVisit[]>([]);
  const [, setTests] = useState<WaterTest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (pool && isOpen) {
      setIsLoading(true);
      Promise.all([
        fetchPoolVisits(pool.id),
        fetchPoolTests(pool.id)
      ]).then(([visitsData, testsData]) => {
        setVisits(visitsData);
        setTests(testsData);
        if (visitsData.length > 0) {
          setExpandedVisitId(visitsData[0].id); // Expand most recent by default
        }
        setIsLoading(false);
      }).catch(err => {
        console.error('Erro ao carregar histórico da piscina', err);
        setIsLoading(false);
      });
    }
  }, [pool, isOpen]);

  if (!isOpen || !pool) return null;

  const handleShareDoorHanger = (visit: ServiceVisit) => {
    const text = `🏊 *Comprovante de Atendimento WandPool*\n` +
      `📍 *Piscina:* ${pool.name}\n` +
      `👤 *Cliente:* ${pool.customer_name}\n` +
      `📅 *Data:* ${new Date(visit.visit_date).toLocaleDateString('pt-BR')} ${new Date(visit.visit_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n` +
      `👨‍🔧 *Técnico:* ${visit.technician_name}\n` +
      `⚙️ *Pressão do Filtro:* ${visit.filter_pressure_psi} PSI${visit.backwash_performed ? ' (Retrolavagem Realizada)' : ''}\n` +
      `🧪 *Produtos Aplicados:*\n${visit.chemicals_added?.map(c => `• ${c.amount} ${c.unit} de ${c.chemical_name} (${c.reason || 'Manutenção'})`).join('\n') || '• Manutenção física de rotina'}\n\n` +
      `💬 *Resumo:* ${visit.customer_summary || 'Piscina balanceada e cristalina!'}\n` +
      `✨ *WandPool - Água Cristalina & Tecnologia em DFW*`;

    const encoded = encodeURIComponent(text);
    const cleanPhone = (pool.customer_phone || '').replace(/\D/g, '');
    const url = cleanPhone.length >= 10 
      ? `https://api.whatsapp.com/send?phone=1${cleanPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    
    window.open(url, '_blank');
    setShareSuccess(`Comprovante de ${new Date(visit.visit_date).toLocaleDateString('pt-BR')} gerado para WhatsApp!`);
    setTimeout(() => setShareSuccess(null), 3000);
  };

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
      zIndex: 105,
      padding: 12
    }}>
      <div className="glass-panel" style={{
        maxWidth: 860,
        width: '100%',
        maxHeight: '94vh',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
        border: '1px solid rgba(0, 242, 254, 0.35)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(0, 242, 254, 0.25)',
        borderRadius: 16
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(5, 11, 20, 0.85)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(79, 172, 254, 0.1))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(0, 242, 254, 0.3)'
            }}>
              <FileText size={22} color="#00f2fe" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: '1.3rem', color: '#ffffff', margin: 0, fontWeight: 800 }}>
                  Histórico de Execuções
                </h2>
                <span className="badge badge-cyan">{pool.volume_gallons?.toLocaleString()} gal</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                {pool.name} • <strong>{pool.customer_name}</strong> ({pool.address})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 6 }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Share Feedback */}
        {shareSuccess && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.2)',
            borderBottom: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            padding: '10px 20px',
            fontSize: '0.85rem',
            fontWeight: 600
          }}>
            ✅ {shareSuccess}
          </div>
        )}

        {/* History Body */}
        <div style={{ overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Summary Metric Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            background: 'rgba(5, 11, 20, 0.6)',
            padding: 16,
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Atendimentos Registrados</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                {visits.length} visitas
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Pressão Baseline</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#00f2fe' }}>
                {pool.clean_filter_psi || 12.0} PSI
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Desinfecção</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8', marginTop: 3 }}>
                {pool.sanitizer_type}
              </div>
            </div>

            {onNewVisitClick && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <button
                  className="btn-primary"
                  onClick={() => {
                    onClose();
                    onNewVisitClick(pool.id);
                  }}
                  style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                >
                  + Nova Visita Hoje
                </button>
              </div>
            )}
          </div>

          {/* Timeline of Visits */}
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#00f2fe' }}>
              <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 10px' }} />
              <p>Carregando histórico detalhado...</p>
            </div>
          ) : visits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, background: 'rgba(5, 11, 20, 0.4)', borderRadius: 12, color: '#64748b' }}>
              <FileText size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
              <h3 style={{ color: '#94a3b8', margin: '0 0 6px 0' }}>Nenhum atendimento gravado ainda</h3>
              <p style={{ fontSize: '0.85rem' }}>Os registros de visitas, checklists, dosagens e fotos desta piscina aparecerão aqui automaticamente.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {visits.map((visit) => {
                const isExpanded = expandedVisitId === visit.id;
                const visitDate = new Date(visit.visit_date);
                const dateStr = visitDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
                const timeStr = visitDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const chems = visit.chemicals_added || [];
                const checklist = visit.checklist_completed || [];
                const photos = visit.photos || [];

                return (
                  <div
                    key={visit.id}
                    className="glass-panel"
                    style={{
                      padding: 0,
                      overflow: 'hidden',
                      border: isExpanded ? '1px solid rgba(0, 242, 254, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: 'rgba(5, 11, 20, 0.7)'
                    }}
                  >
                    {/* Visit Card Header / Accordion Trigger */}
                    <div
                      onClick={() => setExpandedVisitId(isExpanded ? null : visit.id)}
                      style={{
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        background: isExpanded ? 'rgba(0, 242, 254, 0.06)' : 'transparent',
                        borderBottom: isExpanded ? '1px solid rgba(255,255,255,0.06)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: 'rgba(0, 242, 254, 0.15)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#00f2fe'
                        }}>
                          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800 }}>
                            {visitDate.toLocaleDateString('pt-BR', { month: 'short' })}
                          </span>
                          <span style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1 }}>
                            {visitDate.getDate()}
                          </span>
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                              Atendimento {dateStr}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                              às {timeStr}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                            <span><User size={12} style={{ display: 'inline', marginRight: 3 }} /> {visit.technician_name}</span>
                            <span>•</span>
                            <span>⚙️ {visit.filter_pressure_psi} PSI {visit.backwash_performed ? '(Retrolavagem Realizada)' : ''}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {chems.length > 0 && (
                          <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
                            🧪 {chems.length} produto(s)
                          </span>
                        )}
                        {photos.length > 0 && (
                          <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                            📸 {photos.length} fotos
                          </span>
                        )}
                        {isExpanded ? <ChevronUp size={18} color="#00f2fe" /> : <ChevronDown size={18} color="#94a3b8" />}
                      </div>
                    </div>

                    {/* Visit Card Details (Expanded View) */}
                    {isExpanded && (
                      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        
                        {/* 1. Chemicals & Dosages Applied */}
                        {chems.length > 0 && (
                          <div style={{ background: 'rgba(0, 242, 254, 0.03)', padding: 14, borderRadius: 10, border: '1px solid rgba(0, 242, 254, 0.12)' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#00f2fe', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Droplets size={15} /> Produtos Químicos Aplicados nesta Visita:
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8 }}>
                              {chems.map((c, i) => (
                                <div key={i} style={{ background: 'rgba(5, 11, 20, 0.6)', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                                    {c.amount} {c.unit} — {c.chemical_name}
                                  </div>
                                  {c.reason && (
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                                      Motivo: {c.reason}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 2. Checklist Executed */}
                        {checklist.length > 0 && (
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
                              📋 Procedimentos Realizados:
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 6 }}>
                              {checklist.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#cbd5e1' }}>
                                  <CheckCircle2 size={14} color="#10b981" />
                                  <span>{item.task_name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 3. Photo Proofs */}
                        {photos.length > 0 && (
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Camera size={15} color="#00f2fe" /> Fotos de Comprovação da Visita:
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                              {photos.map((p, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => setSelectedPhotoModal(p.url)}
                                  style={{
                                    borderRadius: 10,
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    aspectRatio: '4/3'
                                  }}
                                >
                                  <img
                                    src={p.url}
                                    alt={p.caption || 'Foto do atendimento'}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                  <span style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    background: 'rgba(0,0,0,0.75)',
                                    color: '#ffffff',
                                    fontSize: '0.65rem',
                                    padding: '3px 6px',
                                    textTransform: 'uppercase',
                                    fontWeight: 700
                                  }}>
                                    {p.photo_type === 'before' ? '📸 Antes' : p.photo_type === 'after' ? '✨ Depois' : '⚙️ Equipamento'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 4. Notes & Customer Summary */}
                        {visit.customer_summary && (
                          <div style={{ background: 'rgba(5, 11, 20, 0.5)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
                              Mensagem enviada ao Cliente:
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#f1f5f9', fontStyle: 'italic' }}>
                              "{visit.customer_summary}"
                            </div>
                          </div>
                        )}

                        {/* 5. Footer Actions: Reenviar Door Hanger via WhatsApp */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            ID da Visita: {visit.id}
                          </div>

                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => handleShareDoorHanger(visit)}
                            style={{ padding: '6px 12px', fontSize: '0.8rem', gap: 6 }}
                          >
                            <Send size={14} color="#25D366" /> Reenviar Comprovante p/ WhatsApp
                          </button>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'flex-end',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(5, 11, 20, 0.85)'
        }}>
          <button type="button" className="btn-primary" onClick={onClose} style={{ padding: '10px 24px' }}>
            Fechar Histórico
          </button>
        </div>
      </div>

      {/* Photo Preview Modal */}
      {selectedPhotoModal && (
        <div
          onClick={() => setSelectedPhotoModal(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 120,
            padding: 20
          }}
        >
          <img
            src={selectedPhotoModal}
            alt="Ampliada"
            style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 12, border: '2px solid #00f2fe' }}
          />
        </div>
      )}
    </div>
  );
};
