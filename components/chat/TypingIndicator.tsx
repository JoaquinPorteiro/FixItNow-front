'use client';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 text-sm text-gray-500 px-4 py-2">
      <span>Escribiendo</span>
      <div className="flex gap-1">
        <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
        <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
        <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
      </div>
    </div>
  );
}
