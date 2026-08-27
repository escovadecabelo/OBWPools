import React from 'react';
import type { Pool, Route } from '../types/pool';
import { 
  Navigation, Users, FlaskConical, ClipboardCheck, 
  MapPin, ShieldCheck, ArrowRight, Droplets, Zap
} from 'lucide-react';

interface WelcomeScreenProps {
  pools: Pool[];
  routes: Route[];
  onNavigate: (tab: string) => void;
  onSelectPool?: (pool: Pool) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  pools,
  routes,
  onNavigate,
  onSelectPool
}) => {
  const totalStopsToday = routes.reduce((acc, r) => acc + (r.total_stops || 0), 0);
  const totalCompletedToday = routes.reduce((acc, r) => acc + (r.completed_stops || 0), 0);
  const todayProgress = totalStopsToday > 0 ? Math.round((totalCompletedToday / totalStopsToday) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 20 }}>
      
      {/* 1. HERO BANNER WITH LARGE LOGO */}
      <div className="glass-panel-glow" style={{
        padding: '40px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at top, rgba(0, 242, 254, 0.12) 0%, rgba(5, 11, 20, 0.95) 75%)',
        border: '1px solid rgba(0, 242, 254, 0.35)'
      }}>
        
        {/* Glow Spheres */}
        <div style={{
          position: 'absolute',
          top: -80,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 242, 254, 0.25) 0%, transparent 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none'
        }} />

        {/* Large Animated Logo */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 100,
          height: 100,
          borderRadius: 28,
          background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 50%, #0072ff 100%)',
          boxShadow: '0 0 45px rgba(0, 242, 254, 0.5), 0 10px 25px rgba(0, 0, 0, 0.6)',
          margin: '0 auto 20px',
          position: 'relative'
        }}>
          {/* Neon Water Ripples SVG */}
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#031224" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
            <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
            <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
          </svg>
        </div>

        {/* Brand Name & Typography */}
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          fontWeight: 900,
          letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, #ffffff 30%, #00f2fe 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 8px 0'
        }}>
          WandPool
        </h1>

        <p style={{
          fontSize: 'clamp(0.95rem, 2vw, 1.2rem)',
          color: '#cbd5e1',
          maxWidth: 680,
          margin: '0 auto 20px',
          lineHeight: 1.5
        }}>
          Plataforma Inteligente de Gestão de Rotas, Técnicos em Campo & Química de Precisão no <strong style={{ color: '#00f2fe' }}>DFW Metroplex</strong>
        </p>

        {/* Region & Feature Tags */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
          <span className="badge badge-cyan" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
            📍 Dallas • Frisco • Plano • McKinney • Southlake
          </span>
          <span className="badge badge-emerald" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
            ⚡ Otimização de Rota TSP (milhas)
          </span>
          <span className="badge badge-cyan" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
            🧪 Índice de Saturação LSI & Unidades EUA (gal, fl oz, lbs)
          </span>
        </div>

        {/* Big Start Button */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            onClick={() => onNavigate('routes')}
            style={{
              padding: '14px 32px',
              fontSize: '1.05rem',
              fontWeight: 800,
              borderRadius: 14,
              boxShadow: '0 0 30px rgba(0, 242, 254, 0.4)'
            }}
          >
            Iniciar Operação do Dia <ArrowRight size={18} />
          </button>

          <button
            className="btn-secondary"
            onClick={() => onNavigate('clients')}
            style={{
              padding: '14px 26px',
              fontSize: '1.05rem',
              borderRadius: 14
            }}
          >
            <Users size={18} color="#00f2fe" /> Ver Todos os Clientes ({pools.length})
          </button>
        </div>
      </div>

      {/* 2. REAL-TIME METRICS BAR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div className="glass-panel" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0, 242, 254, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Droplets size={22} color="#00f2fe" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Piscinas no DFW</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>{pools.length} ativas</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Navigation size={22} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Rotas em Andamento</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>{routes.length} rotas</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={22} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Paradas Concluídas</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8' }}>
              {totalCompletedToday} / {totalStopsToday} ({todayProgress}%)
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} color="#a855f7" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Química & LSI</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a855f7' }}>Calcite Sat.</div>
          </div>
        </div>
      </div>

      {/* 3. FOUR CORE MODULES QUICK ACCESS CARDS */}
      <div>
        <h2 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: 14, fontWeight: 800 }}>
          Módulos Operacionais WandPool
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          
          {/* Card 1: Rotas do Dia */}
          <div 
            className="glass-panel"
            onClick={() => onNavigate('routes')}
            style={{
              padding: 24,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 16,
              transition: 'all 0.2s ease',
              border: '1px solid rgba(0, 242, 254, 0.2)'
            }}
          >
            <div>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(0, 242, 254, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Navigation size={24} color="#00f2fe" />
              </div>
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff', margin: '0 0 6px 0', fontWeight: 700 }}>
                Rotas do Dia & Técnicos
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                Gerencie funcionários, otimize trajetos via TSP no DFW Metroplex e acompanhe paradas em tempo real.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#00f2fe', fontSize: '0.85rem', fontWeight: 700 }}>
              <span>Acessar Rotas</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Card 2: Central de Clientes */}
          <div 
            className="glass-panel"
            onClick={() => onNavigate('clients')}
            style={{
              padding: 24,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 16,
              transition: 'all 0.2s ease'
            }}
          >
            <div>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(79, 172, 254, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Users size={24} color="#4facfe" />
              </div>
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff', margin: '0 0 6px 0', fontWeight: 700 }}>
                Central de Clientes & Piscinas
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                Cadastro completo, histórico de execuções anteriores, fotos de comprovação e edição de dados de acesso/portão.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#4facfe', fontSize: '0.85rem', fontWeight: 700 }}>
              <span>Buscar Clientes</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Card 3: Laboratório Químico & LSI */}
          <div 
            className="glass-panel"
            onClick={() => onNavigate('lab')}
            style={{
              padding: 24,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 16,
              transition: 'all 0.2s ease'
            }}
          >
            <div>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <FlaskConical size={24} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff', margin: '0 0 6px 0', fontWeight: 700 }}>
                Laboratório Químico & LSI
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                Cálculo de saturação Langelier (LSI), balanceamento de pH, alcalinidade, dureza cálcica e dosagem em fl oz / lbs.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#10b981', fontSize: '0.85rem', fontWeight: 700 }}>
              <span>Abrir Laboratório</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Card 4: Visita Técnica & Comprovantes */}
          <div 
            className="glass-panel"
            onClick={() => onNavigate('service')}
            style={{
              padding: 24,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 16,
              transition: 'all 0.2s ease'
            }}
          >
            <div>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <ClipboardCheck size={24} color="#f59e0b" />
              </div>
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff', margin: '0 0 6px 0', fontWeight: 700 }}>
                Visita Técnica & Comprovantes
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                Checklist de limpeza física, medição de PSI do filtro, retrolavagem e disparo de comprovante com fotos via WhatsApp.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 700 }}>
              <span>Realizar Visita</span>
              <ArrowRight size={16} />
            </div>
          </div>

        </div>
      </div>

      {/* 4. POOL PREVIEW MINI LIST */}
      <div className="glass-panel" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={18} color="#00f2fe" />
            <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
              Piscinas em Atendimento no DFW
            </h3>
          </div>
          <button className="btn-secondary" onClick={() => onNavigate('clients')} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            Ver Todas ({pools.length})
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          {pools.slice(0, 4).map((p) => (
            <div
              key={p.id}
              onClick={() => {
                if (onSelectPool) onSelectPool(p);
                onNavigate('dashboard');
              }}
              style={{
                background: 'rgba(5, 11, 20, 0.6)',
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid rgba(255, 255, 255, 0.06)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginBottom: 2 }}>
                {p.name}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {p.customer_name} • <span style={{ color: '#00f2fe' }}>{p.address.split(',')[1] || 'DFW'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
