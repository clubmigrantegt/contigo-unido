import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Phone, 
  FileText, 
  Lightbulb, 
  MessageCircle,
  Clock,
  Star,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { usePsychologicalChat } from '@/hooks/usePsychologicalChat';

interface ChatSession {
  id: string;
  session_start: string;
  session_end: string | null;
  status: string;
  rating: number | null;
  feedback: string | null;
}

const Services = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  
  const { isSessionActive, startSession } = usePsychologicalChat();

  useEffect(() => {
    if (user) {
      fetchRecentSessions();
    } else {
      setLoadingSessions(false);
    }
  }, [user]);

  const fetchRecentSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('session_start', { ascending: false })
        .limit(5);

      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
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
        return <Badge variant="default" className="text-xs">Completada</Badge>;
      case 'active':
        return <Badge variant="secondary" className="text-xs">Activa</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const getRatingStars = (rating: number | null) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleStartNewSession = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para acceder al chat de apoyo",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (isSessionActive) {
      navigate('/services/psychological-support');
      return;
    }

    await startSession();
    navigate('/services/psychological-support');
  };

  const quickActions = [
    { 
      icon: Phone, 
      title: 'Línea de Crisis', 
      subtitle: '988 - 24/7',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      borderColor: 'border-red-100',
      action: () => window.location.href = 'tel:988'
    },
    { 
      icon: FileText, 
      title: 'Guías de Ayuda', 
      subtitle: 'Recursos útiles',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-100',
      action: () => navigate('/services/legal')
    },
    { 
      icon: Lightbulb, 
      title: 'Tips Bienestar', 
      subtitle: 'Autocuidado',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-100',
      action: () => toast({
        title: "Próximamente",
        description: "Esta funcionalidad estará disponible pronto",
      })
    },
  ];

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-0.5">
          Club del Migrante
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
          Chat de Apoyo
        </h1>
      </div>

      {/* Hero Card - Iniciar Nueva Sesión */}
      <div className="px-6 mb-6">
        <Card className="border-0 bg-gradient-to-br from-neutral-900 to-neutral-700 text-white overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <Badge className="bg-cyan-500/20 text-cyan-200 border-cyan-400/30 text-xs">
                Disponible ahora
              </Badge>
            </div>
            
            <h2 className="text-xl font-bold mb-2">
              Apoyo Psicológico Inmediato
            </h2>
            <p className="text-sm text-white/80 mb-4 leading-relaxed">
              Conecta con profesionales certificados especializados en temas de migración. 
              Confidencial y en español.
            </p>
            
            <Button 
              onClick={handleStartNewSession}
              className="w-full bg-white hover:bg-white/90 text-neutral-900 font-semibold rounded-xl h-11"
            >
              {isSessionActive ? 'Continuar Sesión' : 'Iniciar Nueva Sesión'}
            </Button>
          </CardContent>
          
          {/* Decorative elements */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -left-8 top-1/2 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl" />
        </Card>
      </div>

      {/* Acceso Rápido - Horizontal Scroll */}
      <div className="mb-8">
        <div className="px-6 mb-4">
          <h2 className="text-sm font-bold text-neutral-900">Acceso Rápido</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 px-6 no-scrollbar">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`flex-shrink-0 w-36 p-4 rounded-xl ${action.bgColor} border ${action.borderColor} hover:shadow-md transition-all text-left`}
            >
              <action.icon className={`w-5 h-5 ${action.iconColor} mb-2`} />
              <span className="text-sm font-medium text-neutral-900 block mb-0.5">
                {action.title}
              </span>
              <span className="text-[10px] text-neutral-500">{action.subtitle}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conversaciones Recientes */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-neutral-900">Conversaciones Recientes</h2>
          {sessions.length > 0 && (
            <button 
              onClick={() => navigate('/profile')}
              className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Ver todas
            </button>
          )}
        </div>

        {loadingSessions ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-neutral-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <Card className="border border-neutral-100 rounded-xl">
            <CardContent className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold mb-1 text-neutral-900">
                No hay conversaciones
              </h3>
              <p className="text-sm text-neutral-500 mb-4">
                Inicia tu primera sesión de apoyo psicológico
              </p>
              <Button 
                onClick={handleStartNewSession}
                variant="outline" 
                size="sm"
                className="rounded-lg"
              >
                Comenzar ahora
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <Card 
                key={session.id} 
                className="border border-neutral-100 rounded-xl hover:shadow-md transition-all cursor-pointer"
                onClick={() => {
                  if (session.status === 'active') {
                    navigate('/services/psychological-support');
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(session.session_start)}</span>
                    </div>
                    {getStatusBadge(session.status)}
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1 text-xs text-neutral-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(session.session_start, session.session_end)}</span>
                    </div>
                    {session.rating && getRatingStars(session.rating)}
                  </div>

                  {session.feedback && (
                    <div className="bg-neutral-50 rounded-lg p-2 mb-3">
                      <p className="text-xs text-neutral-600 italic line-clamp-2">
                        "{session.feedback}"
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <span className="text-xs text-neutral-400">
                      ID: {session.id.slice(0, 8)}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-7 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (session.status === 'active') {
                          navigate('/services/psychological-support');
                        }
                      }}
                    >
                      {session.status === 'active' ? (
                        <>
                          Continuar
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </>
                      ) : (
                        <>
                          Revisar
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
