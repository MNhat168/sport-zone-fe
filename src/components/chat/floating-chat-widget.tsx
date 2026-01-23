import React, { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hook';
import { setWidgetOpen, setWidgetView } from '@/features/chat/chatSlice';
import { getChatRooms, getUnreadCount, getFieldOwnerChatRooms, getCoachChatRooms } from '@/features/chat/chatThunk';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X } from 'lucide-react';
import ConversationList from './conversation-list';
import ActiveChatView from './active-chat-view';
import logger from '@/utils/logger';

interface FloatingChatWidgetProps {
    initialOpen?: boolean;
    position?: 'bottom-right' | 'bottom-left';
}

const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({
    initialOpen = false,
    position = 'bottom-right',
}) => {
    const dispatch = useAppDispatch();
    const { widgetOpen, widgetView, unreadCount, connected } = useAppSelector(
        (state) => state.chat
    );
    const widgetRef = useRef<HTMLDivElement>(null);

    // Initialize WebSocket and fetch chat rooms
    useEffect(() => {
        const userData = sessionStorage.getItem('user') || localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);

            // Fetch chat rooms based on roles
            const fetchRooms = async () => {
                // Always fetch user rooms (as a player/customer)
                await dispatch(getChatRooms());

                // Check for Field Owner role or capability
                if (user.role === 'field_owner' || user.role === 'FIELD_OWNER' || user.isFieldOwner) {
                    logger.debug('[FloatingChatWidget] Fetching Field Owner rooms');
                    dispatch(getFieldOwnerChatRooms());
                }

                // Check for Coach role
                if (user.role === 'coach' || user.role === 'COACH' || user.isCoach) {
                    logger.debug('[FloatingChatWidget] Fetching Coach rooms');
                    dispatch(getCoachChatRooms());
                }
            };

            fetchRooms();

            // Get unread count
            dispatch(getUnreadCount());
        }

        return () => {
            // Don't disconnect on unmount - keep connection alive
        };
    }, [dispatch]);

    // Set initial open state
    useEffect(() => {
        if (initialOpen) {
            dispatch(setWidgetOpen(true));
        }
    }, [initialOpen, dispatch]);

    // Refresh unread count when connected
    useEffect(() => {
        if (connected) {
            dispatch(getUnreadCount());
        }
    }, [connected, dispatch]);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                widgetOpen &&
                widgetRef.current &&
                !widgetRef.current.contains(event.target as Node)
            ) {
                dispatch(setWidgetOpen(false));
            }
        };

        if (widgetOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [widgetOpen, dispatch]);

    const handleToggle = () => {
        dispatch(setWidgetOpen(!widgetOpen));
        if (!widgetOpen) {
            dispatch(setWidgetView('list'));
        }
    };

    const handleClose = () => {
        dispatch(setWidgetOpen(false));
    };

    // Position classes - responsive for mobile
    const positionClasses =
        position === 'bottom-right'
            ? 'bottom-4 right-4 sm:bottom-6 sm:right-6'
            : 'bottom-4 left-4 sm:bottom-6 sm:left-6';

    // Don't show if not logged in
    const userData = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (!userData) return null;

    return (
        <div ref={widgetRef} className={`fixed ${positionClasses} z-50`}>
            {/* FAB Button */}
            {!widgetOpen && (
                <button
                    onClick={handleToggle}
                    className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 z-40"
                    aria-label="Open chat"
                >
                    <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 min-w-5 h-5 sm:min-w-6 sm:h-6 flex items-center justify-center text-xs bg-red-500 text-white px-1 sm:px-1.5 border-2 border-background animate-pulse">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </button>
            )}

            {/* Chat Widget Panel */}
            {widgetOpen && (
                <div
                    className="bg-background rounded-lg shadow-2xl border border-border overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 z-40 w-[calc(100vw-2rem)] sm:w-[384px]"
                    style={{
                        height: '600px',
                        maxHeight: 'calc(100vh - 100px)',
                    }}
                >
                    {widgetView === 'list' ? (
                        <div className="h-full flex flex-col">
                            {/* List Header with Close Button */}
                            <div className="relative">
                                <ConversationList />
                                <button
                                    onClick={handleClose}
                                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-accent transition-colors"
                                    aria-label="Close chat"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <ActiveChatView onClose={handleClose} />
                    )}
                </div>
            )}
        </div>
    );
};

export default FloatingChatWidget;
