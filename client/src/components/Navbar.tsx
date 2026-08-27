import React from 'react';
import { Home, Navigation, Users, Waves, FlaskConical, Calculator, Box, Gauge, ClipboardCheck, ChevronDown, Plus } from 'lucide-react';
import type { Pool } from '../types/pool';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pools: Pool[];
  selectedPool: Pool | null;
  onSelectPool: (pool: Pool) => void;
  onNewPoolClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pools,
  selectedPool,
  onSelectPool,
  onNewPoolClick
}) => {
  const tabs = [
    { id: 'home', label: 'Início', icon: Home, isHighlight: true },
    { id: 'routes', label: 'Rotas do Dia', icon: Navigation, isPrimary: true },
    { id: 'clients', label: 'Clientes & Edição', icon: Users },
    { id: 'dashboard', label: 'Painel Geral', icon: Waves },
    { id: 'lab', label: 'Laboratório & LSI', icon: FlaskConical },
    { id: 'dosage', label: 'Dosagem Química', icon: Calculator },
    { id: 'volume', label: 'Calculadora de Volume', icon: Box },
    { id: 'equipment', label: 'Equipamentos & PSI', icon: Gauge },
    { id: 'service', label: 'Visita Técnica', icon: ClipboardCheck },
  ];

  return (
    <header className="no-print" style={{
      background: 'rgba(5, 11, 20, 0.96)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        {/* Brand Logo & Tagline */}
        <div 
          onClick={() => setActiveTab('home')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        >
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(0, 242, 254, 0.35)'
          }}>
            <Waves size={22} color="#031224" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em' }}>
                Wand<span style={{ color: '#00f2fe' }}>Pool</span>
              </span>
              <span className="badge badge-cyan" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>
                PRO
              </span>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0 }}>
              Rotas & Manutenção de Piscinas
            </p>
          </div>
        </div>

        {/* Pool Quick Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedPool?.id || ''}
              onChange={(e) => {
                if (e.target.value === 'new') {
                  onNewPoolClick();
                } else if (e.target.value === 'all_clients') {
                  setActiveTab('clients');
                } else {
                  const p = pools.find(p => p.id === e.target.value);
                  if (p) onSelectPool(p);
                }
              }}
              style={{
                appearance: 'none',
                background: 'rgba(17, 34, 59, 0.95)',
                border: '1px solid rgba(0, 242, 254, 0.3)',
                borderRadius: 10,
                color: '#f1f5f9',
                padding: '8px 34px 8px 12px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
                maxWidth: 280,
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}
            >
              {pools.map(p => (
                <option key={p.id} value={p.id} style={{ background: '#0a1526' }}>
                  🏊 {p.name}
                </option>
              ))}
              <option value="all_clients" style={{ background: '#0a1526', color: '#4facfe', fontWeight: 700 }}>
                👥 Gerenciar Todos os Clientes...
              </option>
              <option value="new" style={{ background: '#0a1526', color: '#00f2fe', fontWeight: 700 }}>
                ➕ Cadastrar Nova Piscina...
              </option>
            </select>
            <ChevronDown size={15} color="#00f2fe" style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }} />
          </div>

          <button 
            className="btn-secondary"
            onClick={onNewPoolClick}
            style={{ padding: '7px 12px', fontSize: '0.8rem', borderRadius: 8 }}
            title="Novo Cliente / Piscina"
          >
            <Plus size={14} /> Novo
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar (Desktop / Tablet) */}
      <div className="desktop-tab-bar" style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        overflowX: 'auto'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '9px 14px',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#00f2fe' : '#94a3b8',
                background: isActive ? 'rgba(0, 242, 254, 0.12)' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #00f2fe' : '2px solid transparent',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} color={isActive ? '#00f2fe' : '#64748b'} />
              <span>{tab.label}</span>
              {tab.isPrimary && (
                <span className="badge badge-cyan" style={{ fontSize: '0.55rem', padding: '1px 5px' }}>ROTA</span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
