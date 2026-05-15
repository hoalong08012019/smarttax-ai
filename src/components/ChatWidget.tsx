import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  ShieldCheck, 
  Minimize2,
  Maximize2
} from 'lucide-react';

interface ChatWidgetProps {
  chatHistory: Array<{ sender: 'USER' | 'AI'; text: string; citation?: string }>;
  customQuestionInput: string;
  setCustomQuestionInput: (val: string) => void;
  handleSendCustomQuestion: (e: React.FormEvent) => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  chatHistory,
  customQuestionInput,
  setCustomQuestionInput,
  handleSendCustomQuestion
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isOpen]);

  return (
    <div className="chat-widget-container" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className={`chat-window animate-slide-up ${isMinimized ? 'minimized' : ''}`} style={{ 
          width: '380px', 
          height: isMinimized ? '60px' : '520px', 
          backgroundColor: '#06070a', 
          borderRadius: '16px', 
          border: '1px solid var(--accent-purple)', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          marginBottom: '16px',
          transition: 'height 0.3s ease'
        }}>
          {/* HEADER */}
          <div style={{ 
            padding: '12px 16px', 
            backgroundColor: 'rgba(157,0,255,0.1)', 
            borderBottom: '1px solid rgba(157,0,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div className="flex-row-center" style={{ gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} color="#ffffff" />
              </div>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>SmartTax AI Assistant</h4>
                <div className="flex-row-center" style={{ gap: '4px' }}>
                  <span className="live-indicator" style={{ width: '6px', height: '6px', backgroundColor: 'var(--accent-emerald)' }}></span>
                  <span style={{ fontSize: '9px', color: 'var(--accent-emerald)', fontWeight: 700 }}>Chuyên gia Thuế 24/7</span>
                </div>
              </div>
            </div>
            <div className="flex-row-center" style={{ gap: '8px' }}>
              <button onClick={() => setIsMinimized(!isMinimized)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* MESSAGES */}
              <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', scrollBehavior: 'smooth' }}>
                <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '8px' }}>
                  Chào bạn! Tôi là Robot trợ lý thuế được nạp dữ liệu từ Học viện Tài chính & UEH. Tôi có thể giúp gì cho bạn?
                </div>
                
                {chatHistory.map((chat, idx) => (
                  <div key={idx} style={{ alignSelf: chat.sender === 'USER' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                    <div style={{ 
                      padding: '10px 14px', 
                      borderRadius: chat.sender === 'USER' ? '14px 14px 2px 14px' : '14px 14px 14px 2px', 
                      backgroundColor: chat.sender === 'USER' ? 'var(--accent-lime)' : '#12141c',
                      color: chat.sender === 'USER' ? '#000000' : '#ffffff',
                      border: chat.sender === 'USER' ? 'none' : '1px solid rgba(157,0,255,0.1)',
                      fontSize: '12px',
                      lineHeight: 1.5
                    }}>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{chat.text}</div>
                      {chat.citation && (
                        <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '9px', fontWeight: 700, color: chat.sender === 'USER' ? 'rgba(0,0,0,0.5)' : '#d4a6ff', display: 'flex', gap: '4px' }}>
                          <ShieldCheck size={12} />
                          <span>Cơ sở: {chat.citation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* INPUT */}
              <form onSubmit={handleSendCustomQuestion} style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={customQuestionInput}
                  onChange={(e) => setCustomQuestionInput(e.target.value)}
                  placeholder="Nhập câu hỏi tại đây..."
                  style={{ flex: 1, padding: '8px 14px', borderRadius: '20px', backgroundColor: '#000000', border: '1px solid var(--border-color)', color: '#ffffff', fontSize: '12px', outline: 'none' }}
                />
                <button type="submit" className="btn-primary" style={{ width: '36px', height: '36px', borderRadius: '50%', justifyContent: 'center', padding: '0' }}>
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* FLOATING ROBOT BUTTON */}
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className={`robot-fab ${isOpen ? 'active' : ''}`}
        style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          backgroundColor: '#06070a', 
          border: '2px solid var(--accent-purple)', 
          boxShadow: '0 8px 32px rgba(157,0,255,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#ff4444', border: '2px solid #000000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#ffffff', fontWeight: 900 }}>
          !
        </div>
        <Bot size={32} color="#d4a6ff" className={isOpen ? '' : 'animate-float'} />
        
        {/* WAVE EFFECT WHEN CLOSED */}
        {!isOpen && (
          <div className="sonar-wave" style={{ 
            position: 'absolute', 
            inset: '-4px', 
            borderRadius: '50%', 
            border: '2px solid var(--accent-purple)', 
            opacity: 0,
            animation: 'sonar 2s infinite'
          }}></div>
        )}
      </button>

      <style>{`
        @keyframes sonar {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .robot-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 40px rgba(157,0,255,0.6);
        }
        .robot-fab.active {
          transform: rotate(90deg);
        }
        .chat-window.minimized {
          height: 60px ! from JS inline;
        }
      `}</style>
    </div>
  );
};
