import React from 'react';
import { 
  Home, Navigation, Users, Waves, FlaskConical, Calculator, 
  Box, Gauge, ClipboardCheck, ChevronDown, Plus, Truck, Wrench, Receipt, Globe 
} from 'lucide-react';
import type { Pool } from '../types/pool';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pools: Pool[];
  selectedPool: Pool | null;
  onSelectPool: (pool: Pool) => void;
  onNewPoolClick: () => void;
  onBackToLanding?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pools,
  selectedPool,
  onSelectPool,
  onNewPoolClick,
  onBackToLanding
}) => {
  const tabs = [
    { id: 'home', label: 'Início', icon: Home, isHighlight: true },
    { id: 'routes', label: 'Rotas do Dia', icon: Navigation, isPrimary: true },
    { id: 'service', label: 'Visita Técnica', icon: ClipboardCheck },
    { id: 'lab', label: 'Laboratório & LSI', icon: FlaskConical },
    { id: 'dosage', label: 'Dosagem Química', icon: Calculator },
    { id: 'volume', label: 'Volume de Tanque', icon: Box },
    { id: 'equipment', label: 'Equipamentos & PSI', icon: Gauge },
    { id: 'inventory', label: 'Estoque Caminhão', icon: Truck },
    { id: 'clients', label: 'Clientes & Piscinas', icon: Users },
    { id: 'work_orders', label: 'Ordens de Serviço', icon: Wrench },
    { id: 'billing', label: 'Faturamento', icon: Receipt },
    { id: 'team', label: 'Funcionários', icon: Users },
    { id: 'dashboard', label: 'Painel Geral', icon: Waves },
  ];

  return (
    <header className="no-print" style={{
      background: 'rgba(5, 11, 20, 0.97)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(0, 242, 254, 0.18)',
      position: 'sticky',
      top: 0,
      zIndex: 80,
      paddingTop: 'env(safe-area-inset-top, 0px)'
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0 }}
        >
          <img
            src="/logo.png"
            alt="OBW Pools"
            style={{
              height: 32,
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 10px rgba(0, 242, 254, 0.45))'
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                OBW <span style={{ color: '#00f2fe' }}>Pools</span>
              </span>
              <span className="badge badge-cyan" style={{ fontSize: '0.55rem', padding: '0px 5px' }}>
                PRO
              </span>
            </div>
            <p style={{ fontSize: '0.62rem', color: '#94a3b8', margin: 0, lineHeight: 1 }}>
              Cleaning • Maintenance
            </p>
          </div>
        </div>

        {/* Pool Quick Switcher & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
                WebkitAppearance: 'none',
                background: 'rgba(17, 34, 59, 0.95)',
                border: '1px solid rgba(0, 242, 254, 0.35)',
                borderRadius: 8,
                color: '#f1f5f9',
                padding: '6px 26px 6px 10px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
                maxWidth: 'clamp(130px, 30vw, 240px)',
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
                👥 Gerenciar Clientes...
              </option>
              <option value="new" style={{ background: '#0a1526', color: '#00f2fe', fontWeight: 700 }}>
                ➕ Nova Piscina...
              </option>
            </select>
            <ChevronDown size={13} color="#00f2fe" style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }} />
          </div>

          <button 
            className="btn-secondary"
            onClick={onNewPoolClick}
            style={{ 
              padding: '6px 10px', 
              fontSize: '0.78rem', 
              borderRadius: 8,
              minHeight: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
            title="Novo Cliente / Piscina"
          >
            <Plus size={14} />
            <span style={{ display: 'none', }} className="desktop-inline">Novo</span>
          </button>

          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 10px',
                borderRadius: 8,
                background: 'rgba(0, 242, 254, 0.12)',
                border: '1px solid rgba(0, 242, 254, 0.35)',
                color: '#00f2fe',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
              title="Voltar ao Website Oficial"
            >
              <Globe size={14} />
              <span>Site</span>
            </button>
          )}
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
                padding: '8px 12px',
                fontSize: '0.84rem',
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
