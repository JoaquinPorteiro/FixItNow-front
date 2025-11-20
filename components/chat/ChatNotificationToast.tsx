import React from 'react';
import { MessageCircle } from 'lucide-react';
import type { Message } from '@/types';

interface ChatNotificationToastProps {
  message: Message;
}

export function ChatNotificationToast({ message }: ChatNotificationToastProps) {
  const senderName = message.sender
    ? `${message.sender.firstName} ${message.sender.lastName}`
    : 'Usuario';

  const serviceName = message.booking?.service?.title || 'Servicio';

  // Truncate message to 100 characters
  const messagePreview = message.content.length > 100
    ? `${message.content.substring(0, 100)}...`
    : message.content;

  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-blue-600" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-gray-900">{senderName}</p>
          <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
            {serviceName}
          </span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 break-words">
          {messagePreview}
        </p>
      </div>
    </div>
  );
}
