import { Outlet } from 'react-router-dom';
import BottomNav from '@/components/navigation/BottomNav';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-16"> {/* Space for bottom navigation */}
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;