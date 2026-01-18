import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '@/store/hook';

interface MatchNotificationData {
    match: any;
    timestamp: Date;
}

interface SuperLikeData {
    fromUserId: string;
    sportType: string;
    timestamp: Date;
}

interface UseMatchingSocketReturn {
    socket: Socket | null;
    isConnected: boolean;
    onMatchCreated: (callback: (data: MatchNotificationData) => void) => void;
    onSuperLike: (callback: (data: SuperLikeData) => void) => void;
    disconnect: () => void;
}

export const useMatchingSocket = (): UseMatchingSocketReturn => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { token } = useAppSelector(state => state.auth);
    const matchCreatedCallbackRef = useRef<((data: MatchNotificationData) => void) | null>(null);
    const superLikeCallbackRef = useRef<((data: SuperLikeData) => void) | null>(null);

    useEffect(() => {
        if (!token) return;

        // Create socket connection
        const newSocket = io(`${import.meta.env.VITE_API_URL}/matching`, {
            auth: {
                token,
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        // Connection event handlers
        newSocket.on('connect', () => {
            console.log('✅ Connected to matching WebSocket');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Disconnected from matching WebSocket');
            setIsConnected(false);
        });

        newSocket.on('connected', (data) => {
            console.log('🎉 Matching socket connected:', data);
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ Matching socket connection error:', error);
        });

        // Match notification handlers
        newSocket.on('match:created', (data: MatchNotificationData) => {
            console.log('💚 Match created:', data);
            if (matchCreatedCallbackRef.current) {
                matchCreatedCallbackRef.current(data);
            }
        });

        newSocket.on('match:super_like', (data: SuperLikeData) => {
            console.log('⭐ Super like received:', data);
            if (superLikeCallbackRef.current) {
                superLikeCallbackRef.current(data);
            }
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            console.log('🧹 Cleaning up matching socket');
            newSocket.disconnect();
        };
    }, [token]);

    const onMatchCreated = useCallback((callback: (data: MatchNotificationData) => void) => {
        matchCreatedCallbackRef.current = callback;
    }, []);

    const onSuperLike = useCallback((callback: (data: SuperLikeData) => void) => {
        superLikeCallbackRef.current = callback;
    }, []);

    const disconnect = useCallback(() => {
        if (socket) {
            socket.disconnect();
            setSocket(null);
            setIsConnected(false);
        }
    }, [socket]);

    return {
        socket,
        isConnected,
        onMatchCreated,
        onSuperLike,
        disconnect,
    };
};
