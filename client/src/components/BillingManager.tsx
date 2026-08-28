import React, { useState, useEffect } from 'react';
import type { CustomerInvoice } from '../types/pool';
import { 
  Receipt, DollarSign, CheckCircle2, Clock, 
  Share2
} from 'lucide-react';

const STORAGE_KEY = 'wandpool_invoices';

export const BillingManager: React.FC = () => {
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<CustomerInvoice | null>(null);

  useEffect(() => {
    async function init() {

      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setInvoices(parsed);
          if (parsed.length > 0) setSelectedInvoice(parsed[0]);
          return;
        } catch (e) {}
      }

      // Default Seed Invoices for DFW Pools
      const now = new Date();
      const currentMonth = now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

      const seeds: CustomerInvoice[] = [
        {
          id: 'inv-2026-001',
          invoice_number: 'WP-2026-081',
          pool_id: 'pool-1',
          customer_name: 'David & Sarah Miller',
          customer_phone: '(214) 555-0142',
          customer_email: 'david.miller@friscotx.net',
          billing_period: currentMonth,
          issue_date: '2026-08-01',
          due_date: '2026-08-15',
          plan_name: 'Plano Semanal Salt SWG Premium',
          plan_monthly_fee_usd: 220.00,
          items: [
            { id: 'i1', description: 'Manutenção Semanal Residencial (4 visitas no mês)', quantity: 1, unit_price_usd: 220.00, total_price_usd: 220.00, type: 'subscription' },
            { id: 'i2', description: 'Reposição Sal Especial SWG (2 sacos 40 lbs)', quantity: 2, unit_price_usd: 12.50, total_price_usd: 25.00, type: 'chemical' },
            { id: 'i3', description: 'Tratamento Preventivo de Fosfatos Orenda PR-10,000', quantity: 1, unit_price_usd: 35.00, total_price_usd: 35.00, type: 'specialty' }
          ],
          subtotal_usd: 280.00,
          tax_usd: 0.00,
          total_usd: 280.00,
          status: 'Pago',
          paid_at: '2026-08-10',
          payment_method: 'Zelle / Autopay'
        },
        {
          id: 'inv-2026-002',
          invoice_number: 'WP-2026-082',
          pool_id: 'pool-2',
          customer_name: 'Robert & Elena Vance',
          customer_phone: '(214) 555-0199',
          customer_email: 'vance.preston@dallasluxury.com',
          billing_period: currentMonth,
          issue_date: '2026-08-01',
          due_date: '2026-08-15',
          plan_name: 'Plano Mansão Preston Hollow (Cloro Tradicional)',
          plan_monthly_fee_usd: 250.00,
          items: [
            { id: 'i4', description: 'Manutenção Semanal Piscina 35k galões (4 visitas)', quantity: 1, unit_price_usd: 250.00, total_price_usd: 250.00, type: 'subscription' },
            { id: 'i5', description: 'Cloro Líquido 12.5% Extra pós-ondas de calor (4 gal)', quantity: 4, unit_price_usd: 7.50, total_price_usd: 30.00, type: 'chemical' }
          ],
          subtotal_usd: 280.00,
          tax_usd: 0.00,
          total_usd: 280.00,
          status: 'Pendente'
        },
        {
          id: 'inv-2026-003',
          invoice_number: 'WP-2026-083',
          pool_id: 'pool-3',
          customer_name: 'HOA Craig Ranch Master Association',
          customer_phone: '(972) 555-0177',
          customer_email: 'accounting@craigranchhoa.com',
          billing_period: currentMonth,
          issue_date: '2026-08-01',
          due_date: '2026-08-15',
          plan_name: 'Plano Comercial HOA Full Service (50k gal)',
          plan_monthly_fee_usd: 450.00,
          items: [
            { id: 'i6', description: 'Serviço Comercial Bisemanal HOA (8 visitas)', quantity: 1, unit_price_usd: 450.00, total_price_usd: 450.00, type: 'subscription' },
            { id: 'i7', description: 'Retrolavagem e reposição de D.E. no filtro', quantity: 1, unit_price_usd: 60.00, total_price_usd: 60.00, type: 'specialty' }
          ],
          subtotal_usd: 510.00,
          tax_usd: 0.00,
          total_usd: 510.00,
          status: 'Pendente'
        }
      ];

      setInvoices(seeds);
      setSelectedInvoice(seeds[0]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeds));
    }
    init();
  }, []);

  const saveInvoices = (updated: CustomerInvoice[]) => {
    setInvoices(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleToggleStatus = (invId: string) => {
    const updated = invoices.map(inv => {
      if (inv.id === invId) {
        const nextStatus: CustomerInvoice['status'] = inv.status === 'Pago' ? 'Pendente' : 'Pago';
        return {
          ...inv,
          status: nextStatus,
          paid_at: nextStatus === 'Pago' ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return inv;
    });
    saveInvoices(updated);
    const curr = updated.find(i => i.id === invId);
    if (curr) setSelectedInvoice(curr);
  };

  const handleShareWhatsApp = (inv: CustomerInvoice) => {
    const itemsText = inv.items.map(i => `• ${i.description}: $${i.total_price_usd.toFixed(2)}`).join('\n');
    const msg = `*WandPool - Fatura Mensal de Manutenção*\n\n` +
      `👤 *Cliente:* ${inv.customer_name}\n` +
      `🧾 *Fatura Nº:* ${inv.invoice_number}\n` +
      `📅 *Mês de Referência:* ${inv.billing_period}\n\n` +
      `*Detalhamento dos Serviços:*\n${itemsText}\n\n` +
      `💰 *Total a Pagar:* *$${inv.total_usd.toFixed(2)} USD*\n` +
      `📆 *Vencimento:* ${inv.due_date}\n` +
      `💳 *Formas de Pagamento:* Zelle, Cartão de Crédito ou Cheque\n\n` +
      `Obrigado por manter sua piscina cristalina com a WandPool!`;

    const phone = inv.customer_phone ? inv.customer_phone.replace(/\D/g, '') : '';
    const url = `https://api.whatsapp.com/send?phone=${phone ? `1${phone}` : ''}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const totalMonthlyBilled = invoices.reduce((acc, i) => acc + i.total_usd, 0);
  const totalCollected = invoices.filter(i => i.status === 'Pago').reduce((acc, i) => acc + i.total_usd, 0);
  const totalPending = invoices.filter(i => i.status !== 'Pago').reduce((acc, i) => acc + i.total_usd, 0);

  const filteredInvoices = invoices.filter(inv => {
    if (selectedFilter === 'all') return true;
    return inv.status === selectedFilter;
  });

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
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.35)'
            }}>
              <Receipt size={24} color="#031224" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', color: '#ffffff', margin: 0, fontWeight: 800 }}>
                Faturamento & Mensalidades (*Billing & Invoicing*)
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                Cobrança automática de planos mensais, produtos químicos extras e recibos em $ USD
              </p>
            </div>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', gap: 8 }}>
            {['all', 'Pendente', 'Pago'].map(f => (
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
                  cursor: 'pointer'
                }}
              >
                {f === 'all' ? `Todas (${invoices.length})` : f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. REVENUE KPI METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <div className="glass-panel" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0, 242, 254, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={20} color="#00f2fe" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Faturamento Total (Mês)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
              ${totalMonthlyBilled.toFixed(2)} USD
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={20} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Recebido / Liquidado</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
              ${totalCollected.toFixed(2)} USD
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={20} color="#f59e0b" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>A Receber (Pendente)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>
              ${totalPending.toFixed(2)} USD
            </div>
          </div>
        </div>
      </div>

      {/* 3. INVOICE SPLIT VIEW (LIST + PREVIEW) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 16 }}>
        
        {/* Left Column: Invoices List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredInvoices.map(inv => {
            const isSelected = selectedInvoice?.id === inv.id;
            return (
              <div
                key={inv.id}
                onClick={() => setSelectedInvoice(inv)}
                style={{
                  background: isSelected ? 'rgba(0, 242, 254, 0.12)' : 'rgba(5, 11, 20, 0.6)',
                  border: isSelected ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 12,
                  padding: 16,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                      {inv.customer_name}
                    </span>
                    <span className={`badge ${inv.status === 'Pago' ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.65rem' }}>
                      {inv.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    {inv.invoice_number} • Vencimento: {inv.due_date}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#00f2fe', marginTop: 2 }}>
                    {inv.plan_name}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981' }}>
                    ${inv.total_usd.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>USD</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Digital Invoice Detail Card */}
        {selectedInvoice && (
          <div className="glass-panel" style={{ padding: 24, border: '1px solid rgba(0, 242, 254, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 16, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Fatura Digital WandPool</div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', margin: '2px 0' }}>
                  {selectedInvoice.invoice_number}
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#00f2fe' }}>
                  {selectedInvoice.customer_name} • {selectedInvoice.customer_phone}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${selectedInvoice.status === 'Pago' ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                  Status: {selectedInvoice.status}
                </span>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
                  Mês: {selectedInvoice.billing_period}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', paddingBottom: 4 }}>
                <span>Descrição do Item / Serviço</span>
                <span>Valor ($ USD)</span>
              </div>

              {selectedInvoice.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(5, 11, 20, 0.6)',
                    padding: '10px 12px',
                    borderRadius: 8,
                    fontSize: '0.85rem'
                  }}
                >
                  <div>
                    <div style={{ color: '#ffffff', fontWeight: 600 }}>{item.description}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Qtd: {item.quantity} × ${item.unit_price_usd.toFixed(2)}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: '#10b981' }}>
                    ${item.total_price_usd.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Summary */}
            <div style={{ background: 'rgba(0, 242, 254, 0.05)', padding: 14, borderRadius: 10, border: '1px solid rgba(0, 242, 254, 0.2)', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>
                <span>Total a Cobrar:</span>
                <span style={{ color: '#10b981' }}>${selectedInvoice.total_usd.toFixed(2)} USD</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                Vencimento: {selectedInvoice.due_date} {selectedInvoice.paid_at && `• Liquidado em ${selectedInvoice.paid_at}`}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                className="btn-primary"
                onClick={() => handleToggleStatus(selectedInvoice.id)}
                style={{ flex: 1, padding: '10px', justifyContent: 'center' }}
              >
                <CheckCircle2 size={16} />
                {selectedInvoice.status === 'Pago' ? 'Marcar como Pendente' : 'Marcar como Pago'}
              </button>

              <button
                className="btn-secondary"
                onClick={() => handleShareWhatsApp(selectedInvoice)}
                style={{ flex: 1.2, padding: '10px', justifyContent: 'center', gap: 6 }}
              >
                <Share2 size={16} color="#25D366" /> Enviar Fatura no WhatsApp
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
