import { useNotifications } from '@/hooks/useNotifications';
import { Bell, X, MessageSquare, Heart, Info, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
const NotificationCenter = () => {
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();
  const navigate = useNavigate();
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'chat_reminder':
        return <MessageSquare className="h-5 w-5 text-primary" />;
      case 'community_update':
        return <Heart className="h-5 w-5 text-secondary" />;
      case 'system_info':
        return <Info className="h-5 w-5 text-accent" />;
      case 'achievement':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'appointment_reminder':
        return <Bell className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    return date.toLocaleDateString('es-ES');
  };
  const handleActionClick = (actionUrl?: string) => {
    if (actionUrl) {
      navigate(actionUrl);
    }
  };
  if (loading) {
    return <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>;
  }
  return <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          
          
          {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
        </div>
        {unreadCount > 0 && <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Marcar todas como leídas
          </Button>}
      </div>

      {notifications.length === 0 ? <Card>
          <CardContent className="text-center py-12">
            <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay notificaciones</h3>
            <p className="text-muted-foreground">
              Te notificaremos sobre actualizaciones importantes
            </p>
          </CardContent>
        </Card> : <div className="space-y-3">
          {notifications.map(notification => <Card key={notification.id} className={`hover:shadow-md transition-shadow ${!notification.read ? 'border-primary/50' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center space-x-2">
                        <span>{notification.title}</span>
                        {!notification.read && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(notification.created_at)}
                  </span>
                  <div className="flex space-x-2">
                    {!notification.read && <Button variant="outline" size="sm" onClick={() => markAsRead(notification.id)}>
                        Marcar como leída
                      </Button>}
                    {notification.action_url && <Button variant="outline" size="sm" onClick={() => handleActionClick(notification.action_url)}>
                        Ver más
                      </Button>}
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>}
    </div>;
};
export default NotificationCenter;