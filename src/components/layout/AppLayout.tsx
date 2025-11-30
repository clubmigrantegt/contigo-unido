import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from '@/components/navigation/BottomNav';
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt';

const AppLayout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-16"> {/* Space for bottom navigation */}
        <Outlet />
      </main>
      <BottomNav />
      <PWAInstallPrompt />
    </div>
  );
};

export default AppLayout;