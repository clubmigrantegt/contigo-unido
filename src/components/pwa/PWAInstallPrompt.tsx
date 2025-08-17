import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { cn } from '@/lib/utils';

const PWAInstallPrompt = () => {
  const { canInstall, install, isIOS, isStandalone } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if already installed or user dismissed
  if (isStandalone || isDismissed) return null;

  const handleInstall = async () => {
    const success = await install();
    if (!success) {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  // iOS instructions
  if (isIOS && !canInstall) {
    return (
      <div className="fixed bottom-16 left-0 right-0 z-40 px-4">
        <div className="bg-primary text-primary-foreground rounded-xl shadow-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Share size={20} />
            <div className="text-sm">
              <div className="font-medium">Instala la app</div>
              <div className="opacity-90">Toca Compartir → "Añadir a pantalla de inicio"</div>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleDismiss}
            className="text-primary-foreground hover:bg-white/20"
          >
            <X size={16} />
          </Button>
        </div>
      </div>
    );
  }

  // Android/Desktop install prompt
  if (!canInstall) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 px-4">
      <div className="bg-primary text-primary-foreground rounded-xl shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Download size={20} />
          <div className="text-sm">
            <div className="font-medium">Instala la app</div>
            <div className="opacity-90">Acceso más rápido desde tu pantalla de inicio</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={handleInstall}
            className="text-xs"
          >
            Instalar
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleDismiss}
            className="text-primary-foreground hover:bg-white/20"
          >
            <X size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;