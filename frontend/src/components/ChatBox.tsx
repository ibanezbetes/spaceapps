import { useState, useRef, useEffect } from 'react';
import { sendChatMessage, createSSEUrl } from '../lib/api';
import { useSSE } from '../hooks/useSSE';
import type { ChatResponse } from '../lib/types';
import './ChatBox.css';

interface ChatBoxProps {
  objectId: string | null;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export function ChatBox({ objectId, onClose }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages: sseMessages, error: sseError, isConnected } = useSSE(
    objectId ? createSSEUrl(objectId, input) : null
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !objectId || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Use regular HTTP (SSE would require different flow)
      const response = await sendChatMessage(objectId, input.trim());
      const assistantMessage: Message = {
        role: 'assistant',
        content: formatChatResponse(response),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${(error as Error).message}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatChatResponse = (response: ChatResponse): string => {
    const parts: string[] = [];
    
    if (Array.isArray(response.facts) && response.facts.length > 0) {
      parts.push('**Facts:**\n' + response.facts.map((f: string) => `• ${f}`).join('\n'));
    }
    
    if (response.funFact) {
      parts.push(`**Fun Fact:** ${response.funFact}`);
    }
    
    if (response.answer) {
      parts.push(response.answer);
    }
    
    return parts.join('\n\n');
  };

  if (!objectId) return null;

  return (
    <div className="chat-box" role="dialog" aria-labelledby="chat-title">
      <div className="chat-header">
        <h3 id="chat-title">AI Assistant</h3>
        <button
          className="close-btn"
          onClick={onClose}
          aria-label="Close chat"
        >
          ×
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <p>Ask me anything about this celestial object!</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.role}`}
            role={msg.role === 'user' ? 'article' : 'region'}
            aria-label={msg.role === 'user' ? 'User message' : 'Assistant response'}
          >
            <div className="message-content">
              {msg.isStreaming && <div className="streaming-indicator">●</div>}
              {msg.content.split('\n').map((line, i) => {
                // Simple markdown-like formatting
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <strong key={i}>{line.slice(2, -2)}</strong>;
                }
                if (line.startsWith('• ')) {
                  return <li key={i}>{line.slice(2)}</li>;
                }
                return <p key={i}>{line}</p>;
              })}
            </div>
            <div className="message-timestamp">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant loading-message">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {sseError && (
          <div className="message assistant error-message">
            <div className="message-content">
              <p>Streaming error: {typeof sseError === 'string' ? sseError : 'Connection failed'}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          ref={inputRef}
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          rows={2}
          disabled={isLoading}
          aria-label="Chat message input"
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  );
}
