import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, MoveHorizontal, CheckCircle2, AlertTriangle } from 'lucide-react';

interface TransformationCase {
  id: string;
  title: string;
  location: string;
  problem: string;
  solution: string;
  beforeImg: string;
  afterImg: string;
  lsiBefore: string;
  lsiAfter: string;
}

const CASES: TransformationCase[] = [
  {
    id: 'case-1',
    title: 'Green Algae Pool Recovery',
    location: 'Frisco, TX',
    problem: 'Dark green, cloudy water due to zero free chlorine and heavy algae bloom.',
    solution: 'Heavy oxidizer shock treatment, pH balancing, and vacuuming directly to waste.',
    beforeImg: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1200&auto=format&fit=crop&q=80',
    afterImg: 'https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=1200&auto=format&fit=crop&q=80',
    lsiBefore: 'Aggressive & Imbalanced',
    lsiAfter: 'Crystal Clear & Swim-Safe'
  },
  {
    id: 'case-2',
    title: 'Saltwater Pool Cloudiness Turnaround',
    location: 'Southlake, TX',
    problem: 'Salt cell shutting off and cloudy water caused by calcium scaling and high pH.',
    solution: 'Salt cell acid descaling, filter backwashing, and alkalinity buffering.',
    beforeImg: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    afterImg: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200&auto=format&fit=crop&q=80',
    lsiBefore: 'Heavy Scaling Water',
    lsiAfter: 'Perfect Mineral Equilibrium'
  },
  {
    id: 'case-3',
    title: 'Post-Storm Community Pool Recovery',
    location: 'Plano, TX',
    problem: 'Heavy organic debris and dirt runoff brought by severe Texas winds.',
    solution: 'Immediate deep physical netting, enzymatic clarification, and shock disinfection.',
    beforeImg: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&auto=format&fit=crop&q=80',
    afterImg: 'https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=1200&auto=format&fit=crop&q=80',
    lsiBefore: 'Contaminated Water',
    lsiAfter: 'HOA Pool Cleared for Swimming'
  }
];

export const BeforeAfterSlider: React.FC = () => {
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeCase = CASES[activeCaseIndex];

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 3) percentage = 3;
    if (percentage > 97) percentage = 97;
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => setIsDragging(false);

  const handleClickContainer = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  return (
    <div style={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
      {/* Case Selector Tabs with Horizontal Touch Scroll */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 16,
        justifyContent: 'flex-start',
        overflowX: 'auto',
        padding: '4px 2px 10px',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none'
      }}>
        {CASES.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveCaseIndex(idx);
              setSliderPosition(50);
            }}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              border: activeCaseIndex === idx ? '2px solid #0284c7' : '1px solid #cbd5e1',
              backgroundColor: activeCaseIndex === idx ? '#0284c7' : '#ffffff',
              color: activeCaseIndex === idx ? '#ffffff' : '#475569',
              boxShadow: activeCaseIndex === idx ? '0 4px 12px rgba(2, 132, 199, 0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            {item.title} ({item.location})
          </button>
        ))}
      </div>

      {/* Main Interactive Slider Box */}
      <div
        ref={containerRef}
        onClick={handleClickContainer}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          width: '100%',
          height: 'clamp(280px, 48vw, 460px)',
          borderRadius: 16,
          overflow: 'hidden',
          cursor: isDragging ? 'ew-resize' : 'pointer',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
          border: '1px solid #cbd5e1',
          touchAction: 'pan-y' // Allows natural vertical page scrolling while enabling horizontal sliding
        }}
      >
        {/* AFTER Image (Background full width) */}
        <img
          src={activeCase.afterImg}
          alt="After - Crystal Clean Pool"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none'
          }}
        />

        {/* AFTER Badge (Top Right) */}
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          backgroundColor: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          padding: '5px 12px',
          borderRadius: 20,
          color: '#34d399',
          fontSize: '0.75rem',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          zIndex: 5
        }}>
          <Sparkles size={13} />
          <span>AFTER (OBW Pools)</span>
        </div>

        {/* BEFORE Image (Clipped overlay) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
          overflow: 'hidden',
          pointerEvents: 'none'
        }}>
          <img
            src={activeCase.beforeImg}
            alt="Before - Murky Pool"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />

          {/* BEFORE Badge (Top Left) */}
          <div style={{
            position: 'absolute',
            top: 12,
            left: 12,
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '5px 12px',
            borderRadius: 20,
            color: '#f87171',
            fontSize: '0.75rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            zIndex: 5
          }}>
            <AlertTriangle size={13} />
            <span>BEFORE</span>
          </div>
        </div>

        {/* Slider Divider Line */}
        <div style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${sliderPosition}%`,
          width: 3,
          backgroundColor: '#ffffff',
          boxShadow: '0 0 12px rgba(0,0,0,0.6)',
          transform: 'translateX(-50%)',
          zIndex: 10,
          pointerEvents: 'none'
        }}>
          {/* Draggable Handle Button */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: '#0284c7',
              border: '3px solid #ffffff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4), 0 0 10px rgba(2, 132, 199, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'ew-resize',
              color: '#ffffff',
              pointerEvents: 'auto'
            }}
          >
            <MoveHorizontal size={20} />
          </div>
        </div>
      </div>

      {/* Case Details Summary Card */}
      <div style={{
        marginTop: 14,
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: '16px 18px',
        border: '1px solid #e2e8f0',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 14,
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}>
        <div>
          <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
            {activeCase.title}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 2 }}>
            <strong style={{ color: '#dc2626' }}>Problema Inicial:</strong> {activeCase.problem}
          </div>
        </div>

        <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: 14 }}>
          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
            <strong style={{ color: '#16a34a' }}>Solução OBW:</strong> {activeCase.solution}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={14} />
            <span>Resultado: {activeCase.lsiAfter}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
