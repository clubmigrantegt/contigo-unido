import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { User, Settings, BarChart3, MessageCircle, Heart, Users, ChevronRight, LogOut, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import PersonalInfoEditor from '@/components/profile/PersonalInfoEditor';
import PreferencesEditor from '@/components/profile/PreferencesEditor';
import ActivityView from '@/components/profile/ActivityView';
import { getCountryInfo, formatPhoneNumber, getDisplayName, getUserInitials } from '@/lib/countries';
interface Profile {
  full_name: string;
  email: string;
  phone_number?: string;
  country_of_origin?: string;
  language: string;
  notifications_enabled: boolean;
}
interface UserStats {
  totalSessions: number;
  totalTestimonials: number;
  totalFavorites: number;
  lastActivity: string;
}
type ViewMode = 'main' | 'personalInfo' | 'preferences' | 'activity';
const Profile = () => {
  const {
    user
  } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    totalSessions: 0,
    totalTestimonials: 0,
    totalFavorites: 0,
    lastActivity: 'Nunca'
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserStats();
    }
  }, [user]);
  const fetchProfile = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('profiles').select('*').eq('user_id', user?.id).single();
      if (error) throw error;
      const profileData = {
        full_name: data.full_name || '',
        email: user?.email || '',
        phone_number: data.phone_number || '',
        country_of_origin: data.country_of_origin || '',
        language: data.preferred_language || 'es',
        notifications_enabled: data.notifications_enabled ?? true
      };
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchUserStats = async () => {
    try {
      // Fetch chat sessions count
      const {
        data: sessions,
        error: sessionsError
      } = await supabase.from('chat_sessions').select('id, session_start').eq('user_id', user?.id);
      if (sessionsError) throw sessionsError;

      // Fetch testimonials count (assuming there's a testimonials table)
      const {
        data: testimonials,
        error: testimonialsError
      } = await supabase.from('testimonials').select('id').eq('user_id', user?.id);

      // Fetch favorites count
      const {
        data: favorites,
        error: favoritesError
      } = await supabase.from('user_favorites').select('id').eq('user_id', user?.id);
      const totalSessions = sessions?.length || 0;
      const totalTestimonials = testimonials?.length || 0;
      const totalFavorites = favorites?.length || 0;

      // Get last activity date
      let lastActivity = 'Nunca';
      if (sessions && sessions.length > 0) {
        const sortedSessions = sessions.sort((a, b) => new Date(b.session_start).getTime() - new Date(a.session_start).getTime());
        const lastSessionDate = new Date(sortedSessions[0].session_start);
        lastActivity = lastSessionDate.toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short'
        });
      }
      setUserStats({
        totalSessions,
        totalTestimonials,
        totalFavorites,
        lastActivity
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/onboarding');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión. Intenta de nuevo.",
        variant: "destructive"
      });
    }
  };
  // Get country info for dynamic flag and phone formatting
  const countryInfo = getCountryInfo(profile?.country_of_origin);
  const displayName = getDisplayName(profile?.full_name);
  const userInitials = getUserInitials(profile?.full_name);
  const formattedPhone = formatPhoneNumber(profile?.phone_number, countryInfo);
  
  // Check if profile is incomplete for UI purposes
  const isProfileIncomplete = !profile?.full_name || !profile?.phone_number;

  // Return to main view
  const handleBackToMain = () => {
    setViewMode('main');
  };

  // Handle profile save from editor
  const handleProfileSave = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  // Handle preferences save from editor
  const handlePreferencesSave = (updatedPreferences: {
    language: string;
    notifications_enabled: boolean;
    theme: string;
  }) => {
    if (profile) {
      setProfile({
        ...profile,
        language: updatedPreferences.language,
        notifications_enabled: updatedPreferences.notifications_enabled
      });
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-calm-gray flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>;
  }
  if (!profile) {
    return <div className="min-h-screen bg-calm-gray flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error cargando perfil</h2>
          <p className="text-muted-foreground">No se pudo cargar la información del perfil</p>
        </div>
      </div>;
  }

  // Handle different view modes
  if (viewMode === 'personalInfo') {
    return <PersonalInfoEditor profile={profile} onBack={handleBackToMain} onSave={handleProfileSave} />;
  }
  if (viewMode === 'preferences') {
    return <PreferencesEditor preferences={{
      language: profile.language,
      notifications_enabled: profile.notifications_enabled,
      theme: 'system' // Default theme
    }} onBack={handleBackToMain} onSave={handlePreferencesSave} />;
  }
  if (viewMode === 'activity') {
    return <ActivityView stats={userStats} onBack={handleBackToMain} />;
  }

  // Main profile view with cards
  const profileSections = [{
    id: 'personalInfo',
    icon: User,
    title: 'Información Personal',
    description: 'Actualiza tu información básica',
    onClick: () => setViewMode('personalInfo')
  }, {
    id: 'preferences',
    icon: Settings,
    title: 'Preferencias',
    description: 'Idioma, notificaciones y tema',
    onClick: () => setViewMode('preferences')
  }, {
    id: 'activity',
    icon: BarChart3,
    title: 'Tu Actividad',
    description: 'Estadísticas y historial de uso',
    onClick: () => setViewMode('activity')
  }];
  return <div className="min-h-screen bg-calm-gray mt-4">
      {/* Header with Profile Info */}
      <div className="gradient-hero text-white px-4 pt-12 pb-8">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-white">
              {userInitials}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">
              {displayName}
              {isProfileIncomplete && (
                <span className="text-sm font-normal text-white/60 ml-2">
                  (Perfil incompleto)
                </span>
              )}
            </h1>
            <p className="text-white/80 text-sm mb-1">{profile.email}</p>
            {profile.phone_number ? (
              <div className="flex items-center text-white/80 text-sm">
                <span className="mr-2">
                  {countryInfo?.flag || '📱'}
                </span>
                <span>{formattedPhone}</span>
              </div>
            ) : (
              <div className="flex items-center text-white/60 text-sm">
                <Phone size={14} className="mr-2" />
                <span>Sin teléfono registrado</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 mt-2 pb-20 space-y-4">
        {/* Complete Profile Call-to-Action */}
        {isProfileIncomplete && (
          <Card className="card-elevated border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <User size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">
                      Completa tu perfil
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Agrega tu información personal para una mejor experiencia
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setViewMode('personalInfo')}
                  className="w-full"
                >
                  Completar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Sections as Cards */}
        {profileSections.map(section => <Card key={section.id} className="card-elevated cursor-pointer hover:shadow-lg transition-all duration-200" onClick={section.onClick}>
            <CardContent className="p-6 px-0 py-[8px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <section.icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-muted-foreground" />
              </div>
            </CardContent>
          </Card>)}

        {/* Quick Actions */}
        <Card className="card-elevated mt-8">
          <CardContent className="p-6 px-0 py-[12px]">
            <h3 className="font-semibold mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="flex flex-col h-auto py-4" onClick={() => navigate('/services/psychological')}>
                <MessageCircle size={24} className="mb-2 text-primary" />
                <span className="text-xs">Nuevo Chat</span>
              </Button>
              
              <Button variant="outline" className="flex flex-col h-auto py-4" onClick={() => navigate('/community')}>
                <Heart size={24} className="mb-2 text-secondary" />
                <span className="text-xs">Favoritos</span>
              </Button>
              
              <Button variant="outline" className="flex flex-col h-auto py-4" onClick={() => navigate('/community')}>
                <Users size={24} className="mb-2 text-accent" />
                <span className="text-xs">Comunidad</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button onClick={() => setShowLogoutDialog(true)} variant="destructive" className="w-full">
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cerrar Sesión</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres cerrar sesión? Tendrás que iniciar sesión nuevamente para acceder a tu cuenta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              Cerrar Sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};
export default Profile;