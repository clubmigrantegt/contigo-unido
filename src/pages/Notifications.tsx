import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from '@/components/notifications/NotificationCenter';

const Notifications = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-background px-4 pt-12 pb-6">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            Notificaciones
          </h1>
        </div>
      </div>
      
      <div className="px-4">
        <NotificationCenter />
      </div>
    </div>
  );
};

export default Notifications;