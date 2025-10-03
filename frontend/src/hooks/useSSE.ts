import { useEffect, useState, useRef, useCallback } from 'react';
import { config } from '../config';

export interface SSEMessage {
  type: 'data' | 'end' | 'error';
  data?: string;
  error?: string;
}

export function useSSE(url: string | null, body?: Record<string, unknown>) {
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  
  const connect = useCallback(() => {
    if (!url || !config.enableSSE) {
      return;
    }
    
    // For SSE with POST body, we'd need a different approach
    // OpenAI-style: make POST request first, then connect to SSE endpoint with token
    // For simplicity, we'll use EventSource directly (GET-only)
    // In production, you'd POST the question, get a session ID, then connect SSE
    
    const sse = new EventSource(url);
    eventSourceRef.current = sse;
    
    sse.onopen = () => {
      setIsConnected(true);
      setError(null);
    };
    
    sse.onmessage = (event) => {
      if (event.data) {
        setMessages((prev) => [...prev, event.data]);
      }
    };
    
    sse.addEventListener('end', () => {
      sse.close();
      setIsConnected(false);
    });
    
    sse.onerror = () => {
      setError('SSE connection failed');
      sse.close();
      setIsConnected(false);
    };
  }, [url]);
  
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);
  
  useEffect(() => {
    if (url) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [url, connect, disconnect]);
  
  return { messages, isConnected, error, disconnect };
}
