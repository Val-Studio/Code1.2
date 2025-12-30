import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent, Avatar, Badge } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';

export const metadata = {
  title: 'Сообщения',
};

async function getConversations(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ participant1Id: userId }, { participant2Id: userId }],
    },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { lastMessageAt: 'desc' },
  });

  // Get participant details
  const participantIds = conversations.flatMap((c: any) =>
    c.participant1Id === userId ? [c.participant2Id] : [c.participant1Id]
  );

  const participants = await prisma.user.findMany({
    where: { id: { in: participantIds } },
    include: { profile: true },
  });

  const participantMap = new Map(participants.map((p: any) => [p.id, p]));

  return conversations.map((conv: any) => ({
    ...conv,
    participant: participantMap.get(
      conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id
    ),
    unreadCount: 0, // We'll count unread messages
  }));
}

export default async function MessagesPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const conversations = await getConversations(session.user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Сообщения</h1>
        <p className="text-gray-600">Ваши переписки</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {conversations.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-500">У вас пока нет сообщений</p>
            </div>
          ) : (
            <div className="divide-y">
              {conversations.map((conv: any) => (
                <Link
                  key={conv.id}
                  href={`/dashboard/messages/${conv.participant?.id}`}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-gray-50"
                >
                  <Avatar
                    src={conv.participant?.profile?.avatar}
                    firstName={conv.participant?.profile?.firstName || ''}
                    lastName={conv.participant?.profile?.lastName || ''}
                    size="lg"
                  />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">
                        {conv.participant?.profile?.firstName} {conv.participant?.profile?.lastName}
                      </p>
                      {conv.lastMessageAt && (
                        <span className="text-sm text-gray-500">
                          {formatDateTime(conv.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    {conv.messages[0] && (
                      <p className="truncate text-sm text-gray-500">{conv.messages[0].content}</p>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <Badge variant="destructive">{conv.unreadCount}</Badge>
                  )}
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
