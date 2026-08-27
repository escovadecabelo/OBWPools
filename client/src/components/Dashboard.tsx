import React from 'react';
import type { Pool, WaterTest, ServiceVisit } from '../types/pool';
import { 
  Gauge, MapPin, Phone, User, Calendar, Droplets, ShieldCheck, FileText, Send
} from 'lucide-react';
import { calculateLSIClient } from '../lib/chemistry';

interface DashboardProps {
  pool: Pool;
  latestTest?: WaterTest;
  latestVisit?: ServiceVisit;
  onNavigate: (tab: string) => void;
  onQuickDoorHanger: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  pool,
  latestTest,
  latestVisit,
  onNavigate,
  onQuickDoorHanger
}) => {
  const test = latestTest || {
    timestamp: new Date().toISOString(),
    ph: 7.4,
    free_chlorine: 2.5,
    combined_chlorine: 0.1,
    total_alkalinity: 100,
    calcium_hardness: 250,
    cyanuric_acid: 35,
    salt_ppm: 0,
    temperature_c: 26,
    turbidity: 'Cristalina',
    pool_id: pool.id
  };

  const lsi = calculateLSIClient(
    test.ph,
    test.temperature_c,
    test.calcium_hardness,
    test.total_alkalinity,
    test.cyanuric_acid,
    test.salt_ppm || 1000
  );

  let healthScore = 100;
  if (test.ph < 7.2 || test.ph > 7.6) healthScore -= 20;
  if (test.free_chlorine < 1.5 || test.free_chlorine > 4.5) healthScore -= 25;
  if (test.total_alkalinity < 80 || test.total_alkalinity > 120) healthScore -= 15;
  if (Math.abs(lsi.lsi) > 0.30) healthScore -= 20;
  healthScore = Math.max(20, Math.min(100, healthScore));

  const filterPsiDelta = (pool.current_filter_psi || 14) - (pool.clean_filter_psi || 12);
  const needsBackwash = filterPsiDelta >= 6.0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Pool Overview Card */}
      <div className="glass-panel" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 242, 254, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontSize: '1.8rem', color: '#ffffff' }}>{pool.name}</h1>
              <span className="badge badge-cyan">{pool.pool_type}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', color: '#94a3b8', fontSize: '0.875rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <User size={15} color="#00f2fe" /> {pool.customer_name}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <MapPin size={15} color="#4facfe" /> {pool.address}
              </span>
              {pool.customer_phone && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Phone size={15} color="#10b981" /> {pool.customer_phone}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={() => onNavigate('service')}>
              <Calendar size={16} /> Visita Técnica
            </button>
            <button className="btn-primary" onClick={() => onNavigate('lab')}>
              <Droplets size={16} /> Novo Teste Químico
            </button>
          </div>
        </div>

        {/* Quick Specs Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginTop: 20,
          paddingTop: 20,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 14px', borderRadius: 10 }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Volume Total</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f1f5f9' }}>
              {pool.volume_gallons?.toLocaleString()} gal <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>({pool.volume_liters.toLocaleString('pt-BR')} L)</span>
            </div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 14px', borderRadius: 10 }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Revestimento</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f1f5f9' }}>{pool.surface_type}</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 14px', borderRadius: 10 }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Desinfecção</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#00f2fe' }}>{pool.sanitizer_type}</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 14px', borderRadius: 10 }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Filtro / Bomba</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f1f5f9' }}>{pool.filter_type} • {pool.pump_hp} HP</div>
          </div>
        </div>
      </div>

      {/* Main Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Score Card */}
        <div className="glass-panel" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            position: 'relative',
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: healthScore > 75 
              ? 'conic-gradient(#10b981 0deg 300deg, #152945 300deg 360deg)'
              : 'conic-gradient(#f59e0b 0deg 200deg, #152945 200deg 360deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: healthScore > 75 ? '0 0 25px rgba(16, 185, 129, 0.3)' : '0 0 25px rgba(245, 158, 11, 0.3)'
          }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: '#0a1526',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>{healthScore}</span>
              <span style={{ fontSize: '0.65rem', color: '#64748b' }}>/ 100 WQI</span>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <ShieldCheck size={18} color={healthScore > 75 ? '#10b981' : '#f59e0b'} />
              <h3 style={{ fontSize: '1.1rem', color: '#f1f5f9' }}>Índice de Qualidade da Água</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4 }}>
              {healthScore >= 80 
                ? 'Excelente equilíbrio físico-químico. Água cristalina e segura para banho.' 
                : 'Atenção aos parâmetros de pH ou Cloro que necessitam de ajuste imediato.'}
            </p>
            <div style={{ marginTop: 10 }}>
              <span className={`badge ${lsi.badge_color === 'emerald' ? 'badge-emerald' : lsi.badge_color === 'amber' ? 'badge-amber' : 'badge-red'}`}>
                LSI: {lsi.lsi > 0 ? `+${lsi.lsi}` : lsi.lsi} • {lsi.status}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Pressure Card */}
        <div className="glass-panel" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 70,
            height: 70,
            borderRadius: 16,
            background: needsBackwash ? 'rgba(244, 63, 94, 0.15)' : 'rgba(0, 242, 254, 0.15)',
            border: needsBackwash ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(0, 242, 254, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: needsBackwash ? '0 0 20px rgba(244, 63, 94, 0.25)' : 'none'
          }}>
            <Gauge size={32} color={needsBackwash ? '#fb7185' : '#00f2fe'} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#f1f5f9' }}>Manômetro do Filtro</h3>
              <span className={`badge ${needsBackwash ? 'badge-red' : 'badge-emerald'}`}>
                {needsBackwash ? 'RETROLAVAR' : 'NORMAL'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '6px 0' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: needsBackwash ? '#fb7185' : '#ffffff' }}>
                {pool.current_filter_psi || 14.0}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                PSI (Baseline: {pool.clean_filter_psi || 12.0} PSI)
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {needsBackwash 
                ? `Alerta: +${filterPsiDelta.toFixed(1)} PSI acima do normal. Areia saturada.`
                : 'Fluxo de filtração operando com pressão ideal.'}
            </p>
          </div>
        </div>
      </div>

      {/* Current Chemical Parameters Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: '1.25rem', color: '#f1f5f9' }}>Última Análise de Parâmetros</h2>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Medido em: {new Date(test.timestamp).toLocaleDateString('pt-BR')} às {new Date(test.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {/* pH */}
          <div className="glass-panel" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>pH da Água</span>
              <span className={`badge ${test.ph >= 7.2 && test.ph <= 7.6 ? 'badge-emerald' : 'badge-amber'}`}>
                {test.ph >= 7.2 && test.ph <= 7.6 ? 'Ideal' : test.ph > 7.6 ? 'Alto' : 'Baixo'}
              </span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>{test.ph.toFixed(1)}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>Faixa Ideal: 7.4 - 7.6</div>
          </div>

          {/* Cloro Livre */}
          <div className="glass-panel" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Cloro Livre (FC)</span>
              <span className={`badge ${test.free_chlorine >= 2.0 && test.free_chlorine <= 4.0 ? 'badge-emerald' : 'badge-amber'}`}>
                {test.free_chlorine >= 2.0 ? 'Protegido' : 'Baixo'}
              </span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#00f2fe' }}>{test.free_chlorine.toFixed(1)} <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>ppm</span></div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>Faixa Ideal: 2.0 - 4.0 ppm</div>
          </div>

          {/* Alcalinidade */}
          <div className="glass-panel" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Alcalinidade Total</span>
              <span className={`badge ${test.total_alkalinity >= 80 && test.total_alkalinity <= 120 ? 'badge-emerald' : 'badge-amber'}`}>
                {test.total_alkalinity >= 80 && test.total_alkalinity <= 120 ? 'Estável' : 'Ajustar'}
              </span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>{test.total_alkalinity} <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>ppm</span></div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>Faixa Ideal: 80 - 120 ppm</div>
          </div>

          {/* Dureza Cálcica */}
          <div className="glass-panel" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Dureza Cálcica</span>
              <span className="badge badge-cyan">Equilíbrio</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>{test.calcium_hardness} <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>ppm</span></div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>Faixa Ideal: 200 - 400 ppm</div>
          </div>

          {/* Temperatura da Água */}
          <div className="glass-panel" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Temperatura</span>
              <span className="badge badge-emerald">Ideal</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>
              {((test.temperature_c * 9)/5 + 32).toFixed(0)}°F
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
              Equivale a {test.temperature_c}°C (Faixa Ideal: 78°F - 84°F)
            </div>
          </div>
        </div>
      </div>

      {/* Skimmer-Style Digital Door Hanger */}
      {latestVisit && (
        <div className="glass-panel-glow" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FileText size={22} color="#00f2fe" />
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Comprovante Digital de Visita (Digital Door Hanger)</h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Atendido por {latestVisit.technician_name} • {new Date(latestVisit.visit_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <button className="btn-secondary" onClick={onQuickDoorHanger}>
              <Send size={15} color="#00f2fe" /> Compartilhar Relatório / Imprimir
            </button>
          </div>

          <div style={{ background: 'rgba(5, 11, 20, 0.6)', padding: 16, borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <p style={{ fontSize: '0.9rem', color: '#f1f5f9', fontStyle: 'italic', marginBottom: 12 }}>
              "{latestVisit.customer_summary}"
            </p>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>Tarefas Realizadas: </span>
                <span style={{ fontWeight: 600, color: '#10b981' }}>
                  {latestVisit.checklist_completed?.filter(t => t.completed).length || 6} itens concluídos
                </span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Produtos Aplicados: </span>
                <span style={{ fontWeight: 600, color: '#00f2fe' }}>
                  {latestVisit.chemicals_added?.map(c => `${c.amount} ${c.unit} de ${c.chemical_name}`).join(', ') || 'Produtos de rotina'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
