import React, { useState } from 'react';
import { CheckCircle2, Calculator, ArrowRight, Sparkles, MessageSquare } from 'lucide-react';

interface PricingCalculatorProps {
  onOpenQuoteModal: (initialPlan?: string) => void;
}

export const PricingCalculator: React.FC<PricingCalculatorProps> = ({ onOpenQuoteModal }) => {
  const [sanitizer, setSanitizer] = useState<'traditional' | 'salt'>('salt');
  const [gallons, setGallons] = useState<number>(18000);
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly'>('weekly');
  const [hasSpa, setHasSpa] = useState<boolean>(true);

  // Dynamic pricing calculation logic
  const calculateEstimatedPrice = (): number => {
    let base = sanitizer === 'salt' ? 220 : 180;

    // Volume adjustment
    if (gallons > 15000) {
      const extraGallons = gallons - 15000;
      base += Math.round((extraGallons / 5000) * 15);
    }

    // Spa adjustment
    if (hasSpa) {
      base += 25;
    }

    // Frequency adjustment
    if (frequency === 'biweekly') {
      base = Math.round(base * 1.75);
    }

    return base;
  };

  const estimatedPrice = calculateEstimatedPrice();

  const handleWhatsAppBooking = (planName: string, price: number) => {
    onOpenQuoteModal(`${planName} (Estimated $${price}/mo)`);
  };

  return (
    <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto' }}>
      {/* 3 Main Tiers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: 'clamp(16px, 3vw, 24px)',
        marginBottom: 40
      }}>
        {/* Tier 1: Standard */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          padding: '30px 24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Essential Care
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Standard Weekly</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: 20 }}>
              Ideal for standard residential chlorinated pools looking for consistent weekly care.
            </p>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 20 }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f172a' }}>$180</span>
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/ month</span>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                '1 Weekly Visit with Dedicated Technician',
                'Vacuuming, Wall Brushing & Skimmer Emptying',
                'Comprehensive Chemical Test (pH, Chlorine, TA)',
                'Basic Chlorine & pH Adjuster Balancing',
                'Before & After Photos on WhatsApp Every Visit'
              ].map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#334155' }}>
                  <CheckCircle2 size={16} color="#0284c7" style={{ flexShrink: 0 }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => onOpenQuoteModal('Standard Weekly ($180/mo)')}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              border: '1px solid #0284c7',
              backgroundColor: '#f0f9ff',
              color: '#0284c7',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <span>Choose Standard</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Tier 2: Salt Chem Plus (FEATURED) */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          padding: '30px 24px',
          border: '2px solid #0284c7',
          boxShadow: '0 10px 30px rgba(2, 132, 199, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          {/* Badge */}
          <div style={{
            position: 'absolute',
            top: -12,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            padding: '3px 14px',
            borderRadius: 20,
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <Sparkles size={11} />
            <span>MOST POPULAR</span>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Total Protection & Salt
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Salt Chem Plus</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: 20 }}>
              Perfect for saltwater pools (SWG) and luxury finishes requiring gentle, silky water.
            </p>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 20 }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0284c7' }}>$220</span>
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/ month</span>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Everything in the Standard Weekly Plan',
                'All Chemicals Included (Salt, Acid, Bicarb, Stabilizer)',
                'Weekly LSI Saturation Index Audit (No Corrosion)',
                'Salt Cell Inspection & Filter Backwashing',
                'Texas Weather Alerts (Freeze & Heatwave Protocols)',
                'Before, After & Equipment Pressure Photo Reports'
              ].map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#0f172a', fontWeight: 500 }}>
                  <CheckCircle2 size={16} color="#0284c7" style={{ flexShrink: 0 }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => onOpenQuoteModal('Salt Chem Plus ($220/mo)')}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: '0 2px 10px rgba(2, 132, 199, 0.3)'
            }}
          >
            <span>Sign Up for Salt Chem Plus</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Tier 3: Commercial & HOA */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          padding: '30px 24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              HOA & Commercial
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Commercial & HOA</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: 20 }}>
              Tailored service for high-bather community pools and commercial properties.
            </p>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 20 }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f172a' }}>$450</span>
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/ month</span>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                '2 Visits per Week (Mondays & Fridays)',
                'Formal Compliance Reports for HOA Boards',
                'High-Volume Commercial Chemicals Included',
                'Continuous Dual-Filter & Pump Diagnostics',
                'Priority 24/7 Emergency Support'
              ].map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#334155' }}>
                  <CheckCircle2 size={16} color="#0284c7" style={{ flexShrink: 0 }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => onOpenQuoteModal('Commercial & HOA ($450/mo)')}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              color: '#334155',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <span>Inquire Commercial</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Interactive Custom Estimator Calculator Box */}
      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: '30px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 8,
            backgroundColor: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calculator size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Custom Pool Cost Estimator
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
              Select your pool size and sanitizer type to view an instant monthly estimate.
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
          alignItems: 'center'
        }}>
          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Sanitizer System
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setSanitizer('salt')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 6,
                    border: sanitizer === 'salt' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    backgroundColor: sanitizer === 'salt' ? '#f0f9ff' : '#ffffff',
                    color: sanitizer === 'salt' ? '#0284c7' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  🧂 Saltwater (SWG)
                </button>
                <button
                  type="button"
                  onClick={() => setSanitizer('traditional')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 6,
                    border: sanitizer === 'traditional' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    backgroundColor: sanitizer === 'traditional' ? '#f0f9ff' : '#ffffff',
                    color: sanitizer === 'traditional' ? '#0284c7' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  💧 Traditional Chlorine
                </button>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Estimated Volume</label>
                <span style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: 800 }}>{gallons.toLocaleString()} gallons (~{Math.round(gallons * 3.785).toLocaleString()} L)</span>
              </div>
              <input
                type="range"
                min="8000"
                max="45000"
                step="1000"
                value={gallons}
                onChange={(e) => setGallons(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0284c7', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={hasSpa}
                  onChange={(e) => setHasSpa(e.target.checked)}
                  style={{ accentColor: '#0284c7' }}
                />
                <span>Includes Spa / Hot Tub</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={frequency === 'biweekly'}
                  onChange={(e) => setFrequency(e.target.checked ? 'biweekly' : 'weekly')}
                  style={{ accentColor: '#0284c7' }}
                />
                <span>2x per week service</span>
              </label>
            </div>
          </div>

          {/* Output Box */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: 12,
            padding: '24px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: 4 }}>
              Estimated Monthly Cost
            </div>
            <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>
              ${estimatedPrice} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>/mo</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600, marginBottom: 16 }}>
              ✓ No contract lock-in • Cancel anytime
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => onOpenQuoteModal(`Calculated Estimate: $${estimatedPrice}/mo (${gallons.toLocaleString()} gal)`)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Request Inspection
              </button>

              <button
                onClick={() => handleWhatsAppBooking('Custom Plan', estimatedPrice)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 6,
                  border: '1px solid #86efac',
                  backgroundColor: '#f0fdf4',
                  color: '#16a34a',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <MessageSquare size={14} />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
