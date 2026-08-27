import React, { useState, useRef, useEffect } from 'react';
import type { Pool } from '../types/pool';
import { Bot, Send, RefreshCw, User } from 'lucide-react';
import { sendHermesChatMessage } from '../lib/api';

interface HermesCopilotProps {
  pool: Pool;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const HermesCopilot: React.FC<HermesCopilotProps> = ({ pool }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      role: 'assistant',
      content: `👋 Olá! Sou o **Hermes Pool Copilot**, seu assistente autônomo especialista em administração de rotas, envio de fotos e química de piscinas.\n\nEstou conectado à sua piscina **${pool.name}** (${pool.volume_liters.toLocaleString('pt-BR')} L, ${pool.sanitizer_type}).\n\nComo posso ajudar você hoje? Escolha uma das perguntas rápidas abaixo ou digite sua dúvida!`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInput('');
    setLoading(true);

    try {
      const reply = await sendHermesChatMessage(textToSend, pool.id);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    { label: '🗺️ Otimizar Rota Diária', prompt: 'Como funciona o cálculo de melhor caminho e menor trajeto das rotas de limpeza?' },
    { label: '📸 Envio Automático de Fotos', prompt: 'Como o sistema dispara automaticamente as fotos de Antes e Depois para o WhatsApp dos clientes?' },
    { label: '🌿 Tratamento de Piscina Verde', prompt: 'Minha piscina está com água verde e algas. Qual o tratamento de choque recomendado?' },
    { label: '💧 Água Turva / Leitosa', prompt: 'A água está esbranquiçada e leitosa. Como clarificar?' },
    { label: '📊 Calcular Dosagem Quimica', prompt: `Calcule a dosagem exata para equilibrar o pH e cloro para a piscina de ${pool.volume_liters} Litros.` }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: 'calc(100vh - 180px)', minHeight: 600 }}>
      {/* Top Header */}
      <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.4)'
          }}>
            <Bot size={24} color="#031224" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: '1.25rem', color: '#ffffff' }}>Hermes Pool Genius Copilot</h2>
              <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>Nous Hermes Engine</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Piscina Ativa: <strong>{pool.name}</strong> • {pool.volume_liters.toLocaleString('pt-BR')} L
            </p>
          </div>
        </div>

        <button
          className="btn-secondary"
          onClick={() => setMessages([{
            id: 'm1',
            role: 'assistant',
            content: 'Conversa reiniciada. Como posso ajudar com suas rotas ou manutenção de piscinas?',
            timestamp: new Date().toISOString()
          }])}
        >
          <RefreshCw size={14} /> Limpar Conversa
        </button>
      </div>

      {/* Quick Diagnostic Shortcuts */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {quickPrompts.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(q.prompt)}
            style={{
              background: 'rgba(10, 21, 38, 0.8)',
              border: '1px solid rgba(0, 242, 254, 0.2)',
              borderRadius: 20,
              padding: '6px 14px',
              color: '#f1f5f9',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease'
            }}
          >
            <span>{q.label}</span>
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="glass-panel" style={{
        flex: 1,
        padding: 20,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                gap: 12,
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}
            >
              {!isUser && (
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={18} color="#031224" />
                </div>
              )}

              <div style={{
                background: isUser ? 'linear-gradient(135deg, #00d2c4 0%, #00f2fe 100%)' : 'rgba(17, 34, 59, 0.85)',
                color: isUser ? '#031224' : '#f1f5f9',
                padding: '14px 18px',
                borderRadius: 16,
                border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: isUser ? '0 4px 15px rgba(0, 242, 254, 0.25)' : 'none',
                lineHeight: 1.6,
                fontSize: '0.9rem',
                whiteSpace: 'pre-line'
              }}>
                <div style={{ fontWeight: isUser ? 700 : 400 }}>
                  {m.content}
                </div>
                <div style={{
                  fontSize: '0.65rem',
                  opacity: 0.6,
                  textAlign: 'right',
                  marginTop: 6
                }}>
                  {new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {isUser && (
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User size={18} color="#ffffff" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: '#00f2fe', fontSize: '0.85rem' }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <RefreshCw size={18} color="#031224" className="animate-spin" />
            </div>
            <span>Hermes Agent está analisando rotas e parâmetros químicos...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        style={{ display: 'flex', gap: 10 }}
      >
        <input
          type="text"
          className="input-control"
          placeholder="Escreva sua pergunta para o Hermes (ex: Como otimizar minha rota? Como dosar barrilha?...)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          style={{ flex: 1, padding: '14px 18px', fontSize: '0.95rem' }}
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={loading || !input.trim()}
          style={{ padding: '0 24px' }}
        >
          <Send size={18} /> Enviar
        </button>
      </form>
    </div>
  );
};
