import { io, Socket } from "socket.io-client";
import { store } from "@/store/store";
import { addMessage, setTyping, setConnected } from "./chatSlice";

class WebSocketService {
  private socket: Socket | null = null;
  private isConnecting = false;

  connect(token: string) {
    if (this.socket?.connected || this.isConnecting) return;

    this.isConnecting = true;

    const baseUrl = (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3000";
    this.socket = io(`${baseUrl}/chat`, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("[WS] connected", { id: this.socket?.id });
      store.dispatch(setConnected(true));
      this.isConnecting = false;
    });

    this.socket.on("disconnect", (reason) => {
      console.warn("[WS] disconnected", { reason });
      store.dispatch(setConnected(false));
    });

    this.socket.on("connect_error", (error) => {
      console.error("[WS] connect_error", error);
      this.isConnecting = false;
    });

    // Listen for messages
    this.socket.on("new_message", (data) => {
      console.log("[WS] new_message", data);
      store.dispatch(addMessage(data));
    });

    this.socket.on("user_typing", (data) => {
      console.log("[WS] user_typing", data);
      store.dispatch(setTyping(data));
    });

    this.socket.on("messages_read", (data) => {
      console.log("[WS] messages_read", data);
    });

    this.socket.on("message_notification", (data) => {
      console.log("[WS] message_notification", data);
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
      console.log("[WS] emit join_chat", { chatRoomId });
      this.socket.emit("join_chat", { chatRoomId });
    }
  }

  sendMessage(data: {
    chatRoomId: string;
    content: string;
    type?: string;
    attachments?: string[];
    clientId?: string;
  }) {
    if (this.socket?.connected) {
      console.log("[WS] emit send_message", data);
      this.socket.emit("send_message", data);
    }
  }

  sendTyping(chatRoomId: string, isTyping: boolean) {
    if (this.socket?.connected) {
      console.log("[WS] emit typing", { chatRoomId, isTyping });
      this.socket.emit("typing", { chatRoomId, isTyping });
    }
  }

  markAsRead(chatRoomId: string) {
    if (this.socket?.connected) {
      console.log("[WS] emit read_messages", { chatRoomId });
      this.socket.emit("read_messages", { chatRoomId });
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const webSocketService = new WebSocketService();