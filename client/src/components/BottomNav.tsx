import React, { useState } from 'react';
import { 
  Home, Navigation, ClipboardCheck, FlaskConical, Menu, X, 
  Waves, Calculator, Box, Gauge, Truck, Wrench, Receipt, Users, 
  Globe, ChevronRight, Plus
} from 'lucide-react';
import type { Pool } from '../types/pool';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onBackToLanding?: () => void;
  pools?: Pool[];
  selectedPool?: Pool | null;
  onSelectPool?: (pool: Pool) => void;
  onNewPoolClick?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onBackToLanding,
  pools = [],
  selectedPool,
  onSelectPool,
  onNewPoolClick
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPoolSwitcherOpen, setIsPoolSwitcherOpen] = useState(false);

  // Top 4 fast-access tabs on mobile bar + "Mais" button
  const primaryTabs = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'routes', label: 'Rotas', icon: Navigation, badge: 'GPS' },
    { id: 'service', label: 'Visita', icon: ClipboardCheck },
    { id: 'lab', label: 'Lab & LSI', icon: FlaskConical },
  ];

  const allModules = [
    {
      category: '📍 Operações de Campo',
      items: [
        { id: 'home', label: 'Início & Resumo', desc: 'Status geral da operação', icon: Home, color: '#00f2fe' },
        { id: 'routes', label: 'Rotas do Dia (GPS)', desc: 'Otimização TSP e navegação Waze', icon: Navigation, color: '#38bdf8' },
        { id: 'service', label: 'Visita Técnica & Checklist', desc: 'Registro de campo e Door Hanger', icon: ClipboardCheck, color: '#10b981' },
        { id: 'dashboard', label: 'Painel Geral da Piscina', desc: 'Métricas vitais e histórico', icon: Waves, color: '#6366f1' },
      ]
    },
    {
      category: '🧪 Química & Laboratório',
      items: [
        { id: 'lab', label: 'Laboratório & LSI', desc: 'Cálculo de saturação e equilíbrio', icon: FlaskConical, color: '#00f2fe' },
        { id: 'dosage', label: 'Calculadora de Dosagem', desc: 'Ácido, cloro, bicarb e dosagens', icon: Calculator, color: '#f59e0b' },
        { id: 'volume', label: 'Calculadora de Volume', desc: 'Cálculo de galões e litros', icon: Box, color: '#a855f7' },
      ]
    },
    {
      category: '🔧 Equipamentos & Frota',
      items: [
        { id: 'equipment', label: 'Equipamentos & Manômetro', desc: 'Alertas de PSI e retrolavagem', icon: Gauge, color: '#ec4899' },
        { id: 'inventory', label: 'Estoque do Caminhão', desc: 'Controle de químicos na van', icon: Truck, color: '#06b6d4' },
      ]
    },
    {
      category: '💼 Gestão & Clientes',
      items: [
        { id: 'clients', label: 'Clientes & Piscinas', desc: 'Cadastro, edição e histórico', icon: Users, color: '#3b82f6' },
        { id: 'work_orders', label: 'Ordens de Serviço', desc: 'Reparos e orçamentos em USD', icon: Wrench, color: '#eab308' },
        { id: 'billing', label: 'Faturamento & Faturas', desc: 'Planos mensais e cobranças', icon: Receipt, color: '#10b981' },
        { id: 'team', label: 'Funcionários & Técnicos', desc: 'Equipe de campo e rotas', icon: Users, color: '#8b5cf6' },
      ]
    }
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsDrawerOpen(false);
  };

  const isOtherTabActive = !primaryTabs.some(t => t.id === activeTab);

  return (
    <>
      {/* Fixed Bottom Bar */}
      <nav className="mobile-bottom-nav no-print" aria-label="Mobile Navigation">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          height: '100%',
          maxWidth: 600,
          margin: '0 auto',
          padding: '0 6px'
        }}>
          {primaryTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  minHeight: 52,
                  padding: '6px 2px',
                  background: 'transparent',
                  border: 'none',
                  color: isActive ? '#00f2fe' : '#94a3b8',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.15s ease'
                }}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    width: 32,
                    height: 3,
                    background: '#00f2fe',
                    borderRadius: '0 0 4px 4px',
                    boxShadow: '0 0 10px #00f2fe'
                  }} />
                )}
                <div style={{ position: 'relative' }}>
                  <Icon size={22} color={isActive ? '#00f2fe' : '#94a3b8'} strokeWidth={isActive ? 2.5 : 2} />
                  {tab.badge && !isActive && (
                    <span style={{
                      position: 'absolute',
                      top: -4,
                      right: -8,
                      background: 'rgba(0, 242, 254, 0.25)',
                      color: '#00f2fe',
                      fontSize: '0.55rem',
                      fontWeight: 800,
                      padding: '1px 4px',
                      borderRadius: 6,
                      border: '1px solid rgba(0, 242, 254, 0.4)'
                    }}>
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: isActive ? 700 : 500,
                  marginTop: 3,
                  letterSpacing: '-0.01em',
                  color: isActive ? '#00f2fe' : '#94a3b8'
                }}>
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* "Mais Módulos" Button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              minHeight: 52,
              padding: '6px 2px',
              background: 'transparent',
              border: 'none',
              color: isOtherTabActive ? '#00f2fe' : '#94a3b8',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            {isOtherTabActive && (
              <div style={{
                position: 'absolute',
                top: 0,
                width: 32,
                height: 3,
                background: '#00f2fe',
                borderRadius: '0 0 4px 4px',
                boxShadow: '0 0 10px #00f2fe'
              }} />
            )}
            <Menu size={22} color={isOtherTabActive ? '#00f2fe' : '#94a3b8'} strokeWidth={isOtherTabActive ? 2.5 : 2} />
            <span style={{
              fontSize: '0.72rem',
              fontWeight: isOtherTabActive ? 700 : 500,
              marginTop: 3,
              color: isOtherTabActive ? '#00f2fe' : '#94a3b8'
            }}>
              Mais
            </span>
          </button>
        </div>
      </nav>

      {/* Full Sliding Mobile Drawer */}
      {isDrawerOpen && (
        <div 
          className="mobile-drawer-overlay no-print"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div 
            className="mobile-drawer-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-drawer-handle" />

            {/* Drawer Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px 14px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src="/logo.png" alt="OBW Pools" style={{ height: 28, width: 'auto' }} />
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f1f5f9' }}>
                    Menu do Sistema
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Todos os 13 módulos de campo & gestão
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'grid',
                  placeItems: 'center',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Active Pool Quick Bar inside Drawer */}
            {selectedPool && (
              <div style={{
                padding: '10px 18px',
                background: 'rgba(0, 242, 254, 0.06)',
                borderBottom: '1px solid rgba(0, 242, 254, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                  <span style={{ fontSize: '1.1rem' }}>🏊</span>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#00f2fe' }}>
                      {selectedPool.name}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                      {selectedPool.customer_name} • {selectedPool.address}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsPoolSwitcherOpen(true)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 6,
                    background: 'rgba(0, 242, 254, 0.15)',
                    border: '1px solid rgba(0, 242, 254, 0.35)',
                    color: '#00f2fe',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  Trocar
                </button>
              </div>
            )}

            {/* Scrollable Modules List */}
            <div style={{
              overflowY: 'auto',
              padding: '14px 16px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              WebkitOverflowScrolling: 'touch'
            }}>
              {allModules.map((category, idx) => (
                <div key={idx}>
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#64748b',
                    marginBottom: 8,
                    paddingLeft: 4
                  }}>
                    {category.category}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
                    {category.items.map(item => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectTab(item.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 14px',
                            borderRadius: 12,
                            background: isActive ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                            border: isActive ? '1px solid rgba(0, 242, 254, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                            color: '#f1f5f9',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 38,
                              height: 38,
                              borderRadius: 10,
                              background: isActive ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                              border: `1px solid ${isActive ? 'rgba(0, 242, 254, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
                              display: 'grid',
                              placeItems: 'center',
                              flexShrink: 0
                            }}>
                              <Icon size={20} color={item.color || '#00f2fe'} />
                            </div>
                            <div>
                              <div style={{
                                fontSize: '0.92rem',
                                fontWeight: isActive ? 800 : 600,
                                color: isActive ? '#00f2fe' : '#f1f5f9'
                              }}>
                                {item.label}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 1 }}>
                                {item.desc}
                              </div>
                            </div>
                          </div>

                          <ChevronRight size={16} color={isActive ? '#00f2fe' : '#64748b'} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Back to Public Site Link */}
              <div style={{
                marginTop: 6,
                paddingTop: 14,
                borderTop: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    if (onBackToLanding) {
                      onBackToLanding();
                    } else {
                      window.location.assign('/');
                    }
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '12px',
                    borderRadius: 10,
                    background: 'rgba(0, 242, 254, 0.1)',
                    border: '1px solid rgba(0, 242, 254, 0.3)',
                    color: '#00f2fe',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Globe size={18} />
                  <span>Voltar ao Website Oficial (Público)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pool Switcher Modal on Mobile */}
      {isPoolSwitcherOpen && (
        <div 
          className="mobile-drawer-overlay no-print"
          onClick={() => setIsPoolSwitcherOpen(false)}
        >
          <div 
            className="mobile-drawer-sheet"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: '70vh' }}
          >
            <div className="mobile-drawer-handle" />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px 14px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f1f5f9' }}>
                Selecionar Piscina / Cliente
              </div>
              <button
                onClick={() => setIsPoolSwitcherOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'grid',
                  placeItems: 'center',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{
              overflowY: 'auto',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              {pools.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    if (onSelectPool) onSelectPool(p);
                    setIsPoolSwitcherOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: selectedPool?.id === p.id ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: selectedPool?.id === p.id ? '1px solid rgba(0, 242, 254, 0.45)' : '1px solid rgba(255, 255, 255, 0.06)',
                    color: '#f1f5f9',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: selectedPool?.id === p.id ? '#00f2fe' : '#f1f5f9' }}>
                      🏊 {p.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {p.customer_name} • {p.address}
                    </div>
                  </div>
                  {selectedPool?.id === p.id && (
                    <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>Ativa</span>
                  )}
                </button>
              ))}

              {onNewPoolClick && (
                <button
                  onClick={() => {
                    setIsPoolSwitcherOpen(false);
                    onNewPoolClick();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '12px',
                    borderRadius: 10,
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    color: '#34d399',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    marginTop: 4
                  }}
                >
                  <Plus size={16} />
                  <span>Cadastrar Nova Piscina</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
