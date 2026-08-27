import { useState, useEffect } from 'react';
import type { Pool, WaterTest, ServiceVisit } from './types/pool';
import { fetchPools, fetchPoolTests, fetchPoolVisits, createPoolApi, updatePoolApi } from './lib/api';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { RouteManager } from './components/RouteManager';
import { CustomerManager } from './components/CustomerManager';
import { EditPoolModal } from './components/EditPoolModal';
import { Dashboard } from './components/Dashboard';
import { WaterLab } from './components/WaterLab';
import { DosageCalculator } from './components/DosageCalculator';
import { VolumeCalculator } from './components/VolumeCalculator';
import { EquipmentManager } from './components/EquipmentManager';
import { ServiceChecklist } from './components/ServiceChecklist';
import { NewPoolModal } from './components/NewPoolModal';
import { PoolHistoryModal } from './components/PoolHistoryModal';

export function App() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [editingPool, setEditingPool] = useState<Pool | null>(null);
  const [historyPool, setHistoryPool] = useState<Pool | null>(null);
  const [activeTab, setActiveTab] = useState<string>('routes'); // Rotas como tela principal
  const [latestTest, setLatestTest] = useState<WaterTest | undefined>(undefined);
  const [latestVisit, setLatestVisit] = useState<ServiceVisit | undefined>(undefined);
  const [dosageInitialParams, setDosageInitialParams] = useState<any>(undefined);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchPools();
      setPools(data);
      if (data.length > 0) {
        setSelectedPool(data[0]);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedPool) return;
    async function loadPoolDetails() {
      const tests = await fetchPoolTests(selectedPool!.id);
      if (tests && tests.length > 0) {
        setLatestTest(tests[0]);
      } else {
        setLatestTest(undefined);
      }

      const visits = await fetchPoolVisits(selectedPool!.id);
      if (visits && visits.length > 0) {
        setLatestVisit(visits[0]);
      } else {
        setLatestVisit(undefined);
      }
    }
    loadPoolDetails();
  }, [selectedPool]);

  const handleCreatePool = async (newPool: Pool) => {
    setPools(prev => [newPool, ...prev]);
    setSelectedPool(newPool);
    await createPoolApi(newPool);
    setActiveTab('routes');
  };

  const handleUpdatePool = async (updated: Pool) => {
    setPools(prev => prev.map(p => p.id === updated.id ? updated : p));
    if (selectedPool && selectedPool.id === updated.id) {
      setSelectedPool(updated);
    }
    await updatePoolApi(updated);
  };

  const handleOpenEditModal = (poolToEdit: Pool) => {
    setEditingPool(poolToEdit);
    setIsEditModalOpen(true);
  };

  const handleTestSaved = (newTest: WaterTest) => {
    setLatestTest(newTest);
  };

  const handleVisitRecorded = (newVisit: ServiceVisit) => {
    setLatestVisit(newVisit);
  };

  const handleGoToDosage = (params: { ph: number; fc: number; ta: number; ch: number; cya: number; salt: number }) => {
    setDosageInitialParams(params);
    setActiveTab('dosage');
  };

  const handleApplyVolume = (liters: number, gallons: number) => {
    if (!selectedPool) return;
    const updated = { ...selectedPool, volume_liters: liters, volume_gallons: gallons };
    handleUpdatePool(updated);
  };

  const handleUpdatePsi = (newPsi: number) => {
    if (!selectedPool) return;
    const updated = { ...selectedPool, current_filter_psi: newPsi };
    handleUpdatePool(updated);
  };

  if (loading || !selectedPool) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        color: '#00f2fe'
      }}>
        <div style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          border: '3px solid rgba(0, 242, 254, 0.2)',
          borderTopColor: '#00f2fe',
          animation: 'spin 1s linear infinite'
        }} />
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Iniciando WandPool Route & Chemistry Engine...</h2>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '70px' }}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pools={pools}
        selectedPool={selectedPool}
        onSelectPool={setSelectedPool}
        onNewPoolClick={() => setIsModalOpen(true)}
      />

      {/* Main Content View */}
      <main style={{ maxWidth: 1400, width: '100%', margin: '0 auto', padding: '16px 16px 40px', flex: 1 }}>
        {activeTab === 'routes' && (
          <RouteManager
            onSelectPoolForLab={(poolId) => {
              const p = pools.find(item => item.id === poolId);
              if (p) setSelectedPool(p);
              setActiveTab('lab');
            }}
          />
        )}

        {activeTab === 'clients' && (
          <CustomerManager
            pools={pools}
            onSelectPool={setSelectedPool}
            onEditPool={handleOpenEditModal}
            onViewHistory={(pool) => {
              setHistoryPool(pool);
              setIsHistoryModalOpen(true);
            }}
            onNewPoolClick={() => setIsModalOpen(true)}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            pool={selectedPool}
            latestTest={latestTest}
            latestVisit={latestVisit}
            onNavigate={setActiveTab}
            onQuickDoorHanger={() => setActiveTab('service')}
            onViewHistory={() => {
              setHistoryPool(selectedPool);
              setIsHistoryModalOpen(true);
            }}
          />
        )}

        {activeTab === 'lab' && (
          <WaterLab
            pool={selectedPool}
            onTestSaved={handleTestSaved}
            onGoToDosage={handleGoToDosage}
          />
        )}

        {activeTab === 'dosage' && (
          <DosageCalculator
            pool={selectedPool}
            initialParams={dosageInitialParams}
          />
        )}

        {activeTab === 'volume' && (
          <VolumeCalculator
            pool={selectedPool}
            onApplyVolume={handleApplyVolume}
          />
        )}

        {activeTab === 'equipment' && (
          <EquipmentManager
            pool={selectedPool}
            onUpdatePsi={handleUpdatePsi}
          />
        )}

        {activeTab === 'service' && (
          <ServiceChecklist
            pool={selectedPool}
            onVisitRecorded={handleVisitRecorded}
          />
        )}
      </main>

      {/* Mobile Android Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Modal de Criação de Piscina */}
      <NewPoolModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreatePool}
      />

      {/* Modal de Edição de Piscina/Cliente */}
      <EditPoolModal
        pool={editingPool}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPool(null);
        }}
        onSave={handleUpdatePool}
      />

      {/* Modal de Histórico Completo de Execuções por Piscina */}
      <PoolHistoryModal
        pool={historyPool || selectedPool}
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setHistoryPool(null);
        }}
        onNewVisitClick={(poolId) => {
          const p = pools.find(i => i.id === poolId);
          if (p) setSelectedPool(p);
          setActiveTab('service');
        }}
      />
    </div>
  );
}

export default App;
