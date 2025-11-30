import { NavLink } from 'react-router-dom';
import { Home, Search, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomNav = () => {
  const navItems = [
    { to: '/home', icon: Home, label: 'Inicio' },
    { to: '/services', icon: Search, label: 'Servicios' },
    { to: '/chat', icon: MessageCircle, label: 'Chat', hasIndicator: true },
    { to: '/profile', icon: User, label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 z-50 shadow-[0_-1px_0_0_rgba(0,0,0,0.05),0_-4px_12px_-2px_rgba(0,0,0,0.08)]">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-around py-3">
          {navItems.map((item) => {
            const { to, icon: Icon, label, hasIndicator } = item;
            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center gap-1 py-2 px-4 transition-all duration-200 relative",
                    isActive 
                      ? "text-slate-900" 
                      : "text-slate-400 hover:text-slate-600"
                  )
                }
              >
                <div className="relative">
                  <Icon className="w-6 h-6" strokeWidth={1.5} />
                  {hasIndicator && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
