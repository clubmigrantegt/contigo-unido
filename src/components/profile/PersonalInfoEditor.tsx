import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  full_name: string;
  email: string;
  phone?: string;
  country_of_origin?: string;
}

interface PersonalInfoEditorProps {
  profile: Profile;
  onBack: () => void;
  onSave: (updatedProfile: Profile) => void;
}

const PersonalInfoEditor = ({ profile, onBack, onSave }: PersonalInfoEditorProps) => {
  const [formData, setFormData] = useState<Profile>(profile);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          country_of_origin: formData.country_of_origin,
        })
        .eq('user_id', user.data.user.id);

      if (error) throw error;

      onSave(formData);
      toast({
        title: "Información actualizada",
        description: "Tu información personal ha sido guardada correctamente.",
      });
      onBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la información. Intenta de nuevo.",
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
            Información Personal
          </h1>
        </div>
      </div>

      <div className="px-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Datos Personales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Tu nombre completo"
              />
            </div>

            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
                placeholder="tu@email.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                El correo no se puede modificar
              </p>
            </div>

            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Número de teléfono"
              />
            </div>

            <div>
              <Label htmlFor="country">País de Origen</Label>
              <Input
                id="country"
                value={formData.country_of_origin || ''}
                onChange={(e) => setFormData({ ...formData, country_of_origin: e.target.value })}
                placeholder="Tu país de origen"
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

export default PersonalInfoEditor;