import React, { useState, useMemo } from 'react';
import type { Pool } from '../types/pool';
import { 
  Search, Plus, Edit3, MapPin, Phone, Key, X, User, ExternalLink, 
  FlaskConical, ArrowRight, FileText
} from 'lucide-react';

interface CustomerManagerProps {
  pools: Pool[];
  onSelectPool: (pool: Pool) => void;
  onEditPool: (pool: Pool) => void;
  onViewHistory?: (pool: Pool) => void;
  onNewPoolClick: () => void;
  onNavigateTab: (tabId: string) => void;
}

export const CustomerManager: React.FC<CustomerManagerProps> = ({
  pools,
  onSelectPool,
  onEditPool,
  onViewHistory,
  onNewPoolClick,
  onNavigateTab
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const filteredPools = useMemo(() => {
    return pools.filter(p => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term || 
        p.name.toLowerCase().includes(term) ||
        p.customer_name.toLowerCase().includes(term) ||
        p.address.toLowerCase().includes(term) ||
        (p.gate_code && p.gate_code.toLowerCase().includes(term)) ||
        (p.customer_phone && p.customer_phone.includes(term));

      if (!matchesSearch) return false;

      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'segunda') return (p.service_day || 'Segunda-feira').toLowerCase().includes('segunda');
      if (selectedFilter === 'terca') return (p.service_day || '').toLowerCase().includes('terça');
      if (selectedFilter === 'hoa') return p.pool_type.includes('HOA') || p.pool_type.includes('Comercial') || p.pool_type.includes('Condomínio');
      if (selectedFilter === 'residential') return p.pool_type.includes('Residencial');
      if (selectedFilter === 'salt') return p.sanitizer_type.includes('Sal');

      return true;
    });
  }, [pools, searchTerm, selectedFilter]);

  const handleOpenGps = (address: string) => {
    const encoded = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank');
  };

  const handleOpenWhatsApp = (phone?: string, customerName?: string) => {
    if (!phone) return;
    const cleanNumber = phone.replace(/\D/g, '');
    const msg = encodeURIComponent(`Olá ${customerName}! Aqui é o Tyler da equipe técnica de manutenção WandPool.`);
    window.open(`https://wa.me/1${cleanNumber}?text=${msg}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header & Quick Action */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: '1.6rem', color: '#ffffff', margin: 0 }}>Gestão de Clientes & Piscinas</h1>
            <span className="badge badge-cyan">{pools.length} Clientes Ativos</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0' }}>
            Consulte endereços em DFW, códigos de portão, equipamentos e edite qualquer cadastro em tempo real.
          </p>
        </div>

        <button className="btn-primary" onClick={onNewPoolClick} style={{ padding: '12px 20px', borderRadius: 10 }}>
          <Plus size={18} /> Cadastrar Nova Piscina
        </button>
      </div>

      {/* Search & Fast Filters */}
      <div className="glass-panel" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} color="#00f2fe" style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none'
          }} />
          <input
            type="text"
            className="input-control"
            style={{
              paddingLeft: 42,
              paddingRight: searchTerm ? 38 : 14,
              fontSize: '0.95rem',
              height: 48,
              background: 'rgba(5, 11, 20, 0.7)',
              borderColor: 'rgba(0, 242, 254, 0.3)'
            }}
            placeholder="Buscar por nome do cliente, condomínio, endereço (ex: Frisco), portão #4821 ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 4
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { id: 'all', label: `Todos (${pools.length})` },
            { id: 'segunda', label: 'Rotas de Segunda-feira' },
            { id: 'residential', label: 'Residenciais' },
            { id: 'hoa', label: 'Condomínios & HOAs' },
            { id: 'salt', label: 'Gerador de Sal (SWG)' },
          ].map(f => {
            const isSelected = selectedFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 20,
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? '#031224' : '#94a3b8',
                  background: isSelected ? '#00f2fe' : 'rgba(255, 255, 255, 0.05)',
                  border: isSelected ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results List / Grid */}
      {filteredPools.length === 0 ? (
        <div className="glass-panel" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
          <Search size={40} color="#64748b" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Nenhum cliente encontrado</h3>
          <p style={{ fontSize: '0.85rem', marginTop: 6 }}>
            Tente buscar com outro termo ou limpe os filtros para visualizar a lista completa.
          </p>
          <button className="btn-secondary" onClick={() => { setSearchTerm(''); setSelectedFilter('all'); }} style={{ marginTop: 16 }}>
            Limpar Busca
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 18 }}>
          {filteredPools.map((pool) => (
            <div
              key={pool.id}
              className="glass-panel"
              style={{
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                position: 'relative',
                transition: 'all 0.2s ease',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              {/* Header: Name & Badges */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <h3 style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 700, margin: 0 }}>
                      {pool.name}
                    </h3>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#00f2fe', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <User size={14} /> {pool.customer_name}
                  </div>
                </div>

                <button
                  className="btn-secondary"
                  onClick={() => onEditPool(pool)}
                  style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: 8 }}
                  title="Editar cadastro deste cliente"
                >
                  <Edit3 size={14} /> Editar
                </button>
              </div>

              {/* Address & Gate Code Row */}
              <div style={{ background: 'rgba(5, 11, 20, 0.6)', padding: 12, borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={15} color="#4facfe" />
                    {pool.address}
                  </span>
                  <button
                    onClick={() => handleOpenGps(pool.address)}
                    style={{ background: 'transparent', border: 'none', color: '#00f2fe', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.75rem' }}
                  >
                    GPS <ExternalLink size={12} />
                  </button>
                </div>

                {pool.gate_code && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600, marginTop: 2 }}>
                    <Key size={14} />
                    Código / Acesso: {pool.gate_code}
                  </div>
                )}

                {pool.customer_phone && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                      <Phone size={13} color="#10b981" /> {pool.customer_phone}
                    </span>
                    <button
                      onClick={() => handleOpenWhatsApp(pool.customer_phone, pool.customer_name)}
                      style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', borderRadius: 6, padding: '2px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      WhatsApp
                    </button>
                  </div>
                )}
              </div>

              {/* Specs Pills */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 8, borderRadius: 8 }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Volume</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9' }}>
                    {pool.volume_gallons ? `${pool.volume_gallons.toLocaleString()} gal` : `${(pool.volume_liters / 1000).toFixed(0)}k L`}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 8, borderRadius: 8 }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Tratamento</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#00f2fe', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {pool.sanitizer_type.includes('Sal') ? 'Sal (SWG)' : 'Cloro'}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 8, borderRadius: 8 }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Dia de Rota</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>
                    {pool.service_day ? pool.service_day.split('-')[0] : 'Segunda'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 6, marginTop: 'auto', paddingTop: 6, flexWrap: 'wrap' }}>
                {onViewHistory && (
                  <button
                    className="btn-secondary"
                    style={{ flex: 1, padding: '8px 8px', fontSize: '0.75rem', justifyContent: 'center' }}
                    onClick={() => onViewHistory(pool)}
                    title="Ver Histórico de Execuções e Visitas"
                  >
                    <FileText size={13} color="#00f2fe" /> Histórico
                  </button>
                )}

                <button
                  className="btn-secondary"
                  style={{ flex: 1, padding: '8px 8px', fontSize: '0.75rem', justifyContent: 'center' }}
                  onClick={() => {
                    onSelectPool(pool);
                    onNavigateTab('lab');
                  }}
                >
                  <FlaskConical size={13} color="#00f2fe" /> Lab Químico
                </button>

                <button
                  className="btn-primary"
                  style={{ flex: 1.1, padding: '8px 10px', fontSize: '0.75rem', justifyContent: 'center' }}
                  onClick={() => {
                    onSelectPool(pool);
                    onNavigateTab('dashboard');
                  }}
                >
                  Painel <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
