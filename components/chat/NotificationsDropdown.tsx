'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { ChatNotification } from './ChatNotification';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function NotificationsDropdown() {
  const {
    notifications,
    unreadCount,
    markNotificationAsRead,
    clearAllNotifications,
    openChat,
  } = useChat();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notificationId: string, bookingId: string) => {
    markNotificationAsRead(notificationId);
    openChat(bookingId);
    setIsOpen(false);
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageCircle className="h-5 w-5" />
        <span className="ml-2">Notificaciones</span>
        {unreadCount > 0 && <ChatNotification count={unreadCount} />}
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[500px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-gray-700" />
              <h3 className="font-semibold text-gray-900">
                Notificaciones
                {unreadNotifications.length > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({unreadNotifications.length} nuevas)
                  </span>
                )}
              </h3>
            </div>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearAllNotifications();
                  setIsOpen(false);
                }}
                className="text-xs"
              >
                Limpiar todo
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No tienes notificaciones</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const senderName = notification.message.sender
                    ? `${notification.message.sender.firstName} ${notification.message.sender.lastName}`
                    : 'Usuario';
                  const serviceName = notification.message.booking?.service?.title || 'Servicio';
                  const messagePreview = notification.message.content.length > 80
                    ? `${notification.message.content.substring(0, 80)}...`
                    : notification.message.content;

                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id, notification.message.bookingId)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            !notification.isRead ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <MessageCircle className={`w-5 h-5 ${
                              !notification.isRead ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`font-semibold text-sm ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {senderName}
                            </p>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 font-medium mb-1">
                            {serviceName}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2 break-words mb-1">
                            {messagePreview}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: es })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
