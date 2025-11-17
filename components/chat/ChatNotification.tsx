'use client';

interface ChatNotificationProps {
  count: number;
}

export function ChatNotification({ count }: ChatNotificationProps) {
  if (count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
      {count > 99 ? '99+' : count}
    </span>
  );
}
