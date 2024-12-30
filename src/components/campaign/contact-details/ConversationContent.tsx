import React from 'react';
import Logo from '../../Logo';

interface Message {
  role: 'system' | 'assistant' | 'user';
  content: string;
  name?: string;
}

interface ConversationContentProps {
  content: string;
  contactName: string;
}

export function ConversationContent({ content, contactName }: ConversationContentProps) {
  let messages: Message[] = [];
  
  try {
    messages = JSON.parse(content);
  } catch (e) {
    return (
      <div className="text-sm text-gray-600 dark:text-dark-400">
        {content}
      </div>
    );
  }

  // Filter out system messages
  const visibleMessages = messages.filter(msg => msg.role !== 'system');

  return (
    <div className="space-y-3">
      {visibleMessages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-lg px-4 py-2 ${
              message.role === 'user'
                ? 'bg-blue-100 dark:bg-dark-500 text-dark-300 dark:text-white-600'
                : 'bg-gray-100 dark:bg-dark-200 text-gray-800 dark:text-dark-400'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-medium mb-1">
              {message.role === 'user' ? (
                contactName
              ) : (
                <>
                  <Logo className="w-4 h-4 text-dark-600" />
                  <span>OutRival</span>
                </>
              )}
            </div>
            <div className="text-sm whitespace-pre-wrap">
              {message.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}