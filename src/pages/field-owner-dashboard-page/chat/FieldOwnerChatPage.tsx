import React, { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hook";
import { getChatRooms, getChatRoom, markAsRead, getFieldOwnerChatRooms } from "@/features/chat/chatThunk";
import { setCurrentRoom } from "@/features/chat/chatSlice";
import { webSocketService } from "@/features/chat/websocket.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MessageCircle, User, Calendar, MapPin, Send, X, Building } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import type { Message } from "@/features/chat/chat-type";
import axiosPrivate from "@/utils/axios/axiosPrivate";
import { fetchFieldOwnerProfile } from "@/features/field-owner-profile/ownerProfileThunk";

const FieldOwnerChatDashboard: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "with-bookings">("all");
    const [message, setMessage] = useState("");
    const [localMessages, setLocalMessages] = useState<Message[]>([]);

     const [fieldOwnerProfile, setFieldOwnerProfile] = useState<any>(null); // Local state
    const { rooms, currentRoom, loading, unreadCount, typingUsers } = useAppSelector((state) => state.chat);
    const dispatch = useAppDispatch();
    const fieldOwnerData = sessionStorage.getItem("user");
    const fieldOwner = fieldOwnerData ? JSON.parse(fieldOwnerData) : null;
    const fieldOwnerId = fieldOwner?.id || fieldOwner?._id;

    // Update the filteredRooms function
    const filteredRooms = Array.isArray(rooms)
        ? rooms.filter(room => {
            // Basic validation
            if (!room || !room.fieldOwner) return false;

            // The backend should have already filtered rooms for this field owner
            // So we can trust all rooms in the array belong to the current user

            // Rest of filtering...
            const userName = room?.user?.fullName || "";
            const fieldName = room?.field?.name || "";

            const matchesSearch =
                userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                fieldName.toLowerCase().includes(searchQuery.toLowerCase());

            if (activeFilter === "unread" && !room.hasUnread) return false;
            if (activeFilter === "with-bookings" && !room.bookingId) return false;

            return matchesSearch;
        })
        : [];

    // After fetching rooms, add this:
    useEffect(() => {
        console.log('Rooms fetched:', rooms);
        console.log('Field Owner Profile:', fieldOwnerProfile);
        console.log('Field Owner ID from session:', fieldOwnerId);

        // Log each room's fieldOwner ID
        rooms.forEach((room, index) => {
            console.log(`Room ${index}: fieldOwner._id = ${room.fieldOwner?._id}`);
        });
    }, [rooms, fieldOwnerProfile, fieldOwnerId]);

    const fetchFieldOwnerProfile = async (userId: string) => {
        try {
            // Use axiosPrivate since this requires authentication
            const response = await axiosPrivate.get(`/field-owner/profile/`);
            return response.data;
        } catch (error) {
            console.error("Error fetching field owner profile:", error);
            return null;
        }
    };

    useEffect(() => {
        const userData = sessionStorage.getItem("user");
        if (!userData) return;

        const user = JSON.parse(userData);
        const userId = user.id || user._id;

        fetchFieldOwnerProfile(userId).then(profile => {
            if (profile) {
                // You might want to store this in state or context
                console.log("Field owner profile:", profile);
            }
        });
    }, []);

// In FieldOwnerChatPage.tsx, update the useEffect for fetching profile:

useEffect(() => {
    // Get user data from sessionStorage
    const userData = sessionStorage.getItem("user");
    if (!userData) {
        console.error("No user data found in sessionStorage");
        return;
    }

    const user = JSON.parse(userData);
    const userId = user.id || user._id;

    if (!userId) {
        console.error("No user ID found in sessionStorage");
        return;
    }

    // Connect to WebSocket
    webSocketService.connect();

    // Fetch field owner profile first
    const fetchProfileAndRooms = async () => {
        try {
            const response = await axiosPrivate.get(`/field-owner/profile/`);
            if (response.data.success) {
                const profile = response.data.data;
                setFieldOwnerProfile(profile);
                console.log('Field Owner Profile loaded:', profile);
                
                // Now fetch chat rooms using the profile ID
                // We need to dispatch an action that uses the profile ID
                // Since getFieldOwnerChatRooms doesn't take parameters, we need to adjust
                
                // Temporary solution: Refetch the endpoint directly
                const roomsResponse = await axiosPrivate.get('/chat/field-owner/rooms');
                if (roomsResponse.data) {
                    // Dispatch to Redux manually or update state
                    console.log('Chat rooms fetched:', roomsResponse.data);
                }
            }
        } catch (error) {
            console.error("Error fetching field owner profile:", error);
        }
    };

    fetchProfileAndRooms();

    // Also try the standard dispatch
    dispatch(getFieldOwnerChatRooms());
}, [dispatch]);


    useEffect(() => {
        if (currentRoom?.messages) {
            setLocalMessages(currentRoom.messages);
        } else {
            setLocalMessages([]);
        }
    }, [currentRoom?.messages]);

    const handleRoomClick = (room: any) => {
        dispatch(setCurrentRoom(room));
        dispatch(getChatRoom(room._id));
        if (room.hasUnread) {
            dispatch(markAsRead(room._id));
        }
        // Join WebSocket room
        webSocketService.joinChatRoom(room._id);
    };

    const getUnreadCountForRoom = (roomId: string) => {
        const room = rooms.find(r => r._id === roomId);
        if (!room || !room.messages) return 0;

        // Count unread messages sent by the user (not field owner)
        return room.messages.filter(msg =>
            !msg.isRead &&
            msg.sender !== fieldOwnerProfile?.id
        ).length || 0;
    };

    const handleSendMessage = async () => {
        if (!message.trim() || !currentRoom) return;

        // Send message via WebSocket
        webSocketService.sendMessage({
            fieldOwnerId: currentRoom.fieldOwner._id,
            fieldId: currentRoom.field?._id || "",
            content: message.trim(),
            type: "text",
        });

        // Add message locally for immediate display
        const newMessage: Message = {
            sender: fieldOwnerProfile?.id || "",
            type: 'text',
            content: message.trim(),
            isRead: false,
            sentAt: new Date().toISOString(),
        };

        setLocalMessages(prev => [...prev, newMessage]);
        setMessage("");
    };

    const isUserMessage = (senderId: string) => {
        return senderId !== fieldOwnerProfile?.id;
    };

    const formatTime = (dateString: string | Date) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diff = now.getTime() - date.getTime();
            const diffMinutes = Math.floor(diff / (1000 * 60));
            const diffHours = Math.floor(diff / (1000 * 60 * 60));
            const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

            if (diffMinutes < 1) return "Just now";
            if (diffMinutes < 60) return `${diffMinutes}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays === 1) return "Yesterday";
            if (diffDays < 7) return `${diffDays}d ago`;
            return format(date, "MMM d");
        } catch {
            return "";
        }
    };

    const formatMessageTime = (dateString: string | Date) => {
        try {
            const date = new Date(dateString);
            return format(date, "HH:mm");
        } catch {
            return "";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                    <p className="text-gray-600 mt-2">
                        Communicate with customers about bookings, inquiries, and support
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                        <Badge className="bg-blue-500">
                            {unreadCount} unread messages
                        </Badge>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                            {filteredRooms.filter(r => r.status === "active").length} active conversations
                        </Badge>
                        {fieldOwnerProfile && (
                            <Badge variant="outline" className="text-gray-600">
                                Field Owner: {fieldOwnerProfile.facilityName}
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left sidebar - Chat list */}
                    <div className="lg:col-span-1 bg-white rounded-lg shadow border">
                        {/* Search and filters */}
                        <div className="p-4 border-b">
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <div className="flex gap-2">
                                {["all", "unread", "with-bookings"].map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter as any)}
                                        className={`px-3 py-1.5 text-sm rounded-full ${activeFilter === filter
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                    >
                                        {filter === "all" && "All Chats"}
                                        {filter === "unread" && "Unread"}
                                        {filter === "with-bookings" && "With Bookings"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chat list */}
                        <ScrollArea className="h-[600px]">
                            {loading ? (
                                <div className="p-8 text-center text-gray-500">Loading conversations...</div>
                            ) : filteredRooms.length === 0 ? (
                                <div className="p-8 text-center">
                                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                                    <p className="text-gray-500">
                                        When customers message you, conversations will appear here
                                    </p>
                                    {searchQuery && (
                                        <p className="text-sm text-gray-400 mt-2">
                                            Try clearing your search to see all conversations
                                        </p>
                                    )}
                                </div>
                            ) : (
                                filteredRooms.map((room) => {
                                    const unreadCount = getUnreadCountForRoom(room._id);
                                    const lastMessage = room.messages?.[room.messages.length - 1];

                                    return (
                                        <div
                                            key={room._id}
                                            onClick={() => handleRoomClick(room)}
                                            className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${currentRoom?._id === room._id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <Avatar>
                                                    <AvatarImage src={room.user?.avatarUrl} />
                                                    <AvatarFallback>
                                                        {room.user?.fullName?.charAt(0) || "U"}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-semibold text-gray-900 truncate">
                                                            {room.user?.fullName || "Unknown User"}
                                                        </h4>
                                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                                            {formatTime(room.lastMessageAt)}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm text-gray-600 truncate mt-1">
                                                        {lastMessage?.content || "No messages yet"}
                                                    </p>

                                                    <div className="flex items-center gap-3 mt-2">
                                                        {room.field && (
                                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                <MapPin className="w-3 h-3" />
                                                                <span>{room.field.name}</span>
                                                            </div>
                                                        )}

                                                        {room.bookingId && (
                                                            <div className="flex items-center gap-1 text-xs text-blue-600">
                                                                <Calendar className="w-3 h-3" />
                                                                <span>Has Booking</span>
                                                            </div>
                                                        )}

                                                        {room.field?.sportType && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {room.field.sportType}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                {unreadCount > 0 && (
                                                    <Badge className="bg-blue-500 text-white min-w-5 h-5 flex items-center justify-center">
                                                        {unreadCount}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </ScrollArea>
                    </div>

                    {/* Right side - Chat interface or placeholder */}
                    <div className="lg:col-span-2">
                        {currentRoom ? (
                            <div className="bg-white rounded-lg shadow border h-full flex flex-col">
                                {/* Chat header */}
                                <div className="p-4 border-b">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={currentRoom.user?.avatarUrl} />
                                                <AvatarFallback>
                                                    {currentRoom.user?.fullName?.charAt(0) || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {currentRoom.user?.fullName || "Unknown User"}
                                                </h3>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {currentRoom.user?.phone || "No phone"}
                                                    </span>
                                                    {currentRoom.field && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {currentRoom.field.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {currentRoom.bookingId && (
                                                <button className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200">
                                                    View Booking
                                                </button>
                                            )}
                                            <button className="px-3 py-1.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50">
                                                View Profile
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages area */}
                                <ScrollArea className="flex-1 p-4">
                                    {localMessages.length === 0 ? (
                                        <div className="text-center text-gray-500 mt-10">
                                            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <h4 className="font-medium mb-2">Start the conversation</h4>
                                            <p className="text-sm">Send your first message to {currentRoom.user?.fullName || "the customer"}</p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Ask about their needs, provide information, or answer questions
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {localMessages.map((msg: Message, index: number) => {
                                                const isCustomerMessage = isUserMessage(msg.sender);
                                                const isRead = msg.isRead;

                                                return (
                                                    <div
                                                        key={index}
                                                        className={`flex ${isCustomerMessage ? "justify-start" : "justify-end"
                                                            }`}
                                                    >
                                                        <div
                                                            className={`max-w-[70%] rounded-lg p-3 ${isCustomerMessage
                                                                ? "bg-gray-100 text-gray-800 rounded-bl-none"
                                                                : "bg-blue-500 text-white rounded-br-none"
                                                                }`}
                                                        >
                                                            <p className="text-sm">{msg.content}</p>
                                                            <div className={`text-xs mt-1 flex justify-end ${isCustomerMessage ? "text-gray-500" : "text-blue-200"
                                                                }`}>
                                                                {formatMessageTime(msg.sentAt)}
                                                                {!isCustomerMessage && isRead && (
                                                                    <span className="ml-1">✓</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {/* Typing indicator */}
                                            {Object.entries(typingUsers).some(([userId, isTyping]) =>
                                                isTyping && userId !== fieldOwnerProfile?.id
                                            ) && (
                                                    <div className="flex justify-start">
                                                        <div className="max-w-[70%] rounded-lg p-3 bg-gray-100 text-gray-800 rounded-bl-none">
                                                            <div className="flex space-x-1">
                                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </ScrollArea>

                                {/* Message input */}
                                <div className="p-4 border-t">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            placeholder="Type your message..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                            className="flex-1"
                                        />
                                        <Button
                                            onClick={handleSendMessage}
                                            disabled={!message.trim()}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 text-center">
                                        Respond within 24 hours for best customer service
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow border h-full flex flex-col items-center justify-center p-8">
                                <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Select a conversation
                                </h3>
                                <p className="text-gray-600 text-center max-w-md">
                                    Choose a conversation from the list to view messages and respond to customers.
                                    You can search by customer name or field name.
                                </p>

                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
                                    <div className="p-4 border rounded-lg bg-blue-50">
                                        <h4 className="font-medium text-blue-700 mb-2">Quick Tips</h4>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            <li>• Respond within 24 hours</li>
                                            <li>• Be clear about pricing</li>
                                            <li>• Share booking terms</li>
                                            <li>• Confirm availability</li>
                                        </ul>
                                    </div>

                                    <div className="p-4 border rounded-lg bg-green-50">
                                        <h4 className="font-medium text-green-700 mb-2">Stats</h4>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>• {filteredRooms.length} total conversations</p>
                                            <p>• {filteredRooms.filter(r => r.hasUnread).length} unread conversations</p>
                                            <p>• {filteredRooms.filter(r => r.bookingId).length} with bookings</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FieldOwnerChatDashboard;