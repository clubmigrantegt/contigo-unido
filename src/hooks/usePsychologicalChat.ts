import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export const usePsychologicalChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startSession = useCallback(async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para iniciar una sesión",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          status: 'active',
          session_start: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      setIsSessionActive(true);
      setMessages([{
        id: '1',
        content: '¡Hola! Soy tu asistente de apoyo psicológico. Estoy aquí para escucharte y apoyarte en lo que necesites. ¿Cómo te sientes hoy?',
        isUser: false,
        timestamp: new Date()
      }]);

      toast({
        title: "Sesión iniciada",
        description: "Tu sesión de apoyo psicológico ha comenzado",
      });
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la sesión. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const sendMessage = useCallback(async (content: string) => {
    if (!user || !sessionId || !content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('psychological-chat', {
        body: {
          message: content.trim(),
          sessionId,
          userId: user.id
        }
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, sessionId, toast]);

  const endSession = useCallback(async () => {
    if (!sessionId || !user) return;

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({
          status: 'completed',
          session_end: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;

      setIsSessionActive(false);
      return sessionId;
    } catch (error) {
      console.error('Error ending session:', error);
      toast({
        title: "Error",
        description: "Error al finalizar la sesión",
        variant: "destructive",
      });
    }
  }, [sessionId, user, toast]);

  const submitRating = useCallback(async (rating: number, feedback?: string) => {
    if (!sessionId || !user) return;

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({
          rating,
          feedback: feedback || null
        })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Gracias por tu feedback",
        description: "Tu calificación ha sido guardada",
      });
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la calificación",
        variant: "destructive",
      });
    }
  }, [sessionId, user, toast]);

  return {
    messages,
    isLoading,
    isSessionActive,
    startSession,
    sendMessage,
    endSession,
    submitRating,
    messagesEndRef
  };
};