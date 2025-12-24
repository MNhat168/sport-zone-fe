import { io, Socket } from "socket.io-client";
import { store } from "@/store/store";
import { addMessage, setTyping, setConnected } from "./chatSlice";
import { BASE_URL } from "@/utils/constant-value/constant";

class WebSocketService {
  private socket: Socket | null = null;
  private isConnecting = false;

  connect() {
    if (this.socket?.connected || this.isConnecting) return;

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

    this.isConnecting = true;

    const apiUrl = BASE_URL || "http://localhost:3000";
    this.socket = io(`${apiUrl}/chat`, {
      auth: { userId },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("WebSocket connected");
      store.dispatch(setConnected(true));
      this.isConnecting = false;
    });

    this.socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
      store.dispatch(setConnected(false));
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      this.isConnecting = false;
    });

    // Listen for messages
    this.socket.on("new_message", (data) => {
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
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      store.dispatch(setConnected(false));
    }
  }

  joinChatRoom(chatRoomId: string) {
    if (this.socket?.connected) {
      this.socket.emit("join_chat", { chatRoomId });
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
    if (this.socket?.connected) {
      this.socket.emit("send_message_to_room", { chatRoomId, content, type, attachments });
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const webSocketService = new WebSocketService();