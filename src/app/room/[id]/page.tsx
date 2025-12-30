'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from '@livekit/components-react';
// LiveKit styles - will be loaded if package is installed
// import '@livekit/components-styles';
import { Button, PageLoader, Card, CardContent } from '@/components/ui';
import { PhoneOff, AlertCircle } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VideoRoomPage({ params }: PageProps) {
  const { id: roomId } = use(params);
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getToken() {
      try {
        const response = await fetch('/api/video/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, appointmentId: roomId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to get video token');
        }

        setToken(data.token);
        setUrl(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    getToken();
  }, [roomId]);

  const handleDisconnect = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <PageLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-xl font-bold">Не удалось подключиться</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">
              Вернуться в кабинет
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token || !url) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <p className="text-white">Подготовка видеозвонка...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900">
      <LiveKitRoom
        token={token}
        serverUrl={url}
        connect={true}
        onDisconnected={handleDisconnect}
        data-lk-theme="default"
        style={{ height: '100vh' }}
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}
