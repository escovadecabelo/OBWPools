import React, { useState } from 'react';
import type { Pool, WaterTest, LSISolution } from '../types/pool';
import { calculateLSIClient } from '../lib/chemistry';
import { FlaskConical, Save, Sparkles, Info, ArrowRight, RefreshCw } from 'lucide-react';
import { createPoolTest } from '../lib/api';

interface WaterLabProps {
  pool: Pool;
  onTestSaved: (newTest: WaterTest) => void;
  onGoToDosage: (params: { ph: number; fc: number; ta: number; ch: number; cya: number; salt: number }) => void;
}

export const WaterLab: React.FC<WaterLabProps> = ({
  pool,
  onTestSaved,
  onGoToDosage
}) => {
  const [ph, setPh] = useState<number>(7.4);
  const [fc, setFc] = useState<number>(3.0);
  const [cc, setCc] = useState<number>(0.1);
  const [ta, setTa] = useState<number>(100);
  const [ch, setCh] = useState<number>(250);
  const [cya, setCya] = useState<number>(35);
  const [salt] = useState<number>(pool.sanitizer_type.includes('Sal') ? 3200 : 0);
  const [tempF, setTempF] = useState<number>(80);
  const [turbidity, setTurbidity] = useState<string>('Cristalina');
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const lsi: LSISolution = calculateLSIClient(ph, tempF, ch, ta, cya, salt || 1000);
  const gaugePercent = Math.max(0, Math.min(100, ((lsi.lsi + 1.0) / 2.0) * 100));

  const handleSaveTest = async () => {
    setIsSaving(true);
    const tempC = Math.round(((tempF - 32) * 5) / 9);
    const newTest: WaterTest = {
      pool_id: pool.id,
      timestamp: new Date().toISOString(),
      ph,
      free_chlorine: fc,
      combined_chlorine: cc,
      total_alkalinity: ta,
      calcium_hardness: ch,
      cyanuric_acid: cya,
      salt_ppm: salt,
      temperature_c: tempC,
      turbidity,
      lsi_score: lsi.lsi,
      lsi_status: lsi.status,
      technician_notes: notes
    };

    try {
      await createPoolTest(pool.id, newTest);
      onTestSaved(newTest);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Info */}
      <div className="glass-panel" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(0, 242, 254, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FlaskConical size={20} color="#00f2fe" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', color: '#ffffff' }}>Laboratório Químico & Índice LSI</h1>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Insira as medições da piscina <strong>{pool.name}</strong> para análise de saturação e cálculo de equilíbrio.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="btn-secondary"
            onClick={() => onGoToDosage({ ph, fc, ta, ch, cya, salt })}
          >
            <Sparkles size={16} color="#00f2fe" /> Calcular Dosagem <ArrowRight size={14} />
          </button>
          <button
            className="btn-primary"
            onClick={handleSaveTest}
            disabled={isSaving}
          >
            {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            {saveSuccess ? 'Salvo com Sucesso!' : 'Registrar Análise'}
          </button>
        </div>
      </div>

      {/* Main Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        
        {/* LEFT: Parameter Sliders */}
        <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2 style={{ fontSize: '1.2rem', color: '#f1f5f9', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 10 }}>
            Entrada de Parâmetros Medidos
          </h2>

          {/* pH */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f1f5f9' }}>pH da Água</label>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: ph >= 7.4 && ph <= 7.6 ? '#10b981' : ph < 7.2 ? '#f43f5e' : '#f59e0b' }}>
                {ph.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="6.5"
              max="8.5"
              step="0.1"
              value={ph}
              onChange={(e) => setPh(parseFloat(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
              <span>6.5 (Muito Ácido)</span>
              <span style={{ color: '#10b981' }}>Ideal: 7.4 - 7.6</span>
              <span>8.5 (Muito Alcalino)</span>
            </div>
          </div>

          {/* Cloro Livre */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f1f5f9' }}>Cloro Livre Disponível (FC)</label>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: fc >= 2.0 && fc <= 4.0 ? '#10b981' : '#00f2fe' }}>
                {fc.toFixed(1)} ppm
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="10.0"
              step="0.2"
              value={fc}
              onChange={(e) => setFc(parseFloat(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
              <span>0.0 ppm</span>
              <span style={{ color: '#10b981' }}>Ideal: 2.0 - 4.0 ppm</span>
              <span>10.0 ppm (Supercloração)</span>
            </div>
          </div>

          {/* Cloro Combinado */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f1f5f9' }}>Cloro Combinado / Cloraminas (CC)</label>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: cc > 0.4 ? '#f43f5e' : '#10b981' }}>
                {cc.toFixed(1)} ppm
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="2.0"
              step="0.1"
              value={cc}
              onChange={(e) => setCc(parseFloat(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
              <span>0.0 (Perfeito)</span>
              <span style={{ color: cc >= 0.5 ? '#f43f5e' : '#64748b' }}>
                {cc >= 0.5 ? '⚠️ Exige Choque / Breakpoint' : 'Máx recomendado: 0.2 ppm'}
              </span>
              <span>2.0 ppm</span>
            </div>
          </div>

          {/* Alcalinidade Total */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f1f5f9' }}>Alcalinidade Total (TA)</label>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9' }}>{ta} ppm</span>
            </div>
            <input
              type="range"
              min="30"
              max="250"
              step="5"
              value={ta}
              onChange={(e) => setTa(parseInt(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
              <span>30 ppm (Instável)</span>
              <span style={{ color: '#10b981' }}>Ideal: 80 - 120 ppm</span>
              <span>250 ppm (Muito Alta)</span>
            </div>
          </div>

          {/* Dureza Cálcica */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f1f5f9' }}>Dureza Cálcica (CH)</label>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9' }}>{ch} ppm</span>
            </div>
            <input
              type="range"
              min="50"
              max="800"
              step="10"
              value={ch}
              onChange={(e) => setCh(parseInt(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
              <span>50 ppm (Corrosivo)</span>
              <span style={{ color: '#10b981' }}>Ideal: 200 - 400 ppm</span>
              <span>800 ppm (Incrustante)</span>
            </div>
          </div>

          {/* Ácido Cianúrico & Temperatura */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9', display: 'block', marginBottom: 6 }}>
                Ácido Cianúrico (CYA): <strong>{cya} ppm</strong>
              </label>
              <input
                type="range"
                min="0"
                max="120"
                step="5"
                value={cya}
                onChange={(e) => setCya(parseInt(e.target.value))}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9', display: 'block', marginBottom: 6 }}>
                Temperatura: <strong>{tempF}°F</strong> <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>({Math.round(((tempF - 32) * 5) / 9)}°C)</span>
              </label>
              <input
                type="range"
                min="50"
                max="100"
                step="1"
                value={tempF}
                onChange={(e) => setTempF(parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* Aspecto Visual */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9', display: 'block', marginBottom: 8 }}>
              Aspecto Visual da Água
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {['Cristalina', 'Levemente Turva', 'Opaca / Leitosa', 'Verde / Algas'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTurbidity(t)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 8,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: turbidity === t ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: turbidity === t ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    color: turbidity === t ? '#00f2fe' : '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Observações do Técnico */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9', display: 'block', marginBottom: 6 }}>
              Observações Técnicas da Amostra
            </label>
            <textarea
              className="input-control"
              rows={2}
              placeholder="Ex: Amostra coletada a 40cm de profundidade..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* RIGHT: Real-time LSI Saturation Gauge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: 6 }}>
              Índice de Saturação de Langelier (LSI)
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', marginBottom: 20 }}>
              Equilíbrio físico-químico entre pH, alcalinidade, cálcio, temperatura e cianúrico.
            </p>

            {/* Custom Visual Needle Gauge */}
            <div style={{ width: '100%', maxWidth: 360, position: 'relative', marginBottom: 20 }}>
              <div style={{
                height: 18,
                borderRadius: 9,
                background: 'linear-gradient(to right, #f43f5e 0%, #f43f5e 30%, #10b981 35%, #10b981 65%, #f59e0b 70%, #f59e0b 100%)',
                position: 'relative',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
              }}>
                <div style={{
                  position: 'absolute',
                  left: `${gaugePercent}%`,
                  top: -8,
                  transform: 'translateX(-50%)',
                  width: 14,
                  height: 34,
                  background: '#ffffff',
                  borderRadius: 4,
                  boxShadow: '0 0 12px rgba(255, 255, 255, 0.9), 0 2px 6px rgba(0,0,0,0.5)',
                  transition: 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: 10 }}>
                <span style={{ color: '#f43f5e', fontWeight: 600 }}>-0.80 Corrosiva</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>0.00 Equilíbrio</span>
                <span style={{ color: '#f59e0b', fontWeight: 600 }}>+0.80 Incrustante</span>
              </div>
            </div>

            {/* Big LSI Score Display */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '16px 28px',
              background: 'rgba(5, 11, 20, 0.7)',
              borderRadius: 16,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: 16
            }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                LSI Calculado
              </div>
              <div style={{ fontSize: '2.8rem', fontWeight: 800, color: lsi.lsi > 0.3 ? '#f59e0b' : lsi.lsi < -0.3 ? '#f43f5e' : '#10b981' }}>
                {lsi.lsi > 0 ? `+${lsi.lsi.toFixed(2)}` : lsi.lsi.toFixed(2)}
              </div>
              <span className={`badge ${lsi.badge_color === 'emerald' ? 'badge-emerald' : lsi.badge_color === 'amber' ? 'badge-amber' : 'badge-red'}`}>
                {lsi.status}
              </span>
            </div>

            {/* Description & Impact */}
            <div style={{ width: '100%', background: 'rgba(255, 255, 255, 0.02)', padding: 16, borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Info size={16} color="#00f2fe" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>Diagnóstico de Equilíbrio:</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.4, marginBottom: 10 }}>
                {lsi.description}
              </p>
              <div style={{ fontSize: '0.8rem', color: '#00f2fe', fontWeight: 600 }}>
                👉 Ação recomendada: {lsi.recommendation}
              </div>
            </div>
          </div>

          {/* Mathematical Sub-factors Breakdown */}
          <div className="glass-panel" style={{ padding: 20 }}>
            <h4 style={{ fontSize: '0.95rem', color: '#f1f5f9', marginBottom: 12 }}>
              Fatores da Equação de Langelier
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.8rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 8 }}>
                <span style={{ color: '#64748b' }}>Fator Temperatura (TF): </span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>+{lsi.factors.temperature_factor}</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 8 }}>
                <span style={{ color: '#64748b' }}>Fator Dureza (CF): </span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>+{lsi.factors.calcium_factor}</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 8 }}>
                <span style={{ color: '#64748b' }}>Fator Alcalinidade (AF): </span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>+{lsi.factors.alkalinity_factor}</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 8 }}>
                <span style={{ color: '#64748b' }}>Constante TDS: </span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>-{lsi.factors.tds_constant}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
