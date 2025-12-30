'use client';

import { useEffect, useRef } from 'react';
import { Avatar } from '@/components/ui';
import { cn } from '@/lib/utils';
import { Check, CheckCheck } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  senderId: string;
  readAt: Date | null;
  createdAt: Date;
  sender: {
    profile: {
      firstName: string;
      lastName: string;
      avatar?: string | null;
    } | null;
  };
}

interface ChatMessagesProps {
  messages: Message[];
  currentUserId: string;
}

export function ChatMessages({ messages, currentUserId }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Начните переписку</p>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toLocaleDateString('ru-RU');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <div key={date}>
          <div className="sticky top-0 z-10 flex justify-center">
            <span className="rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-600">{date}</span>
          </div>
          <div className="mt-4 space-y-3">
            {msgs.map((message) => {
              const isMine = message.senderId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={cn('flex items-end gap-2', isMine ? 'flex-row-reverse' : 'flex-row')}
                >
                  {!isMine && (
                    <Avatar
                      src={message.sender.profile?.avatar}
                      firstName={message.sender.profile?.firstName || ''}
                      lastName={message.sender.profile?.lastName || ''}
                      size="sm"
                    />
                  )}
                  <div
                    className={cn(
                      'max-w-[70%] rounded-2xl px-4 py-2',
                      isMine ? 'bg-primary-600 text-white' : 'bg-white text-gray-900'
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    <div
                      className={cn(
                        'mt-1 flex items-center justify-end gap-1 text-xs',
                        isMine ? 'text-primary-100' : 'text-gray-400'
                      )}
                    >
                      <span>
                        {new Date(message.createdAt).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isMine && (
                        message.readAt ? (
                          <CheckCheck className="h-3 w-3" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
