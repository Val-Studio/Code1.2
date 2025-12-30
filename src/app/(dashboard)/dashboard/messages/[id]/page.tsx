import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, Avatar } from '@/components/ui';
import { ChatMessages } from '@/components/chat/chat-messages';
import { ChatInput } from '@/components/chat/chat-input';
import Link from 'next/link';
import { ArrowLeft, Video, Phone } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getOrCreateConversation(userId: string, participantId: string) {
  // Get participant info
  const participant = await prisma.user.findUnique({
    where: { id: participantId },
    include: { profile: true },
  });

  if (!participant) {
    return null;
  }

  // Find or create conversation
  let conversation = await prisma.conversation.findFirst({
    where: {
      OR: [
        { participant1Id: userId, participant2Id: participantId },
        { participant1Id: participantId, participant2Id: userId },
      ],
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participant1Id: userId,
        participant2Id: participantId,
      },
    });
  }

  // Get messages
  const messages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    include: {
      sender: { include: { profile: true } },
    },
    orderBy: { createdAt: 'asc' },
    take: 100,
  });

  // Mark messages as read
  await prisma.message.updateMany({
    where: {
      conversationId: conversation.id,
      receiverId: userId,
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  return {
    conversation,
    participant,
    messages,
  };
}

export default async function ChatPage({ params }: PageProps) {
  const { id: participantId } = await params;
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const data = await getOrCreateConversation(session.user.id, participantId);

  if (!data) {
    notFound();
  }

  const { conversation, participant, messages } = data;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-white p-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/messages" className="rounded-lg p-2 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar
                src={participant.profile?.avatar}
                firstName={participant.profile?.firstName || ''}
                lastName={participant.profile?.lastName || ''}
                size="md"
              />
              {participant.profile?.isOnline && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
              )}
            </div>
            <div>
              <p className="font-medium">
                {participant.profile?.firstName} {participant.profile?.lastName}
              </p>
              <p className="text-sm text-gray-500">
                {participant.role === 'PSYCHOLOGIST' ? 'Психолог' : 'Клиент'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg p-2 text-gray-600 hover:bg-gray-100">
            <Phone className="h-5 w-5" />
          </button>
          <button className="rounded-lg p-2 text-gray-600 hover:bg-gray-100">
            <Video className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        <ChatMessages
          messages={messages}
          currentUserId={session.user.id}
        />
      </div>

      {/* Input */}
      <div className="border-t bg-white p-4">
        <ChatInput
          conversationId={conversation.id}
          receiverId={participantId}
        />
      </div>
    </div>
  );
}
