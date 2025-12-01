import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Pencil, CalendarIcon, Lock, FileUp, Info, ChevronDown } from 'lucide-react';
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

const IMMIGRATION_STATUS_OPTIONS = [
  { value: 'tps_solicitado', label: 'TPS Solicitado' },
  { value: 'tps_aprobado', label: 'TPS Aprobado' },
  { value: 'asilo_pendiente', label: 'Asilo Pendiente' },
  { value: 'parole', label: 'Parole' },
  { value: 'visa_trabajo', label: 'Visa de Trabajo' },
  { value: 'residencia', label: 'Residencia' },
  { value: 'otro', label: 'Otro' },
];

const PersonalInfoEditor = ({ profile, onBack, onSave }: PersonalInfoEditorProps) => {
  const [formData, setFormData] = useState<Profile & { immigration_status?: string }>(profile);
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

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

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
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Archivo inválido",
          description: "Por favor selecciona una imagen (JPG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
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

  const userInitials = getUserInitials(formData.full_name);

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
          Información Personal
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
        {/* Avatar Edit */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-full p-1 border-2 border-neutral-100 relative overflow-hidden">
              {formData.avatar_url ? (
                <img 
                  src={formData.avatar_url} 
                  className="w-full h-full object-cover rounded-full" 
                  alt="Avatar"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 text-xl font-semibold">
                  {userInitials}
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <button 
              className="absolute bottom-0 right-0 w-8 h-8 bg-neutral-900 rounded-full flex items-center justify-center border-2 border-white shadow-md text-white hover:scale-110 transition-transform"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          {isUploading && (
            <p className="text-xs text-neutral-500 mt-2">Subiendo imagen...</p>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-2 ml-1">
              Nombre Completo
            </label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Tu nombre completo"
              className="h-12 rounded-xl border-neutral-200 bg-neutral-50 text-neutral-900 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-2 ml-1">
              Número de Teléfono
            </label>
            <div className="relative">
              <Input
                value={formData.phone_number || ''}
                readOnly
                className="h-12 rounded-xl border-neutral-200 bg-neutral-100 text-neutral-500 px-4 text-sm font-medium cursor-not-allowed pr-24"
              />
              <div className="absolute inset-y-0 right-4 flex items-center text-neutral-400 gap-2">
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                  Verificado
                </span>
                <Lock className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-[10px] text-neutral-400 mt-1.5 ml-1">
              Contacta a soporte para cambiar tu número.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-2 ml-1">
              Correo Electrónico
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="tu@email.com"
              className="h-12 rounded-xl border-neutral-200 bg-neutral-50 text-neutral-900 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-2 mb-2 ml-1">
              <label className="block text-xs font-semibold text-neutral-500">
                Información Migratoria
              </label>
              <div className="group relative">
                <Info className="w-3 h-3 text-neutral-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-neutral-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center leading-snug">
                  Usado para personalizar las noticias legales y recursos.
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Select 
                  value={formData.country_of_origin || ''} 
                  onValueChange={(value) => setFormData({ ...formData, country_of_origin: value })}
                >
                  <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-neutral-50 text-neutral-900 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all">
                    <SelectValue placeholder="País" />
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
              <div className="relative">
                <Select 
                  value={formData.gender || ''} 
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger className="h-12 rounded-xl border-neutral-200 bg-neutral-50 text-neutral-900 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all">
                    <SelectValue placeholder="Estatus" />
                  </SelectTrigger>
                  <SelectContent>
                    {IMMIGRATION_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 mb-2 ml-1">
              Fecha de Nacimiento
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left font-medium rounded-xl border-neutral-200 bg-neutral-50 px-4 text-sm hover:bg-neutral-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
                    !selectedDate && "text-neutral-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-neutral-400" />
                  {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Selecciona fecha"}
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

          <div className="pt-4">
            <button className="w-full py-4 rounded-xl border-2 border-dashed border-neutral-200 text-neutral-500 text-sm font-medium hover:bg-neutral-50 hover:border-neutral-300 transition-all flex items-center justify-center gap-2 group">
              <FileUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              Subir Documento de Identidad
            </button>
            <p className="text-[10px] text-neutral-400 mt-2 text-center">
              Tus documentos están encriptados y seguros.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoEditor;
