import { useState, useEffect } from 'react';
import type { Pool, WaterTest, ServiceVisit } from './types/pool';
import { fetchPools, fetchPoolTests, fetchPoolVisits } from './lib/api';
import { Navbar } from './components/Navbar';
import { RouteManager } from './components/RouteManager';
import { Dashboard } from './components/Dashboard';
import { WaterLab } from './components/WaterLab';
import { DosageCalculator } from './components/DosageCalculator';
import { VolumeCalculator } from './components/VolumeCalculator';
import { EquipmentManager } from './components/EquipmentManager';
import { ServiceChecklist } from './components/ServiceChecklist';
import { HermesCopilot } from './components/HermesCopilot';
import { NewPoolModal } from './components/NewPoolModal';

export function App() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [activeTab, setActiveTab] = useState<string>('routes'); // Rotas como tela principal
  const [latestTest, setLatestTest] = useState<WaterTest | undefined>(undefined);
  const [latestVisit, setLatestVisit] = useState<ServiceVisit | undefined>(undefined);
  const [dosageInitialParams, setDosageInitialParams] = useState<any>(undefined);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
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

  const handleCreatePool = (newPool: Pool) => {
    setPools(prev => [newPool, ...prev]);
    setSelectedPool(newPool);
    setActiveTab('routes');
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
    setSelectedPool(updated);
    setPools(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleUpdatePsi = (newPsi: number) => {
    if (!selectedPool) return;
    const updated = { ...selectedPool, current_filter_psi: newPsi };
    setSelectedPool(updated);
    setPools(prev => prev.map(p => p.id === updated.id ? updated : p));
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
      <main style={{ maxWidth: 1400, width: '100%', margin: '0 auto', padding: '24px 24px 60px', flex: 1 }}>
        {activeTab === 'routes' && (
          <RouteManager
            onSelectPoolForLab={(poolId) => {
              const p = pools.find(item => item.id === poolId);
              if (p) setSelectedPool(p);
              setActiveTab('lab');
            }}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            pool={selectedPool}
            latestTest={latestTest}
            latestVisit={latestVisit}
            onNavigate={setActiveTab}
            onQuickDoorHanger={() => setActiveTab('service')}
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

        {activeTab === 'hermes' && (
          <HermesCopilot
            pool={selectedPool}
          />
        )}
      </main>

      {/* Modal de Cadastro de Piscina */}
      <NewPoolModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreatePool}
      />

      {/* Footer */}
      <footer className="no-print" style={{
        textAlign: 'center',
        padding: '20px 24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        color: '#64748b',
        fontSize: '0.8rem'
      }}>
        WandPool Pro • <strong>Administração de Rotas & Fotos</strong> • Desenvolvido com Vite + TypeScript + SQLite + Hermes Agent
      </footer>
    </div>
  );
}

export default App;
