import React, { useState, useEffect } from 'react';
import type { TechnicianInventory } from '../types/pool';
import { fetchTruckInventories, saveTruckInventories, restockTruck } from '../lib/inventory';
import { 
  Package, Truck, RefreshCw, Plus, Minus, AlertCircle, 
  CheckCircle2, DollarSign, User
} from 'lucide-react';

export const TruckInventory: React.FC = () => {
  const [inventories, setInventories] = useState<TechnicianInventory[]>([]);
  const [selectedTechId, setSelectedTechId] = useState<string>('tech-1');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    const data = fetchTruckInventories();
    setInventories(data);
    if (data.length > 0) {
      setSelectedTechId(data[0].technician_id);
    }
  }, []);

  const activeInventory = inventories.find(i => i.technician_id === selectedTechId) || inventories[0];

  const handleAdjustQuantity = (itemId: string, delta: number) => {
    if (!activeInventory) return;
    const updated = inventories.map(inv => {
      if (inv.technician_id === activeInventory.technician_id) {
        return {
          ...inv,
          items: inv.items.map(item => {
            if (item.id === itemId) {
              const newQty = Math.max(0, Math.min(item.capacity, Math.round((item.current_quantity + delta) * 10) / 10));
              return { ...item, current_quantity: newQty };
            }
            return item;
          })
        };
      }
      return inv;
    });

    setInventories(updated);
    saveTruckInventories(updated);
  };

  const handleRestock = () => {
    if (!activeInventory) return;
    const updated = restockTruck(activeInventory.technician_id);
    setInventories(updated);
    setSuccessMessage(`🚚 Caminhão de ${activeInventory.technician_name} reabastecido com sucesso em 100%!`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const totalValueOnTruck = activeInventory?.items.reduce(
    (acc, item) => acc + item.current_quantity * item.cost_per_unit_usd,
    0
  ) || 0;

  const lowStockCount = activeInventory?.items.filter(
    item => item.current_quantity <= item.min_alert_threshold
  ).length || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* 1. TOP HEADER & TRUCK SELECTOR */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(0, 242, 254, 0.35)'
            }}>
              <Truck size={24} color="#031224" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', color: '#ffffff', margin: 0, fontWeight: 800 }}>
                Estoque do Caminhão (*Truck Chemical Inventory*)
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                Rastreamento e baixa automática de produtos químicos aplicados em campo
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={handleRestock}
              style={{ padding: '10px 18px', borderRadius: 10 }}
            >
              <RefreshCw size={16} /> Reabastecer Caminhão (100%)
            </button>
          </div>
        </div>

        {/* Technician Switcher Bar */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16, overflowX: 'auto', paddingBottom: 4 }}>
          {inventories.map(inv => {
            const isSelected = inv.technician_id === selectedTechId;
            return (
              <button
                key={inv.technician_id}
                onClick={() => setSelectedTechId(inv.technician_id)}
                style={{
                  background: isSelected ? 'rgba(0, 242, 254, 0.15)' : 'rgba(5, 11, 20, 0.6)',
                  border: isSelected ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isSelected ? '#00f2fe' : '#94a3b8',
                  borderRadius: 10,
                  padding: '8px 14px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  whiteSpace: 'nowrap'
                }}
              >
                <User size={14} />
                <span>{inv.technician_name}</span>
                <span style={{ fontSize: '0.7rem', color: isSelected ? '#ffffff' : '#64748b' }}>
                  ({inv.truck_name.split('(')[0]})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          color: '#34d399',
          padding: '12px 16px',
          borderRadius: 10,
          fontSize: '0.9rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <CheckCircle2 size={18} /> {successMessage}
        </div>
      )}

      {/* 2. TRUCK KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <div className="glass-panel" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0, 242, 254, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={20} color="#00f2fe" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Itens Rastreados</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
              {activeInventory?.items.length || 0} produtos
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={20} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Valor a Bordo</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
              ${totalValueOnTruck.toFixed(2)} USD
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: lowStockCount > 0 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={20} color={lowStockCount > 0 ? '#fb7185' : '#10b981'} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Alertas de Estoque Baixo</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: lowStockCount > 0 ? '#fb7185' : '#ffffff' }}>
              {lowStockCount > 0 ? `${lowStockCount} itens críticos` : 'Tudo abastecido'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. CHEMICAL INVENTORY GRID */}
      <div className="glass-panel" style={{ padding: 20 }}>
        <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: 16, fontWeight: 700 }}>
          Insumos no Veículo ({activeInventory?.truck_name})
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {activeInventory?.items.map(item => {
            const pct = Math.round((item.current_quantity / item.capacity) * 100);
            const isLow = item.current_quantity <= item.min_alert_threshold;

            return (
              <div
                key={item.id}
                style={{
                  background: 'rgba(5, 11, 20, 0.6)',
                  border: isLow ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 12,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                      {item.chemical_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#00f2fe' }}>
                      ${item.cost_per_unit_usd.toFixed(2)} / {item.unit} • Categoria: {item.category}
                    </div>
                  </div>

                  <span className={`badge ${isLow ? 'badge-red' : pct > 60 ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.7rem' }}>
                    {isLow ? '⚠️ Repor' : `${pct}%`}
                  </span>
                </div>

                {/* Progress Level Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                    <span style={{ color: '#cbd5e1', fontWeight: 700 }}>
                      {item.current_quantity} {item.unit}
                    </span>
                    <span style={{ color: '#64748b' }}>
                      Capacidade: {item.capacity} {item.unit}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 3, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: isLow ? '#f43f5e' : pct > 60 ? '#10b981' : '#f59e0b',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>

                {/* Quick Step Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Alerta mín: {item.min_alert_threshold} {item.unit}
                  </span>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="btn-secondary"
                      onClick={() => handleAdjustQuantity(item.id, -1)}
                      style={{ padding: '4px 8px', borderRadius: 6 }}
                      title="Diminuir 1 unidade"
                    >
                      <Minus size={14} />
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => handleAdjustQuantity(item.id, 1)}
                      style={{ padding: '4px 8px', borderRadius: 6 }}
                      title="Adicionar 1 unidade"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
