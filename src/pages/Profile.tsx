import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User, ShieldCheck, Bell, Globe, HelpCircle, LogOut, UserCog, ChevronRight, ExternalLink, Check, LucideIcon } from 'lucide-react';
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

interface SettingsRowProps {
  icon: LucideIcon;
  iconBgClass?: string;
  iconColorClass?: string;
  label: string;
  rightElement?: React.ReactNode;
  rightText?: string;
  hasChevron?: boolean;
  hasExternalLink?: boolean;
  variant?: 'default' | 'danger';
  onClick?: () => void;
  isLast?: boolean;
}

const SettingsRow = ({ 
  icon: Icon, 
  iconBgClass = 'bg-neutral-100', 
  iconColorClass = 'text-neutral-600',
  label, 
  rightElement, 
  rightText,
  hasChevron = true,
  hasExternalLink = false,
  variant = 'default',
  onClick,
  isLast = false
}: SettingsRowProps) => {
  const isDanger = variant === 'danger';
  
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors group ${!isLast ? 'border-b border-neutral-100' : ''} ${isDanger ? 'hover:bg-red-50' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg ${isDanger ? 'bg-red-50 text-red-500' : iconBgClass + ' ' + iconColorClass} flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className={`text-sm font-medium ${isDanger ? 'text-red-600' : 'text-neutral-900'}`}>
          {label}
        </span>
      </div>
      
      {rightElement || (
        <div className="flex items-center gap-1">
          {rightText && (
            <span className="text-xs text-neutral-400 font-medium mr-1">
              {rightText}
            </span>
          )}
          {hasExternalLink ? (
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          ) : hasChevron ? (
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          ) : null}
        </div>
      )}
    </button>
  );
};

const Profile = () => {
  const { user } = useAuth();
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
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

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
      const { data: sessions, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('id, session_start')
        .eq('user_id', user?.id);

      if (sessionsError) throw sessionsError;

      const { data: testimonials } = await supabase
        .from('testimonials')
        .select('id')
        .eq('user_id', user?.id);

      const { data: favorites } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user?.id);

      const totalSessions = sessions?.length || 0;
      const totalTestimonials = testimonials?.length || 0;
      const totalFavorites = favorites?.length || 0;

      let lastActivity = 'Nunca';
      if (sessions && sessions.length > 0) {
        const sortedSessions = sessions.sort((a, b) => 
          new Date(b.session_start).getTime() - new Date(a.session_start).getTime()
        );
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

  const handleToggleNotifications = async () => {
    if (!profile) return;

    const newValue = !profile.notifications_enabled;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ notifications_enabled: newValue })
        .eq('user_id', user?.id);

      if (error) throw error;

      setProfile({ ...profile, notifications_enabled: newValue });
      
      toast({
        title: newValue ? "Notificaciones activadas" : "Notificaciones desactivadas",
        description: newValue 
          ? "Recibirás notificaciones sobre tus sesiones" 
          : "No recibirás notificaciones"
      });
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración",
        variant: "destructive"
      });
    }
  };

  const countryInfo = getCountryInfo(profile?.country_of_origin);
  const displayName = getDisplayName(profile?.full_name);
  const userInitials = getUserInitials(profile?.full_name);
  const formattedPhone = formatPhoneNumber(profile?.phone_number, countryInfo);

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    let completed = 0;
    const totalFields = 4;

    if (profile.full_name) completed++;
    if (profile.phone_number) completed++;
    if (profile.country_of_origin) completed++;
    if (profile.email) completed++;

    return Math.round((completed / totalFields) * 100);
  };

  const profileCompletion = calculateProfileCompletion();
  const isProfileIncomplete = profileCompletion < 100;

  const handleBackToMain = () => {
    setViewMode('main');
  };

  const handleProfileSave = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
    fetchProfile(); // Refresh to recalculate completion
  };

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
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error cargando perfil</h2>
          <p className="text-muted-foreground">No se pudo cargar la información del perfil</p>
        </div>
      </div>
    );
  }

  if (viewMode === 'personalInfo') {
    return <PersonalInfoEditor profile={profile} onBack={handleBackToMain} onSave={handleProfileSave} />;
  }

  if (viewMode === 'preferences') {
    return (
      <PreferencesEditor 
        preferences={{
          language: profile.language,
          notifications_enabled: profile.notifications_enabled,
          theme: 'system'
        }} 
        onBack={handleBackToMain} 
        onSave={handlePreferencesSave} 
      />
    );
  }

  if (viewMode === 'activity') {
    return <ActivityView stats={userStats} onBack={handleBackToMain} />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 bg-white sticky top-0 z-20 border-b border-transparent">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900">Perfil y Ajustes</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-24 bg-white">
        <div className="px-6 pb-6 pt-2">
          {/* User Profile Section */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative shrink-0">
              <Avatar className="w-16 h-16 border border-neutral-200 shadow-sm">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`} />
                <AvatarFallback className="bg-neutral-100 text-neutral-600 text-lg font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 leading-tight">
                {displayName}
              </h2>
              <p className="text-sm text-neutral-500 mb-1">{formattedPhone || 'Sin teléfono'}</p>
              <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                Miembro Básico
              </Badge>
            </div>
          </div>

          {/* Complete Profile Card */}
          {isProfileIncomplete && (
            <div className="relative overflow-hidden rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-4 shadow-sm mb-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-indigo-900">Completa tu perfil</h3>
                  <p className="text-xs text-indigo-700/80 mt-1 max-w-[200px]">
                    Añade tu información legal básica para recibir ayuda personalizada.
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <UserCog className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={profileCompletion} className="flex-1 h-2" />
                <span className="text-xs font-bold text-indigo-900">{profileCompletion}%</span>
              </div>
              <Button
                onClick={() => setViewMode('personalInfo')}
                className="mt-3 w-full py-2 bg-white border border-indigo-100 rounded-lg text-xs font-semibold text-indigo-700 hover:bg-indigo-50 shadow-sm"
                variant="outline"
              >
                Continuar
              </Button>
            </div>
          )}

          {/* Settings Sections */}
          <div className="space-y-6">
            {/* CUENTA */}
            <div>
              <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 pl-2">
                Cuenta
              </h4>
              <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
                <SettingsRow
                  icon={User}
                  label="Información Personal"
                  onClick={() => setViewMode('personalInfo')}
                />
                <SettingsRow
                  icon={ShieldCheck}
                  label="Seguridad y Privacidad"
                  onClick={() => {
                    toast({
                      title: "Próximamente",
                      description: "Esta función estará disponible pronto"
                    });
                  }}
                  isLast
                />
              </div>
            </div>

            {/* PREFERENCIAS */}
            <div>
              <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 pl-2">
                Preferencias
              </h4>
              <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
                <SettingsRow
                  icon={Bell}
                  label="Notificaciones"
                  hasChevron={false}
                  rightElement={
                    <div 
                      className={`w-10 h-6 rounded-full relative transition-colors duration-200 cursor-pointer ${
                        profile.notifications_enabled ? 'bg-emerald-500' : 'bg-neutral-200'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleNotifications();
                      }}
                    >
                      <div 
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                          profile.notifications_enabled ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  }
                  onClick={handleToggleNotifications}
                />
                <SettingsRow
                  icon={Globe}
                  label="Idioma"
                  rightText="Español"
                  onClick={() => setViewMode('preferences')}
                  isLast
                />
              </div>
            </div>

            {/* SOPORTE */}
            <div>
              <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 pl-2">
                Soporte
              </h4>
              <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden mb-6">
                <SettingsRow
                  icon={HelpCircle}
                  label="Ayuda y Soporte"
                  hasExternalLink
                  onClick={() => window.open('https://docs.lovable.dev/features/cloud', '_blank')}
                />
                <SettingsRow
                  icon={LogOut}
                  label="Cerrar Sesión"
                  variant="danger"
                  hasChevron={false}
                  onClick={() => setShowLogoutDialog(true)}
                  isLast
                />
              </div>

              {/* Footer */}
              <div className="flex justify-center flex-col items-center pb-6">
                <p className="text-[10px] text-neutral-400">Versión 1.0.4</p>
                <p className="text-[10px] text-neutral-300 mt-1">Hecho con ❤️ para la comunidad</p>
              </div>
            </div>
          </div>
        </div>
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
    </div>
  );
};

export default Profile;
