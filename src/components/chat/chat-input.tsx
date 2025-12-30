'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui';
import { Send, Paperclip, Smile } from 'lucide-react';

interface ChatInputProps {
  conversationId: string;
  receiverId: string;
}

export function ChatInput({ conversationId, receiverId }: ChatInputProps) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || isSending) return;

    setIsSending(true);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          receiverId,
          content: message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setMessage('');
      router.refresh();
    } catch (error) {
      toast.error('Не удалось отправить сообщение');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <button
        type="button"
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
      >
        <Paperclip className="h-5 w-5" />
      </button>
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Введите сообщение..."
          rows={1}
          className="max-h-[120px] min-h-[40px] w-full resize-none rounded-xl border bg-gray-50 px-4 py-2 pr-10 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="button"
          className="absolute bottom-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <Smile className="h-5 w-5" />
        </button>
      </div>
      <Button
        type="submit"
        size="icon"
        disabled={!message.trim() || isSending}
        isLoading={isSending}
      >
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
}
