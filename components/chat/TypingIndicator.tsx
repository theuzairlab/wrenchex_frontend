'use client';

import React from 'react';

interface TypingIndicatorProps {
  isTyping: boolean;
  userName?: string;
  className?: string;
}

export function TypingIndicator({ isTyping, userName, className = '' }: TypingIndicatorProps) {
  if (!isTyping) return null;

  return (
    <div className={`flex items-center space-x-2 text-sm text-gray-500 animate-pulse ${className}`}>
      <div className="flex items-center space-x-1">
        <span>{userName || 'Someone'} is typing</span>
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}

interface TypingBubbleProps {
  className?: string;
}

export function TypingBubble({ className = '' }: TypingBubbleProps) {
  return (
    <div className={`flex items-center justify-start mb-4 ${className}`}>
      <div className="bg-gray-200 rounded-lg px-4 py-2 max-w-xs">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
