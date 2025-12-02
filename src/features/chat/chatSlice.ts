import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ChatState, ChatRoom, SocketMessageEvent, TypingEvent } from "./chat-type";
import {
  getChatRooms,
  getChatRoom,
  startChat,
  markAsRead,
  getUnreadCount,
} from "./chatThunk";

const initialState: ChatState = {
  rooms: [],
  currentRoom: null,
  loading: false,
  error: null,
  unreadCount: 0,
  connected: false,
  typingUsers: {},
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setCurrentRoom: (state, action: PayloadAction<ChatRoom | null>) => {
      state.currentRoom = action.payload;
    },
    addMessage: (state, action: PayloadAction<SocketMessageEvent>) => {
      const { chatRoomId, message, chatRoom } = action.payload;
      
      // Update current room if active
      if (state.currentRoom?._id === chatRoomId) {
        state.currentRoom.messages.push(message);
        state.currentRoom.lastMessageAt = new Date().toISOString();
        state.currentRoom.lastMessageBy = message.sender;
      }

      // Update rooms list
      const roomIndex = state.rooms.findIndex(room => room._id === chatRoomId);
      if (roomIndex !== -1) {
        state.rooms[roomIndex] = {
          ...chatRoom,
          hasUnread: state.currentRoom?._id !== chatRoomId,
        };
        
        // Move to top
        const updatedRoom = state.rooms.splice(roomIndex, 1)[0];
        state.rooms.unshift(updatedRoom);
      } else {
        // Add new room
        state.rooms.unshift(chatRoom);
      }

      // Update unread count
      if (state.currentRoom?._id !== chatRoomId) {
        state.unreadCount += 1;
      }
    },
    setTyping: (state, action: PayloadAction<TypingEvent>) => {
      const { userId, isTyping, chatRoomId } = action.payload;
      if (state.currentRoom?._id === chatRoomId) {
        state.typingUsers[userId] = isTyping;
      }
    },
    clearTyping: (state, action: PayloadAction<{ chatRoomId: string }>) => {
      if (state.currentRoom?._id === action.payload.chatRoomId) {
        state.typingUsers = {};
      }
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
    updateUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetChatState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getChatRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getChatRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(getChatRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getChatRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getChatRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRoom = action.payload;
      })
      .addCase(getChatRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(startChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startChat.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRoom = action.payload;
        // Add to rooms if not already there
        if (!state.rooms.find(room => room._id === action.payload._id)) {
          state.rooms.unshift(action.payload);
        }
      })
      .addCase(startChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.count;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        // action.meta.arg can be either a string (chatRoomId) or an object { chatRoomId: string }
        const chatRoomId =
          typeof action.meta.arg === "string"
            ? action.meta.arg
            : (action.meta.arg as { chatRoomId?: string }).chatRoomId;

        if (!chatRoomId) return;

        if (state.currentRoom?._id === chatRoomId) {
          state.currentRoom.messages.forEach(msg => {
            msg.isRead = true;
          });
          state.currentRoom.hasUnread = false;
        }
        
        // Update in rooms list
        const roomIndex = state.rooms.findIndex(room => room._id === chatRoomId);
        if (roomIndex !== -1) {
          state.rooms[roomIndex].hasUnread = false;
          state.rooms[roomIndex].messages.forEach(msg => {
            msg.isRead = true;
          });
        }
        
        // Update unread count
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      });
  },
});

export const {
  setCurrentRoom,
  addMessage,
  setTyping,
  clearTyping,
  setConnected,
  updateUnreadCount,
  clearError,
  resetChatState,
} = chatSlice.actions;

export default chatSlice.reducer;