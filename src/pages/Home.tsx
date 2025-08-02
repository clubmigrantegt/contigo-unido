import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Scale, Users, ChevronRight, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
interface Banner {
  id: string;
  title: string;
  content: string;
  link_url?: string;
  link_text?: string;
}
interface Profile {
  full_name: string;
}
const Home = () => {
  const {
    user
  } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      fetchBanners();
      fetchProfile();
    }
  }, [user]);
  const fetchBanners = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('banners').select('*').eq('is_active', true).order('priority', {
        ascending: false
      }).limit(1);
      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };
  const fetchProfile = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('profiles').select('full_name').eq('user_id', user?.id).single();
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };
  const firstName = profile?.full_name?.split(' ')[0] || 'Amigo';
  const services = [{
    icon: Heart,
    title: 'Apoyo Psicológico 24/7',
    description: 'Chat en tiempo real con apoyo profesional',
    color: 'bg-primary',
    textColor: 'text-primary',
    route: '/services/psychological'
  }, {
    icon: Scale,
    title: 'Orientación Legal',
    description: 'Información sobre tus derechos',
    color: 'bg-secondary',
    textColor: 'text-secondary',
    route: '/services/legal'
  }, {
    icon: Users,
    title: 'Comunidad',
    description: 'Conecta con otros migrantes',
    color: 'bg-accent',
    textColor: 'text-accent-foreground',
    route: '/community'
  }];
  return <div className="min-h-screen bg-calm-gray">
      {/* Header */}
      <div className="bg-background px-4 pt-12 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {getGreeting()}, {firstName}
            </h1>
            <p className="text-muted-foreground mt-1">
              Estamos contigo en tu camino
            </p>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => navigate('/notifications')}>
            <Bell size={20} />
          </Button>
        </div>
      </div>

      {/* Banner */}
      {banners.length > 0 && <div className="px-4 pb-6">
          <Card className="gradient-hero text-white">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-2">
                {banners[0].title}
              </h3>
              <p className="text-white/90 mb-4">
                {banners[0].content}
              </p>
              {banners[0].link_text && <Button variant="secondary" size="sm" className="bg-yellow-400 hover:bg-yellow-300">
                  {banners[0].link_text}
                  <ChevronRight size={16} className="ml-1" />
                </Button>}
            </CardContent>
          </Card>
        </div>}

      {/* Services Grid */}
      <div className="px-4 space-y-4">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Nuestros Servicios
        </h2>
        
        {services.map((service, index) => <Card key={index} className="card-elevated hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => navigate(service.route)}>
            <CardContent className="p-6 px-0 py-[16px]">
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center flex-shrink-0`}>
                  <service.icon size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {service.description}
                  </p>
                </div>
                <ChevronRight size={20} className="text-muted-foreground flex-shrink-0" />
              </div>
            </CardContent>
          </Card>)}
      </div>

      {/* Quick Access */}
      <div className="px-4 pt-8 pb-20">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Acceso Rápido
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <Card className="card-elevated cursor-pointer hover:shadow-lg transition-all duration-200">
            <CardContent className="p-4 text-center px-[8px] py-[8px]">
              <Heart size={24} className="text-primary mx-auto mb-2" />
              <h4 className="font-medium text-sm">Chat de Apoyo</h4>
            </CardContent>
          </Card>
          
          <Card className="card-elevated cursor-pointer hover:shadow-lg transition-all duration-200">
            <CardContent className="p-4 text-center px-[8px] py-[8px]">
              <Users size={24} className="text-accent-foreground mx-auto mb-2" />
              <h4 className="font-medium text-sm">Testimonios</h4>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default Home;