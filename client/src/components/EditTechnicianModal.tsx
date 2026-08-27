import React, { useState, useEffect } from 'react';
import type { Technician } from '../types/pool';
import { X, User, Phone, Mail, Briefcase, Trash2, Check } from 'lucide-react';

interface EditTechnicianModalProps {
  technician: Technician | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (tech: Technician) => void;
  onDelete?: (techId: string) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
];

export const EditTechnicianModal: React.FC<EditTechnicianModalProps> = ({
  technician,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<string>('Técnico de Rotas (DFW)');
  const [avatarUrl, setAvatarUrl] = useState<string>(AVATAR_PRESETS[0]);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  useEffect(() => {
    if (technician) {
      setName(technician.name || '');
      setPhone(technician.phone || '');
      setEmail(technician.email || '');
      setRole(technician.role || 'Técnico de Rotas (DFW)');
      setAvatarUrl(technician.avatar_url || AVATAR_PRESETS[0]);
    } else {
      setName('');
      setPhone('(214) 555-');
      setEmail('');
      setRole('Técnico de Rotas (DFW)');
      setAvatarUrl(AVATAR_PRESETS[0]);
    }
    setConfirmDelete(false);
  }, [technician, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Technician = {
      id: technician ? technician.id : `tech-${Date.now()}`,
      name,
      phone,
      email,
      role,
      avatar_url: avatarUrl,
      assigned_routes_count: technician?.assigned_routes_count || 0,
      active_stops_count: technician?.active_stops_count || 0
    };
    onSave(updated);
    onClose();
  };

  const handleDelete = () => {
    if (technician && onDelete) {
      onDelete(technician.id);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(3, 7, 18, 0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: 12
    }}>
      <div className="glass-panel" style={{
        maxWidth: 540,
        width: '100%',
        maxHeight: '94vh',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
        border: '1px solid rgba(0, 242, 254, 0.3)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(0, 242, 254, 0.25)',
        borderRadius: 16
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(5, 11, 20, 0.8)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(0, 242, 254, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={20} color="#00f2fe" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: '#ffffff', margin: 0 }}>
                {technician ? 'Editar Funcionário' : 'Novo Funcionário / Técnico'}
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                Gerenciamento de equipe e rotas de campo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 6 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Avatar Selector */}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 8 }}>
              Foto do Perfil / Avatar
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img
                src={avatarUrl}
                alt="Avatar Preview"
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #00f2fe',
                  boxShadow: '0 0 12px rgba(0, 242, 254, 0.3)'
                }}
              />
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {AVATAR_PRESETS.map((preset, idx) => (
                  <img
                    key={idx}
                    src={preset}
                    alt={`Preset ${idx + 1}`}
                    onClick={() => setAvatarUrl(preset)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: avatarUrl === preset ? '2px solid #00f2fe' : '1px solid rgba(255,255,255,0.2)',
                      opacity: avatarUrl === preset ? 1 : 0.6,
                      transition: 'all 0.2s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Nome */}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
              <User size={13} style={{ display: 'inline', marginRight: 4 }} /> Nome Completo *
            </label>
            <input
              type="text"
              className="input-control"
              placeholder="Ex: Tyler Brooks"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Telefone & WhatsApp */}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
              <Phone size={13} style={{ display: 'inline', marginRight: 4 }} /> Telefone / WhatsApp *
            </label>
            <input
              type="text"
              className="input-control"
              placeholder="Ex: (214) 555-7890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          {/* E-mail */}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
              <Mail size={13} style={{ display: 'inline', marginRight: 4 }} /> E-mail Profissional
            </label>
            <input
              type="email"
              className="input-control"
              placeholder="Ex: tyler@wandpool.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Cargo / Região */}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
              <Briefcase size={13} style={{ display: 'inline', marginRight: 4 }} /> Cargo & Região de Atuação em DFW
            </label>
            <input
              type="text"
              className="input-control"
              placeholder="Ex: Senior Tech (Frisco & Plano)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
          </div>

          {/* Delete Option if editing */}
          {technician && onDelete && (
            <div style={{
              marginTop: 10,
              padding: '12px 16px',
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              borderRadius: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fb7185' }}>
                  Remover Funcionário
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Exclui o cadastro do técnico do sistema.
                </div>
              </div>

              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  style={{
                    background: 'rgba(244, 63, 94, 0.2)',
                    border: '1px solid rgba(244, 63, 94, 0.4)',
                    color: '#fb7185',
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={14} style={{ display: 'inline', marginRight: 4 }} /> Excluir
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    onClick={handleDelete}
                    style={{
                      background: '#f43f5e',
                      border: 'none',
                      color: '#ffffff',
                      padding: '6px 12px',
                      borderRadius: 8,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      color: '#94a3b8',
                      padding: '6px 10px',
                      borderRadius: 8,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '10px 18px' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '10px 22px' }}
            >
              <Check size={16} /> Salvar Funcionário
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
