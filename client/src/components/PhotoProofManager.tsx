import React, { useState } from 'react';
import type { RouteStop, ServicePhoto } from '../types/pool';
import { Camera as CameraIcon, Upload, Trash2, Send, Sparkles } from 'lucide-react';
import { dispatchStopReportToCustomer, updateStopPhotosAndStatus } from '../lib/api';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import confetti from 'canvas-confetti';

interface PhotoProofManagerProps {
  stop: RouteStop;
  onPhotosUpdated: (stopId: string, photos: ServicePhoto[]) => void;
  onClose: () => void;
}

export const PhotoProofManager: React.FC<PhotoProofManagerProps> = ({
  stop,
  onPhotosUpdated,
  onClose
}) => {
  const [photos, setPhotos] = useState<ServicePhoto[]>(stop.photos || []);
  const [photoType, setPhotoType] = useState<'before' | 'after' | 'equipment' | 'issue'>('before');
  const [caption, setCaption] = useState<string>('');
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<boolean>(false);

  const demoPhotos = [
    { type: 'before' as const, label: 'Antes: Água Turva e Folhas', url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&auto=format&fit=crop&q=80' },
    { type: 'after' as const, label: 'Depois: Piscina Cristalina', url: 'https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=600&auto=format&fit=crop&q=80' },
    { type: 'equipment' as const, label: 'Casa de Máquinas / Manômetro', url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=600&auto=format&fit=crop&q=80' }
  ];

  const handleAddPhoto = (urlToAdd?: string) => {
    const url = urlToAdd || customImageUrl;
    if (!url.trim()) return;

    const newPhoto: ServicePhoto = {
      id: `photo-${Date.now()}`,
      photo_type: photoType,
      url,
      caption: caption || (photoType === 'before' ? 'Foto de Antes: Estado Inicial' : photoType === 'after' ? 'Foto de Depois: Piscina Limpa' : 'Equipamento / Manômetro'),
      timestamp: new Date().toISOString()
    };

    const updated = [...photos, newPhoto];
    setPhotos(updated);
    setCustomImageUrl('');
    setCaption('');
    onPhotosUpdated(stop.stop_id, updated);
  };

  // Suporte a Câmera Nativa do Android via Capacitor
  const handleNativeCamera = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const image = await Camera.getPhoto({
          quality: 85,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera
        });

        if (image.dataUrl) {
          handleAddPhoto(image.dataUrl);
        }
      } catch (err) {
        console.warn('Câmera nativa cancelada ou erro:', err);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handleAddPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePhoto = (id: string) => {
    const updated = photos.filter(p => p.id !== id);
    setPhotos(updated);
    onPhotosUpdated(stop.stop_id, updated);
  };

  const handleAutoDispatch = async () => {
    setIsDispatching(true);
    try {
      await updateStopPhotosAndStatus(stop.stop_id, 'Concluído', photos);
      await dispatchStopReportToCustomer(stop.stop_id, {
        customer_name: stop.customer_name,
        customer_phone: stop.customer_phone,
        pool_name: stop.pool_name,
        photos,
        notes: 'Manutenção e aspiração concluídas. Fotos em anexo.'
      });

      setDispatchSuccess(true);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        setDispatchSuccess(false);
        onClose();
      }, 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDispatching(false);
    }
  };

  const beforePhotos = photos.filter(p => p.photo_type === 'before');
  const afterPhotos = photos.filter(p => p.photo_type === 'after');
  const equipmentPhotos = photos.filter(p => p.photo_type === 'equipment' || p.photo_type === 'issue');

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
      zIndex: 100,
      padding: 16
    }}>
      <div className="glass-panel" style={{
        maxWidth: 900,
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: 28,
        border: '1px solid rgba(0, 242, 254, 0.35)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 40px rgba(0, 242, 254, 0.25)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0, 242, 254, 0.3)'
            }}>
              <CameraIcon size={24} color="#031224" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', color: '#ffffff' }}>Comprovação Fotográfica de Serviço (Antes & Depois)</h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Parada {stop.order_index}: <strong>{stop.pool_name}</strong> • Cliente: {stop.customer_name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px 14px' }}>
            Fechar
          </button>
        </div>

        {/* Action Bar: Native Android Camera / Web Upload */}
        <div style={{ background: 'rgba(5, 11, 20, 0.7)', padding: 18, borderRadius: 14, border: '1px solid rgba(255, 255, 255, 0.06)', marginBottom: 24 }}>
          <h3 style={{ fontSize: '0.95rem', color: '#f1f5f9', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Upload size={16} color="#00f2fe" /> Capturar / Adicionar Nova Foto
          </h3>

          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            {[
              { id: 'before', label: '📸 Foto ANTES (Chegada)' },
              { id: 'after', label: '✨ Foto DEPOIS (Piscina Limpa)' },
              { id: 'equipment', label: '⚙️ Casa de Máquinas / Manômetro' },
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setPhotoType(t.id as any)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: photoType === t.id ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: photoType === t.id ? 'rgba(0, 242, 254, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                  color: photoType === t.id ? '#00f2fe' : '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, alignItems: 'center' }}>
            {Capacitor.isNativePlatform() ? (
              <button
                type="button"
                onClick={handleNativeCamera}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 18px' }}
              >
                <CameraIcon size={18} />
                <span>Abrir Câmera do Celular (Nativo)</span>
              </button>
            ) : (
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 18px',
                borderRadius: 10,
                background: 'rgba(0, 242, 254, 0.1)',
                border: '1px dashed #00f2fe',
                color: '#00f2fe',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}>
                <CameraIcon size={18} />
                <span>Tirar Foto com Câmera / Upload</span>
                <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              {demoPhotos.map((dp, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPhotoType(dp.type);
                    handleAddPhoto(dp.url);
                  }}
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '8px 10px' }}
                >
                  + {dp.label.split(':')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Photo Gallery Comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 24 }}>
          
          {/* ANTES */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 16, borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f59e0b' }}>Fotos de ANTES ({beforePhotos.length})</span>
              <span className="badge badge-amber">Chegada</span>
            </div>
            {beforePhotos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b', fontSize: '0.8rem', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 8 }}>
                Nenhuma foto inicial capturada
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {beforePhotos.map(p => (
                  <div key={p.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    <img src={p.url} alt="Antes" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'rgba(5, 11, 20, 0.85)',
                      padding: '6px 10px',
                      fontSize: '0.7rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ color: '#ffffff' }}>{p.caption || 'Antes'}</span>
                      <button onClick={() => handleDeletePhoto(p.id)} style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DEPOIS */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 16, borderRadius: 12, border: '1px solid rgba(0, 242, 254, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#00f2fe' }}>Fotos de DEPOIS ({afterPhotos.length})</span>
              <span className="badge badge-cyan">Concluído</span>
            </div>
            {afterPhotos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b', fontSize: '0.8rem', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 8 }}>
                Nenhuma foto de finalização adicionada
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {afterPhotos.map(p => (
                  <div key={p.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(0, 242, 254, 0.4)' }}>
                    <img src={p.url} alt="Depois" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'rgba(5, 11, 20, 0.85)',
                      padding: '6px 10px',
                      fontSize: '0.7rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ color: '#00f2fe', fontWeight: 600 }}>{p.caption || 'Depois'}</span>
                      <button onClick={() => handleDeletePhoto(p.id)} style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* EQUIPAMENTOS */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 16, borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>Equipamentos ({equipmentPhotos.length})</span>
              <span className="badge badge-emerald">Manômetro</span>
            </div>
            {equipmentPhotos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b', fontSize: '0.8rem', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 8 }}>
                Nenhuma foto de manômetro ou motor
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {equipmentPhotos.map(p => (
                  <div key={p.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <img src={p.url} alt="Equipamento" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'rgba(5, 11, 20, 0.85)',
                      padding: '6px 10px',
                      fontSize: '0.7rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ color: '#10b981' }}>{p.caption}</span>
                      <button onClick={() => handleDeletePhoto(p.id)} style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Automated Customer Dispatch Bar */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.1) 0%, rgba(16, 185, 129, 0.08) 100%)',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          padding: 20,
          borderRadius: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ffffff', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
              <span>Disparo Automático de Fotos & Relatório para {stop.customer_name}</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Envia {photos.length} fotos comprobatórias com carimbo de geolocalização e data/hora para WhatsApp e E-mail.
            </p>
          </div>

          <button
            className="btn-primary"
            onClick={handleAutoDispatch}
            disabled={isDispatching || photos.length === 0}
            style={{ padding: '12px 24px', fontSize: '0.95rem' }}
          >
            {isDispatching ? <Sparkles size={18} className="animate-spin" /> : <Send size={18} />}
            {dispatchSuccess ? 'Disparado com Sucesso!' : `Concluir Parada e Enviar ${photos.length} Fotos`}
          </button>
        </div>

      </div>
    </div>
  );
};
