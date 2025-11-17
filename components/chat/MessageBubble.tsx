'use client';

import { Message } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const messageTime = format(new Date(message.createdAt), 'HH:mm', { locale: es });

  return (
    <div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isOwnMessage
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-900 rounded-bl-none'
        }`}
      >
        {!isOwnMessage && message.sender && (
          <div className="text-xs font-semibold mb-1 text-gray-700">
            {message.sender.firstName} {message.sender.lastName}
          </div>
        )}
        <div className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </div>
        <div
          className={`flex items-center justify-end gap-1 mt-1 text-xs ${
            isOwnMessage ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          <span>{messageTime}</span>
          {isOwnMessage && (
            <span className="inline-flex">
              {message.isRead ? (
                <CheckCheck size={14} className="text-blue-200" />
              ) : (
                <Check size={14} className="text-blue-200" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
