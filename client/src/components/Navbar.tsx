import React from 'react';
import { Navigation, Waves, FlaskConical, Calculator, Box, Gauge, ClipboardCheck, Bot, ChevronDown, Sparkles } from 'lucide-react';
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
    { id: 'routes', label: 'Rotas & Fotos', icon: Navigation, isPrimary: true },
    { id: 'dashboard', label: 'Painel Geral', icon: Waves },
    { id: 'lab', label: 'Laboratório & LSI', icon: FlaskConical },
    { id: 'dosage', label: 'Dosagem Química', icon: Calculator },
    { id: 'volume', label: 'Calculadora de Volume', icon: Box },
    { id: 'equipment', label: 'Equipamentos & Pressão', icon: Gauge },
    { id: 'service', label: 'Visitas & Checklists', icon: ClipboardCheck },
    { id: 'hermes', label: 'Hermes Copilot AI', icon: Bot, isSpecial: true },
  ];

  return (
    <header className="no-print" style={{
      background: 'rgba(5, 11, 20, 0.94)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.4)'
          }}>
            <Waves size={24} color="#031224" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em' }}>
                Wand<span style={{ color: '#00f2fe' }}>Pool</span>
              </span>
              <span className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                ROUTING & AI
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Administração de Rotas & Manutenção de Piscinas
            </p>
          </div>
        </div>

        {/* Pool Selector & Quick Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedPool?.id || ''}
              onChange={(e) => {
                if (e.target.value === 'new') {
                  onNewPoolClick();
                } else {
                  const p = pools.find(p => p.id === e.target.value);
                  if (p) onSelectPool(p);
                }
              }}
              style={{
                appearance: 'none',
                background: 'rgba(17, 34, 59, 0.9)',
                border: '1px solid rgba(0, 242, 254, 0.3)',
                borderRadius: 10,
                color: '#f1f5f9',
                padding: '8px 36px 8px 14px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
                minWidth: 260
              }}
            >
              {pools.map(p => (
                <option key={p.id} value={p.id} style={{ background: '#0a1526' }}>
                  🏊 {p.name} ({p.customer_name})
                </option>
              ))}
              <option value="new" style={{ background: '#0a1526', color: '#00f2fe', fontWeight: 700 }}>
                ➕ Cadastrar Nova Piscina...
              </option>
            </select>
            <ChevronDown size={16} color="#00f2fe" style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }} />
          </div>

          {selectedPool && (
            <div className="badge badge-emerald" style={{ padding: '6px 12px' }}>
              <span>{selectedPool.volume_liters.toLocaleString('pt-BR')} L</span>
              <span style={{ opacity: 0.6 }}>•</span>
              <span>{selectedPool.sanitizer_type}</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
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
                gap: 8,
                padding: '10px 16px',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive 
                  ? (tab.isPrimary ? '#00f2fe' : tab.isSpecial ? '#00f2fe' : '#ffffff') 
                  : '#94a3b8',
                background: isActive 
                  ? (tab.isPrimary ? 'rgba(0, 242, 254, 0.15)' : tab.isSpecial ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255, 255, 255, 0.08)')
                  : 'transparent',
                border: 'none',
                borderBottom: isActive 
                  ? '2px solid #00f2fe'
                  : '2px solid transparent',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={17} color={isActive ? '#00f2fe' : '#64748b'} />
              <span>{tab.label}</span>
              {tab.isPrimary && (
                <span className="badge badge-cyan" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>CORE</span>
              )}
              {tab.isSpecial && (
                <Sparkles size={12} color="#00f2fe" style={{ animation: 'pulse-glow 2s infinite' }} />
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
