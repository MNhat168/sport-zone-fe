// hooks/useSocket.ts
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL;

type SocketKind = 'chat' | 'notifications';

/**
 * Generic socket hook that can connect to different namespaces.
 * - chat:    `${API_URL}/chat`
 * - notifications: `${API_URL}/notifications`
 */
export const useSocket = (userId: string, kind: SocketKind = 'notifications') => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId || !API_URL) return;

    const namespacePath = kind === 'chat' ? '/chat' : '/notifications';
    const url = `${API_URL.replace(/\/$/, '')}${namespacePath}`;

    // For now we pass userId via auth payload; can be extended to JWT later
    socketRef.current = io(url, {
      auth: { userId },
    });

    socketRef.current.on('connect', () => {
      console.log(`✅ Connected to ${kind} socket as user`, userId);
    });

    socketRef.current.on('disconnect', () => {
      console.log(`❌ Disconnected from ${kind} socket`);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error(`🚨 ${kind} socket connect_error:`, error);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [userId, kind]);

  return socketRef.current;
};
