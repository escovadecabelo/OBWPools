import React, { useState, useEffect } from 'react';
import type { Pool } from '../types/pool';
import { X, Save, Edit3, MapPin, Key, Droplet, Gauge, Calendar, ShieldCheck, User } from 'lucide-react';

interface EditPoolModalProps {
  pool: Pool | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPool: Pool) => void;
}

export const EditPoolModal: React.FC<EditPoolModalProps> = ({
  pool,
  isOpen,
  onClose,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'equipment' | 'targets'>('info');

  const [name, setName] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [gateCode, setGateCode] = useState<string>('');
  const [poolType, setPoolType] = useState<string>('Residencial');
  const [surfaceType, setSurfaceType] = useState<string>('PebbleTec / Pastilha');
  const [sanitizerType, setSanitizerType] = useState<string>('Gerador de Sal (SWG)');
  
  const [volumeGallons, setVolumeGallons] = useState<number>(18500);
  const [filterType, setFilterType] = useState<string>('Filtro de Cartucho');
  const [pumpHp, setPumpHp] = useState<number>(2.0);
  const [cleanFilterPsi, setCleanFilterPsi] = useState<number>(12.0);
  const [dailyRunHours, setDailyRunHours] = useState<number>(8);
  const [serviceDay, setServiceDay] = useState<string>('Segunda-feira');
  const [serviceFrequency, setServiceFrequency] = useState<string>('Semanal');

  // Metas Químicas
  const [targetPh, setTargetPh] = useState<number>(7.4);
  const [targetFc, setTargetFc] = useState<number>(3.5);
  const [targetTa, setTargetTa] = useState<number>(90);
  const [targetCh, setTargetCh] = useState<number>(280);
  const [targetCya, setTargetCya] = useState<number>(70);
  const [targetSalt, setTargetSalt] = useState<number>(3200);

  useEffect(() => {
    if (pool) {
      setName(pool.name || '');
      setCustomerName(pool.customer_name || '');
      setCustomerPhone(pool.customer_phone || '');
      setCustomerEmail(pool.customer_email || '');
      setAddress(pool.address || '');
      setGateCode(pool.gate_code || '');
      setPoolType(pool.pool_type || 'Residencial');
      setSurfaceType(pool.surface_type || 'PebbleTec / Pastilha');
      setSanitizerType(pool.sanitizer_type || 'Gerador de Sal (SWG)');
      setVolumeGallons(pool.volume_gallons || Math.round((pool.volume_liters || 70000) * 0.264172));
      setFilterType(pool.filter_type || 'Filtro de Cartucho');
      setPumpHp(pool.pump_hp || 2.0);
      setCleanFilterPsi(pool.clean_filter_psi || 12.0);
      setDailyRunHours(pool.daily_run_hours || 8);
      setServiceDay(pool.service_day || 'Segunda-feira');
      setServiceFrequency(pool.service_frequency || 'Semanal');

      if (pool.target_params) {
        setTargetPh(pool.target_params.target_ph || 7.4);
        setTargetFc(pool.target_params.target_fc || 3.5);
        setTargetTa(pool.target_params.target_ta || 90);
        setTargetCh(pool.target_params.target_ch || 280);
        setTargetCya(pool.target_params.target_cya || 70);
        setTargetSalt(pool.target_params.target_salt || 3200);
      }
    }
  }, [pool]);

  if (!isOpen || !pool) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const liters = Math.round(volumeGallons * 3.78541);
    const updated: Pool = {
      ...pool,
      name,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      address,
      gate_code: gateCode,
      pool_type: poolType,
      surface_type: surfaceType,
      sanitizer_type: sanitizerType,
      volume_liters: liters,
      volume_gallons: volumeGallons,
      filter_type: filterType,
      pump_hp: pumpHp,
      clean_filter_psi: cleanFilterPsi,
      daily_run_hours: dailyRunHours,
      service_day: serviceDay,
      service_frequency: serviceFrequency,
      target_params: {
        target_ph: targetPh,
        target_fc: targetFc,
        target_ta: targetTa,
        target_ch: targetCh,
        target_cya: targetCya,
        target_salt: targetSalt
      }
    };

    onSave(updated);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(3, 7, 18, 0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 12
    }}>
      <div className="glass-panel" style={{
        maxWidth: 680,
        width: '100%',
        maxHeight: '94vh',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
        border: '1px solid rgba(0, 242, 254, 0.3)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(0, 242, 254, 0.25)',
        borderRadius: 16
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(5, 11, 20, 0.8)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(0, 242, 254, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Edit3 size={18} color="#00f2fe" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', color: '#ffffff', margin: 0 }}>Editar Cliente / Piscina</h2>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>{pool.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 6 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Section Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(10, 21, 38, 0.5)',
          padding: '0 16px'
        }}>
          {[
            { id: 'info', label: 'Dados & Acesso', icon: User },
            { id: 'equipment', label: 'Volume & Equipamentos', icon: Gauge },
            { id: 'targets', label: 'Metas Químicas', icon: Droplet },
          ].map(t => {
            const Icon = t.icon;
            const isSelected = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '12px 16px',
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? '#00f2fe' : '#94a3b8',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isSelected ? '2px solid #00f2fe' : '2px solid transparent',
                  cursor: 'pointer'
                }}
              >
                <Icon size={15} color={isSelected ? '#00f2fe' : '#64748b'} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          {/* TAB 1: INFO & ACESSO */}
          {activeTab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Nome da Residência / Piscina *</label>
                  <input
                    type="text"
                    required
                    className="input-control"
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
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Telefone / WhatsApp</label>
                  <input
                    type="text"
                    className="input-control"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>E-mail para Relatórios</label>
                  <input
                    type="email"
                    className="input-control"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                  <MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />
                  Endereço Completo (DFW Metroplex)
                </label>
                <input
                  type="text"
                  required
                  className="input-control"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                    <Key size={13} style={{ display: 'inline', marginRight: 4 }} />
                    Código do Portão / Instruções de Acesso
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Ex: Gate #4821 ou Chave no painel"
                    value={gateCode}
                    onChange={(e) => setGateCode(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                    <Calendar size={13} style={{ display: 'inline', marginRight: 4 }} />
                    Dia de Atendimento da Rota
                  </label>
                  <select className="input-control" value={serviceDay} onChange={(e) => setServiceDay(e.target.value)}>
                    <option value="Segunda-feira">Segunda-feira</option>
                    <option value="Terça-feira">Terça-feira</option>
                    <option value="Quarta-feira">Quarta-feira</option>
                    <option value="Quinta-feira">Quinta-feira</option>
                    <option value="Sexta-feira">Sexta-feira</option>
                    <option value="Sábado">Sábado</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Tipo de Imóvel</label>
                  <select className="input-control" value={poolType} onChange={(e) => setPoolType(e.target.value)}>
                    <option value="Residencial">Residencial</option>
                    <option value="Comercial / HOA">Comercial / HOA</option>
                    <option value="Condomínio">Condomínio</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Frequência</label>
                  <select className="input-control" value={serviceFrequency} onChange={(e) => setServiceFrequency(e.target.value)}>
                    <option value="Semanal">Semanal (1x por semana)</option>
                    <option value="Bi-semanal">Bi-semanal (2x por semana)</option>
                    <option value="Quinzenal">Quinzenal</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EQUIPMENT & VOLUME */}
          {activeTab === 'equipment' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Volume em Galões (US gal) *</label>
                  <input
                    type="number"
                    required
                    className="input-control"
                    value={volumeGallons}
                    onChange={(e) => setVolumeGallons(parseInt(e.target.value) || 1000)}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4, display: 'block' }}>
                    Equivale a {Math.round(volumeGallons * 3.78541).toLocaleString('pt-BR')} Litros
                  </span>
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Sistema de Desinfecção</label>
                  <select className="input-control" value={sanitizerType} onChange={(e) => setSanitizerType(e.target.value)}>
                    <option value="Gerador de Sal (SWG)">Gerador de Sal (SWG)</option>
                    <option value="Cloro Tradicional (Pastilha/Líquido)">Cloro Tradicional (Pastilha/Líquido)</option>
                    <option value="Ozônio + Cloro">Ozônio + Cloro</option>
                    <option value="Mineral / UV">Mineral / UV</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Tipo de Filtro</label>
                  <select className="input-control" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                    <option value="Filtro de Cartucho Quad">Filtro de Cartucho Quad</option>
                    <option value="Filtro de Cartucho Simples">Filtro de Cartucho Simples</option>
                    <option value="Filtro de Areia (Sand Filter)">Filtro de Areia (Sand Filter)</option>
                    <option value="Filtro D.E. (Terra Diatomácea)">Filtro D.E. (Terra Diatomácea)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Potência Bomba (HP)</label>
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
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Horas/Dia Filtração</label>
                  <input
                    type="number"
                    className="input-control"
                    value={dailyRunHours}
                    onChange={(e) => setDailyRunHours(parseInt(e.target.value) || 6)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TARGETS */}
          {activeTab === 'targets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'rgba(0, 242, 254, 0.05)', padding: 14, borderRadius: 10, border: '1px solid rgba(0, 242, 254, 0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#00f2fe', fontSize: '0.85rem', fontWeight: 600 }}>
                  <ShieldCheck size={16} />
                  Metas Químicas de Referência (LSI Saturation Target)
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '4px 0 0' }}>
                  A calculadora de dosagem e o laboratório LSI usarão estes valores específicos para gerar receitas de dosagem automática.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>pH Alvo (7.2 - 7.6)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-control"
                    value={targetPh}
                    onChange={(e) => setTargetPh(parseFloat(e.target.value) || 7.4)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Cloro Livre FC (ppm)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="input-control"
                    value={targetFc}
                    onChange={(e) => setTargetFc(parseFloat(e.target.value) || 3.0)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Alcalinidade TA (ppm)</label>
                  <input
                    type="number"
                    step="5"
                    className="input-control"
                    value={targetTa}
                    onChange={(e) => setTargetTa(parseInt(e.target.value) || 90)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Dureza Cálcica CH (ppm)</label>
                  <input
                    type="number"
                    step="10"
                    className="input-control"
                    value={targetCh}
                    onChange={(e) => setTargetCh(parseInt(e.target.value) || 280)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Ácido Cianúrico CYA</label>
                  <input
                    type="number"
                    step="5"
                    className="input-control"
                    value={targetCya}
                    onChange={(e) => setTargetCya(parseInt(e.target.value) || 50)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Sal SWG (ppm)</label>
                  <input
                    type="number"
                    step="100"
                    className="input-control"
                    value={targetSalt}
                    onChange={(e) => setTargetSalt(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 10,
            paddingTop: 16,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '12px 24px' }}>
              <Save size={16} /> Salvar Alterações
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
