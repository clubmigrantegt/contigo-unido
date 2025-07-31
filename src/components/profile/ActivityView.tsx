import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MessageCircle, ChevronRight } from 'lucide-react';
import ChatHistory from '@/components/profile/ChatHistory';

interface UserStats {
  totalSessions: number;
  totalTestimonials: number;
  totalFavorites: number;
  lastActivity: string;
}

interface ActivityViewProps {
  stats: UserStats;
  onBack: () => void;
}

const ActivityView = ({ stats, onBack }: ActivityViewProps) => {
  const [showChatHistory, setShowChatHistory] = useState(false);

  if (showChatHistory) {
    return (
      <div className="min-h-screen bg-calm-gray">
        <div className="bg-background px-4 pt-12 pb-6">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => setShowChatHistory(false)}>
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
              Historial de Sesiones
            </h1>
          </div>
        </div>
        <div className="px-4">
          <ChatHistory />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-calm-gray">
      <div className="bg-background px-4 pt-12 pb-6">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            Tu Actividad
          </h1>
        </div>
      </div>

      <div className="px-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Actividad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats.totalSessions}</p>
                <p className="text-sm text-muted-foreground">Sesiones de Chat</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary">{stats.totalTestimonials}</p>
                <p className="text-sm text-muted-foreground">Testimonios</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{stats.totalFavorites}</p>
                <p className="text-sm text-muted-foreground">Favoritos</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Última actividad</p>
                <p className="text-sm font-medium">{stats.lastActivity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200" onClick={() => setShowChatHistory(true)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageCircle size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Historial de Sesiones</h3>
                  <p className="text-sm text-muted-foreground">
                    Ver todas tus conversaciones anteriores
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActivityView;