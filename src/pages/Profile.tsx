import { useEffect, useState } from 'react';
import { User, Phone, Mail, Globe, Settings, LogOut, Bell, History, BarChart3, MessageSquare, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  country_of_origin: string;
  preferred_language: string;
  notifications_enabled: boolean;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [originalProfile, setOriginalProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [userStats, setUserStats] = useState({
    chat_sessions: 0,
    testimonials: 0,
    favorites: 0,
    last_activity: null as string | null
  });

  const countries = [
    'El Salvador', 'Honduras', 'Guatemala', 'Nicaragua', 
    'Venezuela', 'Colombia', 'México', 'Perú', 'Ecuador', 'Otro'
  ];

  const languages = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' }
  ];

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
      setProfile(data);
      setOriginalProfile(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Get chat sessions count
      const { count: chatCount } = await supabase
        .from('chat_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get testimonials count
      const { count: testimonialsCount } = await supabase
        .from('testimonials')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get favorites count
      const { count: favoritesCount } = await supabase
        .from('user_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get last activity
      const { data: lastActivity } = await supabase
        .from('user_activity')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      setUserStats({
        chat_sessions: chatCount || 0,
        testimonials: testimonialsCount || 0,
        favorites: favoritesCount || 0,
        last_activity: lastActivity?.[0]?.created_at || null
      });
    } catch (error: any) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleSave = async () => {
    if (!profile || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          email: profile.email,
          phone_number: profile.phone_number,
          country_of_origin: profile.country_of_origin,
          preferred_language: profile.preferred_language,
          notifications_enabled: profile.notifications_enabled,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "¡Perfil actualizado!",
        description: "Los cambios se han guardado correctamente",
      });
      setHasUnsavedChanges(false);
      setOriginalProfile(profile);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      navigate('/onboarding');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive",
      });
    }
  };

  const updateProfile = (field: keyof Profile, value: any) => {
    if (profile) {
      const updatedProfile = { ...profile, [field]: value };
      setProfile(updatedProfile);
      
      // Check if there are unsaved changes
      if (originalProfile) {
        const hasChanges = JSON.stringify(updatedProfile) !== JSON.stringify(originalProfile);
        setHasUnsavedChanges(hasChanges);
      }
    }
  };

  // Handle navigation with unsaved changes
  const handleNavigation = (navigationFn: () => void) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(() => navigationFn);
      setShowUnsavedDialog(true);
    } else {
      navigationFn();
    }
  };

  const handleSaveAndContinue = async () => {
    await handleSave();
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
    setShowUnsavedDialog(false);
  };

  const handleDiscardAndContinue = () => {
    if (originalProfile) {
      setProfile(originalProfile);
      setHasUnsavedChanges(false);
    }
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
    setShowUnsavedDialog(false);
  };

  // Handle browser back/refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="mx-4 max-w-md">
          <CardContent className="text-center py-12">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="mb-2">Perfil no encontrado</h3>
            <p className="body text-muted-foreground mb-4">
              No se pudo cargar la información del perfil
            </p>
            <Button onClick={fetchProfile} variant="outline">
              Intentar de nuevo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-primary text-white px-4 py-8">
        <div className="container mx-auto">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-full p-3">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-white mb-1">Mi Perfil</h1>
              <p className="body text-white/90">
                Gestiona tu información personal
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Información Personal</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Actualiza tu información personal y de contacto
          </p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                value={profile.full_name}
                onChange={(e) => updateProfile('full_name', e.target.value)}
                placeholder="Tu nombre completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={profile.email || ''}
                onChange={(e) => updateProfile('email', e.target.value)}
                placeholder="tu@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Número de Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone_number || ''}
                onChange={(e) => updateProfile('phone_number', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">País de Origen</Label>
              <Select 
                value={profile.country_of_origin || ''} 
                onValueChange={(value) => updateProfile('country_of_origin', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu país" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Preferences */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Preferencias</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Configura tus preferencias de idioma y notificaciones
          </p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Idioma Preferido</Label>
              <Select 
                value={profile.preferred_language} 
                onValueChange={(value) => updateProfile('preferred_language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center">
                  <Bell className="h-4 w-4 mr-2" />
                  Notificaciones
                </Label>
                <p className="body-small text-muted-foreground">
                  Recibir notificaciones importantes
                </p>
              </div>
              <Switch
                checked={profile.notifications_enabled}
                onCheckedChange={(checked) => updateProfile('notifications_enabled', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* User Activity Dashboard */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Tu Actividad</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Resumen de tu uso de los servicios
          </p>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {userStats.chat_sessions}
              </div>
              <p className="body-small text-muted-foreground">Chats</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary mb-1">
                {userStats.testimonials}
              </div>
              <p className="body-small text-muted-foreground">Testimonios</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-1">
                {userStats.favorites}
              </div>
              <p className="body-small text-muted-foreground">Favoritos</p>
            </div>
          </div>
          
          {userStats.last_activity && (
            <div className="text-center pt-2 border-t">
              <p className="body-small text-muted-foreground">
                Última actividad: {new Date(userStats.last_activity).toLocaleDateString('es-ES')}
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Acciones Rápidas</h2>
          
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="h-4 w-4 mr-2" />
              Historial de Chats
              <Badge variant="secondary" className="ml-auto">
                {userStats.chat_sessions}
              </Badge>
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <Heart className="h-4 w-4 mr-2" />
              Mis Favoritos
              <Badge variant="secondary" className="ml-auto">
                {userStats.favorites}
              </Badge>
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Configuración de Privacidad
            </Button>
          </div>
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full btn-primary"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>

        <Separator />

        {/* Logout */}
        <Button 
          variant="destructive" 
          onClick={() => handleNavigation(handleLogout)}
          className="w-full"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>

        {/* Unsaved Changes Dialog */}
        <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Guardar cambios?</AlertDialogTitle>
              <AlertDialogDescription>
                Tienes cambios sin guardar. ¿Qué te gustaría hacer?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleDiscardAndContinue}>
                Descartar cambios
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleSaveAndContinue}>
                Guardar y continuar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Profile;