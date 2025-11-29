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
  return <div className="min-h-screen bg-slate-50">
      {/* Header with Profile Info */}
      <div className="bg-background px-6 pt-8 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-[24px] font-semibold text-white">
              {userInitials}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-[20px] font-semibold text-slate-900">
              {displayName}
              {isProfileIncomplete && (
                <span className="text-[12px] font-normal text-slate-400 ml-2">
                  (Incompleto)
                </span>
              )}
            </h1>
            <p className="text-[13px] text-slate-500 mt-0.5">{profile.email}</p>
            {profile.phone_number ? (
              <div className="flex items-center gap-2 mt-1">
                <span>
                  {countryInfo?.flag || '📱'}
                </span>
                <span className="text-[12px] text-slate-600">{formattedPhone}</span>
              </div>
            ) : (
              <div className="flex items-center text-slate-400 mt-1">
                <Phone size={14} className="mr-2" />
                <span className="text-[12px]">Sin teléfono registrado</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 pb-20 space-y-4">
        {/* Complete Profile Call-to-Action */}
        {isProfileIncomplete && (
          <Card className="rounded-2xl ring-1 ring-emerald-200 bg-emerald-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <User size={20} className="text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[14px] font-semibold text-emerald-700">
                    Completa tu perfil
                  </h3>
                  <p className="text-[12px] text-emerald-600/80">
                    Mejora tu experiencia
                  </p>
                </div>
                <Button 
                  size="sm"
                  onClick={() => setViewMode('personalInfo')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                >
                  Completar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Sections as Cards */}
        {profileSections.map(section => <Card key={section.id} className="rounded-2xl ring-1 ring-slate-200 hover:ring-slate-300 transition-all cursor-pointer" onClick={section.onClick}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <section.icon size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[14px] font-semibold text-slate-900">{section.title}</h3>
                  <p className="text-[12px] text-slate-500">
                    {section.description}
                  </p>
                </div>
                <ChevronRight size={20} className="text-slate-400" />
              </div>
            </CardContent>
          </Card>)}

        {/* Quick Actions */}
        <Card className="rounded-2xl ring-1 ring-slate-200 mt-6">
          <CardContent className="p-4">
            <h3 className="text-[15px] font-semibold text-slate-900 mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-3 gap-3">
              <button className="p-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 hover:ring-slate-300 transition-all" onClick={() => navigate('/services/psychological')}>
                <MessageCircle size={24} className="text-slate-700 mx-auto mb-2" />
                <span className="text-[11px] text-slate-600">Nuevo Chat</span>
              </button>
              
              <button className="p-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 hover:ring-slate-300 transition-all" onClick={() => navigate('/community')}>
                <Heart size={24} className="text-slate-700 mx-auto mb-2" />
                <span className="text-[11px] text-slate-600">Favoritos</span>
              </button>
              
              <button className="p-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 hover:ring-slate-300 transition-all" onClick={() => navigate('/community')}>
                <Users size={24} className="text-slate-700 mx-auto mb-2" />
                <span className="text-[11px] text-slate-600">Comunidad</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button 
          onClick={() => setShowLogoutDialog(true)} 
          variant="outline" 
          className="w-full rounded-xl ring-1 ring-red-200 text-red-600 hover:bg-red-50 hover:ring-red-300"
        >
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