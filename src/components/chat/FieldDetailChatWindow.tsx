import React, { useState, useEffect, useRef } from "react";
import { Search, Send, X, MessageCircle, User, Building } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hook";
import { getChatRoom, markAsRead } from "@/features/chat/chatThunk";
import { setCurrentRoom, clearTyping } from "@/features/chat/chatSlice";
import { webSocketService } from "@/features/chat/websocket.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import type { ChatRoom, Message } from "@/features/chat/chat-type";
import axiosPrivate from "@/utils/axios/axiosPrivate";

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

    const { currentRoom, loading, typingUsers } = useAppSelector((state) => state.chat);
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);

    useEffect(() => {
        if (isOpen && user) {
            // Initialize WebSocket connection
            const token = sessionStorage.getItem("access_token");
            if (token) {
                webSocketService.connect(token);
            }
        }
    }, [isOpen, user]);

    useEffect(() => {
        if (currentRoom?.messages) {
            console.log('Current room messages:', currentRoom.messages); // Debug log
            setLocalMessages(currentRoom.messages);
        }
    }, [currentRoom?.messages]);

    useEffect(() => {
        if (isOpen && currentRoom?._id) { // Add optional chaining
            webSocketService.joinChatRoom(currentRoom._id);
            dispatch(markAsRead(currentRoom._id));
            webSocketService.markAsRead(currentRoom._id);
        }
    }, [isOpen, currentRoom, dispatch]);

    useEffect(() => {
        if (isOpen && currentRoom && currentRoom.messages) {
            scrollToBottom();
        }
    }, [isOpen, currentRoom?.messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        // If no chat room exists yet, create one first
        if (!currentRoom?._id) { // Check for _id
            try {
                // Create chat room
                const response = await axiosPrivate.post('/chat/start', {
                    fieldOwnerId,
                    fieldId,
                });

                const newRoom = response.data;
                dispatch(setCurrentRoom(newRoom));

                // Join the room
                if (webSocketService.isConnected()) {
                    webSocketService.joinChatRoom(newRoom._id);
                }

                // Send the first message
                webSocketService.sendMessage({
                    chatRoomId: newRoom._id,
                    content: message.trim(),
                    type: "text",
                });
            } catch (error) {
                console.error("Failed to create chat room:", error);
                alert("Failed to send message. Please try again.");
                return;
            }
        } else {
            // Existing room, just send message
            webSocketService.sendMessage({
                chatRoomId: currentRoom._id, // This should now be valid
                content: message.trim(),
                type: "text",
            });
        }

        setMessage("");
        clearTypingIndicator();
    };
    const handleTyping = () => {
        if (!currentRoom) return;

        webSocketService.sendTyping(currentRoom._id, true);

        if (typingTimeout) clearTimeout(typingTimeout);

        const timeout = setTimeout(() => {
            webSocketService.sendTyping(currentRoom._id, false);
        }, 1000);

        setTypingTimeout(timeout);
    };

    const clearTypingIndicator = () => {
        if (typingTimeout) clearTimeout(typingTimeout);
        if (currentRoom) {
            webSocketService.sendTyping(currentRoom._id, false);
        }
        dispatch(clearTyping({ chatRoomId: currentRoom?._id || "" }));
    };

    const isUserMessage = (senderId: string) => {
        return senderId === user?.id;
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
            <div className="relative w-[90%] max-w-2xl h-[80%] bg-white rounded-lg shadow-2xl flex flex-col">
                {/* Header */}
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-gray-50 rounded-t-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Building className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Chat with {fieldOwnerName}</h3>
                            <p className="text-sm text-gray-600">About: {fieldName}</p>
                            {!currentRoom && (
                                <p className="text-xs text-yellow-600 mt-1">
                                    Chat room will be created when you send your first message
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
                <ScrollArea className="flex-1 p-4">
                    {loading ? (
                        <div className="text-center py-8">Initializing chat...</div>
                    ) : !currentRoom ? (
                        <div className="text-center text-gray-500 mt-10">
                            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h4 className="font-medium mb-2">Start a conversation</h4>
                            <p className="text-sm">Send your first message to {fieldOwnerName}</p>
                            <p className="text-xs text-gray-500 mt-2">
                                Ask about availability, pricing, or any other questions
                            </p>
                            <p className="text-xs text-blue-500 mt-1">
                                Chat room will be created automatically
                            </p>
                        </div>
                    ) : (
                        // Safe check for messages
                        <>
                            {(currentRoom.messages || []).length === 0 ? (
                                <div className="text-center text-gray-500 mt-10">
                                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h4 className="font-medium mb-2">No messages yet</h4>
                                    <p className="text-sm">Start the conversation with {fieldOwnerName}</p>
                                </div>
                            ) : (
                                currentRoom.messages.map((msg: Message, index: number) => {
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
                                                <div
                                                    className={`text-xs mt-1 flex justify-end ${isCurrentUserMessage ? "text-blue-200" : "text-gray-500"
                                                        }`}
                                                >
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
                        </>
                    )}
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder={`Type your message to ${fieldOwnerName}...`}
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
                        Press Enter to send • Responds within 24 hours
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FieldDetailChatWindow;

function setLocalMessages(messages: Message[]) {
    throw new Error("Function not implemented.");
}
