import { useNotifications } from '@/hooks/useNotifications';
import { Bell, HeartHandshake, MessageCircle, Heart, FileText, Sparkles, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

const NotificationCenter = () => {
  const {
    notifications,
    loading,
    markAsRead,
    deleteNotification
  } = useNotifications();
  const navigate = useNavigate();

  const groupNotificationsByDate = (notifications: Notification[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: { [key: string]: Notification[] } = {
      today: [],
      yesterday: [],
      older: []
    };

    notifications.forEach(n => {
      const date = new Date(n.created_at);
      date.setHours(0, 0, 0, 0);
      
      if (date.getTime() === today.getTime()) {
        groups.today.push(n);
      } else if (date.getTime() === yesterday.getTime()) {
        groups.yesterday.push(n);
      } else {
        groups.older.push(n);
      }
    });

    return groups;
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;

    // For yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    
    if (dateOnly.getTime() === yesterday.getTime()) {
      return `Ayer, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    }

    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'direct_message':
      case 'chat_reminder':
        return { bg: 'bg-cyan-100', text: 'text-cyan-600', icon: HeartHandshake };
      case 'comment':
      case 'community_update':
        return { bg: 'bg-indigo-100', text: 'text-indigo-600', icon: MessageCircle };
      case 'likes':
      case 'like':
        return { bg: 'bg-rose-100', text: 'text-rose-600', icon: Heart };
      case 'system':
      case 'system_info':
      case 'new_content':
        return { bg: 'bg-blue-50', text: 'text-blue-600', icon: FileText };
      case 'welcome':
      case 'achievement':
        return { bg: 'bg-neutral-900', text: 'text-white', icon: Sparkles };
      default:
        return { bg: 'bg-neutral-100', text: 'text-neutral-600', icon: Bell };
    }
  };

  const NotificationAvatar = ({ notification }: { notification: Notification }) => {
    const badge = getTypeBadge(notification.type);
    const IconComponent = badge.icon;

    // Handle likes with multiple avatars
    if (notification.type === 'likes' || notification.type === 'like') {
      return (
        <div className="relative w-10 h-10 shrink-0">
          <div className="absolute inset-0 flex">
            <Avatar className="w-7 h-7 absolute top-0 left-0 z-10 border-2 border-white">
              <AvatarImage src={notification.metadata?.avatar1} />
              <AvatarFallback className="text-[10px] bg-neutral-100">
                {notification.metadata?.initials1 || 'U'}
              </AvatarFallback>
            </Avatar>
            <Avatar className="w-7 h-7 absolute bottom-0 right-0 border-2 border-white">
              <AvatarImage src={notification.metadata?.avatar2} />
              <AvatarFallback className="text-[10px] bg-neutral-100">
                {notification.metadata?.initials2 || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      );
    }

    // System/content notifications without avatar
    if (notification.type === 'system' || notification.type === 'system_info' || notification.type === 'new_content') {
      return (
        <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${badge.bg} border border-blue-100`}>
          <IconComponent className="w-5 h-5 text-blue-600" />
        </div>
      );
    }

    // Welcome notifications
    if (notification.type === 'welcome' || notification.type === 'achievement') {
      return (
        <div className="w-10 h-10 rounded-full bg-neutral-900 shrink-0 flex items-center justify-center text-white">
          <Sparkles className="w-5 h-5" />
        </div>
      );
    }

    // Regular notifications with avatar and badge
    return (
      <div className="relative w-10 h-10 shrink-0">
        <Avatar className="w-10 h-10">
          <AvatarImage src={notification.metadata?.avatar} />
          <AvatarFallback className="text-xs bg-neutral-100 text-neutral-600">
            {notification.metadata?.initials || notification.title.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${badge.bg}`}>
            <IconComponent className={`w-2 h-2 ${badge.text}`} />
          </div>
        </div>
      </div>
    );
  };

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const isDirect = notification.type === 'direct_message' || notification.type === 'chat_reminder';

    return (
      <div className="relative pl-4 group cursor-pointer" onClick={() => {
        if (!notification.read) markAsRead(notification.id);
        if (notification.action_url) navigate(notification.action_url);
      }}>
        {!notification.read && (
          <div className="absolute left-0 top-3 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
        )}
        
        <div className="flex gap-3">
          <NotificationAvatar notification={notification} />
          
          <div className="flex-1 pb-4 border-b border-neutral-100 group-last:border-0">
            <p className="text-sm text-neutral-900 leading-snug">
              {notification.title}
            </p>
            
            {notification.message && (
              <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
                {notification.message}
              </p>
            )}
            
            {isDirect && (
              <div className="mt-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (notification.action_url) navigate(notification.action_url);
                  }}
                  className="px-3 py-1.5 bg-neutral-900 text-white text-xs rounded-lg font-medium hover:bg-neutral-800 transition-colors"
                >
                  Responder
                </button>
              </div>
            )}
            
            <span className="text-[10px] text-neutral-400 mt-2 block">
              {formatTimestamp(notification.created_at)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="px-6 py-4 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-10 h-10 bg-neutral-100 rounded-full shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-neutral-100 rounded w-3/4"></div>
              <div className="h-3 bg-neutral-100 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mb-4">
          <Bell className="h-8 w-8 text-neutral-300" />
        </div>
        <h3 className="text-base font-semibold text-neutral-900 mb-1">
          No hay notificaciones
        </h3>
        <p className="text-sm text-neutral-500 text-center">
          Te avisaremos cuando haya algo nuevo
        </p>
      </div>
    );
  }

  const groups = groupNotificationsByDate(notifications);

  return (
    <div>
      {groups.today.length > 0 && (
        <div className="px-6 py-4">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            Hoy
          </h3>
          <div className="flex flex-col gap-4">
            {groups.today.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        </div>
      )}

      {groups.yesterday.length > 0 && (
        <div className="px-6 py-2">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            Ayer
          </h3>
          <div className="flex flex-col gap-4">
            {groups.yesterday.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        </div>
      )}

      {groups.older.length > 0 && (
        <div className="px-6 py-2">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            Anteriores
          </h3>
          <div className="flex flex-col gap-4">
            {groups.older.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        </div>
      )}

      <div className="h-6"></div>
    </div>
  );
};

export default NotificationCenter;
