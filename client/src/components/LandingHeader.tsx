import React, { useState } from 'react';
import { Phone, Lock, Menu, X, Star } from 'lucide-react';

const NAV = [
  { href: '#services', label: 'Services' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#transformations', label: 'Results' },
  { href: '#pricing', label: 'Plans' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#faq', label: 'FAQ' },
  { href: '#coverage', label: 'Areas' }
];

interface LandingHeaderProps {
  onOpenQuote: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ onOpenQuote }) => {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <header className="landing-header">
      <div className="landing-header-inner">
        <a href="#top" className="landing-brand" onClick={close}>
          <span className="landing-brand-mark">
            <img src="/logo.png" alt="OBW Pools" />
          </span>
          <span className="landing-brand-text">
            <span className="landing-brand-name">
              OBW <span>POOLS</span>
            </span>
            <span className="landing-brand-tag">Cleaning · Maintenance · Repairs</span>
            <span className="landing-brand-meta">
              <Star size={11} fill="#f59e0b" color="#f59e0b" />
              4.9 DFW · Frisco · Plano · Southlake
            </span>
          </span>
        </a>

        <nav className="landing-nav" aria-label="Primary">
          {NAV.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>

        <div className="landing-header-actions">
          <a href="tel:7542351214" className="landing-phone">
            <Phone size={15} />
            <span>(754) 235-1214</span>
          </a>
          <button type="button" className="landing-cta" onClick={onOpenQuote}>
            Free quote
          </button>
          <a href="/portal" className="landing-portal" title="Technician portal">
            <Lock size={13} />
          </a>
          <button
            type="button"
            className="landing-menu-btn"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="landing-mobile-panel">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} onClick={close}>{item.label}</a>
          ))}
          <a href="tel:7542351214" onClick={close}>(754) 235-1214</a>
          <button type="button" className="landing-cta landing-cta-block" onClick={() => { close(); onOpenQuote(); }}>
            Get a free quote
          </button>
        </div>
      )}
    </header>
  );
};
