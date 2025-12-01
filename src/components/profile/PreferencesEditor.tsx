import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { LATIN_AMERICAN_COUNTRIES } from '@/components/ui/country-phone-input';

interface Preferences {
  language: string;
  notifications_enabled: boolean;
  theme: string;
  country_of_origin?: string;
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
          country_of_origin: formData.country_of_origin,
        })
        .eq('user_id', user.data.user.id);

      if (error) throw error;

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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 bg-white/90 backdrop-blur-md sticky top-0 z-30 border-b border-neutral-100 flex items-center justify-between">
        <button 
          onClick={onBack} 
          className="p-2 -ml-2 rounded-full hover:bg-neutral-50 text-neutral-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-neutral-900 absolute left-1/2 transform -translate-x-1/2">
          Preferencias
        </h1>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
        >
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24">
        <div className="space-y-8">
          {/* Section: General */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 pl-2">
              General
            </h4>
            <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-neutral-100">
                <label className="block text-xs font-semibold text-neutral-500 mb-2">
                  Idioma
                </label>
                <Select 
                  value={formData.language} 
                  onValueChange={(value) => setFormData({ ...formData, language: value })}
                >
                  <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-neutral-50 text-neutral-900 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all">
                    <SelectValue placeholder="Selecciona un idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 border-b border-neutral-100">
                <label className="block text-xs font-semibold text-neutral-500 mb-2">
                  Tema
                </label>
                <Select 
                  value={formData.theme} 
                  onValueChange={(value) => setFormData({ ...formData, theme: value })}
                >
                  <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-neutral-50 text-neutral-900 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all">
                    <SelectValue placeholder="Selecciona un tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Oscuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4">
                <label className="block text-xs font-semibold text-neutral-500 mb-2">
                  País de origen
                </label>
                <Select 
                  value={formData.country_of_origin} 
                  onValueChange={(value) => setFormData({ ...formData, country_of_origin: value })}
                >
                  <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-neutral-50 text-neutral-900 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all">
                    <SelectValue placeholder="Selecciona tu país" />
                  </SelectTrigger>
                  <SelectContent>
                    {LATIN_AMERICAN_COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section: Notifications */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 pl-2">
              Notificaciones
            </h4>
            <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="pr-4">
                  <span className="block text-sm font-medium text-neutral-900">Notificaciones Push</span>
                  <span className="block text-[10px] text-neutral-400 leading-tight mt-0.5">
                    Recibir notificaciones sobre nuevos mensajes y actualizaciones
                  </span>
                </div>
                <Switch
                  checked={formData.notifications_enabled}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, notifications_enabled: checked })
                  }
                  className="shrink-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesEditor;
