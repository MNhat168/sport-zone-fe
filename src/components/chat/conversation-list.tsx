import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hook';
import { setWidgetView, setCurrentRoom } from '@/features/chat/chatSlice';
import { getChatRoom } from '@/features/chat/chatThunk';
import type { ChatRoom } from '@/features/chat/chat-type';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building, UserCircle, Search, MessageCircle, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import logger from '@/utils/logger';

interface ConversationListProps {
    onSelect?: (room: ChatRoom) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const dispatch = useAppDispatch();
    const { rooms, loading, currentRoom } = useAppSelector((state) => state.chat);

    // Get current user ID from session storage
    const getCurrentUserId = () => {
        const userData = sessionStorage.getItem('user');
        if (!userData) return null;
        const user = JSON.parse(userData);
        return user._id;
    };

    // Transform rooms to add actor information
    const transformedRooms = rooms.map((room) => {
        const isCoachRoom = !!room.coach;
        const isFieldRoom = !!room.fieldOwner;
        const currentUserId = getCurrentUserId();

        let actorType: 'field' | 'coach' | 'match' = 'field';
        let actorName = 'Người dùng';
        let actorId = '';
        let actorAvatar = '';

        if (isCoachRoom) {
            actorType = 'coach';
            actorName = room.coach?.displayName || 'Huấn luyện viên';
            actorId = room.coach?._id || '';
        } else if (isFieldRoom) {
            actorType = 'field';
            actorName = room.fieldOwner?.facilityName || 'Chủ sân';
            actorId = room.fieldOwner?._id || '';
        } else {
            // Likely a match or group session room
            actorType = 'match';
            // Find the other user from participants
            const otherUser = room.participants?.find((p: any) => {
                const pId = p?._id || p;
                return pId !== currentUserId;
            });

            if (otherUser && typeof otherUser === 'object') {
                actorName = otherUser.fullName || 'Đồng đội';
                actorId = otherUser._id?.toString() || '';
                actorAvatar = otherUser.avatarUrl || otherUser.avatar || '';
            } else if (room.user && room.user._id !== currentUserId) {
                actorName = room.user.fullName || 'Đồng đội';
                actorId = room.user._id?.toString() || '';
                actorAvatar = room.user.avatarUrl || '';
            }
        }

        return {
            ...room,
            actorType,
            actorName,
            actorId,
            actorAvatar
        };
    });

    // Filter rooms by search term
    const filteredRooms = transformedRooms.filter((room) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            room.actorName?.toLowerCase().includes(searchLower) ||
            room.field?.name?.toLowerCase().includes(searchLower) ||
            room.messages[room.messages.length - 1]?.content?.toLowerCase().includes(searchLower)
        );
    });

    // Sort rooms by last message time (most recent first)
    const sortedRooms = [...filteredRooms].sort((a, b) => {
        const dateA = new Date(a.lastMessageAt).getTime();
        const dateB = new Date(b.lastMessageAt).getTime();
        return dateB - dateA;
    });

    // Get unread count for a room
    const getRoomUnreadCount = (room: ChatRoom) => {
        const currentUserId = getCurrentUserId();
        if (!currentUserId) return 0;

        return room.messages.filter(
            (msg) => !msg.isRead && msg.sender !== currentUserId
        ).length;
    };

    // Get last message preview
    const getLastMessage = (room: ChatRoom) => {
        if (room.messages.length === 0) return 'Không có tin nhắn';
        const lastMsg = room.messages[room.messages.length - 1];
        return lastMsg.content.length > 40
            ? lastMsg.content.substring(0, 40) + '...'
            : lastMsg.content;
    };

    // Format time ago
    const formatTimeAgo = (dateString: Date | string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'Vừa xong';
            if (diffMins < 60) return `${diffMins} phút trước`;
            if (diffHours < 24) return `${diffHours} giờ trước`;
            if (diffDays < 7) return `${diffDays} ngày trước`;
            return format(date, 'dd/MM/yyyy');
        } catch {
            return '';
        }
    };

    // Check if last message was sent by current user
    const isLastMessageMine = (room: ChatRoom) => {
        const currentUserId = getCurrentUserId();
        if (!currentUserId || room.messages.length === 0) return false;
        return room.messages[room.messages.length - 1].sender === currentUserId;
    };

    // Handle room selection
    const handleSelectRoom = async (room: ChatRoom) => {
        if (onSelect) {
            onSelect(room);
            return;
        }

        try {
            // Fetch latest history from API
            const latestRoom = await dispatch(getChatRoom(room._id)).unwrap();
            // Set as current room and switch view
            dispatch(setCurrentRoom(latestRoom));
            dispatch(setWidgetView('chat'));
        } catch (error) {
            logger.error('Failed to load chat room:', error);
            // Fallback: at least open with existing data if API fails
            dispatch(setCurrentRoom(room));
            dispatch(setWidgetView('chat'));
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
                <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    Tin nhắn
                </h2>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm cuộc trò chuyện..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-background"
                    />
                </div>
            </div>

            {/* Conversation List */}
            <ScrollArea className="flex-1">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Đang tải cuộc trò chuyện...
                    </div>
                ) : sortedRooms.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="font-medium mb-2">
                            {searchTerm ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có cuộc trò chuyện nào'}
                        </h3>
                        <p className="text-sm">
                            {searchTerm
                                ? 'Thử tìm kiếm với từ khóa khác'
                                : 'Bắt đầu trò chuyện với sân hoặc huấn luyện viên'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {sortedRooms.map((room) => {
                            const unreadCount = getRoomUnreadCount(room);
                            const isSelected = currentRoom?._id === room._id;
                            const lastMessageMine = isLastMessageMine(room);

                            return (
                                <button
                                    key={room._id}
                                    onClick={() => handleSelectRoom(room)}
                                    className={`w-full p-4 transition-colors duration-200 text-left group ${isSelected ? 'bg-accent/80' : 'hover:bg-accent/50'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Avatar */}
                                        <Avatar className="w-12 h-12 flex-shrink-0 border">
                                            <AvatarImage src={room.actorAvatar} />
                                            <AvatarFallback
                                                className={room.actorType === 'field'
                                                    ? 'bg-primary/10 text-primary'
                                                    : room.actorType === 'coach'
                                                        ? 'bg-secondary/10 text-secondary'
                                                        : 'bg-green-100 text-green-700'
                                                }
                                            >
                                                {room.actorType === 'field' ? (
                                                    <Building className="w-6 h-6" />
                                                ) : room.actorType === 'coach' ? (
                                                    <UserCircle className="w-6 h-6" />
                                                ) : (
                                                    <Users className="w-6 h-6" />
                                                )}
                                            </AvatarFallback>
                                        </Avatar>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            {/* Name and Badge */}
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className={`font-semibold text-sm truncate ${unreadCount > 0 ? 'text-foreground' : 'text-foreground/80'
                                                    }`}>
                                                    {room.actorName}
                                                </h3>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] px-1.5 py-0 leading-tight ${room.actorType === 'field'
                                                        ? 'border-primary/30 text-primary bg-primary/5'
                                                        : room.actorType === 'coach'
                                                            ? 'border-secondary/30 text-secondary bg-secondary/5'
                                                            : 'border-green-300 text-green-700 bg-green-50'
                                                        }`}
                                                >
                                                    {room.actorType === 'field' ? 'Sân' : room.actorType === 'coach' ? 'HLV' : 'Bắt cặp'}
                                                </Badge>
                                            </div>

                                            {/* Field Name (if applicable) */}
                                            {room.field && (
                                                <p className="text-xs text-muted-foreground mb-1 truncate">
                                                    Về sân: {room.field.name}
                                                </p>
                                            )}

                                            {/* Last Message */}
                                            <p
                                                className={`text-sm truncate ${unreadCount > 0
                                                    ? 'text-foreground font-medium'
                                                    : 'text-muted-foreground'
                                                    }`}
                                            >
                                                {lastMessageMine && (
                                                    <span className="text-primary mr-1">Bạn: </span>
                                                )}
                                                {getLastMessage(room)}
                                            </p>
                                        </div>

                                        {/* Time and Unread Badge */}
                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                            <span className="text-xs text-muted-foreground">
                                                {formatTimeAgo(room.lastMessageAt)}
                                            </span>
                                            {unreadCount > 0 && (
                                                <Badge className="min-w-5 h-5 flex items-center justify-center text-xs bg-red-500 text-white px-1.5 animate-pulse">
                                                    {unreadCount > 99 ? '99+' : unreadCount}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
};

export default ConversationList;
