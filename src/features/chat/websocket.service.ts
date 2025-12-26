import { io, Socket } from "socket.io-client";
import { store } from "@/store/store";
import { addMessage, setTyping, setConnected } from "./chatSlice";
import { BASE_URL } from "@/utils/constant-value/constant";

class WebSocketService {
  private socket: Socket | null = null;
  private isConnecting = false;

  connect() {
    console.log('🔌 [WebSocketService] connect() called', {
      alreadyConnected: this.socket?.connected,
      isConnecting: this.isConnecting,
    });

    if (this.socket?.connected) {
      console.log('⏭️ [WebSocketService] Already connected, skipping');
      return;
    }

    // If stuck in connecting state, reset after checking actual socket state
    if (this.isConnecting && this.socket && !this.socket.connected) {
      console.warn('⚠️ [WebSocketService] Was in connecting state but socket not connected, resetting...');
      this.isConnecting = false;
    }

    if (this.isConnecting) {
      console.log('⏭️ [WebSocketService] Already connecting, skipping');
      return;
    }

    // Get user data from sessionStorage
    const userData = sessionStorage.getItem("user");
    if (!userData) {
      console.error("❌ [WebSocketService] No user data found in sessionStorage");
      return;
    }

    const user = JSON.parse(userData);
    const userId = user.id || user._id;

    if (!userId) {
      console.error("❌ [WebSocketService] No user ID found in sessionStorage");
      return;
    }

    console.log('🔌 [WebSocketService] Initiating connection...', { userId });

    this.isConnecting = true;

    // Safety timeout: reset isConnecting after 10 seconds if still not connected
    setTimeout(() => {
      if (this.isConnecting && !this.socket?.connected) {
        console.warn('⚠️ [WebSocketService] Connection timeout, resetting isConnecting flag');
        this.isConnecting = false;
      }
    }, 10000);

    const apiUrl = BASE_URL;
    this.socket = io(`${apiUrl}/chat`, {
      auth: { userId },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("✅ [WebSocketService] Socket connected successfully");
      store.dispatch(setConnected(true));
      this.isConnecting = false;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 [WebSocketService] Socket disconnected:", reason);
      store.dispatch(setConnected(false));
      this.isConnecting = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ [WebSocketService] Connection error:", error);
      this.isConnecting = false;
    });

    // Listen for messages
    this.socket.on("new_message", (data) => {
      console.log('📨 [WebSocket] Received new_message event:', {
        chatRoomId: data.chatRoomId,
        chatRoomObjectId: data.chatRoom?._id,
        messageContent: data.message?.content?.substring(0, 30),
        sender: data.message?.sender,
        hasFieldOwner: !!data.chatRoom?.fieldOwner,
        hasCoach: !!data.chatRoom?.coach,
      });
      store.dispatch(addMessage(data));
    });

    this.socket.on("user_typing", (data) => {
      store.dispatch(setTyping(data));
    });

    this.socket.on("messages_read", (data) => {
      // Handle read receipt
      console.log("Messages read by:", data.userId);
    });

    this.socket.on("message_notification", (data) => {
      // Show browser notification
      if (Notification.permission === "granted") {
        new Notification("New Message", {
          body: data.message.content,
          icon: "/favicon.ico",
        });
      }
    });
  }

  disconnect() {
    console.log('🔌 [WebSocketService] Disconnecting socket...');
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    store.dispatch(setConnected(false));
  }

  // Force reset for logout
  reset() {
    console.log('🔄 [WebSocketService] Resetting service on logout');
    this.disconnect();
    this.socket = null;
    this.isConnecting = false;
  }

  joinChatRoom(chatRoomId: string) {
    if (this.socket?.connected) {
      console.log('🔗 [WebSocketService] Joining chat room:', chatRoomId);
      this.socket.emit("join_chat", { chatRoomId });
    } else {
      console.warn('⚠️ [WebSocketService] Cannot join room - socket not connected');
    }
  }

  leaveChatRoom(chatRoomId: string) {
    if (this.socket?.connected) {
      console.log('🚪 [WebSocketService] Leaving chat room:', chatRoomId);
      this.socket.emit("leave_chat", { chatRoomId });
    } else {
      console.warn('⚠️ [WebSocketService] Cannot leave room - socket not connected');
    }
  }

  sendMessage(data: {
    fieldOwnerId: string;
    fieldId?: string;
    content: string;
    type?: string;
    attachments?: string[];
  }) {
    if (this.socket?.connected) {
      this.socket.emit("send_message", data);
    }
  }

  sendTyping(chatRoomId: string, isTyping: boolean) {
    if (this.socket?.connected) {
      this.socket.emit("typing", { chatRoomId, isTyping });
    }
  }

  markAsRead(chatRoomId: string) {
    if (this.socket?.connected) {
      this.socket.emit("read_messages", { chatRoomId });
    }
  }

  sendMessageToRoom(chatRoomId: string, content: string, type: string = "text", attachments?: string[]) {
    console.log('📤 [WebSocketService] sendMessageToRoom called', {
      chatRoomId,
      contentLength: content?.length,
      isConnected: this.socket?.connected,
      hasSocket: !!this.socket,
    });

    if (this.socket?.connected) {
      console.log('✅ [WebSocketService] Emitting send_message_to_room event');
      this.socket.emit("send_message_to_room", { chatRoomId, content, type, attachments });
    } else {
      console.error('❌ [WebSocketService] Socket not connected!', {
        hasSocket: !!this.socket,
        connected: this.socket?.connected,
      });
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const webSocketService = new WebSocketService();