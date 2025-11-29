import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import BottomNav from '@/components/navigation/BottomNav';
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Rocket, X } from 'lucide-react';

const AppLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [showDevMenu, setShowDevMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const handleDevLogout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has salido del modo desarrollo",
      });
      navigate('/onboarding');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowDevMenu(false);
    }
  };

  const handleDevReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-16"> {/* Space for bottom navigation */}
        <Outlet />
      </main>
      <BottomNav />
      <PWAInstallPrompt />
      
      {/* Dev Quick Access Button */}
      {import.meta.env.DEV && (
        <>
          {/* Floating Dev Button */}
          <button
            onClick={() => setShowDevMenu(!showDevMenu)}
            className="fixed bottom-20 right-4 w-12 h-12 bg-brand hover:bg-brand-hover text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-all"
          >
            {showDevMenu ? <X size={20} /> : <Rocket size={20} />}
          </button>
          
          {/* Dev Menu Panel */}
          {showDevMenu && (
            <div className="fixed bottom-36 right-4 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 w-48 animate-scale-fade-in">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Dev Tools</p>
              <div className="space-y-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full justify-start text-sm"
                  onClick={handleDevReload}
                >
                  🔄 Recargar App
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full justify-start text-sm text-red-600"
                  onClick={handleDevLogout}
                  disabled={isLoading}
                >
                  🚪 Cerrar Sesión
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AppLayout;