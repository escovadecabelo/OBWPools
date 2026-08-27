import React, { useState, useEffect } from 'react';
import type { WorkOrder, Pool, Technician } from '../types/pool';
import { fetchPools, fetchTechnicians } from '../lib/api';
import { 
  Wrench, Plus, CheckCircle2, DollarSign, 
  Share2, X
} from 'lucide-react';

const STORAGE_KEY = 'wandpool_work_orders';

export const WorkOrderManager: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Form State
  const [formPoolId, setFormPoolId] = useState<string>('');
  const [formTechId, setFormTechId] = useState<string>('');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formCategory, setFormCategory] = useState<WorkOrder['category']>('Bomba & Motor');
  const [formPriority, setFormPriority] = useState<WorkOrder['priority']>('Alta');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formPartsCost, setFormPartsCost] = useState<number>(180);
  const [formLaborCost, setFormLaborCost] = useState<number>(120);

  useEffect(() => {
    async function init() {
      const [pData, tData] = await Promise.all([fetchPools(), fetchTechnicians()]);
      setPools(pData);
      setTechnicians(tData);
      if (pData.length > 0) setFormPoolId(pData[0].id);
      if (tData.length > 0) setFormTechId(tData[0].id);

      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        try {
          setWorkOrders(JSON.parse(cached));
          return;
        } catch (e) {}
      }

      // Default Seed Work Orders
      const seeds: WorkOrder[] = [
        {
          id: 'wo-101',
          pool_id: 'pool-1',
          pool_name: 'Residência Stonebriar Creek',
          customer_name: 'David & Sarah Miller',
          customer_phone: '(214) 555-0142',
          technician_id: 'tech-1',
          technician_name: 'Tyler Brooks',
          title: 'Substituição do Motor da Bomba Hayward 2.0 HP (Ruído de Rolamento)',
          category: 'Bomba & Motor',
          description: 'Motor apresentando ruído agudo de rolamento desgastado e superaquecimento pós-verão. Necessária troca do motor de velocidade variável.',
          priority: 'Alta',
          status: 'Aprovado pelo Cliente',
          parts_cost_usd: 420.00,
          labor_cost_usd: 150.00,
          total_cost_usd: 570.00,
          parts_list: ['Motor Hayward Super Pump 2.0 HP VSP', 'Selo Mecânico Viton Heavy Duty', 'O-ring Tampa Bomba'],
          photos: [
            {
              id: 'wop-1',
              photo_type: 'equipment',
              url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
              caption: 'Motor com corrosão no eixo e ruído anormal de 85dB',
              timestamp: new Date().toISOString()
            }
          ],
          created_at: new Date().toISOString()
        },
        {
          id: 'wo-102',
          pool_id: 'pool-3',
          pool_name: 'Condomínio Craig Ranch Club',
          customer_name: 'HOA Craig Ranch Master Association',
          customer_phone: '(972) 555-0177',
          technician_id: 'tech-2',
          technician_name: 'Marcus Rodriguez',
          title: 'Troca de Célula de Sal Pentair IntelliChlor IC40',
          category: 'Célula de Sal (SWG)',
          description: 'Célula de sal com calcificação severa e placas de titânio gastas após 5 anos. SWG reportando erro de fluxo.',
          priority: 'Média',
          status: 'Orçamento Criado',
          parts_cost_usd: 850.00,
          labor_cost_usd: 120.00,
          total_cost_usd: 970.00,
          parts_list: ['Pentair IntelliChlor IC40 Salt Cell Genuine', 'União roscada 2"'],
          photos: [],
          created_at: new Date().toISOString()
        }
      ];

      setWorkOrders(seeds);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeds));
    }
    init();
  }, []);

  const saveOrders = (updated: WorkOrder[]) => {
    setWorkOrders(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleCreateWorkOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const pool = pools.find(p => p.id === formPoolId) || pools[0];
    const tech = technicians.find(t => t.id === formTechId) || technicians[0];
    const total = Number(formPartsCost) + Number(formLaborCost);

    const newWO: WorkOrder = {
      id: `wo-${Date.now()}`,
      pool_id: pool?.id || 'pool-1',
      pool_name: pool?.name || 'Piscina DFW',
      customer_name: pool?.customer_name || 'Cliente',
      customer_phone: pool?.customer_phone,
      technician_id: tech?.id || 'tech-1',
      technician_name: tech?.name || 'Técnico',
      title: formTitle,
      category: formCategory,
      priority: formPriority,
      description: formDescription,
      status: 'Orçamento Criado',
      parts_cost_usd: Number(formPartsCost),
      labor_cost_usd: Number(formLaborCost),
      total_cost_usd: total,
      parts_list: ['Peças originais de reposição'],
      photos: [],
      created_at: new Date().toISOString()
    };

    const updated = [newWO, ...workOrders];
    saveOrders(updated);
    setIsModalOpen(false);
    setFormTitle('');
    setFormDescription('');
    setSuccessMessage(`🛠️ Ordem de Serviço "${newWO.title}" criada com sucesso!`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleUpdateStatus = (woId: string, newStatus: WorkOrder['status']) => {
    const updated = workOrders.map(wo => wo.id === woId ? { ...wo, status: newStatus } : wo);
    saveOrders(updated);
  };

  const handleShareWhatsApp = (wo: WorkOrder) => {
    const msg = `*WandPool - Orçamento de Reparo / Ordem de Serviço*\n\n` +
      `👤 *Cliente:* ${wo.customer_name}\n` +
      `🏊 *Piscina:* ${wo.pool_name}\n` +
      `🔧 *Serviço:* ${wo.title}\n` +
      `📝 *Detalhes:* ${wo.description}\n` +
      `⚙️ *Peças:* $${wo.parts_cost_usd.toFixed(2)} USD\n` +
      `👨‍🔧 *Mão de Obra:* $${wo.labor_cost_usd.toFixed(2)} USD\n` +
      `💰 *Total:* *$${wo.total_cost_usd.toFixed(2)} USD*\n\n` +
      `Para aprovar este orçamento, responda esta mensagem!`;

    const phone = wo.customer_phone ? wo.customer_phone.replace(/\D/g, '') : '';
    const url = `https://api.whatsapp.com/send?phone=${phone ? `1${phone}` : ''}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const filteredOrders = workOrders.filter(wo => {
    if (selectedFilter === 'all') return true;
    return wo.status === selectedFilter;
  });

  const totalRepairsPipelineUSD = workOrders.reduce((acc, wo) => acc + wo.total_cost_usd, 0);

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
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(245, 158, 11, 0.35)'
            }}>
              <Wrench size={24} color="#031224" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', color: '#ffffff', margin: 0, fontWeight: 800 }}>
                Ordens de Serviço & Reparos (*Work Orders*)
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                Gerenciamento de consertos de equipamentos, vazamentos e orçamentos em $ USD
              </p>
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={() => setIsModalOpen(true)}
            style={{ padding: '10px 20px', borderRadius: 10 }}
          >
            <Plus size={16} /> Abrir Nova O.S. de Reparo
          </button>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, overflowX: 'auto', paddingBottom: 4 }}>
          {['all', 'Orçamento Criado', 'Aprovado pelo Cliente', 'Em Execução', 'Concluído'].map(f => (
            <button
              key={f}
              onClick={() => setSelectedFilter(f)}
              style={{
                background: selectedFilter === f ? 'rgba(0, 242, 254, 0.15)' : 'rgba(5, 11, 20, 0.6)',
                border: selectedFilter === f ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.08)',
                color: selectedFilter === f ? '#00f2fe' : '#94a3b8',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {f === 'all' ? `Todas (${workOrders.length})` : f}
            </button>
          ))}
        </div>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          color: '#34d399',
          padding: '12px 16px',
          borderRadius: 10,
          fontSize: '0.9rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <CheckCircle2 size={18} /> {successMessage}
        </div>
      )}

      {/* 2. KPI PIPELINE CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <div className="glass-panel" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wrench size={20} color="#f59e0b" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>O.S. em Aberto</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>
              {workOrders.filter(w => w.status !== 'Concluído').length} ativas
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={20} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Faturamento em Reparos</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
              ${totalRepairsPipelineUSD.toFixed(2)} USD
            </div>
          </div>
        </div>
      </div>

      {/* 3. WORK ORDERS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredOrders.map(wo => (
          <div
            key={wo.id}
            className="glass-panel"
            style={{
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              border: wo.status === 'Aprovado pelo Cliente' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                    {wo.category}
                  </span>
                  <span className={`badge ${wo.priority === 'Urgente / Emergência' ? 'badge-red' : wo.priority === 'Alta' ? 'badge-amber' : 'badge-cyan'}`} style={{ fontSize: '0.7rem' }}>
                    Prioridade: {wo.priority}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    O.S. #{wo.id} • {new Date(wo.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
                  {wo.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                  🏊 {wo.pool_name} ({wo.customer_name}) • 👨‍🔧 Técnico: {wo.technician_name}
                </p>
              </div>

              {/* Status Select & Total Cost Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Valor do Reparo</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#10b981' }}>
                    ${wo.total_cost_usd.toFixed(2)} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>USD</span>
                  </div>
                </div>

                <select
                  value={wo.status}
                  onChange={(e) => handleUpdateStatus(wo.id, e.target.value as any)}
                  style={{
                    background: wo.status === 'Concluído' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(5, 11, 20, 0.8)',
                    border: '1px solid rgba(0, 242, 254, 0.3)',
                    color: wo.status === 'Concluído' ? '#34d399' : '#00f2fe',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}
                >
                  <option value="Orçamento Criado">Orçamento Criado</option>
                  <option value="Aprovado pelo Cliente">Aprovado pelo Cliente</option>
                  <option value="Peças em Trânsito">Peças em Trânsito</option>
                  <option value="Em Execução">Em Execução</option>
                  <option value="Concluído">Concluído</option>
                </select>
              </div>
            </div>

            <div style={{ background: 'rgba(5, 11, 20, 0.6)', padding: '12px 14px', borderRadius: 8, fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              "{wo.description}"
            </div>

            {/* Financial Breakdown & Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, paddingTop: 6, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: '#94a3b8' }}>
                <span>Peças: <strong style={{ color: '#ffffff' }}>${wo.parts_cost_usd.toFixed(2)}</strong></span>
                <span>Mão de Obra: <strong style={{ color: '#ffffff' }}>${wo.labor_cost_usd.toFixed(2)}</strong></span>
              </div>

              <button
                className="btn-secondary"
                onClick={() => handleShareWhatsApp(wo)}
                style={{ padding: '8px 14px', fontSize: '0.8rem', gap: 6 }}
              >
                <Share2 size={14} color="#25D366" /> Enviar Orçamento no WhatsApp
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Criação de O.S. */}
      {isModalOpen && (
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
          zIndex: 110,
          padding: 12
        }}>
          <div className="glass-panel" style={{
            maxWidth: 600,
            width: '100%',
            maxHeight: '94vh',
            overflowY: 'auto',
            padding: 24,
            border: '1px solid rgba(245, 158, 11, 0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.25rem', color: '#ffffff', margin: 0, fontWeight: 800 }}>
                🛠️ Abertura de Ordem de Serviço (O.S.)
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateWorkOrder} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Piscina / Cliente</label>
                <select
                  value={formPoolId}
                  onChange={(e) => setFormPoolId(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#050b14', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#ffffff' }}
                >
                  {pools.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - {p.customer_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Título do Serviço</label>
                <input
                  type="text"
                  placeholder="Ex: Troca de Motor Hayward 2.0 HP ou Célula de Sal"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', background: '#050b14', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#ffffff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Categoria</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    style={{ width: '100%', padding: '10px', background: '#050b14', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#ffffff' }}
                  >
                    <option value="Bomba & Motor">Bomba & Motor</option>
                    <option value="Filtro & Areia/Cartucho">Filtro & Areia/Cartucho</option>
                    <option value="Aquecedor (Heater)">Aquecedor (Heater)</option>
                    <option value="Célula de Sal (SWG)">Célula de Sal (SWG)</option>
                    <option value="Vazamentos & Encanamento">Vazamentos & Encanamento</option>
                    <option value="Iluminação & Elétrica">Iluminação & Elétrica</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Prioridade</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    style={{ width: '100%', padding: '10px', background: '#050b14', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#ffffff' }}
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente / Emergência">Urgente / Emergência</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Custo de Peças ($ USD)</label>
                  <input
                    type="number"
                    value={formPartsCost}
                    onChange={(e) => setFormPartsCost(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px', background: '#050b14', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#ffffff' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Mão de Obra ($ USD)</label>
                  <input
                    type="number"
                    value={formLaborCost}
                    onChange={(e) => setFormLaborCost(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px', background: '#050b14', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#ffffff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Descrição do Problema & Diagnóstico</label>
                <textarea
                  rows={3}
                  placeholder="Descreva a avaria, modelo do equipamento e motivo da manutenção..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#050b14', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#ffffff' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Criar Ordem de Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
