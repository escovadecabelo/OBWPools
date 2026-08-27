import React, { useState } from 'react';
import type { Pool } from '../types/pool';
import { X, Plus, Waves } from 'lucide-react';

interface NewPoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pool: Pool) => void;
}

export const NewPoolModal: React.FC<NewPoolModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [name, setName] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [gateCode, setGateCode] = useState<string>('');
  const [poolType, setPoolType] = useState<string>('Residencial');
  const [surfaceType, setSurfaceType] = useState<string>('PebbleTec / Pastilha');
  const [sanitizerType, setSanitizerType] = useState<string>('Gerador de Sal (SWG)');
  const [volumeGallons, setVolumeGallons] = useState<number>(18500);
  const [filterType] = useState<string>('Filtro de Cartucho');
  const [pumpHp, setPumpHp] = useState<number>(2.0);
  const [dailyRunHours] = useState<number>(8);
  const [cleanFilterPsi, setCleanFilterPsi] = useState<number>(12.0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !customerName) return;

    const liters = Math.round(volumeGallons * 3.78541);
    const newPool: Pool = {
      id: `pool-${Date.now()}`,
      name,
      customer_name: customerName,
      customer_phone: customerPhone,
      address,
      latitude: 32.7767,
      longitude: -96.7970,
      gate_code: gateCode,
      pool_type: poolType,
      surface_type: surfaceType,
      sanitizer_type: sanitizerType,
      volume_liters: liters,
      volume_gallons: volumeGallons,
      clean_filter_psi: cleanFilterPsi,
      current_filter_psi: cleanFilterPsi,
      filter_type: filterType,
      pump_hp: pumpHp,
      daily_run_hours: dailyRunHours,
      target_params: {
        target_ph: 7.4,
        target_fc: sanitizerType.includes('Sal') ? 3.5 : 3.0,
        target_ta: 90,
        target_ch: 280,
        target_cya: sanitizerType.includes('Sal') ? 70 : 40,
        target_salt: sanitizerType.includes('Sal') ? 3200 : 0
      },
      created_at: new Date().toISOString()
    };

    onSave(newPool);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 16
    }}>
      <div className="glass-panel" style={{
        maxWidth: 600,
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: 28,
        border: '1px solid rgba(0, 242, 254, 0.3)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(0, 242, 254, 0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Waves size={22} color="#00f2fe" />
            <h2 style={{ fontSize: '1.3rem', color: '#ffffff' }}>Cadastrar Nova Piscina / Cliente</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Nome da Piscina *</label>
              <input
                type="text"
                required
                className="input-control"
                placeholder="Ex: Stonebriar Oasis"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Nome do Proprietário / HOA *</label>
              <input
                type="text"
                required
                className="input-control"
                placeholder="Ex: David Harrison"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>WhatsApp / Telefone</label>
              <input
                type="text"
                className="input-control"
                placeholder="(214) 555-0142"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Código do Portão (Gate Code)</label>
              <input
                type="text"
                className="input-control"
                placeholder="Ex: Gate #4821"
                value={gateCode}
                onChange={(e) => setGateCode(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Endereço Completo (DFW Region)</label>
            <input
              type="text"
              required
              className="input-control"
              placeholder="5420 Stonebriar Dr, Frisco, TX 75034"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Tipo</label>
              <select className="input-control" value={poolType} onChange={(e) => setPoolType(e.target.value)}>
                <option value="Residencial">Residencial</option>
                <option value="Comercial / HOA">Comercial / HOA</option>
                <option value="Condomínio">Condomínio</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Revestimento</label>
              <select className="input-control" value={surfaceType} onChange={(e) => setSurfaceType(e.target.value)}>
                <option value="PebbleTec / Pastilha">PebbleTec / Pastilha</option>
                <option value="Diamond Brite / Quartz">Diamond Brite / Quartz</option>
                <option value="Alvenaria / Plaster">Alvenaria / Plaster</option>
                <option value="Fibra de Vidro">Fibra de Vidro</option>
                <option value="Vinil">Vinil</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Desinfecção</label>
              <select className="input-control" value={sanitizerType} onChange={(e) => setSanitizerType(e.target.value)}>
                <option value="Gerador de Sal (SWG)">Gerador de Sal (SWG)</option>
                <option value="Cloro Tradicional">Cloro Tradicional</option>
                <option value="Ozônio + Cloro">Ozônio + Cloro</option>
                <option value="Mineral / UV">Mineral / UV</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Volume (Galões - gal)</label>
              <input
                type="number"
                required
                className="input-control"
                value={volumeGallons}
                onChange={(e) => setVolumeGallons(parseInt(e.target.value) || 1000)}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Bomba (HP)</label>
              <input
                type="number"
                step="0.25"
                className="input-control"
                value={pumpHp}
                onChange={(e) => setPumpHp(parseFloat(e.target.value) || 1)}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Pressão Limpa (PSI)</label>
              <input
                type="number"
                step="0.5"
                className="input-control"
                value={cleanFilterPsi}
                onChange={(e) => setCleanFilterPsi(parseFloat(e.target.value) || 12)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              <Plus size={16} /> Salvar Piscina
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
