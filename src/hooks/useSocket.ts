// hooks/useSocket.ts
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL; // hoặc URL backend

export const useSocket = (userId: string) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    console.log("🔌 useSocket - userId:", userId);
    if (!userId) {
      console.log("🔌 useSocket - No userId provided");
      return;
    }

    console.log("🔌 useSocket - Creating socket connection...");
    socketRef.current = io(SOCKET_SERVER_URL, {
      query: { userId },
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Connected to WebSocket with userId:', userId);
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket');
    });
    //Mark notifications as read when clicked

    socketRef.current.on('error', (error) => {
      console.error('🚨 Socket error:', error);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [userId]);

  return socketRef.current;
};
