import { NavLink } from 'react-router-dom';
import { Home, Heart, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';

const BottomNav = () => {
  const { unreadCount } = useNotifications();
  
  const navItems = [
    { to: '/home', icon: Home, label: 'Inicio' },
    { to: '/services', icon: Heart, label: 'Servicios' },
    { to: '/community', icon: Users, label: 'Comunidad' },
    { to: '/profile', icon: User, label: 'Perfil', badge: unreadCount },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const { to, icon: Icon, label, badge } = item;
            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center space-y-1 p-2 min-w-[60px] transition-colors duration-200 relative",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )
                }
              >
                <div className="relative">
                  <Icon size={20} />
                  {badge && badge > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-4 min-w-[16px] px-1 text-[10px] flex items-center justify-center"
                    >
                      {badge > 99 ? '99+' : badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium">{label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;