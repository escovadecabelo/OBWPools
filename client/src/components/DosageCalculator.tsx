import React, { useState } from 'react';
import type { Pool, DosageResult } from '../types/pool';
import { calculateDosagesClient } from '../lib/chemistry';
import { Calculator, CheckCircle, ShieldAlert, Copy, Check } from 'lucide-react';

interface DosageCalculatorProps {
  pool: Pool;
  initialParams?: {
    ph: number;
    fc: number;
    ta: number;
    ch: number;
    cya: number;
    salt: number;
  };
}

export const DosageCalculator: React.FC<DosageCalculatorProps> = ({
  pool,
  initialParams
}) => {
  const [volumeGallons, setVolumeGallons] = useState<number>(pool.volume_gallons || Math.round(pool.volume_liters * 0.264172));
  const [currentPh, setCurrentPh] = useState<number>(initialParams?.ph ?? 7.8);
  const [targetPh, setTargetPh] = useState<number>(pool.target_params?.target_ph ?? 7.4);
  
  const [currentFc, setCurrentFc] = useState<number>(initialParams?.fc ?? 1.0);
  const [targetFc, setTargetFc] = useState<number>(pool.target_params?.target_fc ?? 3.5);

  const [currentTa, setCurrentTa] = useState<number>(initialParams?.ta ?? 80);
  const [targetTa, setTargetTa] = useState<number>(pool.target_params?.target_ta ?? 90);

  const [currentCh, setCurrentCh] = useState<number>(initialParams?.ch ?? 200);
  const [targetCh] = useState<number>(pool.target_params?.target_ch ?? 280);

  const [currentCya, setCurrentCya] = useState<number>(initialParams?.cya ?? 25);
  const [targetCya] = useState<number>(pool.target_params?.target_cya ?? 50);

  const [currentSalt] = useState<number>(initialParams?.salt ?? (pool.sanitizer_type.includes('Sal') ? 2800 : 0));
  const [targetSalt] = useState<number>(pool.target_params?.target_salt ?? (pool.sanitizer_type.includes('Sal') ? 3200 : 0));

  const [copied, setCopied] = useState<boolean>(false);

  const dosage: DosageResult = calculateDosagesClient(
    volumeGallons,
    currentPh,
    targetPh,
    currentFc,
    targetFc,
    currentTa,
    targetTa,
    currentCh,
    targetCh,
    currentCya,
    targetCya,
    currentSalt,
    targetSalt,
    true // isGallons
  );

  const handleCopyRecipe = () => {
    const text = `🏊 *WandPool - Chemical Dosing Sheet (US Standards)*\n` +
      `Pool: ${pool.name} (${volumeGallons.toLocaleString()} Gallons)\n\n` +
      dosage.recommendations.map((r, i) => `${i + 1}. *${r.chemical}*: ${r.amount_formatted}\n   👉 ${r.instructions}`).join('\n\n') +
      `\n\n⚠️ *Safety Notice:* Always add chemicals to water, NEVER water to acid. Keep pool pump running during application.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
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
            <Calculator size={22} color="#00f2fe" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', color: '#ffffff' }}>Calculadora de Dosagem Química (US Pool Industry)</h1>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Baseada em <strong>{volumeGallons.toLocaleString()} Galões</strong> com unidades em <strong>fl oz, lbs, oz e galões</strong>.
            </p>
          </div>
        </div>

        <button className="btn-secondary" onClick={handleCopyRecipe}>
          {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
          {copied ? 'Receita Copiada!' : 'Copiar Receita (WhatsApp / SMS)'}
        </button>
      </div>

      {/* Grid: Inputs (Left) and Chemical Dosage Recipes (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'clamp(14px, 3vw, 24px)' }}>
        
        {/* LEFT: Current vs Target Controls */}
        <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 10 }}>
            <h2 style={{ fontSize: '1.15rem', color: '#f1f5f9' }}>Parâmetros & Metas</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Volume (Gal):</span>
              <input
                type="number"
                className="input-control"
                style={{ width: 110, padding: '4px 8px', fontSize: '0.85rem' }}
                value={volumeGallons}
                onChange={(e) => setVolumeGallons(parseInt(e.target.value) || 1000)}
              />
            </div>
          </div>

          {/* pH Row */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 14, borderRadius: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f1f5f9' }}>Ajuste de pH</span>
              <span style={{ fontSize: '0.85rem', color: '#00f2fe' }}>Atual: {currentPh.toFixed(1)} ➔ Alvo: {targetPh.toFixed(1)}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b' }}>pH Atual</label>
                <input
                  type="range"
                  min="6.5"
                  max="8.5"
                  step="0.1"
                  value={currentPh}
                  onChange={(e) => setCurrentPh(parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b' }}>pH Desejado (Alvo)</label>
                <input
                  type="range"
                  min="7.2"
                  max="7.8"
                  step="0.1"
                  value={targetPh}
                  onChange={(e) => setTargetPh(parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Cloro Livre Row */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 14, borderRadius: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f1f5f9' }}>Cloração (Free Chlorine)</span>
              <span style={{ fontSize: '0.85rem', color: '#00f2fe' }}>Atual: {currentFc.toFixed(1)} ppm ➔ Alvo: {targetFc.toFixed(1)} ppm</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Cloro Atual (ppm)</label>
                <input
                  type="range"
                  min="0.0"
                  max="6.0"
                  step="0.2"
                  value={currentFc}
                  onChange={(e) => setCurrentFc(parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Cloro Alvo (ppm)</label>
                <input
                  type="range"
                  min="1.0"
                  max="6.0"
                  step="0.5"
                  value={targetFc}
                  onChange={(e) => setTargetFc(parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Alcalinidade Row */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 14, borderRadius: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f1f5f9' }}>Total Alkalinity (TA)</span>
              <span style={{ fontSize: '0.85rem', color: '#00f2fe' }}>Atual: {currentTa} ppm ➔ Alvo: {targetTa} ppm</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Alcalinidade Atual</label>
                <input
                  type="range"
                  min="40"
                  max="180"
                  step="10"
                  value={currentTa}
                  onChange={(e) => setCurrentTa(parseInt(e.target.value))}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b' }}>Alcalinidade Alvo</label>
                <input
                  type="range"
                  min="80"
                  max="120"
                  step="10"
                  value={targetTa}
                  onChange={(e) => setTargetTa(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Dureza & Estabilizador */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 12, borderRadius: 10 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f1f5f9', display: 'block', marginBottom: 4 }}>
                Calcium Hardness ({currentCh} ➔ {targetCh} ppm)
              </label>
              <input
                type="range"
                min="100"
                max="500"
                step="25"
                value={currentCh}
                onChange={(e) => setCurrentCh(parseInt(e.target.value))}
              />
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 12, borderRadius: 10 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f1f5f9', display: 'block', marginBottom: 4 }}>
                Cyanuric Acid ({currentCya} ➔ {targetCya} ppm)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={currentCya}
                onChange={(e) => setCurrentCya(parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* RIGHT: Dosage Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div className="glass-panel" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: '1.2rem', color: '#ffffff' }}>
                Dosagem Recomendada ({dosage.recommendations.length} Ações)
              </h2>
              <span className="badge badge-cyan">{volumeGallons.toLocaleString()} Galões (US)</span>
            </div>

            {dosage.recommendations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: '#10b981' }}>
                <CheckCircle size={40} style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '1.1rem', color: '#f1f5f9' }}>Água 100% Balanceada!</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>
                  Nenhum produto químico corretivo é necessário no momento. Mantenha a filtração diária e cloração de rotina.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {dosage.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'rgba(10, 21, 38, 0.8)',
                      border: '1px solid rgba(0, 242, 254, 0.2)',
                      borderRadius: 12,
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: 'rgba(0, 242, 254, 0.2)',
                          color: '#00f2fe',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {index + 1}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{rec.parameter}</span>
                      </div>
                      <span className={`badge ${rec.priority === 'Crítica' ? 'badge-red' : rec.priority === 'Alta' ? 'badge-amber' : 'badge-emerald'}`}>
                        {rec.priority}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>
                        {rec.chemical}
                      </span>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#00f2fe' }}>
                        {rec.amount_formatted}
                      </span>
                    </div>

                    {rec.alternative && (
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        {rec.alternative}
                      </div>
                    )}

                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 8 }}>
                      👉 {rec.instructions}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Safety Rules Card */}
          <div className="glass-panel" style={{ padding: 20, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f59e0b', marginBottom: 8 }}>
              <ShieldAlert size={18} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Normas Críticas de Segurança Química (US EPA / NSPF)</h4>
            </div>
            <ul style={{ fontSize: '0.8rem', color: '#94a3b8', paddingLeft: 18, lineHeight: 1.6 }}>
              <li><strong>ALWAYS add acid to water:</strong> Nunca despeje água diretamente no galão de ácido muriático.</li>
              <li><strong>Não misture produtos químicos concentrados:</strong> Risco severo de reação exotérmica violenta ou emissão de gás tóxico.</li>
              <li>Aguarde no mínimo <strong>4 a 6 horas</strong> de intervalo entre o ácido muriático e o choque de cloro líquido.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};
