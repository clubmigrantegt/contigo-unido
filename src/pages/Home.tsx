import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Scale, Users, User, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const services = [
    {
      icon: Heart,
      title: 'Apoyo Psicológico',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      route: '/services/psychological'
    },
    {
      icon: Scale,
      title: 'Orientación Legal',
      bgColor: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      route: '/services/legal'
    },
    {
      icon: Users,
      title: 'Comunidad',
      bgColor: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      route: '/community'
    }
  ];
  return (
    <div className="min-h-screen bg-white">
      {/* Header Simplificado */}
      <div className="bg-white px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">
            Club del Migrante
          </h1>
          <button 
            onClick={() => navigate('/profile')}
            className="w-11 h-11 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <User size={22} />
          </button>
        </div>
      </div>

      <div className="px-6 space-y-8 pb-24">
        {/* Welcome Card */}
        <Card className="rounded-3xl bg-rose-50/70 border-0 shadow-none">
          <CardContent className="p-6">
            <span className="text-[12px] font-semibold text-brand uppercase tracking-wider">
              BIENVENIDO
            </span>
            
            <h2 className="text-[24px] font-bold text-slate-900 mt-2 leading-tight">
              Tu apoyo en el camino migratorio
            </h2>
            
            <p className="text-[14px] text-slate-500 mt-3 leading-relaxed">
              Accede a apoyo psicológico, información legal y una comunidad que te entiende.
            </p>
            
            <div className="flex items-center gap-4 mt-5">
              <Button 
                onClick={() => navigate('/services')}
                className="bg-brand hover:bg-brand-hover text-white rounded-full px-6 py-2.5 text-[14px] font-semibold"
              >
                Comenzar
              </Button>
              <span className="text-[13px] text-slate-400">v2.0</span>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-bold text-slate-900">Servicios</h2>
            <button 
              onClick={() => navigate('/services')}
              className="text-[14px] font-medium text-brand hover:text-brand-hover"
            >
              Ver todos
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {services.map((service, index) => (
              <Card 
                key={index}
                className={`rounded-2xl border-0 shadow-none cursor-pointer hover:scale-105 transition-transform ${service.bgColor}`}
                onClick={() => navigate(service.route)}
              >
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className={`w-14 h-14 rounded-full ${service.iconBg} flex items-center justify-center mb-3`}>
                    <service.icon size={26} className={service.iconColor} />
                  </div>
                  <span className="text-[12px] font-medium text-slate-700 leading-tight">
                    {service.title}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Access */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-bold text-slate-900">Acceso Rápido</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card 
              className="rounded-2xl bg-violet-50 border-0 shadow-none cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate('/profile')}
            >
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mb-2">
                  <User size={22} className="text-violet-600" />
                </div>
                <span className="text-[12px] font-medium text-slate-700">Mi Perfil</span>
              </CardContent>
            </Card>
            
            <Card 
              className="rounded-2xl bg-pink-50 border-0 shadow-none cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate('/community')}
            >
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-2">
                  <MessageCircle size={22} className="text-pink-600" />
                </div>
                <span className="text-[12px] font-medium text-slate-700">Testimonios</span>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Home;