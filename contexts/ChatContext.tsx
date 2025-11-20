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
import { toast } from 'sonner';
import { ChatNotificationToast } from '@/components/chat/ChatNotificationToast';

export interface ChatNotificationItem {
  id: string;
  message: Message;
  timestamp: Date;
  isRead: boolean;
}

interface ChatContextType {
  socket: Socket | null;
  isConnected: boolean;
  currentChatBookingId: string | null;
  messages: Message[];
  typingUsers: Map<string, boolean>;
  unreadCount: number;
  notifications: ChatNotificationItem[];
  openChat: (bookingId: string) => void;
  closeChat: () => void;
  sendMessage: (content: string) => void;
  setTyping: (isTyping: boolean) => void;
  markMessagesAsRead: (messageIds: string[]) => void;
  refreshUnreadCount: () => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearAllNotifications: () => void;
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
  const [notifications, setNotifications] = useState<ChatNotificationItem[]>([]);

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const socketInstance = getSocket();
      setSocket(socketInstance);

      // Setup socket event listeners
      const handleConnect = () => {
        console.log('Chat socket connected');
        setIsConnected(true);
        // Request unread count on connect
        socketInstance.emit('get_unread_count');
      };

      const handleDisconnect = () => {
        console.log('Chat socket disconnected');
        setIsConnected(false);
      };

      const handleReconnect = () => {
        console.log('Chat socket reconnected');
        setIsConnected(true);
        // Re-join current chat room if any
        if (currentChatBookingId) {
          socketInstance.emit('join_booking_chat', { bookingId: currentChatBookingId });
        }
        // Request unread count on reconnect
        socketInstance.emit('get_unread_count');
      };

      const handleChatHistory = (data: ChatHistory) => {
        setMessages(data.messages);
      };

      const handleNewMessage = (message: Message) => {
        setMessages((prev) => [...prev, message]);

        // If message is not from current user, increment unread count
        if (message.senderId !== user.id) {
          setUnreadCount((prev) => prev + 1);

          // Show notification if no chat is currently open OR if the message is from a different booking
          const shouldNotify = currentChatBookingId === null || currentChatBookingId !== message.bookingId;

          if (shouldNotify) {
            // Add to notifications list
            const notification: ChatNotificationItem = {
              id: `${message.id}-${Date.now()}`,
              message,
              timestamp: new Date(),
              isRead: false,
            };

            setNotifications((prev) => [notification, ...prev].slice(0, 50)); // Keep last 50 notifications

            // Show toast notification with custom component and action button
            toast(<ChatNotificationToast message={message} />, {
              duration: 6000,
              action: {
                label: 'Abrir Chat',
                onClick: () => {
                  // Leave previous chat if any
                  if (currentChatBookingId) {
                    socketInstance.emit('leave_booking_chat', { bookingId: currentChatBookingId });
                  }

                  // Join the new chat
                  socketInstance.emit('join_booking_chat', { bookingId: message.bookingId });
                  setCurrentChatBookingId(message.bookingId);
                  setMessages([]);
                  setTypingUsers(new Map());
                },
              },
            });
          }
        }
      };

      const handleUserTyping = (data: TypingStatus) => {
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
      };

      const handleMessagesRead = ({ messageIds }: { messageIds: string[] }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
          )
        );
      };

      const handleUnreadCount = ({ count }: { count: number }) => {
        setUnreadCount(count);
      };

      const handleError = (error: { message: string }) => {
        console.error('Socket error:', error.message);
      };

      // Register event listeners
      socketInstance.on('connect', handleConnect);
      socketInstance.on('disconnect', handleDisconnect);
      socketInstance.on('reconnect', handleReconnect);
      socketInstance.on('chat_history', handleChatHistory);
      socketInstance.on('new_message', handleNewMessage);
      socketInstance.on('user_typing', handleUserTyping);
      socketInstance.on('messages_read', handleMessagesRead);
      socketInstance.on('unread_count', handleUnreadCount);
      socketInstance.on('error', handleError);

      return () => {
        // Clean up all event listeners to prevent memory leaks
        socketInstance.off('connect', handleConnect);
        socketInstance.off('disconnect', handleDisconnect);
        socketInstance.off('reconnect', handleReconnect);
        socketInstance.off('chat_history', handleChatHistory);
        socketInstance.off('new_message', handleNewMessage);
        socketInstance.off('user_typing', handleUserTyping);
        socketInstance.off('messages_read', handleMessagesRead);
        socketInstance.off('unread_count', handleUnreadCount);
        socketInstance.off('error', handleError);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // Emit leave event if socket is connected and we have a chat open
    if (socket && currentChatBookingId) {
      socket.emit('leave_booking_chat', { bookingId: currentChatBookingId });
    }

    // Always reset state, even if socket is disconnected or chat is already closed
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

  // Mark notification as read
  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: ChatContextType = {
    socket,
    isConnected,
    currentChatBookingId,
    messages,
    typingUsers,
    unreadCount,
    notifications,
    openChat,
    closeChat,
    sendMessage,
    setTyping,
    markMessagesAsRead,
    refreshUnreadCount,
    markNotificationAsRead,
    clearAllNotifications,
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
