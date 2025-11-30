import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, MoreHorizontal, MessageCircleHeart, UserRound, Wind, Sun, Phone, Bot } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { usePsychologicalChat } from '@/hooks/usePsychologicalChat';
import ChatInterface from '@/components/chat/ChatInterface';
import SessionRatingModal from '@/components/chat/SessionRatingModal';
interface ChatSession {
  id: string;
  session_start: string;
  session_end: string | null;
  status: string;
  user_id: string;
}
const Chat = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showChatInterface, setShowChatInterface] = useState(false);
  const {
    messages,
    isLoading: chatLoading,
    isSessionActive,
    startSession,
    sendMessage,
    endSession,
    submitRating,
    messagesEndRef
  } = usePsychologicalChat();
  useEffect(() => {
    if (user) {
      fetchChatHistory();
    }
  }, [user]);
  const fetchChatHistory = async () => {
    if (!user) return;
    try {
      const {
        data,
        error
      } = await supabase.from('chat_sessions').select('*').eq('user_id', user.id).order('session_start', {
        ascending: false
      }).limit(5);
      if (error) throw error;
      setChatSessions(data || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleStartChat = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para acceder al chat",
        variant: "destructive"
      });
      return;
    }
    await startSession();
    setShowChatInterface(true);
  };
  const handleNavigateBack = () => {
    setShowChatInterface(false);
  };
  const handleEndSession = async () => {
    const sessionId = await endSession();
    setShowChatInterface(false);
    if (sessionId) {
      setShowRatingModal(true);
    }
  };
  const handleRatingSubmit = (rating: number, feedback?: string) => {
    submitRating(rating, feedback);
    setShowRatingModal(false);
    fetchChatHistory(); // Refresh history after rating
  };
  const handleWellnessAction = (action: string) => {
    switch (action) {
      case 'Respiración':
        navigate('/wellness/breathing');
        break;
      case 'Gratitud':
        navigate('/wellness/gratitude');
        break;
      case 'Crisis':
        navigate('/wellness/crisis');
        break;
      default:
        toast({
          title: "Próximamente",
          description: `La función "${action}" estará disponible pronto.`
        });
    }
  };
  const handlePsychologist = () => {
    toast({
      title: "Próximamente",
      description: "La conexión con psicólogos estará disponible pronto."
    });
  };
  const handleChatHistoryClick = (session: ChatSession) => {
    if (session.status === 'active') {
      setShowChatInterface(true);
    } else {
      toast({
        title: "Sesión finalizada",
        description: "Esta conversación ya ha terminado. Inicia una nueva sesión."
      });
    }
  };
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', {
        weekday: 'short'
      });
    }
  };
  const wellnessActions = [{
    icon: Wind,
    title: 'Respiración',
    subtitle: '3 min de calma',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-100',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    textColor: 'text-teal-900',
    subtitleColor: 'text-teal-700/70'
  }, {
    icon: Sun,
    title: 'Gratitud',
    subtitle: 'Diario personal',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-100',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    textColor: 'text-amber-900',
    subtitleColor: 'text-amber-700/70'
  }, {
    icon: Phone,
    title: 'Crisis',
    subtitle: 'Líneas de ayuda',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-100',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    textColor: 'text-rose-900',
    subtitleColor: 'text-rose-700/70'
  }];
  const userName = user?.user_metadata?.full_name || 'Amigo/a';

  // If chat interface is active, show full screen chat
  if (isSessionActive && showChatInterface) {
    return <>
        <ChatInterface messages={messages} isLoading={chatLoading} isSessionActive={isSessionActive} onSendMessage={sendMessage} onEndSession={handleEndSession} onNavigateBack={handleNavigateBack} messagesEndRef={messagesEndRef} />
        <SessionRatingModal isOpen={showRatingModal} onClose={() => setShowRatingModal(false)} onSubmit={handleRatingSubmit} />
      </>;
  }
  return <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 bg-white/95 backdrop-blur-sm sticky top-0 z-20 border-b border-transparent">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">Asistencia Psicológica</h1>
          <button className="w-9 h-9 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-neutral-500">Espacio seguro, confidencial y anónimo.</p>
      </div>

      <div className="flex-1 overflow-y-auto pb-6 bg-white">
        {/* Prominent AI Chat Hero */}
        <div className="px-6 py-4" style={{
        animation: 'slideUp 0.5s ease-out both'
      }}>
          <div className="relative w-full rounded-3xl overflow-hidden bg-neutral-900 p-6 shadow-xl text-center flex flex-col items-center">
            {/* Decorative Gradients */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-900/50 to-neutral-900"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center mb-4 shadow-inner">
                <Sparkles className="w-7 h-7 text-indigo-300" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Hola, {userName}</h2>
              <p className="text-sm text-neutral-300 mb-6 leading-relaxed max-w-[240px]">Estoy aquí para escucharte y ayudarte a procesar tus emociones. Sin juicios. Sin burla. Solo apoyo.</p>
              
              <button onClick={handleStartChat} className="w-full py-3.5 bg-white text-indigo-950 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-all shadow-[0_0_15px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2 transform active:scale-[0.98]">
                <MessageCircleHeart className="w-4 h-4" />
                Iniciar chat de asistencia
              </button>
              
              <div className="mt-4 pt-4 border-t border-white/10 w-full flex items-center justify-center gap-2">
                <span className="text-[10px] text-neutral-400">O conecta con un especialista humano</span>
                <button onClick={handlePsychologist} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-medium hover:bg-white/10 transition-colors flex items-center gap-1.5">
                  <UserRound className="w-3 h-3" />
                  Psicólogo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Carousel */}
        <div className="mt-2 mb-6" style={{
        animation: 'slideUp 0.5s ease-out 0.1s both'
      }}>
          <div className="px-6 flex justify-between items-end mb-3">
            <h3 className="text-sm font-bold text-neutral-900">Bienestar Rápido</h3>
          </div>
          <div className="flex overflow-x-auto no-scrollbar px-6 gap-3 pb-2">
            {wellnessActions.map((action, index) => <button key={index} onClick={() => handleWellnessAction(action.title)} className={`flex-shrink-0 w-32 p-3 rounded-2xl ${action.bgColor} border ${action.borderColor} flex flex-col gap-2 hover:${action.bgColor.replace('50', '100')} transition-colors text-left group`}>
                <div className={`w-8 h-8 rounded-full ${action.iconBg} group-hover:bg-white ${action.iconColor} flex items-center justify-center transition-colors`}>
                  <action.icon className="w-4 h-4" />
                </div>
                <div>
                  <span className={`block text-xs font-bold ${action.textColor}`}>{action.title}</span>
                  <span className={`text-[10px] ${action.subtitleColor}`}>{action.subtitle}</span>
                </div>
              </button>)}
          </div>
        </div>

        {/* Chat History */}
        <div className="px-6 pb-6" style={{
        animation: 'slideUp 0.5s ease-out 0.2s both'
      }}>
          <h3 className="text-sm font-bold text-neutral-900 mb-3">Historial Reciente</h3>
          
          {isLoading ? <div className="flex flex-col gap-2">
              {[1, 2, 3].map(i => <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-neutral-100 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-neutral-200"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-neutral-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
                  </div>
                </div>)}
            </div> : chatSessions.length === 0 ? <div className="text-center py-8">
              <p className="text-sm text-neutral-500">No hay conversaciones recientes</p>
              <p className="text-xs text-neutral-400 mt-1">Inicia tu primera sesión de apoyo</p>
            </div> : <div className="flex flex-col gap-2">
              {chatSessions.map(session => <button key={session.id} onClick={() => handleChatHistoryClick(session)} className={`flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-100 transition-all group w-full text-left ${session.status === 'completed' ? 'opacity-70' : ''}`}>
                  <div className="relative w-12 h-12 shrink-0">
                    <div className="w-full h-full rounded-full bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
                      <MessageCircleHeart className="w-6 h-6" />
                    </div>
                    {session.status === 'active' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="text-sm font-semibold text-neutral-900">Asistencia Psicológica</h4>
                      <span className="text-[10px] text-neutral-400">{formatTimestamp(session.session_start)}</span>
                    </div>
                    <p className="text-xs text-neutral-500 truncate group-hover:text-neutral-700">
                      {session.status === 'active' ? 'Conversación activa...' : 'Conversación finalizada.'}
                    </p>
                  </div>
                </button>)}
            </div>}
        </div>
      </div>

      {/* Rating Modal */}
      <SessionRatingModal isOpen={showRatingModal} onClose={() => setShowRatingModal(false)} onSubmit={handleRatingSubmit} />
    </div>;
};
export default Chat;