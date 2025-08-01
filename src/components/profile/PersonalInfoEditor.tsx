import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Save, Camera, CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { COUNTRIES, getUserInitials } from '@/lib/countries';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Profile {
  full_name: string;
  email: string;
  phone_number?: string;
  country_of_origin?: string;
  avatar_url?: string;
  gender?: string;
  date_of_birth?: string;
}

interface PersonalInfoEditorProps {
  profile: Profile;
  onBack: () => void;
  onSave: (updatedProfile: Profile) => void;
}

const PersonalInfoEditor = ({ profile, onBack, onSave }: PersonalInfoEditorProps) => {
  const [formData, setFormData] = useState<Profile>(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    profile.date_of_birth ? new Date(profile.date_of_birth) : undefined
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const countryOptions = Object.keys(COUNTRIES).map(country => ({
    value: country,
    label: `${COUNTRIES[country].flag} ${country}`,
    flag: COUNTRIES[country].flag
  }));

  const handleAvatarUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('No user found');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.data.user.id}/avatar.${fileExt}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));

      toast({
        title: "Avatar actualizado",
        description: "Tu foto de perfil ha sido subida correctamente.",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la imagen. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Archivo inválido",
          description: "Por favor selecciona una imagen (JPG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Archivo muy grande",
          description: "La imagen debe ser menor a 5MB",
          variant: "destructive",
        });
        return;
      }

      handleAvatarUpload(file);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setFormData(prev => ({ 
      ...prev, 
      date_of_birth: date ? format(date, 'yyyy-MM-dd') : undefined 
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('No user found');

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          country_of_origin: formData.country_of_origin,
          avatar_url: formData.avatar_url,
          gender: formData.gender,
          date_of_birth: formData.date_of_birth,
        })
        .eq('user_id', user.data.user.id);

      if (profileError) throw profileError;

      // Update email in auth if changed
      if (formData.email !== profile.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        });

        if (emailError) throw emailError;
      }

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
            <CardTitle>Foto de Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={formData.avatar_url} alt="Avatar" />
                <AvatarFallback className="text-lg">
                  {getUserInitials(formData.full_name)}
                </AvatarFallback>
              </Avatar>
              
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center space-x-2"
              >
                <Camera size={16} />
                <span>{isUploading ? 'Subiendo...' : 'Cambiar Foto'}</span>
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <p className="text-xs text-muted-foreground text-center">
                Formatos soportados: JPG, PNG. Máximo 5MB.
              </p>
            </div>
          </CardContent>
        </Card>

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
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Teléfono de Registro</Label>
              <Input
                id="phone"
                value={formData.phone_number || ''}
                placeholder="Número usado en el registro"
                className="bg-muted"
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">
                Este es el número usado en tu registro
              </p>
            </div>

            <div>
              <Label htmlFor="country">País de Origen</Label>
              <Select 
                value={formData.country_of_origin || ''} 
                onValueChange={(value) => setFormData({ ...formData, country_of_origin: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu país de origen" />
                </SelectTrigger>
                <SelectContent>
                  {countryOptions.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="gender">Género</Label>
              <Select 
                value={formData.gender || ''} 
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="femenino">Femenino</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                  <SelectItem value="no_especifica">Prefiero no decir</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="birthdate">Fecha de Nacimiento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Selecciona tu fecha de nacimiento"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
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