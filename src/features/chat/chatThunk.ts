import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosPrivate from "../../utils/axios/axiosPrivate";
import {
    START_CHAT_API,
    GET_CHAT_ROOMS_API,
    GET_CHAT_ROOM_API,
    MARK_AS_READ_API,
    UNREAD_COUNT_API,
} from "./chatAPI";
import type { ChatRoom, StartChatPayload } from "./chat-type";

export const startChat = createAsyncThunk(
    "chat/startChat",
    async (payload: StartChatPayload, { rejectWithValue }) => {
        try {
            const response = await axiosPrivate.post(START_CHAT_API, payload);
            return response.data as ChatRoom;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || "Failed to start chat"
            );
        }
    }
);

// In chatThunk.ts - getChatRooms
export const getChatRooms = createAsyncThunk(
    "chat/getChatRooms",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosPrivate.get(GET_CHAT_ROOMS_API);
            // Ensure response.data is an array
            const rooms = Array.isArray(response.data) ? response.data : [];
            return rooms as ChatRoom[];
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || "Failed to get chat rooms"
            );
        }
    }
);

export const getChatRoom = createAsyncThunk(
    "chat/getChatRoom",
    async (chatRoomId: string, { rejectWithValue }) => {
        try {
            const response = await axiosPrivate.get(GET_CHAT_ROOM_API(chatRoomId));
            return response.data as ChatRoom;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || "Failed to get chat room"
            );
        }
    }
);

export const markAsRead = createAsyncThunk(
    "chat/markAsRead",
    async (chatRoomId: string, { rejectWithValue }) => {
        try {
            await axiosPrivate.patch(MARK_AS_READ_API(chatRoomId));
            return { chatRoomId };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || "Failed to mark as read"
            );
        }
    }
);

export const getUnreadCount = createAsyncThunk(
    "chat/getUnreadCount",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosPrivate.get(UNREAD_COUNT_API);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || "Failed to get unread count"
            );
        }
    }
);