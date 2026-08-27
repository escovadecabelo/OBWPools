import React, { useState } from 'react';
import {
  Award, ShieldCheck, FileText, Clock, CheckCircle2, Star,
  ChevronDown, ThermometerSun, Snowflake, MessageSquare
} from 'lucide-react';

const REVIEWS = [
  {
    name: 'Amanda R.',
    city: 'Frisco',
    quote: 'The weekly photo report is the reason we stayed. I know the water was tested, not just skimmed, and the LSI notes actually make sense.'
  },
  {
    name: 'Marcus T.',
    city: 'Southlake',
    quote: 'Our salt system kept scaling with the last company. OBW tracks the cell and calcium together — water stays clear and the heater stopped throwing error codes.'
  },
  {
    name: 'Priya S.',
    city: 'Plano',
    quote: 'They recovered a green pool in a few days after we got back from vacation. No surprise extras, just a plan, photos, and a swim-safe notice.'
  },
  {
    name: 'Daniel K.',
    city: 'McKinney',
    quote: 'Same technician every week, same day. When a freeze warning hit, they told us to run the pump overnight before we even thought to ask.'
  }
];

const FAQS = [
  {
    q: 'What is included in weekly pool cleaning?',
    a: 'Every visit covers skimming, brushing walls and tile, vacuuming the floor, emptying skimmer and pump baskets, testing pH, chlorine, alkalinity and calcium, then dosing to LSI targets. You get a timestamped photo summary on WhatsApp when the tech leaves the property.'
  },
  {
    q: 'Do you require a long-term contract?',
    a: 'No lock-in contracts. Stay because the water stays balanced. If the first 30 days are not a fit, we make it right or you can cancel without a penalty.'
  },
  {
    q: 'How do you handle North Texas hard water and 100°F summers?',
    a: 'Dallas-Fort Worth water is high in minerals and UV burns chlorine fast. We raise free chlorine and stabilizer (CYA) for heatwaves, watch calcium so salt cells and heaters do not scale, and send freeze alerts when overnight lows drop toward 32°F.'
  },
  {
    q: 'Can you recover a green or storm-hit pool?',
    a: 'Yes. Green-to-clean typically takes 48–72 hours with oxidizer, brushing, filter work and follow-up chemistry. We photograph the start and finish so you can see the turnaround.'
  },
  {
    q: 'Which cities do you service?',
    a: 'Weekly routes run through Frisco, Plano, McKinney, Allen, Prosper, Southlake, Westlake, University Park, North Dallas and Carrollton. Call (754) 235-1214 if your street is not listed — we add stops when the route has capacity.'
  },
  {
    q: 'Are technicians licensed, insured and background-checked?',
    a: 'Yes. Field techs are background-checked, covered by liability insurance, and trained on LSI chemistry plus common DFW equipment (cartridge filters, VS pumps, and SWG salt cells).'
  }
];

export const LandingEnrichment: React.FC<{ onOpenQuote: () => void }> = ({ onOpenQuote }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <section style={{
        background: 'linear-gradient(90deg, #0f172a 0%, #0c4a6e 100%)',
        color: '#e0f2fe',
        padding: '18px 20px',
        borderTop: '1px solid rgba(56, 189, 248, 0.25)'
      }}>
        <div style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 18,
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '0.82rem',
          fontWeight: 700
        }}>
          {[
            'Licensed & insured',
            'Background-checked techs',
            'LSI lab on every stop',
            'WhatsApp photo report',
            'No lock-in contracts'
          ].map((item) => (
            <span key={item} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={15} color="#38bdf8" />
              {item}
            </span>
          ))}
        </div>
      </section>

      <section id="included" style={{ padding: '72px 20px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Every Visit
          </div>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
            A full service stop — not a drive-by skim
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: 560, margin: '0 auto' }}>
            North Texas pools fight hard water, pollen and brutal UV. The route checklist is built for Frisco, Plano and Southlake backyards — not a generic national script.
          </p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16
        }}>
          {[
            'Skim surface, brush tile line and vacuum floor',
            'Empty skimmer and pump baskets',
            'Test pH, FC, TA, CH, CYA and salt (SWG)',
            'Dose to LSI between −0.30 and +0.30',
            'Check filter PSI vs clean baseline',
            'Inspect salt cell, pump and visible leaks',
            'Before & after photos + chemistry snapshot',
            'WhatsApp door hanger when we leave'
          ].map((line) => (
            <div key={line} style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              fontSize: '0.88rem',
              color: '#334155',
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
            }}>
              <CheckCircle2 size={18} color="#0284c7" style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{line}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={{
        backgroundColor: '#fff7ed',
        borderTop: '1px solid #fed7aa',
        borderBottom: '1px solid #fed7aa',
        padding: '28px 20px'
      }}>
        <div style={{
          maxWidth: 1000,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20,
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <ThermometerSun size={28} color="#ea580c" />
            <div>
              <div style={{ fontWeight: 800, color: '#9a3412' }}>Heatwave protocol</div>
              <div style={{ fontSize: '0.85rem', color: '#9a3412', opacity: 0.85 }}>
                Above 98°F we bump free chlorine and CYA so Texas sun does not bleach the sanitizer overnight.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Snowflake size={28} color="#0369a1" />
            <div>
              <div style={{ fontWeight: 800, color: '#0c4a6e' }}>Freeze watch</div>
              <div style={{ fontSize: '0.85rem', color: '#0c4a6e', opacity: 0.85 }}>
                Below 32°F we flag 24-hour pump run so pipes and the heater heat exchanger do not freeze.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="why-obw" style={{ backgroundColor: '#f8fafc', padding: '80px 20px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Why Homeowners Switch
            </div>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a' }}>
              White-glove route care with lab-grade chemistry
            </h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20
          }}>
            {[
              { icon: MessageSquare, title: 'Proof on your phone', body: 'Every stop ends with photos, readings and a swim-safe note — the digital door hanger luxury DFW homes expect.' },
              { icon: Award, title: 'LSI, not guesswork', body: 'We protect plaster, salt cells and heaters by holding saturation in the safe window, not “a capful of acid.”' },
              { icon: Clock, title: 'Same day, same tech', body: 'A dedicated route technician learns your gate code, equipment pad and what “clear” looks like at your house.' },
              { icon: ShieldCheck, title: '30-day make-it-right', body: 'If you are not confident after a month, we correct the water or you walk. Stay only if you love the service.' },
              { icon: FileText, title: 'Upfront monthly plans', body: 'Standard, Salt Chem Plus and Commercial HOA pricing on the site. No mystery chemical invoices after the fact.' },
              { icon: Star, title: 'Green-to-clear recovery', body: 'Storms and neglected pools get a structured shock program with a typical 48–72 hour turnaround.' }
            ].map((item) => (
              <div key={item.title} style={{
                backgroundColor: '#ffffff',
                borderRadius: 14,
                padding: 22,
                border: '1px solid #e2e8f0',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)'
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: '#f0f9ff',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12
                }}>
                  <item.icon size={20} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: 1.55 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" style={{ padding: '80px 20px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Neighbors in DFW
          </div>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
            What pool owners tell us
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={18} color="#d97706" fill="#d97706" />
            ))}
          </div>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>4.9 average from homeowners on our weekly Frisco–Plano–Southlake routes.</p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 18
        }}>
          {REVIEWS.map((review) => (
            <blockquote key={review.name} style={{
              margin: 0,
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: 22,
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)'
            }}>
              <div style={{ display: 'flex', gap: 3, marginBottom: 10 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} color="#d97706" fill="#d97706" />
                ))}
              </div>
              <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.55, marginBottom: 14 }}>
                “{review.quote}”
              </p>
              <footer style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                {review.name}
                <span style={{ fontWeight: 600, color: '#64748b' }}> · {review.city}, TX</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section style={{
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        padding: '48px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <ShieldCheck size={36} color="#38bdf8" style={{ marginBottom: 12 }} />
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: 10 }}>30-day risk-free start</h2>
          <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: 22 }}>
            Give us a month on your route. If the water, photos or communication are not what you expected, we fix it or you leave with no cancellation fee.
          </p>
          <button
            type="button"
            onClick={onOpenQuote}
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: 10,
              padding: '12px 24px',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            Start with a free inspection
          </button>
        </div>
      </section>

      <section id="faq" style={{ padding: '80px 20px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Questions
          </div>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a' }}>
            Pool service FAQs
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FAQS.map((item, idx) => {
            const open = openFaq === idx;
            return (
              <div key={item.q} style={{
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                backgroundColor: '#ffffff',
                overflow: 'hidden'
              }}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? null : idx)}
                  aria-expanded={open}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '16px 18px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    alignItems: 'center',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    color: '#0f172a'
                  }}
                >
                  <span>{item.q}</span>
                  <ChevronDown size={18} color="#0284c7" style={{
                    flexShrink: 0,
                    transform: open ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s'
                  }} />
                </button>
                {open && (
                  <p style={{
                    margin: 0,
                    padding: '0 18px 16px 18px',
                    fontSize: '0.9rem',
                    color: '#475569',
                    lineHeight: 1.6
                  }}>
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
};
