import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  metadata?: any;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [user]);

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Si no hay datos reales, usar datos mock
      if (!data || data.length === 0) {
        const mockNotifications: Notification[] = [
          // HOY
          {
            id: 'mock-1',
            type: 'direct_message',
            title: 'Psic. Maria E.',
            message: 'Hola, ¿cómo te has sentido después de nuestra sesión?',
            read: false,
            action_url: '/chat',
            metadata: {
              avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100',
              action_label: 'Responder'
            },
            created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min ago
          },
          {
            id: 'mock-2',
            type: 'comment',
            title: 'Juan Perez',
            message: 'comentó en tu publicación "Mi experiencia solicitando asilo".',
            read: true,
            action_url: '/community/post/123',
            metadata: {
              initials: 'JP'
            },
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          },
          {
            id: 'mock-3',
            type: 'new_content',
            title: 'Derechos del Inquilino',
            message: 'Aprende cómo protegerte contra desalojos injustos.',
            read: false,
            action_url: '/services/legal/derechos-inquilino',
            metadata: {
              prefix: 'Nueva guía disponible:'
            },
            created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          },
          // AYER
          {
            id: 'mock-4',
            type: 'likes',
            title: 'Carlos M. y 4 personas más',
            message: 'indicaron que les gusta tu post.',
            read: true,
            action_url: '/community/post/456',
            metadata: {
              avatars: [
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
                'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100'
              ],
              preview: 'Buscando abogado pro-bono en...'
            },
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 3.5 * 60 * 60 * 1000).toISOString(), // Yesterday 8:30 PM
          },
          {
            id: 'mock-5',
            type: 'welcome',
            title: '¡Bienvenido a Club del Migrante! 🎉',
            message: 'Completa tu perfil para conectar con personas de tu misma nacionalidad.',
            read: true,
            action_url: '/profile',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 15 * 60 * 60 * 1000).toISOString(), // Yesterday 9:00 AM
          },
        ];
        setNotifications(mockNotifications);
      } else {
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications((prev) => [payload.new as Notification, ...prev]);
            toast({
              title: (payload.new as Notification).title,
              description: (payload.new as Notification).message,
            });
          } else if (payload.eventType === 'UPDATE') {
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === payload.new.id ? (payload.new as Notification) : n
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setNotifications((prev) =>
              prev.filter((n) => n.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'No se pudo marcar la notificación como leída',
        variant: 'destructive',
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );

      toast({
        title: 'Notificaciones actualizadas',
        description: 'Todas las notificaciones han sido marcadas como leídas',
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron actualizar las notificaciones',
        variant: 'destructive',
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la notificación',
        variant: 'destructive',
      });
    }
  };

  const createNotification = async (
    type: string,
    title: string,
    message: string,
    actionUrl?: string,
    metadata?: any
  ) => {
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: user?.id,
        type,
        title,
        message,
        action_url: actionUrl,
        metadata,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refetch: fetchNotifications,
  };
}
