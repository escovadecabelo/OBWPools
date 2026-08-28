import React, { useState } from 'react';
import type { Pool, ChecklistItem, ChemicalDoseItem, ServiceVisit } from '../types/pool';
import { ClipboardCheck, CheckSquare, Square, FileText, Send, Printer, Check } from 'lucide-react';
import { recordServiceVisit } from '../lib/api';
import confetti from 'canvas-confetti';

interface ServiceChecklistProps {
  pool: Pool;
  onVisitRecorded: (newVisit: ServiceVisit) => void;
}

export const ServiceChecklist: React.FC<ServiceChecklistProps> = ({
  pool,
  onVisitRecorded
}) => {
  const [technicianName] = useState<string>('Tyler Brooks (DFW Senior Pool Tech)');
  const [filterPsi, setFilterPsi] = useState<number>(pool.current_filter_psi || 14.0);
  const [backwashDone, setBackwashDone] = useState<boolean>(false);
  const [notes] = useState<string>('Manutenção periódica executada com sucesso. Água cristalina e parâmetros ajustados.');
  const [customerMessage, setCustomerMessage] = useState<string>(
    `Hello ${pool.customer_name}! Realizamos a limpeza física completa e o balanceamento químico da sua piscina hoje. A água estará 100% liberada para banho após às 17h.`
  );

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: 'c1', task_name: 'Escovação de paredes, fundo e degraus da escada', category: 'Limpeza Física', completed: true },
    { id: 'c2', task_name: 'Aspiração de fundo do tanque', category: 'Limpeza Física', completed: true },
    { id: 'c3', task_name: 'Limpeza e desengraxe de bordas', category: 'Limpeza Física', completed: true },
    { id: 'c4', task_name: 'Limpeza do cesto do skimmer e pré-filtro da bomba', category: 'Casa de Máquinas', completed: true },
    { id: 'c5', task_name: 'Conferência de pressão no manômetro do filtro', category: 'Casa de Máquinas', completed: true },
    { id: 'c6', task_name: 'Teste colorimétrico (pH, Cloro e Alcalinidade)', category: 'Química & Tratamento', completed: true },
    { id: 'c7', task_name: 'Aplicação dos produtos químicos necessários', category: 'Química & Tratamento', completed: true }
  ]);

  const [chemicals, setChemicals] = useState<ChemicalDoseItem[]>([
    { chemical_name: 'Muriatic Acid 31.45%', amount: 16, unit: 'fl oz', reason: 'Ajuste de pH para 7.4' },
    { chemical_name: 'Liquid Chlorine 12.5%', amount: 32, unit: 'fl oz', reason: 'Manutenção de Cloro Livre 3.5 ppm' }
  ]);

  const [newChemName, setNewChemName] = useState<string>('');
  const [newChemAmount, setNewChemAmount] = useState<string>('');
  const [newChemUnit, setNewChemUnit] = useState<string>('fl oz');
  const [newChemReason, setNewChemReason] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [doorHangerPreview, setDoorHangerPreview] = useState<boolean>(false);

  const toggleTask = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const handleAddChemical = () => {
    if (!newChemName || !newChemAmount) return;
    setChemicals(prev => [
      ...prev,
      {
        chemical_name: newChemName,
        amount: parseFloat(newChemAmount) || 100,
        unit: newChemUnit,
        reason: newChemReason || 'Dosagem de rotina'
      }
    ]);
    setNewChemName('');
    setNewChemAmount('');
    setNewChemReason('');
  };

  const handleRemoveChemical = (idx: number) => {
    setChemicals(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFinishVisit = async () => {
    setIsSubmitting(true);
    const newVisit: ServiceVisit = {
      id: `visit-${Date.now()}`,
      pool_id: pool.id,
      visit_date: new Date().toISOString(),
      technician_name: technicianName,
      filter_pressure_psi: filterPsi,
      backwash_performed: backwashDone,
      checklist_completed: checklist,
      chemicals_added: chemicals,
      photos: [],
      technician_notes: notes,
      customer_summary: customerMessage,
      status: 'Concluído',
      door_hanger_sent: true,
      whatsapp_dispatched: true
    };

    try {
      await recordServiceVisit(pool.id, newVisit);
      onVisitRecorded(newVisit);
      setDoorHangerPreview(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `🏊 *WandPool - Comprovante de Visita Técnica*\n` +
      `Cliente: ${pool.customer_name}\n` +
      `Piscina: ${pool.name}\n` +
      `Técnico: ${technicianName}\n` +
      `Data: ${new Date().toLocaleDateString('pt-BR')}\n\n` +
      `✅ *Tarefas Executadas (${checklist.filter(c => c.completed).length}/${checklist.length}):*\n` +
      checklist.filter(c => c.completed).map(c => `• ${c.task_name}`).join('\n') +
      `\n\n🧪 *Produtos Aplicados:*\n` +
      chemicals.map(c => `• ${c.amount} ${c.unit} de ${c.chemical_name}`).join('\n') +
      `\n\n💬 *Mensagem do Técnico:* ${customerMessage}\n\n` +
      `WandPool Service • Relatório Digital`;

    window.open(`https://api.whatsapp.com/send?phone=${pool.customer_phone?.replace(/\D/g, '') || ''}&text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="glass-panel no-print" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(0, 242, 254, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ClipboardCheck size={22} color="#00f2fe" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', color: '#ffffff' }}>Ordem de Serviço & Checklist de Visita</h1>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Fluxo profissional no padrão <strong>Skimmer & PoolTrackr</strong> com comprovante digital (Digital Door Hanger).
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={() => setDoorHangerPreview(!doorHangerPreview)}>
            <FileText size={16} /> {doorHangerPreview ? 'Editar Formulário' : 'Visualizar Comprovante'}
          </button>
          <button className="btn-primary" onClick={handleFinishVisit} disabled={isSubmitting}>
            <Check size={16} /> Concluir Atendimento
          </button>
        </div>
      </div>

      {/* Main Form Layout */}
      {!doorHangerPreview ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'clamp(14px, 3vw, 24px)' }}>
          
          {/* LEFT: Checklist & Tasks */}
          <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 style={{ fontSize: '1.2rem', color: '#f1f5f9', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 10 }}>
              Checklist de Tarefas da Visita
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleTask(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: item.completed ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: item.completed ? '1px solid rgba(0, 242, 254, 0.25)' : '1px solid rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {item.completed ? (
                    <CheckSquare size={20} color="#00f2fe" />
                  ) : (
                    <Square size={20} color="#64748b" />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: item.completed ? '#ffffff' : '#94a3b8',
                    }}>
                      {item.task_name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.category}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Manômetro & Retrolavagem */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 16, borderRadius: 12 }}>
              <h3 style={{ fontSize: '0.95rem', color: '#f1f5f9', marginBottom: 12 }}>Equipamentos & Pressão</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                    Pressão Manômetro (PSI):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    className="input-control"
                    value={filterPsi}
                    onChange={(e) => setFilterPsi(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 22 }}>
                  <input
                    type="checkbox"
                    id="backwash"
                    checked={backwashDone}
                    onChange={(e) => setBackwashDone(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: '#00f2fe' }}
                  />
                  <label htmlFor="backwash" style={{ fontSize: '0.85rem', color: '#f1f5f9', cursor: 'pointer' }}>
                    Retrolavagem Executada
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Chemicals Applied & Customer Note */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Chemicals Added Table */}
            <div className="glass-panel" style={{ padding: 24 }}>
              <h2 style={{ fontSize: '1.2rem', color: '#f1f5f9', marginBottom: 14 }}>
                Produtos Químicos Aplicados Nesta Visita
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {chemicals.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(5, 11, 20, 0.6)',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f1f5f9' }}>{c.chemical_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.reason}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00f2fe' }}>
                        {c.amount} {c.unit}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveChemical(i)}
                        style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer', fontSize: '1.2rem' }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Chemical Subform */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 14, borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>+ Adicionar Produto Aplicado</span>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Nome do Produto (Ex: Barrilha)"
                    className="input-control"
                    value={newChemName}
                    onChange={(e) => setNewChemName(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Qtd"
                    className="input-control"
                    value={newChemAmount}
                    onChange={(e) => setNewChemAmount(e.target.value)}
                  />
                  <select
                    className="input-control"
                    value={newChemUnit}
                    onChange={(e) => setNewChemUnit(e.target.value)}
                  >
                    <option value="fl oz">fl oz</option>
                    <option value="lbs">lbs</option>
                    <option value="oz">oz</option>
                    <option value="qt">qt (Quart)</option>
                    <option value="gal">gal (Gallon)</option>
                    <option value="bags">sacos (40 lbs)</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Motivo / Parâmetro Corrigido (Opcional)"
                  className="input-control"
                  value={newChemReason}
                  onChange={(e) => setNewChemReason(e.target.value)}
                />
                <button className="btn-secondary" type="button" onClick={handleAddChemical} style={{ alignSelf: 'flex-start' }}>
                  Inserir Produto
                </button>
              </div>
            </div>

            {/* Customer Message Card */}
            <div className="glass-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', color: '#f1f5f9', marginBottom: 8 }}>
                Mensagem Automática para o Cliente (Digital Door Hanger)
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 10 }}>
                Esta mensagem será enviada por WhatsApp/E-mail informando a liberação da piscina.
              </p>
              <textarea
                className="input-control"
                rows={3}
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
              />
            </div>

          </div>
        </div>
      ) : (
        /* Digital Door Hanger View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div className="glass-panel-glow" style={{ padding: 36, maxWidth: 800, margin: '0 auto', width: '100%' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(0, 242, 254, 0.3)', paddingBottom: 20, marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
                  Wand<span style={{ color: '#00f2fe' }}>Pool</span>
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Comprovante Digital de Manutenção de Piscina</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-emerald">Serviço Concluído</span>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
                  {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Client & Pool Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Cliente</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>{pool.customer_name}</div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{pool.address}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Piscina</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#00f2fe' }}>{pool.name}</div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{pool.volume_liters.toLocaleString('pt-BR')} L • {pool.sanitizer_type}</div>
              </div>
            </div>

            {/* Summary Message */}
            <div style={{ background: 'rgba(0, 242, 254, 0.08)', border: '1px solid rgba(0, 242, 254, 0.2)', padding: 18, borderRadius: 12, marginBottom: 24 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#00f2fe', marginBottom: 4 }}>
                MENSAGEM DO TÉCNICO:
              </div>
              <p style={{ fontSize: '0.95rem', color: '#ffffff', lineHeight: 1.5, fontStyle: 'italic' }}>
                "{customerMessage}"
              </p>
            </div>

            {/* Tasks & Chemicals Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', color: '#f1f5f9', marginBottom: 10 }}>Tarefas Concluídas</h4>
                <ul style={{ fontSize: '0.85rem', color: '#cbd5e1', paddingLeft: 18, lineHeight: 1.6 }}>
                  {checklist.filter(c => c.completed).map((c, i) => (
                    <li key={i}>{c.task_name}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', color: '#f1f5f9', marginBottom: 10 }}>Produtos Aplicados</h4>
                <ul style={{ fontSize: '0.85rem', color: '#cbd5e1', paddingLeft: 18, lineHeight: 1.6 }}>
                  {chemicals.map((c, i) => (
                    <li key={i}><strong>{c.amount} {c.unit}</strong> de {c.chemical_name}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 16, fontSize: '0.8rem', color: '#64748b' }}>
              <div>Atendido por: <strong style={{ color: '#ffffff' }}>{technicianName}</strong></div>
              <div>Pressão do Filtro: <strong style={{ color: '#00f2fe' }}>{filterPsi} PSI</strong> {backwashDone && '(Retrolavado)'}</div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="no-print" style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
            <button className="btn-primary" onClick={handleShareWhatsApp}>
              <Send size={16} /> Compartilhar no WhatsApp do Cliente
            </button>
            <button className="btn-secondary" onClick={handlePrint}>
              <Printer size={16} /> Imprimir / Salvar PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
