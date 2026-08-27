import React from 'react';
import { Home, Navigation, Users, Waves, FlaskConical } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab
}) => {
  const items = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'routes', label: 'Rotas', icon: Navigation },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'dashboard', label: 'Painel', icon: Waves },
    { id: 'lab', label: 'Lab & LSI', icon: FlaskConical },
  ];

  return (
    <nav className="mobile-bottom-nav no-print">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        height: '100%',
        maxWidth: 600,
        margin: '0 auto',
        padding: '0 8px'
      }}>
        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                minHeight: 48,
                padding: '6px 4px',
                background: 'transparent',
                border: 'none',
                color: isActive ? '#00f2fe' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative'
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
              <Icon size={20} color={isActive ? '#00f2fe' : '#94a3b8'} strokeWidth={isActive ? 2.5 : 2} />
              <span style={{
                fontSize: '0.7rem',
                fontWeight: isActive ? 700 : 500,
                marginTop: 3,
                letterSpacing: '-0.01em'
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
