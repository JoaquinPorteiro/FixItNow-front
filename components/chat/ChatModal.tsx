'use client';

import { useEffect, useState } from 'react';
import { X, MessageCircle, Loader2 } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Booking } from '@/types';

interface ChatModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatModal({ booking, isOpen, onClose }: ChatModalProps) {
  const { user } = useAuth();
  const {
    isConnected,
    messages,
    typingUsers,
    openChat,
    closeChat,
    sendMessage,
    setTyping,
    markMessagesAsRead,
  } = useChat();

  const [isInitialized, setIsInitialized] = useState(false);

  // Open chat when modal opens and socket is connected
  useEffect(() => {
    if (isOpen && booking?.id) {
      if (isConnected) {
        // Socket is connected, open chat immediately
        openChat(booking.id);
        setIsInitialized(true);
      } else {
        // Socket not connected yet, wait for connection
        setIsInitialized(false);
      }
    }

    return () => {
      if (isInitialized) {
        closeChat();
        setIsInitialized(false);
      }
    };
  }, [isOpen, booking?.id, isConnected, isInitialized, openChat, closeChat]);

  // Mark unread messages as read when chat is viewed
  useEffect(() => {
    if (isOpen && user && messages.length > 0) {
      const unreadMessages = messages.filter(
        (msg) => !msg.isRead && msg.senderId !== user.id
      );

      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map((msg) => msg.id);
        markMessagesAsRead(messageIds);
      }
    }
  }, [isOpen, messages, user]);

  if (!isOpen) return null;

  // Determine who is the other participant
  const isConsumer = user?.id === booking.consumerId;
  const otherParticipant = isConsumer ? booking.service?.provider : booking.consumer;

  // Check if other user is typing
  const isOtherUserTyping = otherParticipant
    ? typingUsers.get(otherParticipant.id) || false
    : false;

  return (
    <>
      {/* Backdrop - Only visible on mobile, subtle on desktop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 sm:bg-transparent z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal - Floating chat window */}
      <div className="fixed bottom-0 right-0 sm:bottom-4 sm:right-4 w-full sm:w-[400px] h-[600px] bg-white rounded-t-lg sm:rounded-lg shadow-2xl border border-gray-300 z-50 flex flex-col animate-in slide-in-from-bottom-4 sm:slide-in-from-right-4 duration-300">
        {/* Header */}
        <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg sm:rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} />
            <div>
              <h3 className="font-semibold">
                Chat - {booking.service?.title}
              </h3>
              {otherParticipant && (
                <p className="text-xs text-blue-100">
                  {otherParticipant.firstName} {otherParticipant.lastName}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 rounded p-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 text-sm flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Conectando al chat...
          </div>
        )}

        {/* Messages Area */}
        {isConnected && isInitialized && user ? (
          <>
            <MessageList
              messages={messages}
              currentUserId={user.id}
              isTyping={isOtherUserTyping}
            />

            {/* Message Input */}
            <MessageInput
              onSendMessage={sendMessage}
              onTyping={setTyping}
              disabled={!isConnected}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Loader2 size={48} className="animate-spin mx-auto mb-4" />
              <p>Cargando chat...</p>
            </div>
          </div>
        )}

        {/* Booking Info Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-600">
          <p>
            <strong>Servicio:</strong> {booking.service?.title}
          </p>
          <p>
            <strong>Estado:</strong>{' '}
            <span
              className={`font-semibold ${
                booking.status === 'CONFIRMED'
                  ? 'text-green-600'
                  : booking.status === 'PENDING'
                  ? 'text-yellow-600'
                  : booking.status === 'COMPLETED'
                  ? 'text-blue-600'
                  : 'text-red-600'
              }`}
            >
              {booking.status === 'CONFIRMED' && 'Confirmada'}
              {booking.status === 'PENDING' && 'Pendiente'}
              {booking.status === 'COMPLETED' && 'Completada'}
              {booking.status === 'CANCELLED' && 'Cancelada'}
            </span>
          </p>
        </div>
      </div>
    </>
  );
}
