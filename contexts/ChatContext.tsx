'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket } from '@/lib/socket';
import type {
  Message,
  ChatHistory,
  TypingStatus,
  SendMessageDto,
} from '@/types';
import { useAuth } from './AuthContext';

interface ChatContextType {
  socket: Socket | null;
  isConnected: boolean;
  currentChatBookingId: string | null;
  messages: Message[];
  typingUsers: Map<string, boolean>;
  unreadCount: number;
  openChat: (bookingId: string) => void;
  closeChat: () => void;
  sendMessage: (content: string) => void;
  setTyping: (isTyping: boolean) => void;
  markMessagesAsRead: (messageIds: string[]) => void;
  refreshUnreadCount: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentChatBookingId, setCurrentChatBookingId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map());
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const socketInstance = getSocket();
      setSocket(socketInstance);

      // Setup socket event listeners
      socketInstance.on('connect', () => {
        console.log('Chat socket connected');
        setIsConnected(true);
        // Request unread count on connect
        socketInstance.emit('get_unread_count');
      });

      socketInstance.on('disconnect', () => {
        console.log('Chat socket disconnected');
        setIsConnected(false);
      });

      // Listen for chat history
      socketInstance.on('chat_history', (data: ChatHistory) => {
        setMessages(data.messages);
      });

      // Listen for new messages
      socketInstance.on('new_message', (message: Message) => {
        setMessages((prev) => [...prev, message]);

        // If message is not from current user, increment unread count
        if (message.senderId !== user.id) {
          setUnreadCount((prev) => prev + 1);
        }
      });

      // Listen for typing events
      socketInstance.on('user_typing', (data: TypingStatus) => {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          newMap.set(data.userId, data.isTyping);
          // Remove after 3 seconds if isTyping is false
          if (!data.isTyping) {
            setTimeout(() => {
              setTypingUsers((current) => {
                const updatedMap = new Map(current);
                updatedMap.delete(data.userId);
                return updatedMap;
              });
            }, 3000);
          }
          return newMap;
        });
      });

      // Listen for messages read events
      socketInstance.on('messages_read', ({ messageIds }: { messageIds: string[] }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
          )
        );
      });

      // Listen for unread count updates
      socketInstance.on('unread_count', ({ count }: { count: number }) => {
        setUnreadCount(count);
      });

      // Listen for errors
      socketInstance.on('error', (error: { message: string }) => {
        console.error('Socket error:', error.message);
      });

      return () => {
        disconnectSocket();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      // Disconnect if user logs out
      if (socket) {
        disconnectSocket();
        setSocket(null);
        setIsConnected(false);
        setMessages([]);
        setCurrentChatBookingId(null);
        setTypingUsers(new Map());
        setUnreadCount(0);
      }
    }
  }, [isAuthenticated, user]);

  // Open chat for a specific booking
  const openChat = useCallback(
    (bookingId: string) => {
      if (!socket || !isConnected) {
        console.error('Socket not connected');
        return;
      }

      // Leave previous chat if any
      if (currentChatBookingId && currentChatBookingId !== bookingId) {
        socket.emit('leave_booking_chat', { bookingId: currentChatBookingId });
      }

      // Join new chat
      socket.emit('join_booking_chat', { bookingId });
      setCurrentChatBookingId(bookingId);
      setMessages([]);
      setTypingUsers(new Map());
    },
    [socket, isConnected, currentChatBookingId]
  );

  // Close current chat
  const closeChat = useCallback(() => {
    if (!socket || !currentChatBookingId) return;

    socket.emit('leave_booking_chat', { bookingId: currentChatBookingId });
    setCurrentChatBookingId(null);
    setMessages([]);
    setTypingUsers(new Map());
  }, [socket, currentChatBookingId]);

  // Send a message
  const sendMessage = useCallback(
    (content: string) => {
      if (!socket || !currentChatBookingId || !content.trim()) {
        return;
      }

      const messageData: SendMessageDto = {
        bookingId: currentChatBookingId,
        content: content.trim(),
      };

      socket.emit('send_message', messageData);
    },
    [socket, currentChatBookingId]
  );

  // Set typing status
  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!socket || !currentChatBookingId) return;

      socket.emit('typing', {
        bookingId: currentChatBookingId,
        isTyping,
      });
    },
    [socket, currentChatBookingId]
  );

  // Mark messages as read
  const markMessagesAsRead = useCallback(
    (messageIds: string[]) => {
      if (!socket || messageIds.length === 0) return;

      socket.emit('mark_messages_read', { messageIds });

      // Update local state
      setMessages((prev) =>
        prev.map((msg) =>
          messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
        )
      );

      // Decrease unread count
      setUnreadCount((prev) => Math.max(0, prev - messageIds.length));
    },
    [socket]
  );

  // Refresh unread count
  const refreshUnreadCount = useCallback(() => {
    if (!socket || !isConnected) return;

    socket.emit('get_unread_count');
  }, [socket, isConnected]);

  const value: ChatContextType = {
    socket,
    isConnected,
    currentChatBookingId,
    messages,
    typingUsers,
    unreadCount,
    openChat,
    closeChat,
    sendMessage,
    setTyping,
    markMessagesAsRead,
    refreshUnreadCount,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
