import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { useNotifications } from '@/hooks/useNotifications';

const Notifications = () => {
  const navigate = useNavigate();
  const { markAllAsRead } = useNotifications();

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 pt-14 pb-4 border-b border-neutral-100 flex justify-between items-end sticky top-0 bg-white/95 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="-ml-2 p-2 rounded-full hover:bg-neutral-50 text-neutral-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-neutral-900 tracking-tight">
            Notificaciones
          </h1>
        </div>
        <button
          onClick={markAllAsRead}
          className="text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          Marcar leídas
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-white">
        <NotificationCenter />
      </div>
    </div>
  );
};

export default Notifications;