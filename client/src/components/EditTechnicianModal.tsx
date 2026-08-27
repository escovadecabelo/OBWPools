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
    if (!name.trim()) return;

    const updated: Technician = {
      id: technician ? technician.id : `tech-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      role: role.trim(),
      avatar_url: avatarUrl,
      assigned_routes_count: technician?.assigned_routes_count || 0,
      active_stops_count: technician?.active_stops_count || 0
    };
    onSave(updated);
  };

  const handleDelete = () => {
    if (technician && onDelete) {
      onDelete(technician.id);
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
        maxWidth: 520,
        width: '100%',
        maxHeight: '94vh',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
        border: '1px solid rgba(0, 242, 254, 0.35)',
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
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'rgba(0, 242, 254, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={20} color="#00f2fe" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: '#ffffff', margin: 0, fontWeight: 800 }}>
                {technician ? 'Editar Cadastro do Funcionário' : 'Novo Funcionário / Técnico'}
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                Dados cadastrais e informações de contato
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
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 8, fontWeight: 600 }}>
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

          {/* Nome Completo */}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontWeight: 700 }}>
              <User size={14} color="#00f2fe" /> Nome Completo do Funcionário *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Tyler Brooks"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#050b14',
                border: '1px solid rgba(0, 242, 254, 0.3)',
                borderRadius: 10,
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 600
              }}
            />
          </div>

          {/* Telefone / WhatsApp */}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontWeight: 700 }}>
              <Phone size={14} color="#10b981" /> Telefone / WhatsApp *
            </label>
            <input
              type="text"
              required
              placeholder="(214) 555-0142"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#050b14',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 10,
                color: '#ffffff',
                fontSize: '0.95rem'
              }}
            />
          </div>

          {/* E-mail Corporativo */}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontWeight: 700 }}>
              <Mail size={14} color="#4facfe" /> E-mail de Contato
            </label>
            <input
              type="email"
              placeholder="funcionario@wandpool.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#050b14',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 10,
                color: '#ffffff',
                fontSize: '0.95rem'
              }}
            />
          </div>

          {/* Cargo / Especialidade */}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontWeight: 700 }}>
              <Briefcase size={14} color="#f59e0b" /> Cargo / Função no DFW
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#050b14',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 10,
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 600
              }}
            >
              <option value="Técnico de Rotas (DFW)">Técnico de Rotas (DFW)</option>
              <option value="Técnico Sênior (Química & LSI)">Técnico Sênior (Química & LSI)</option>
              <option value="Especialista em Reparos & O.S.">Especialista em Reparos & O.S.</option>
              <option value="Supervisor de Campo / Lead Tech">Supervisor de Campo / Lead Tech</option>
              <option value="Técnico Comercial HOA">Técnico Comercial HOA</option>
            </select>
          </div>

          {/* Bottom Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 10,
            paddingTop: 16,
            borderTop: '1px solid rgba(255,255,255,0.08)'
          }}>
            {technician && onDelete ? (
              <div>
                {!confirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    style={{
                      background: 'rgba(244, 63, 94, 0.1)',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                      color: '#fb7185',
                      padding: '8px 14px',
                      borderRadius: 8,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Trash2 size={14} /> Excluir
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDelete}
                    style={{
                      background: '#e11d48',
                      border: 'none',
                      color: '#ffffff',
                      padding: '8px 14px',
                      borderRadius: 8,
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Confirmar Exclusão?
                  </button>
                )}
              </div>
            ) : <div />}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                style={{ padding: '10px 18px', borderRadius: 8 }}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '10px 20px', borderRadius: 8, gap: 6 }}
              >
                <Check size={16} /> Salvar Funcionário
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
