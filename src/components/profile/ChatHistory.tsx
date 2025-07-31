import { useEffect, useState } from 'react';
import { Calendar, Clock, Star, MessageSquare, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ChatSession {
  id: string;
  session_start: string;
  session_end: string | null;
  status: string;
  rating: number | null;
  feedback: string | null;
}

const ChatHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchChatHistory();
    }
  }, [user]);

  const fetchChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('session_start', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo cargar el historial de chats",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return 'En progreso';
    
    const startTime = new Date(start);
    const endTime = new Date(end);
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    
    if (duration < 1) return '< 1 min';
    if (duration < 60) return `${duration} min`;
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Completada</Badge>;
      case 'active':
        return <Badge variant="secondary">Activa</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRatingStars = (rating: number | null) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  const exportSession = async (sessionId: string) => {
    try {
      // In a real implementation, you would fetch the actual chat messages
      // For now, we'll create a basic export with session info
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return;

      const exportData = {
        session_id: session.id,
        date: formatDate(session.session_start),
        duration: formatDuration(session.session_start, session.session_end),
        status: session.status,
        rating: session.rating,
        feedback: session.feedback,
        note: "Las transcripciones completas estarán disponibles en futuras versiones."
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-session-${sessionId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Sesión exportada",
        description: "La información de la sesión se ha descargado",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo exportar la sesión",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay historial de chats</h3>
          <p className="text-muted-foreground mb-4">
            Aún no has iniciado ninguna sesión de apoyo psicológico
          </p>
          <Button variant="outline">
            Iniciar primera sesión
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Historial de Sesiones</h3>
        <Badge variant="secondary">
          {sessions.length} {sessions.length === 1 ? 'sesión' : 'sesiones'}
        </Badge>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <Card key={session.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">
                    {formatDate(session.session_start)}
                  </CardTitle>
                </div>
                {getStatusBadge(session.status)}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(session.session_start, session.session_end)}</span>
                  </div>
                  
                  {session.rating && (
                    <div className="flex items-center space-x-1">
                      <span>Calificación:</span>
                      {getRatingStars(session.rating)}
                    </div>
                  )}
                </div>

                {session.feedback && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm italic">"{session.feedback}"</p>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    ID: {session.id.slice(0, 8)}...
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportSession(session.id)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ChatHistory;