import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import { 
  Bell, 
  Sparkles, 
  ArrowRight, 
  Scale, 
  HeartHandshake, 
  Users, 
  BookOpen,
  Home as HomeIcon,
  MessageCircle,
  UsersRound,
  User
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const services = [
    {
      icon: Scale,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      title: 'Legal',
      subtitle: 'Asilo, TPS, Visas',
      hoverColor: 'group-hover:text-indigo-600',
      route: '/services/legal'
    },
    {
      icon: HeartHandshake,
      iconBg: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      title: 'Salud Mental',
      subtitle: 'Apoyo Psicológico',
      hoverColor: 'group-hover:text-cyan-600',
      route: '/services/psychological'
    },
    {
      icon: Users,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      title: 'Comunidad',
      subtitle: 'Foros y Eventos',
      hoverColor: 'group-hover:text-indigo-600',
      route: '/community'
    },
    {
      icon: BookOpen,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      title: 'Recursos',
      subtitle: 'Guías y Docs',
      hoverColor: 'group-hover:text-indigo-600',
      route: '/services'
    }
  ];

  const news = [
    {
      id: 'tps-venezuela-update',
      image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=200',
      badge: 'Urgente',
      badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-100',
      title: 'Actualización TPS Venezuela',
      subtitle: 'Nuevos plazos para la reinscripción.',
      time: 'Hace 2h'
    },
    {
      id: 'taller-derechos-laborales',
      image: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&q=80&w=200',
      badge: 'Evento',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      title: 'Taller de Derechos Laborales',
      subtitle: 'Sábado 10AM - Online',
      time: null
    }
  ];

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 animate-slide-down">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-0.5">
              Bienvenido
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
              Club del Migrante
            </h1>
          </div>
          <button 
            className="w-9 h-9 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors relative"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white" />
          </button>
        </div>

        {/* AI Assistant CTA (Hero Card) */}
        <div 
          className="relative w-full rounded-2xl bg-neutral-900 p-5 text-white overflow-hidden shadow-lg group cursor-pointer transition-transform active:scale-[0.98]"
          onClick={() => navigate('/services/psychological')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/20 rounded-full blur-2xl -ml-5 -mb-5" />
          
          <div className="relative z-10 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-lg font-medium tracking-tight">Asistente Virtual 24/7</h3>
              <p className="text-sm text-neutral-400 mt-1 leading-snug">
                Apoyo emocional y dudas legales. Confidencial y anónimo.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs font-medium text-blue-300">
              <span>Iniciar chat seguro</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Servicios Esenciales - Grid 2x2 */}
      <div className="px-6 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-sm font-bold text-neutral-900 tracking-tight mb-4">
          Servicios Esenciales
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {services.map((service, index) => (
            <button
              key={index}
              className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-white hover:shadow-sm transition-all text-left flex flex-col gap-3 group"
              onClick={() => navigate(service.route)}
            >
              <div className={`w-8 h-8 rounded-lg ${service.iconBg} flex items-center justify-center ${service.iconColor}`}>
                <service.icon className="w-4 h-4" />
              </div>
              <div>
                <span className={`block text-sm font-medium text-neutral-900 transition-colors ${service.hoverColor}`}>
                  {service.title}
                </span>
                <span className="text-xs text-neutral-500">
                  {service.subtitle}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Novedades Legales */}
      <div className="px-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-sm font-semibold text-neutral-900 tracking-tight">
            Novedades Legales
          </h2>
          <a 
            href="#" 
            className="text-xs font-medium text-neutral-500 hover:text-neutral-900"
            onClick={(e) => {
              e.preventDefault();
              navigate('/services/legal');
            }}
          >
            Ver todo
          </a>
        </div>
        
        <div className="flex flex-col gap-3">
          {news.map((item, index) => (
            <div 
              key={index}
              className="p-3 rounded-xl border border-neutral-100 bg-white shadow-sm flex gap-4 items-center cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/services/legal/${item.id}`)}
            >
              <div className="w-16 h-16 rounded-lg bg-neutral-100 flex-shrink-0 overflow-hidden">
                <img 
                  src={item.image} 
                  className="w-full h-full object-cover opacity-90" 
                  alt={item.title}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                  {item.time && (
                    <span className="text-[10px] text-neutral-400">{item.time}</span>
                  )}
                </div>
                <h4 className="text-sm font-medium text-neutral-900 truncate">
                  {item.title}
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5 truncate">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;