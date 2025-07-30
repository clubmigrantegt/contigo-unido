import { NavLink } from 'react-router-dom';
import { Home, Heart, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomNav = () => {
  const navItems = [
    { to: '/home', icon: Home, label: 'Inicio' },
    { to: '/services', icon: Heart, label: 'Servicios' },
    { to: '/community', icon: Users, label: 'Comunidad' },
    { to: '/profile', icon: User, label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center space-y-1 p-2 min-w-[60px] transition-colors duration-200",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;