import React, { useState, useEffect, useRef } from "react";
import { Send, X, MessageCircle, Building } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hook";
import { getChatRoom, markAsRead, startChat } from "@/features/chat/chatThunk";
import { setCurrentRoom, clearTyping } from "@/features/chat/chatSlice";
import { webSocketService } from "@/features/chat/websocket.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import type { Message } from "@/features/chat/chat-type";

interface FieldDetailChatWindowProps {
    onClose: () => void;
    fieldOwnerId: string;
    fieldId: string;
    fieldName: string;
    fieldOwnerName: string;
    isOpen: boolean;
}

const FieldDetailChatWindow: React.FC<FieldDetailChatWindowProps> = ({
    onClose,
    fieldOwnerId,
    fieldId,
    fieldName,
    fieldOwnerName,
    isOpen,
}) => {
    const [message, setMessage] = useState("");
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [localMessages, setLocalMessages] = useState<Message[]>([]);
    // Add rooms to dependencies
    const { rooms, currentRoom, loading } = useAppSelector((state) => state.chat);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (isOpen) {
            webSocketService.connect();
        } else {
            try {
                if (currentRoom?._id) webSocketService.sendTyping(currentRoom._id, false);
            } catch { }
            webSocketService.disconnect();
            dispatch(setCurrentRoom(null));
            setLocalMessages([]);
            initializedRef.current = false;
        }
    }, [isOpen]);

    useEffect(() => {
        if (currentRoom?.messages && currentRoom.messages.length > 0) {
            setLocalMessages([...currentRoom.messages]);
        } else {
            setLocalMessages([]);
        }
    }, [currentRoom?.messages]);

    useEffect(() => {
        scrollToBottom();
    }, [localMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const initializedRef = useRef(false);
    useEffect(() => {
        if (!isOpen || !fieldOwnerId) return;
        if (initializedRef.current) return; // prevent re-init on every Redux change
        initializedRef.current = true;

        // Ensure WebSocket is connected (no-op if already connected)
        webSocketService.connect();

        const mapKey = `chat:roomId:${fieldOwnerId}:${fieldId || 'none'}`;
        const savedRoomId = localStorage.getItem(mapKey);

        const hydrateFromLocalStorage = (roomId: string) => {
            try {
                const saved = localStorage.getItem(`chat:messages:${roomId}`);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed?.messages)) {
                        setLocalMessages(parsed.messages);
                    }
                }
            } catch { }
        };

        const useRoom = async (roomId: string) => {
            webSocketService.joinChatRoom(roomId);
            hydrateFromLocalStorage(roomId);
            await dispatch(getChatRoom(roomId));
        };

        // Prefer an existing room snapshot from current Redux state (single read)
        const existingRoom = Array.isArray(rooms)
            ? rooms.find((room) => {
                if (!room) return false;
                const ownerId = (room as any)?.fieldOwner?._id ?? (room as any)?.fieldOwner;
                const rFieldId = (room as any)?.field?._id ?? (room as any)?.fieldId;
                return ownerId === fieldOwnerId && (!fieldId || rFieldId === fieldId);
            })
            : undefined;

        if (existingRoom) {
            dispatch(setCurrentRoom(existingRoom));
            useRoom(existingRoom._id);
            localStorage.setItem(mapKey, existingRoom._id);
            return;
        }

        // If we have a saved mapping, use it
        if (savedRoomId) {
            // minimal object to set id so the UI can proceed; full data comes from getChatRoom
            dispatch(setCurrentRoom({ _id: savedRoomId, messages: [] } as any));
            useRoom(savedRoomId);
            return;
        }

        // Otherwise, create/get the room via API for persistence
        (async () => {
            try {
                const action = await dispatch(startChat({ fieldOwnerId, fieldId })).unwrap();
                const room = action;
                dispatch(setCurrentRoom(room));
                webSocketService.joinChatRoom(room._id);
                await dispatch(getChatRoom(room._id));
                localStorage.setItem(mapKey, room._id);
            } catch (e) {
                console.error('Failed to initialize chat room:', e);
                dispatch(setCurrentRoom(null));
                setLocalMessages([]);
            }
        })();
    }, [isOpen, fieldOwnerId, fieldId]);

    // Ensure we stay joined to the active room for realtime events
    useEffect(() => {
        if (currentRoom?._id) {
            webSocketService.joinChatRoom(currentRoom._id);
        }
    }, [currentRoom?._id]);

    // Persist messages locally per room for quick rehydrate
    useEffect(() => {
        if (currentRoom?._id) {
            try {
                localStorage.setItem(
                    `chat:messages:${currentRoom._id}`,
                    JSON.stringify({ messages: localMessages, updatedAt: Date.now() })
                );
            } catch { }
        }
    }, [currentRoom?._id, localMessages]);

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        // Get user data from sessionStorage
        const userData = sessionStorage.getItem("user");
        if (!userData) {
            alert("Vui lòng đăng nhập để gửi tin nhắn");
            return;
        }

        // Ensure we have a room and joined it; if not yet, start chat now
        let roomId = currentRoom?._id;
        if (!roomId) {
            try {
                const action = await dispatch(startChat({ fieldOwnerId, fieldId })).unwrap();
                roomId = action._id;
                dispatch(setCurrentRoom(action));
                webSocketService.joinChatRoom(roomId);
                localStorage.setItem(`chat:roomId:${fieldOwnerId}:${fieldId || 'none'}`, roomId);
            } catch (e) {
                console.error('Cannot start chat to send message:', e);
                return;
            }
        }

        // Send message via WebSocket
        webSocketService.sendMessage({
            fieldOwnerId,
            fieldId,
            content: message.trim(),
            type: "text",
        });

        // Add message locally for immediate display
        const user = JSON.parse(userData);
        const newMessage: Message = {
            sender: user.id || user._id,
            type: 'text',
            content: message.trim(),
            isRead: false,
            sentAt: new Date().toISOString(),
        };

        setLocalMessages(prev => [...prev, newMessage]);
        setMessage("");
        clearTypingIndicator();
    };

    const handleTyping = () => {
        if (!currentRoom?._id) return;

        webSocketService.sendTyping(currentRoom._id, true);

        if (typingTimeout) clearTimeout(typingTimeout);

        const timeout = setTimeout(() => {
            if (currentRoom?._id) {
                webSocketService.sendTyping(currentRoom._id, false);
            }
        }, 1000);

        setTypingTimeout(timeout);
    };

    const clearTypingIndicator = () => {
        if (typingTimeout) clearTimeout(typingTimeout);
        if (currentRoom?._id) {
            webSocketService.sendTyping(currentRoom._id, false);
        }
        dispatch(clearTyping({ chatRoomId: currentRoom?._id || "" }));
    };

    const isUserMessage = (senderId: string) => {
        const userData = sessionStorage.getItem("user");
        if (!userData) return false;
        const user = JSON.parse(userData);
        return senderId === (user.id || user._id);
    };

    const formatTime = (dateString: string | Date) => {
        try {
            const date = new Date(dateString);
            return format(date, "HH:mm");
        } catch {
            return "";
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="relative w-[90%] max-w-2xl h-[80%] bg-white rounded-lg shadow-2xl flex flex-col min-h-0">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-gray-50 rounded-t-lg">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-blue-600" />
                        </div>

                        <div className="text-left">
                            <h3 className="font-semibold text-gray-900">
                                Trò chuyện với chủ sân
                            </h3>
                            <p className="text-sm text-gray-600">
                                Về sân: {fieldName}
                            </p>

                            {!currentRoom && (
                                <p className="text-xs text-yellow-600 mt-1">
                                    Phòng chat sẽ được tạo khi bạn gửi tin nhắn đầu tiên
                                </p>
                            )}
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="hover:bg-gray-200"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 min-h-0 p-4 overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-8">Đang tải cuộc trò chuyện...</div>
                    ) : localMessages.length === 0 ? (
                        <div className="text-center text-gray-500 mt-10">
                            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h4 className="font-medium mb-2">Bắt đầu cuộc trò chuyện</h4>
                            <p className="text-sm">Gửi tin nhắn đầu tiên cho {fieldOwnerName}</p>
                            <p className="text-xs text-gray-500 mt-2">
                                Hãy hỏi về lịch trống, giá thuê hoặc bất kỳ thắc mắc nào khác
                            </p>
                        </div>
                    ) : (
                        localMessages.map((msg: Message, index: number) => {
                            const isCurrentUserMessage = isUserMessage(msg.sender);

                            return (
                                <div
                                    key={index}
                                    className={`flex mb-4 ${isCurrentUserMessage ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-lg p-3 ${isCurrentUserMessage
                                            ? "bg-blue-500 text-white rounded-br-none"
                                            : "bg-gray-100 text-gray-800 rounded-bl-none"
                                            }`}
                                    >
                                        <p className="text-sm">{msg.content}</p>
                                        <div className={`text-xs mt-1 flex justify-end ${isCurrentUserMessage ? "text-blue-200" : "text-gray-500"
                                            }`}>
                                            {formatTime(msg.sentAt)}
                                            {msg.isRead && isCurrentUserMessage && (
                                                <span className="ml-1">✓</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder={`Nhập tin nhắn gửi đến ${fieldOwnerName}...`}
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value);
                                handleTyping();
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            onBlur={clearTypingIndicator}
                            className="flex-1"
                        />
                        <Button
                            onClick={handleSendMessage}
                            disabled={!message.trim()}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        Nhấn Enter để gửi • Thường phản hồi trong vòng 24 giờ
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FieldDetailChatWindow;