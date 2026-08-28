import React, { useState } from 'react';
import type { Pool } from '../types/pool';
import { calculatePoolVolumeClient } from '../lib/chemistry';
import { Box, Layers, Check } from 'lucide-react';

interface VolumeCalculatorProps {
  pool?: Pool;
  onApplyVolume: (liters: number, gallons: number) => void;
}

export const VolumeCalculator: React.FC<VolumeCalculatorProps> = ({
  onApplyVolume
}) => {
  const [shape, setShape] = useState<string>('retangular');
  const [lengthFt, setLengthFt] = useState<number>(28.0);
  const [widthFt, setWidthFt] = useState<number>(14.0);
  const [diameterFt, setDiameterFt] = useState<number>(18.0);
  const [shallowDepthFt, setShallowDepthFt] = useState<number>(3.5);
  const [deepDepthFt, setDeepDepthFt] = useState<number>(6.0);
  const [applied, setApplied] = useState<boolean>(false);

  const vol = calculatePoolVolumeClient(
    shape,
    lengthFt,
    widthFt,
    diameterFt,
    shallowDepthFt,
    deepDepthFt
  );

  const handleApply = () => {
    onApplyVolume(vol.liters, vol.gallons);
    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
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
            <Box size={22} color="#00f2fe" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', color: '#ffffff' }}>Calculadora de Volume (Padrão US Pool Industry)</h1>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Calcule a capacidade exata em <strong>Galões (US Gallons)</strong> e metros cúbicos para qualquer formato e perfil de profundidade.
            </p>
          </div>
        </div>

        <button className="btn-primary" onClick={handleApply}>
          {applied ? <Check size={16} /> : <Layers size={16} />}
          {applied ? 'Volume Aplicado!' : `Aplicar à Piscina (${vol.gallons.toLocaleString()} gal)`}
        </button>
      </div>

      {/* Shapes Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { id: 'retangular', name: 'Retangular / Quadrada', desc: 'Comprimento (ft) × Largura (ft) × Prof. Média × 7.48' },
          { id: 'redonda', name: 'Redonda / Circular', desc: 'π × Raio² (ft) × Prof. Média × 7.48' },
          { id: 'oval', name: 'Oval / Elíptica', desc: 'π × (C/2) × (L/2) × Prof. Média × 7.48' },
          { id: 'irregular', name: 'Livre / Feijão / Irregular', desc: 'Fator de área livre (0.85 × C × L)' },
        ].map((s) => (
          <div
            key={s.id}
            onClick={() => setShape(s.id)}
            className="glass-panel"
            style={{
              padding: 18,
              cursor: 'pointer',
              borderColor: shape === s.id ? '#00f2fe' : 'rgba(255, 255, 255, 0.08)',
              background: shape === s.id ? 'rgba(0, 242, 254, 0.08)' : 'var(--bg-card)',
              boxShadow: shape === s.id ? '0 0 20px rgba(0, 242, 254, 0.15)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: shape === s.id ? '#00f2fe' : '#ffffff', marginBottom: 4 }}>
              {s.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Grid: Inputs and 2D/3D SVG Diagram */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'clamp(14px, 3vw, 24px)' }}>
        
        {/* Dimensions Inputs */}
        <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2 style={{ fontSize: '1.2rem', color: '#f1f5f9', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 10 }}>
            Dimensões da Piscina (Pés / Feet)
          </h2>

          {shape !== 'redonda' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9', display: 'block', marginBottom: 6 }}>
                  Comprimento: <strong>{lengthFt} ft</strong> <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({(lengthFt * 0.3048).toFixed(1)}m)</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="75"
                  step="1"
                  value={lengthFt}
                  onChange={(e) => setLengthFt(parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9', display: 'block', marginBottom: 6 }}>
                  Largura: <strong>{widthFt} ft</strong> <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({(widthFt * 0.3048).toFixed(1)}m)</span>
                </label>
                <input
                  type="range"
                  min="8"
                  max="45"
                  step="1"
                  value={widthFt}
                  onChange={(e) => setWidthFt(parseFloat(e.target.value))}
                />
              </div>
            </div>
          ) : (
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9', display: 'block', marginBottom: 6 }}>
                Diâmetro: <strong>{diameterFt} ft</strong> <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({(diameterFt * 0.3048).toFixed(1)}m)</span>
              </label>
              <input
                type="range"
                min="8"
                max="45"
                step="1"
                value={diameterFt}
                onChange={(e) => setDiameterFt(parseFloat(e.target.value))}
              />
            </div>
          )}

          {/* Depth Controls */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 16, borderRadius: 12 }}>
            <h3 style={{ fontSize: '0.95rem', color: '#f1f5f9', marginBottom: 12 }}>Perfil de Profundidade</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                  Parte Rasa (Shallow): <strong style={{ color: '#00f2fe' }}>{shallowDepthFt} ft</strong>
                </label>
                <input
                  type="range"
                  min="2.0"
                  max="6.0"
                  step="0.5"
                  value={shallowDepthFt}
                  onChange={(e) => setShallowDepthFt(parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                  Parte Funda (Deep End): <strong style={{ color: '#00f2fe' }}>{deepDepthFt} ft</strong>
                </label>
                <input
                  type="range"
                  min="3.5"
                  max="12.0"
                  step="0.5"
                  value={deepDepthFt}
                  onChange={(e) => setDeepDepthFt(parseFloat(e.target.value))}
                />
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 10 }}>
              Profundidade Média: <strong>{vol.avg_depth_ft} ft</strong> ({vol.avg_depth_m} m)
            </div>
          </div>
        </div>

        {/* Visual SVG Diagram & Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: 16 }}>
              Visualização Geométrica & Perfil
            </h3>

            <div style={{ width: '100%', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5, 11, 20, 0.7)', borderRadius: 12, padding: 16 }}>
              <svg width="100%" height="100%" viewBox="0 0 400 140" fill="none">
                <line x1="40" y1="30" x2="360" y2="30" stroke="#00f2fe" strokeWidth="3" strokeDasharray="6 4" />
                <text x="200" y="22" fill="#00f2fe" fontSize="11" textAnchor="middle" fontWeight="bold">Water Line</text>
                <path d={`M 50 30 L 70 60 L 220 90 L 330 110 L 350 30`} fill="rgba(0, 242, 254, 0.12)" stroke="#4facfe" strokeWidth="2.5" />
                <text x="70" y="80" fill="#94a3b8" fontSize="10">Rasa: {shallowDepthFt} ft</text>
                <text x="280" y="125" fill="#94a3b8" fontSize="10">Funda: {deepDepthFt} ft</text>
                <text x="200" y="65" fill="#ffffff" fontSize="12" textAnchor="middle" fontWeight="bold">
                  {shape === 'redonda' ? `Diâmetro: ${diameterFt} ft` : `${lengthFt} ft × ${widthFt} ft`}
                </text>
              </svg>
            </div>

            <div style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              marginTop: 20
            }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 14, borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Galões (US)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#00f2fe' }}>
                  {vol.gallons.toLocaleString()} gal
                </div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 14, borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Volume em Litros</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                  {vol.liters.toLocaleString('pt-BR')} L
                </div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 14, borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Pés Cúbicos</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#94a3b8' }}>
                  {vol.volume_cu_ft} cu ft
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
