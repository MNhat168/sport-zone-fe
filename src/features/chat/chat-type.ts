export type MessageType = 'text' | 'image' | 'file' | 'system' | 'match_proposal';

export interface Message {
  _id?: string;
  sender: string;
  type: MessageType;
  content: string;
  attachments?: string[];
  isRead: boolean;
  sentAt: Date | string;
}

export interface ChatRoom {
  _id: string;
  user?: {
    _id: string;
    fullName: string;
    avatarUrl?: string;
    phone?: string;
  };
  fieldOwner?: {
    _id: string;
    facilityName: string;
    contactPhone?: string;
  };
  // Optional coach participant for coach chat rooms
  coach?: {
    _id: string;
    displayName?: string;
    contactPhone?: string;
  };
  participants?: any[];
  field?: {
    _id: string;
    name: string;
    images: string[];
    sportType: string;
    location?: any;
  };
  bookingId?: string;
  messages: Message[];
  status: 'active' | 'resolved' | 'archived';
  lastMessageAt: Date | string;
  hasUnread: boolean;
  lastMessageBy?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  // Matching/Group specific IDs
  matchId?: string;
  groupSessionId?: string;
  // Additional fields for floating widget
  actorType?: 'field' | 'coach' | 'match';
  actorName?: string;
  actorId?: string;
  actorAvatar?: string;
}

export interface StartChatPayload {
  fieldOwnerId: string;
  fieldId?: string;
  bookingId?: string;
}

export interface SendMessagePayload {
  chatRoomId: string;
  content: string;
  type?: MessageType;
  attachments?: string[];
}

export interface ChatState {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  loading: boolean;
  error: string | null;
  unreadCount: number;
  matchingUnreadCount: number;
  unreadPerMatch: Record<string, number>;
  connected: boolean;
  typingUsers: Record<string, boolean>;
  // Widget state
  widgetOpen: boolean;
  widgetView: 'list' | 'chat';
}

export interface SocketMessageEvent {
  chatRoomId: string;
  message: Message;
  chatRoom: ChatRoom;
}

export interface TypingEvent {
  chatRoomId: string;
  userId: string;
  isTyping: boolean;
}