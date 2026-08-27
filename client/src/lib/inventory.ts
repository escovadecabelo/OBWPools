import type { TechnicianInventory, ChemicalDoseItem } from '../types/pool';

const STORAGE_KEY = 'wandpool_truck_inventories';

export function getDefaultTruckInventories(): TechnicianInventory[] {
  const now = new Date().toISOString();
  return [
    {
      technician_id: 'tech-1',
      technician_name: 'Tyler Brooks',
      truck_name: 'Ford F-150 #01 (Frisco & Plano)',
      items: [
        {
          id: 'item-1',
          chemical_name: 'Muriatic Acid 31.45%',
          category: 'Balancer',
          current_quantity: 8,
          capacity: 12,
          unit: 'gal',
          cost_per_unit_usd: 9.50,
          min_alert_threshold: 3,
          last_restocked_date: now
        },
        {
          id: 'item-2',
          chemical_name: 'Liquid Chlorine 12.5%',
          category: 'Sanitizer',
          current_quantity: 14,
          capacity: 20,
          unit: 'gal',
          cost_per_unit_usd: 6.20,
          min_alert_threshold: 5,
          last_restocked_date: now
        },
        {
          id: 'item-3',
          chemical_name: 'Salt for SWG Pools (40 lbs bag)',
          category: 'Salt',
          current_quantity: 6,
          capacity: 10,
          unit: 'bags',
          cost_per_unit_usd: 11.00,
          min_alert_threshold: 2,
          last_restocked_date: now
        },
        {
          id: 'item-4',
          chemical_name: 'Trichlor 3" Chlorine Tablets',
          category: 'Sanitizer',
          current_quantity: 35,
          capacity: 50,
          unit: 'lbs',
          cost_per_unit_usd: 3.80,
          min_alert_threshold: 10,
          last_restocked_date: now
        },
        {
          id: 'item-5',
          chemical_name: 'Sodium Bicarbonate (Alkalinity Up)',
          category: 'Balancer',
          current_quantity: 25,
          capacity: 40,
          unit: 'lbs',
          cost_per_unit_usd: 1.40,
          min_alert_threshold: 8,
          last_restocked_date: now
        },
        {
          id: 'item-6',
          chemical_name: 'Calcium Chloride (Hardness Up)',
          category: 'Balancer',
          current_quantity: 18,
          capacity: 30,
          unit: 'lbs',
          cost_per_unit_usd: 1.85,
          min_alert_threshold: 6,
          last_restocked_date: now
        },
        {
          id: 'item-7',
          chemical_name: 'Phosphate Remover Extra Strength',
          category: 'Specialty',
          current_quantity: 96,
          capacity: 128,
          unit: 'fl oz',
          cost_per_unit_usd: 0.45,
          min_alert_threshold: 32,
          last_restocked_date: now
        },
        {
          id: 'item-8',
          chemical_name: 'Copper Algaecide 60%',
          category: 'Specialty',
          current_quantity: 64,
          capacity: 96,
          unit: 'fl oz',
          cost_per_unit_usd: 0.60,
          min_alert_threshold: 20,
          last_restocked_date: now
        }
      ]
    },
    {
      technician_id: 'tech-2',
      technician_name: 'Marcus Rodriguez',
      truck_name: 'Chevy Silverado #02 (McKinney & Allen)',
      items: [
        {
          id: 'item-2-1',
          chemical_name: 'Muriatic Acid 31.45%',
          category: 'Balancer',
          current_quantity: 6,
          capacity: 12,
          unit: 'gal',
          cost_per_unit_usd: 9.50,
          min_alert_threshold: 3,
          last_restocked_date: now
        },
        {
          id: 'item-2-2',
          chemical_name: 'Liquid Chlorine 12.5%',
          category: 'Sanitizer',
          current_quantity: 10,
          capacity: 20,
          unit: 'gal',
          cost_per_unit_usd: 6.20,
          min_alert_threshold: 5,
          last_restocked_date: now
        },
        {
          id: 'item-2-3',
          chemical_name: 'Salt for SWG Pools (40 lbs bag)',
          category: 'Salt',
          current_quantity: 4,
          capacity: 10,
          unit: 'bags',
          cost_per_unit_usd: 11.00,
          min_alert_threshold: 2,
          last_restocked_date: now
        }
      ]
    }
  ];
}

export function fetchTruckInventories(): TechnicianInventory[] {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error(e);
    }
  }
  const initial = getDefaultTruckInventories();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export function saveTruckInventories(data: TechnicianInventory[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Dá baixa automática de produtos químicos no estoque do caminhão do técnico.
 */
export function deductChemicalsFromTruck(technicianName: string, chemicals: ChemicalDoseItem[]): void {
  const inventories = fetchTruckInventories();
  const techInv = inventories.find(inv => 
    inv.technician_name === technicianName || 
    technicianName.includes(inv.technician_name.split(' ')[0])
  );

  if (!techInv) return;

  chemicals.forEach(chem => {
    const item = techInv.items.find(i => 
      i.chemical_name.toLowerCase().includes(chem.chemical_name.toLowerCase().split(' ')[0]) ||
      chem.chemical_name.toLowerCase().includes(i.chemical_name.toLowerCase().split(' ')[0])
    );

    if (item) {
      let deductAmount = chem.amount;
      // Conversão simples se necessário (ex: 128 fl oz = 1 gal)
      if (chem.unit === 'fl oz' && item.unit === 'gal') {
        deductAmount = chem.amount / 128.0;
      }
      item.current_quantity = Math.max(0, Math.round((item.current_quantity - deductAmount) * 10) / 10);
    }
  });

  saveTruckInventories(inventories);
}

/**
 * Reabastece o caminhão até a capacidade máxima.
 */
export function restockTruck(technicianId: string): TechnicianInventory[] {
  const inventories = fetchTruckInventories();
  const updated = inventories.map(inv => {
    if (inv.technician_id === technicianId) {
      return {
        ...inv,
        items: inv.items.map(item => ({
          ...item,
          current_quantity: item.capacity,
          last_restocked_date: new Date().toISOString()
        }))
      };
    }
    return inv;
  });
  saveTruckInventories(updated);
  return updated;
}
