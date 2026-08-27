import React, { useState } from 'react';
import { 
  Phone, CheckCircle2, Star, ShieldCheck, Droplets, 
  Wrench, Camera, MapPin, 
  Sparkles, Lock, MessageSquare, ChevronRight
} from 'lucide-react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { PricingCalculator } from './PricingCalculator';
import { QuoteFormModal } from './QuoteFormModal';
import { canSubmitLead } from '../lib/leadGuard';
import { HoneypotField, TurnstileWidget } from './TurnstileWidget';
import { LandingHeader } from './LandingHeader';
import { LandingEnrichment } from './LandingEnrichment';

export const LandingPage: React.FC = () => {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteInitialPlan, setQuoteInitialPlan] = useState('Salt Chem Plus ($220/mo)');

  // Quick Hero Form State
  const [heroName, setHeroName] = useState('');
  const [heroPhone, setHeroPhone] = useState('');
  const [heroCity, setHeroCity] = useState('Frisco');
  const [heroHoneypot, setHeroHoneypot] = useState('');
  const [heroTurnstileToken, setHeroTurnstileToken] = useState<string | null>(null);
  const [heroGuardError, setHeroGuardError] = useState('');

  const handleOpenQuote = (planName?: string) => {
    if (planName) setQuoteInitialPlan(planName);
    setIsQuoteModalOpen(true);
  };

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroName || !heroPhone) return;
    if (!canSubmitLead({ honeypot: heroHoneypot, turnstileToken: heroTurnstileToken })) {
      setHeroGuardError('Please complete the security check before submitting.');
      return;
    }
    setHeroGuardError('');
    const text = encodeURIComponent(
      `Hello OBW Pools! I'd like to request a free pool inspection.\n\n` +
      `👤 Name: ${heroName}\n` +
      `📞 Phone: ${heroPhone}\n` +
      `📍 City: ${heroCity}, TX`
    );
    window.open(`https://wa.me/17542351214?text=${text}`, '_blank');
  };

  return (
    <div id="top" style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <LandingHeader onOpenQuote={() => handleOpenQuote()} />

      {/* 3. HERO SECTION (Clean, Bright, Luxury Texas Pool Background with Quick Quote Card) */}
      <section style={{
        position: 'relative',
        backgroundImage: 'linear-gradient(to right, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.65) 55%, rgba(15, 23, 42, 0.3) 100%), url(https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1600&auto=format&fit=crop&q=85)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '70px 20px 85px 20px',
        color: '#ffffff'
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 40,
          alignItems: 'center'
        }}>
          {/* Left Column: Value Proposition */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: 20,
              padding: '5px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#38bdf8',
              marginBottom: 18
            }}>
              <Sparkles size={13} />
              <span>PREMIER POOL SERVICE IN DALLAS-FORT WORTH</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: 18,
              letterSpacing: '-0.02em'
            }}>
              Crystal-clear water & worry-free pool care, every single week.
            </h1>

            <p style={{
              fontSize: '1.05rem',
              color: '#cbd5e1',
              lineHeight: 1.6,
              marginBottom: 28,
              maxWidth: 540
            }}>
              Complete weekly maintenance with <strong>timestamped before & after photo reports sent directly to your phone</strong> on every visit, and precision chemical balancing to protect your family and equipment.
            </p>

            {/* Quick Feature Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
              {[
                'Certified, background-checked, and on-time technicians',
                'Digital service receipt with photos after every visit',
                'Perfect LSI chemical balance (no strong smell, no eye burn)',
                'Transparent pricing with zero hidden fees'
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.92rem', color: '#f1f5f9' }}>
                  <CheckCircle2 size={18} color="#38bdf8" style={{ flexShrink: 0 }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <a
                href="tel:7542351214"
                style={{
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  padding: '14px 24px',
                  borderRadius: 10,
                  fontSize: '1rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)'
                }}
              >
                <Phone size={18} />
                <span>Call (754) 235-1214</span>
              </a>

              <button
                type="button"
                onClick={() => handleOpenQuote()}
                style={{
                  backgroundColor: '#25d366',
                  color: '#ffffff',
                  padding: '14px 20px',
                  borderRadius: 10,
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <MessageSquare size={18} />
                <span>Chat on WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Right Column: Quick Estimate Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: '30px',
            color: '#0f172a',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0',
            maxWidth: 440,
            margin: '0 auto',
            width: '100%'
          }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                Request a Free Inspection
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Get a customized proposal for your home in minutes.
              </p>
            </div>

            <form onSubmit={handleHeroSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
              <HoneypotField value={heroHoneypot} onChange={setHeroHoneypot} />
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Miller"
                  value={heroName}
                  onChange={(e) => setHeroName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Phone / Mobile
                </label>
                <input
                  type="tel"
                  required
                  placeholder="(754) 000-0000"
                  value={heroPhone}
                  onChange={(e) => setHeroPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  City in DFW
                </label>
                <select
                  value={heroCity}
                  onChange={(e) => setHeroCity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="Frisco">Frisco, TX</option>
                  <option value="Plano">Plano, TX</option>
                  <option value="McKinney">McKinney, TX</option>
                  <option value="Southlake">Southlake, TX</option>
                  <option value="Dallas">Dallas, TX</option>
                  <option value="University Park">University Park, TX</option>
                  <option value="Prosper">Prosper, TX</option>
                  <option value="Allen">Allen, TX</option>
                  <option value="Other DFW Area">Other DFW Area</option>
                </select>
              </div>

              <TurnstileWidget onToken={setHeroTurnstileToken} />
              {heroGuardError && (
                <p style={{ fontSize: '0.8rem', color: '#b91c1c', margin: 0 }}>{heroGuardError}</p>
              )}

              <button
                type="submit"
                style={{
                  marginTop: 6,
                  width: '100%',
                  padding: '12px',
                  borderRadius: 8,
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(2, 132, 199, 0.3)'
                }}
              >
                Request Instant Callback
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                🔒 Your details are confidential • Response within 15 mins
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 4. TRUST PROOF STRIP */}
      <section style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '24px 20px'
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 24,
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
              <Camera size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>Photo Door Hangers</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Before & after pics on every visit</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
              <Droplets size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>LSI Chemical Balance</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Gentle, silky water without irritation</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>Satisfaction Guaranteed</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>No lock-in contracts required</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <Star size={20} fill="#d97706" />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>4.9 Stars Across DFW</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Over 500+ happy pool owners</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SERVICES GRID */}
      <section id="services" style={{ padding: '80px 20px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            What We Do
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
            Complete Pool Care Services
          </h2>
          <p style={{ fontSize: '1rem', color: '#64748b', maxWidth: 600, margin: '0 auto' }}>
            We take care of all the hard work so you can simply relax and enjoy your backyard oasis.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 24
        }}>
          {[
            {
              title: 'Full Weekly Pool Cleaning',
              desc: 'Deep floor vacuuming, thorough wall & tile brushing, surface skimming, and emptying of all skimmer and pump baskets.',
              icon: Droplets,
              img: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&auto=format&fit=crop&q=80'
            },
            {
              title: 'Precision Water Chemistry',
              desc: 'Accurate testing of pH, Free Chlorine, Alkalinity, and Calcium Hardness. Scientific dosing ensures pure, crystal-clear water.',
              icon: Sparkles,
              img: 'https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=600&auto=format&fit=crop&q=80'
            },
            {
              title: 'Pump & Filter Maintenance',
              desc: 'Routine filter backwashing, cartridge cleanings, variable-speed pump inspections, and salt cell (SWG) scale prevention.',
              icon: Wrench,
              img: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&auto=format&fit=crop&q=80'
            },
            {
              title: 'Green Pool Recovery & Shock',
              desc: 'Heavy-duty oxidizer shock treatment, enzyme algaecide application, and complete turnaround for murky or storm-hit pools.',
              icon: ShieldCheck,
              img: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&auto=format&fit=crop&q=80'
            },
            {
              title: 'Repairs & Equipment',
              desc: 'Pumps, filters, heaters, salt cells and automation. We quote parts plus labor in USD and send the proposal on WhatsApp.',
              icon: Wrench,
              img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'
            },
            {
              title: 'Texas Heat & Freeze Care',
              desc: 'Summer UV chlorine protection, winter freeze-watch pump run, and filter pressure alerts so DFW weather does not wreck the pad.',
              icon: ShieldCheck,
              img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80'
            }
          ].map((s, idx) => (
            <div key={idx} style={{
              backgroundColor: '#ffffff',
              borderRadius: 14,
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <img
                  src={s.img}
                  alt={s.title}
                  style={{ width: '100%', height: 160, objectFit: 'cover' }}
                />
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
                    {s.desc}
                  </p>
                </div>
              </div>

              <div style={{ padding: '0 20px 20px 20px' }}>
                <button
                  onClick={() => handleOpenQuote(s.title)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #0284c7',
                    backgroundColor: '#f0f9ff',
                    color: '#0284c7',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <span>Request this service</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section id="how-it-works" style={{ backgroundColor: '#f1f5f9', padding: '80px 20px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Simple & Seamless
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', marginBottom: 40 }}>
            How Our Service Works
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 30
          }}>
            {[
              {
                step: '1',
                title: 'Free Consultation',
                desc: 'Call (754) 235-1214 or submit your details to schedule a quick, no-obligation on-site pool evaluation.'
              },
              {
                step: '2',
                title: 'Weekly Professional Care',
                desc: 'Your dedicated technician arrives on the same scheduled day each week, performs deep cleaning, and balances water chemistry.'
              },
              {
                step: '3',
                title: 'Photos on Your Phone',
                desc: 'Receive an instant digital service summary with before/after photos, chemical readings, and a clear swim-safe notification.'
              }
            ].map((step, idx) => (
              <div key={idx} style={{
                backgroundColor: '#ffffff',
                borderRadius: 14,
                padding: '30px 24px',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
                position: 'relative'
              }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)'
                }}>
                  {step.step}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingEnrichment onOpenQuote={() => handleOpenQuote()} />

      {/* 7. BEFORE & AFTER SECTION */}
      <section id="transformations" style={{ padding: '80px 20px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Real Results
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
            See the OBW Pools Difference
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#64748b' }}>
            Drag the interactive slider to compare real transformations from murky to sparkling clean.
          </p>
        </div>

        <BeforeAfterSlider />
      </section>

      {/* 8. PRICING & PLANS */}
      <section id="pricing" style={{ backgroundColor: '#ffffff', padding: '80px 20px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Pricing & Packages
            </div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
              Transparent Monthly Plans
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: 540, margin: '0 auto' }}>
              Clear pricing with no surprises. Choose a package or estimate the exact monthly rate for your pool volume.
            </p>
          </div>

          <PricingCalculator onOpenQuoteModal={handleOpenQuote} />
        </div>
      </section>

      {/* 9. SERVICE AREA (Dallas-Fort Worth) */}
      <section id="coverage" style={{ padding: '70px 20px', maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          Service Areas
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>
          Serving Premier Communities in Dallas-Fort Worth
        </h2>

        <div style={{
          display: 'flex',
          gap: 10,
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: 30
        }}>
          {[
            'Frisco', 'Plano', 'McKinney', 'Southlake', 
            'University Park', 'North Dallas', 'Prosper', 
            'Allen', 'Carrollton', 'Westlake'
          ].map((city, idx) => (
            <div key={idx} style={{
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: 20,
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <MapPin size={14} color="#0284c7" />
              <span>{city}, TX</span>
            </div>
          ))}
        </div>

        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px dashed #cbd5e1',
          borderRadius: 12,
          padding: '16px',
          display: 'inline-block'
        }}>
          <span style={{ fontSize: '0.9rem', color: '#475569' }}>
            Don't see your neighborhood? Call us at <strong>(754) 235-1214</strong> to check our weekly route availability.
          </span>
        </div>
      </section>

      {/* 10. FINAL CONTACT & BOOKING BANNER */}
      <section style={{
        backgroundColor: '#0f172a',
        color: '#ffffff',
        padding: '70px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 14 }}>
            Ready for the cleanest pool on your street?
          </h2>
          <p style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: 28, lineHeight: 1.6 }}>
            Speak directly with our technical team today and schedule your first weekly cleaning.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="tel:7542351214"
              style={{
                backgroundColor: '#0284c7',
                color: '#ffffff',
                padding: '14px 28px',
                borderRadius: 10,
                fontSize: '1rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)'
              }}
            >
              <Phone size={18} />
              <span>Call (754) 235-1214</span>
            </a>

            <button
              onClick={() => handleOpenQuote()}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                padding: '14px 24px',
                borderRadius: 10,
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Request a Quote Online
            </button>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer style={{
        backgroundColor: '#080e1a',
        color: '#64748b',
        fontSize: '0.82rem',
        padding: '40px 20px 24px 20px',
        borderTop: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.png" alt="OBW Pools" style={{ height: 32 }} />
          <div>
            <div style={{ color: '#ffffff', fontWeight: 800 }}>OBW POOLS LLC</div>
            <div style={{ fontSize: '0.72rem' }}>Cleaning • Maintenance • Repairs</div>
            <div style={{ fontSize: '0.7rem', marginTop: 4 }}>Licensed & insured · DFW weekly routes · Mon–Sat 7am–6pm</div>
          </div>
          </div>

          <div style={{ display: 'flex', gap: 20 }}>
            <a href="tel:7542351214" style={{ color: '#94a3b8', textDecoration: 'none' }}>📞 (754) 235-1214</a>
            <a href="mailto:service@obwpools.com" style={{ color: '#94a3b8', textDecoration: 'none' }}>✉️ service@obwpools.com</a>
          </div>

          {/* Small Discreet Staff Portal Link */}
          <div>
            <a
              href="/portal"
              style={{
                color: '#475569',
                fontSize: '0.75rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Lock size={11} />
              <span>Internal Team Portal</span>
            </a>
          </div>
        </div>

        <div style={{
          maxWidth: 1200,
          margin: '20px auto 0 auto',
          paddingTop: 16,
          borderTop: '1px solid rgba(255,255,255,0.04)',
          textAlign: 'center',
          fontSize: '0.75rem'
        }}>
          © {new Date().getFullYear()} OBW Pools LLC. All rights reserved. Dallas-Fort Worth Metroplex.
        </div>
      </footer>

      {/* Quote Form Modal */}
      <QuoteFormModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        initialPlan={quoteInitialPlan}
      />
    </div>
  );
};
