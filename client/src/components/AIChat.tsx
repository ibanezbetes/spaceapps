/**
 * Componente de chat IA para preguntar sobre objetos astronómicos
 */

import React, { useState, useRef, useEffect } from 'react';

interface AIChatProps {
  regionName?: string;
  regionDescription?: string;
  ra: number;
  dec: number;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIChat: React.FC<AIChatProps> = ({
  regionName,
  regionDescription,
  ra,
  dec,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) {
      return;
    }

    const userMessage = input.trim();
    setInput('');
    
    // Añadir mensaje del usuario
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Llamar a la API
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: {
            regionName,
            regionDescription,
            ra,
            dec,
          },
          history: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();
      
      // Añadir respuesta de la IA
      setMessages([...newMessages, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Lo siento, hubo un error al procesar tu pregunta. Por favor, intenta de nuevo.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.chatContainer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>
            Pregunta sobre {regionName || 'esta región'}
          </h3>
          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {/* Messages */}
        <div style={styles.messagesContainer}>
          {messages.length === 0 && (
            <div style={styles.welcomeMessage}>
              <p style={styles.welcomeText}>
                ¡Hola! Soy tu asistente astronómico. Puedes preguntarme sobre:
              </p>
              <ul style={styles.examplesList}>
                <li>¿Qué objetos interesantes hay aquí?</li>
                <li>¿Cómo se formó esta región?</li>
                <li>¿Qué distancia hay desde la Tierra?</li>
                <li>¿Qué puedo observar con un telescopio?</li>
              </ul>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                ...styles.message,
                ...(msg.role === 'user' ? styles.userMessage : styles.assistantMessage),
              }}
            >
              <div style={styles.messageContent}>{msg.content}</div>
            </div>
          ))}
          
          {loading && (
            <div style={{ ...styles.message, ...styles.assistantMessage }}>
              <div style={styles.messageContent}>
                <span style={styles.loadingDots}>●●●</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={styles.inputContainer}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu pregunta..."
            style={styles.input}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              ...styles.sendButton,
              ...(loading || !input.trim() ? styles.sendButtonDisabled : {}),
            }}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'transparent',
    zIndex: 20000,
    pointerEvents: 'none',
  },
  chatContainer: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    background: 'rgba(15, 23, 42, 0.98)',
    border: '2px solid #3b82f6',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(10px)',
    minWidth: '320px',
    maxWidth: '400px',
    zIndex: 20001,
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideInFromBottom 0.3s ease-out',
    pointerEvents: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
    borderTopLeftRadius: '10px',
    borderTopRightRadius: '10px',
    borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#ffffff',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: '#ffffff',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: 1,
    opacity: 0.8,
    transition: 'opacity 0.2s',
  },
  messagesContainer: {
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '300px',
    minHeight: '200px',
  },
  welcomeMessage: {
    textAlign: 'center',
    color: '#94a3b8',
    padding: '20px',
  },
  welcomeText: {
    fontSize: '14px',
    marginBottom: '16px',
  },
  examplesList: {
    textAlign: 'left',
    fontSize: '13px',
    lineHeight: '1.8',
    color: '#bfdbfe',
    paddingLeft: '20px',
  },
  message: {
    maxWidth: '80%',
    padding: '10px 14px',
    borderRadius: '12px',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  userMessage: {
    alignSelf: 'flex-end',
    background: '#3b82f6',
    color: '#ffffff',
    borderBottomRightRadius: '4px',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    background: 'rgba(59, 130, 246, 0.15)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    color: '#e2e8f0',
    borderBottomLeftRadius: '4px',
  },
  messageContent: {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  loadingDots: {
    fontSize: '20px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  inputContainer: {
    display: 'flex',
    gap: '10px',
    padding: '16px 20px',
    borderTop: '1px solid rgba(148, 163, 184, 0.3)',
    background: 'rgba(30, 41, 59, 0.5)',
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    background: 'rgba(30, 41, 59, 0.8)',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    borderRadius: '8px',
    color: '#e2e8f0',
    fontSize: '14px',
    outline: 'none',
  },
  sendButton: {
    padding: '10px 20px',
    background: '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  sendButtonDisabled: {
    background: '#475569',
    cursor: 'not-allowed',
    opacity: 0.5,
  },
};
