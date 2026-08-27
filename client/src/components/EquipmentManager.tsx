import React, { useState } from 'react';
import type { Pool } from '../types/pool';
import { Gauge, Zap, Waves, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

interface EquipmentManagerProps {
  pool: Pool;
  onUpdatePsi: (newPsi: number) => void;
}

export const EquipmentManager: React.FC<EquipmentManagerProps> = ({
  pool,
  onUpdatePsi
}) => {
  const [currentPsi, setCurrentPsi] = useState<number>(pool.current_filter_psi || 14.0);
  const cleanPsi = pool.clean_filter_psi || 12.0;
  const deltaPsi = currentPsi - cleanPsi;
  const needsBackwash = deltaPsi >= 6.0;

  const flowRateGpm = Math.round((pool.pump_hp || 1.0) * 52);
  const poolGallons = pool.volume_gallons || Math.round(pool.volume_liters * 0.264172);
  const requiredTurnoverHours = Math.round((poolGallons / (flowRateGpm * 60)) * 10) / 10;
  
  const powerKw = (pool.pump_hp || 1.0) * 0.746;
  const dailyKwh = Math.round(powerKw * (pool.daily_run_hours || 6) * 10) / 10;

  const handleSavePsi = () => {
    onUpdatePsi(currentPsi);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(0, 242, 254, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Gauge size={22} color="#00f2fe" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', color: '#ffffff' }}>Casa de Máquinas & Equipamentos (US Standards)</h1>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Manômetro em <strong>PSI</strong>, vazão em <strong>GPM (Gallons Per Minute)</strong> e ciclos de turnover em horas.
            </p>
          </div>
        </div>

        <button className="btn-primary" onClick={handleSavePsi}>
          <RefreshCw size={16} /> Atualizar Pressão Atual
        </button>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 24 }}>
        
        {/* LEFT: Filter PSI Gauge & Backwash Monitor */}
        <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.2rem', color: '#f1f5f9' }}>Manômetro do Filtro ({pool.filter_type})</h2>
            <span className={`badge ${needsBackwash ? 'badge-red' : 'badge-emerald'}`}>
              {needsBackwash ? '⚠️ NECESSITA RETROLAVAGEM' : 'PRESSÃO IDEAL'}
            </span>
          </div>

          {/* PSI Meter Slider */}
          <div style={{ background: 'rgba(5, 11, 20, 0.7)', padding: 20, borderRadius: 14, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: '2.4rem', fontWeight: 800, color: needsBackwash ? '#fb7185' : '#ffffff' }}>
                  {currentPsi.toFixed(1)}
                </span>
                <span style={{ fontSize: '0.9rem', color: '#94a3b8', marginLeft: 6 }}>PSI Atual</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Baseline Limpo: </span>
                <strong style={{ color: '#00f2fe' }}>{cleanPsi} PSI</strong>
              </div>
            </div>

            <input
              type="range"
              min="5"
              max="35"
              step="0.5"
              value={currentPsi}
              onChange={(e) => setCurrentPsi(parseFloat(e.target.value))}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: 8 }}>
              <span>5 PSI</span>
              <span style={{ color: '#10b981' }}>{cleanPsi} PSI (Clean Baseline)</span>
              <span style={{ color: '#f43f5e' }}>{cleanPsi + 8} PSI (Backwash Limit)</span>
              <span>35 PSI</span>
            </div>
          </div>

          {/* Delta Status Alert */}
          <div style={{
            background: needsBackwash ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            border: needsBackwash ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
            padding: 16,
            borderRadius: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: needsBackwash ? '#fb7185' : '#34d399', fontWeight: 700, marginBottom: 4 }}>
              {needsBackwash ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
              <span>Variação Delta: +{deltaPsi > 0 ? deltaPsi.toFixed(1) : 0} PSI acima do baseline</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.4 }}>
              {needsBackwash 
                ? 'O elemento filtrante acumulou excesso de detritos, elevando a pressão e restringindo a vazão GPM. Realize a retrolavagem (Backwash) ou limpeza do cartucho com mangueira de alta pressão.'
                : 'O filtro está operando com fluxo livre de vazão e máxima eficiência de circulação.'}
            </p>
          </div>

          {/* Equipment Specs Card */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 16, borderRadius: 12 }}>
            <h4 style={{ fontSize: '0.9rem', color: '#f1f5f9', marginBottom: 10 }}>Dados do Filtro</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.8rem' }}>
              <div><span style={{ color: '#64748b' }}>Tipo:</span> <span style={{ color: '#ffffff', fontWeight: 600 }}>{pool.filter_type}</span></div>
              <div><span style={{ color: '#64748b' }}>Baseline Normal:</span> <span style={{ color: '#ffffff', fontWeight: 600 }}>{pool.clean_filter_psi} PSI</span></div>
              <div><span style={{ color: '#64748b' }}>Manutenção:</span> <span style={{ color: '#10b981', fontWeight: 600 }}>Inspecionar a cada visita</span></div>
              <div><span style={{ color: '#64748b' }}>Multiport Valve:</span> <span style={{ color: '#ffffff', fontWeight: 600 }}>Filter / Backwash / Rinse</span></div>
            </div>
          </div>
        </div>

        {/* RIGHT: Pump, Turnover & Energy Diagnostics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div className="glass-panel" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Zap size={20} color="#00f2fe" />
                <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>Dimensionamento da Bomba & Recirculação</h3>
              </div>
              <span className="badge badge-cyan">{pool.pump_hp} HP</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              <div style={{ background: 'rgba(5, 11, 20, 0.6)', padding: 14, borderRadius: 10 }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Vazão Hidráulica (GPM)</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#00f2fe' }}>
                  {flowRateGpm} GPM
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>~{(flowRateGpm * 60).toLocaleString()} gal/hora</div>
              </div>

              <div style={{ background: 'rgba(5, 11, 20, 0.6)', padding: 14, borderRadius: 10 }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Tempo Padrão de 1 Turnover</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                  {requiredTurnoverHours} Horas
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Para filtrar 100% dos {poolGallons.toLocaleString()} gal</div>
              </div>

              <div style={{ background: 'rgba(5, 11, 20, 0.6)', padding: 14, borderRadius: 10 }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Filtração Programada</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981' }}>
                  {pool.daily_run_hours} Horas/dia
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {((pool.daily_run_hours / requiredTurnoverHours)).toFixed(1)} turnovers completos/dia
                </div>
              </div>

              <div style={{ background: 'rgba(5, 11, 20, 0.6)', padding: 14, borderRadius: 10 }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Consumo Elétrico Estimado</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b' }}>
                  {dailyKwh} kWh/dia
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>~{(dailyKwh * 30).toFixed(0)} kWh/mês</div>
              </div>
            </div>
          </div>

          {/* SWG Salt Cell / Sanitizer Card */}
          <div className="glass-panel" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Waves size={20} color="#00f2fe" />
                <h3 style={{ fontSize: '1.15rem', color: '#ffffff' }}>Sistema de Desinfecção ({pool.sanitizer_type})</h3>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              {pool.sanitizer_type.includes('Sal')
                ? 'Célula de eletrólise SWG operando. Recomenda-se inspecionar as placas a cada 90 dias quanto a incrustações de cálcio. Se houver placa branca, mergulhe em solução de 4 partes de água para 1 parte de ácido muriático por 10 minutos.'
                : 'Piscina com dosagem tradicional de cloro. Recomenda-se manter o dosador inline abastecido com pastilhas de tricloro para cloração contínua.'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
