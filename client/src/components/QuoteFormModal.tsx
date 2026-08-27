import React, { useState } from 'react';
import { X, Send, CheckCircle2, Phone, Mail, Sparkles, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';
import { canSubmitLead } from '../lib/leadGuard';
import { HoneypotField, TurnstileWidget } from './TurnstileWidget';

interface QuoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: string;
}

export const QuoteFormModal: React.FC<QuoteFormModalProps> = ({
  isOpen,
  onClose,
  initialPlan = 'Salt Chem Plus ($220/mo)'
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Frisco');
  const [poolType, setPoolType] = useState('Residential Saltwater (SWG)');
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [guardError, setGuardError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    if (!canSubmitLead({ honeypot, turnstileToken })) {
      setGuardError('Please complete the security check before submitting.');
      return;
    }
    setGuardError('');

    // Trigger confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    setSubmitted(true);
  };

  const handleSendToWhatsApp = () => {
    if (!canSubmitLead({ honeypot, turnstileToken })) {
      setGuardError('Please complete the security check before opening WhatsApp.');
      return;
    }
    setGuardError('');
    const text = encodeURIComponent(
      `Hello OBW Pools! I'd like to request a quote and schedule an inspection.\n\n` +
      `👤 *Name:* ${name}\n` +
      `📞 *Phone:* ${phone}\n` +
      `📧 *Email:* ${email || 'Not provided'}\n` +
      `📍 *City (DFW):* ${city}, TX\n` +
      `🏊 *Pool Type:* ${poolType}\n` +
      `📋 *Plan Selected:* ${selectedPlan}\n` +
      `📝 *Notes:* ${notes || 'Requesting initial pool inspection.'}`
    );
    window.open(`https://wa.me/17542351214?text=${text}`, '_blank');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 16
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 16,
        width: '100%',
        maxWidth: 540,
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '30px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        position: 'relative',
        color: '#0f172a'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            cursor: 'pointer'
          }}
        >
          <X size={16} />
        </button>

        {!submitted ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{
                backgroundColor: '#f0f9ff',
                color: '#0284c7',
                width: 32,
                height: 32,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={18} />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Request a Free Inspection & Quote
              </h2>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: 20 }}>
              Fill in your details and our technical coordinator will reach out promptly via phone or WhatsApp.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
              <HoneypotField value={honeypot} onChange={setHoneypot} />
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robert Miller"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    color: '#0f172a'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Phone / Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(754) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      color: '#0f172a'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      color: '#0f172a'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    City in DFW
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
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
                    <option value="University Park">University Park, TX</option>
                    <option value="Dallas">Dallas, TX</option>
                    <option value="Prosper">Prosper, TX</option>
                    <option value="Allen">Allen, TX</option>
                    <option value="Other Area">Other DFW Area</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Pool Type
                  </label>
                  <select
                    value={poolType}
                    onChange={(e) => setPoolType(e.target.value)}
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
                    <option value="Residential Saltwater (SWG)">Residential Saltwater (SWG)</option>
                    <option value="Residential Traditional Chlorine">Residential Traditional Chlorine</option>
                    <option value="Commercial / HOA Clubhouse">Commercial / HOA Clubhouse</option>
                    <option value="Green / Algae Infested Pool">Green / Algae Infested Pool</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Selected Plan
                </label>
                <input
                  type="text"
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    color: '#0284c7',
                    fontWeight: 700
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Notes / Specific Needs (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Pool has high filter pressure, would like Tuesday morning service..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    color: '#0f172a',
                    resize: 'none'
                  }}
                />
              </div>

              <TurnstileWidget onToken={setTurnstileToken} />
              {guardError && (
                <p style={{ fontSize: '0.8rem', color: '#b91c1c', margin: 0 }}>{guardError}</p>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
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
                    gap: 6
                  }}
                >
                  <Send size={16} />
                  <span>Submit Request</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendToWhatsApp}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid #86efac',
                    backgroundColor: '#f0fdf4',
                    color: '#16a34a',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <MessageSquare size={16} />
                  <span>WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 10px' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <CheckCircle2 size={32} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
              Request Received Successfully!
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#64748b', lineHeight: 1.5, marginBottom: 20 }}>
              Thank you, <strong>{name}</strong>! Our Dallas-Fort Worth team in <strong>{city}, TX</strong> will contact you at <strong>{phone}</strong> within 15 minutes.
            </p>

            <div style={{
              backgroundColor: '#f8fafc',
              padding: '14px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              marginBottom: 20,
              textAlign: 'left',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, color: '#0f172a' }}>
                <Phone size={14} color="#0284c7" />
                <span>Direct Support: <strong>(754) 235-1214</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, color: '#0f172a' }}>
                <Mail size={14} color="#0284c7" />
                <span>Contact: <strong>contact@obwpools.com</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a' }}>
                <Mail size={14} color="#0284c7" />
                <span>Service: <strong>service@obwpools.com</strong></span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleSendToWhatsApp}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <MessageSquare size={16} />
                <span>Open in WhatsApp</span>
              </button>

              <button
                onClick={onClose}
                style={{
                  padding: '12px 18px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
