import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';

interface Preferences {
  language: string;
  notifications_enabled: boolean;
  theme: string;
}

interface PreferencesEditorProps {
  preferences: Preferences;
  onBack: () => void;
  onSave: (updatedPreferences: Preferences) => void;
}

const PreferencesEditor = ({ preferences, onBack, onSave }: PreferencesEditorProps) => {
  const [formData, setFormData] = useState<Preferences>(preferences);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { setTheme } = useTheme();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update({
          language: formData.language,
          notifications_enabled: formData.notifications_enabled,
        })
        .eq('user_id', user.data.user.id);

      if (error) throw error;

      // Update theme
      setTheme(formData.theme);

      onSave(formData);
      toast({
        title: "Preferencias actualizadas",
        description: "Tus preferencias han sido guardadas correctamente.",
      });
      onBack();
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las preferencias. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-calm-gray">
      <div className="bg-background px-4 pt-12 pb-6">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            Preferencias
          </h1>
        </div>
      </div>

      <div className="px-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuración General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="language">Idioma</Label>
              <Select 
                value={formData.language} 
                onValueChange={(value) => setFormData({ ...formData, language: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="theme">Tema</Label>
              <Select 
                value={formData.theme} 
                onValueChange={(value) => setFormData({ ...formData, theme: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Oscuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Notificaciones</Label>
                <p className="text-sm text-muted-foreground">
                  Recibir notificaciones sobre nuevos mensajes y actualizaciones
                </p>
              </div>
              <Switch
                id="notifications"
                checked={formData.notifications_enabled}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, notifications_enabled: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          <Save size={16} className="mr-2" />
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );
};

export default PreferencesEditor;