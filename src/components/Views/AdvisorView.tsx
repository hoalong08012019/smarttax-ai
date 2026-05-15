import React from 'react';
import { 
  MessageSquare, 
  Database, 
  Send, 
  Sparkles,
  BookOpen,
  FileCode,
  ShieldCheck
} from 'lucide-react';
import { EmbeddedSource, LegalQA } from '../../mockData';

interface AdvisorViewProps {
  chatHistory: Array<{ sender: 'USER' | 'AI'; text: string; citation?: string }>;
  customQuestionInput: string;
  setCustomQuestionInput: (val: string) => void;
  handleSendCustomQuestion: (e: React.FormEvent) => void;
  embeddedSources: EmbeddedSource[];
  selectedEmbeddedSourceId: string;
  setSelectedEmbeddedSourceId: (id: string) => void;
  activeEmbeddedSource: EmbeddedSource;
}

export const AdvisorView: React.FC<AdvisorViewProps> = ({
  chatHistory,
  customQuestionInput,
  setCustomQuestionInput,
  handleSendCustomQuestion,
  embeddedSources,
  selectedEmbeddedSourceId,
  setSelectedEmbeddedSourceId,
  activeEmbeddedSource
}) => {
  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px', height: 'calc(100vh - 250px)' }}>
      
      <div className="content-card" style={{ display: 'flex', flexDirection: 'column', padding: '0' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex-row-center" style={{ gap: '10px' }}>
            <Database size={18} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Kho tri thức pgvector</h3>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Các nguồn dữ liệu luật đã được nhúng Embedding 1536 chiều.</p>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {embeddedSources.map(source => (
              <button 
                key={source.id}
                onClick={() => setSelectedEmbeddedSourceId(source.id)}
                style={{ 
                  width: '100%', 
                  textAlign: 'left', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  backgroundColor: selectedEmbeddedSourceId === source.id ? 'rgba(157,0,255,0.1)' : 'rgba(255,255,255,0.02)', 
                  border: selectedEmbeddedSourceId === source.id ? '1px solid var(--accent-purple)' : '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div className="flex-row-between" style={{ marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: selectedEmbeddedSourceId === source.id ? '#d4a6ff' : '#ffffff' }}>{source.title}</span>
                  <div style={{ padding: '2px 4px', borderRadius: '3px', backgroundColor: 'rgba(0,0,0,0.3)', fontSize: '8px', color: 'var(--text-muted)' }}>{source.type}</div>
                </div>
                <div className="flex-row-between">
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{source.totalChunks} Chunks</span>
                  <span style={{ fontSize: '9px', color: 'var(--accent-emerald)', fontWeight: 600 }}>Active</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '20px', backgroundColor: 'rgba(157,0,255,0.05)', borderTop: '1px solid rgba(157,0,255,0.1)' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#d4a6ff', display: 'block', marginBottom: '6px' }}>DỮ LIỆU ĐANG TRUY VẤN:</span>
          <p style={{ fontSize: '11px', color: '#ffffff', fontStyle: 'italic', lineHeight: 1.4 }}>"{activeEmbeddedSource.sampleEmbeddedText.substring(0, 100)}..."</p>
        </div>
      </div>

      <div className="content-card" style={{ display: 'flex', flexDirection: 'column', padding: '0' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
          <div className="flex-row-between">
            <div className="flex-row-center" style={{ gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(157,0,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={16} color="#d4a6ff" />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Hỗ trợ Quyết định (RAG Advisor)</h3>
                <span style={{ fontSize: '10px', color: 'var(--accent-emerald)' }}>● Đang trực tuyến • Sử dụng gpt-4-turbo-v+pgvector</span>
              </div>
            </div>
            <ShieldCheck size={18} color="var(--accent-emerald)" />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {chatHistory.map((chat, idx) => (
            <div key={idx} style={{ alignSelf: chat.sender === 'USER' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
              <div style={{ 
                padding: '14px 18px', 
                borderRadius: chat.sender === 'USER' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', 
                backgroundColor: chat.sender === 'USER' ? 'var(--accent-lime)' : 'rgba(255,255,255,0.03)',
                color: chat.sender === 'USER' ? '#000000' : '#ffffff',
                border: chat.sender === 'USER' ? 'none' : '1px solid rgba(255,255,255,0.05)',
                fontSize: '13px',
                lineHeight: 1.5
              }}>
                <div style={{ whiteSpace: 'pre-wrap' }}>{chat.text}</div>
                {chat.citation && (
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '10px', fontWeight: 700, color: chat.sender === 'USER' ? 'rgba(0,0,0,0.6)' : 'var(--accent-emerald)' }}>
                    📖 Trích dẫn: {chat.citation}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendCustomQuestion} style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            value={customQuestionInput}
            onChange={(e) => setCustomQuestionInput(e.target.value)}
            placeholder="Hỏi về quy định thuế, cách hạch toán, thời hạn nộp..."
            style={{ flex: 1, padding: '12px 20px', borderRadius: '30px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', fontSize: '13px', outline: 'none' }}
          />
          <button type="submit" className="btn-primary" style={{ width: '44px', height: '44px', borderRadius: '50%', justifyContent: 'center', padding: '0' }}>
            <Send size={18} />
          </button>
        </form>
      </div>

    </div>
  );
};
