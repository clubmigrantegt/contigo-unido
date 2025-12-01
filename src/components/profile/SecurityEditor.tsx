import { useState } from 'react';
import { ArrowLeft, ShieldCheck, ScanFace, Smartphone, Key, ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface SecurityEditorProps {
  onBack: () => void;
}

const SecurityEditor = ({ onBack }: SecurityEditorProps) => {
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [communityVisible, setCommunityVisible] = useState(false);
  const [anonymousData, setAnonymousData] = useState(true);
  const { toast } = useToast();

  const handleToggle = (setting: string, value: boolean) => {
    toast({
      title: value ? "Activado" : "Desactivado",
      description: `${setting} ha sido ${value ? 'activado' : 'desactivado'}.`,
    });
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
        <h1 className="text-base font-bold text-neutral-900">Seguridad</h1>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24">
        {/* Security Score */}
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3 mb-8">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-800">Tu cuenta está protegida</h3>
            <p className="text-xs text-emerald-700/80 mt-1 leading-relaxed">
              La autenticación de dos factores está activa y tu contraseña es fuerte.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Section: Login */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 pl-2">
              Inicio de Sesión
            </h4>
            <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
              {/* FaceID Toggle */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 flex items-center justify-center">
                    <ScanFace className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-neutral-900">Face ID</span>
                    <span className="block text-[10px] text-neutral-400">Entrar sin contraseña</span>
                  </div>
                </div>
                <Switch
                  checked={faceIdEnabled}
                  onCheckedChange={(checked) => {
                    setFaceIdEnabled(checked);
                    handleToggle('Face ID', checked);
                  }}
                />
              </div>

              {/* 2FA Toggle */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-neutral-900">Verificación en 2 pasos</span>
                    <span className="block text-[10px] text-neutral-400">SMS al +1 (555)...</span>
                  </div>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={(checked) => {
                    setTwoFactorEnabled(checked);
                    handleToggle('Verificación en 2 pasos', checked);
                  }}
                />
              </div>

              {/* Password Change */}
              <button 
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors group"
                onClick={() => {
                  toast({
                    title: "Próximamente",
                    description: "Esta función estará disponible pronto.",
                  });
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-50 text-neutral-600 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                    <Key className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-neutral-900">Cambiar Contraseña</span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
          </div>

          {/* Section: Data Privacy */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 pl-2">
              Privacidad de Datos
            </h4>
            <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-neutral-100">
                <div className="flex items-center gap-3 pr-4">
                  <div>
                    <span className="block text-sm font-medium text-neutral-900">Visibilidad en Comunidad</span>
                    <span className="block text-[10px] text-neutral-400 leading-tight mt-0.5">
                      Permitir que otros migrantes te encuentren por país.
                    </span>
                  </div>
                </div>
                <Switch
                  checked={communityVisible}
                  onCheckedChange={(checked) => {
                    setCommunityVisible(checked);
                    handleToggle('Visibilidad en Comunidad', checked);
                  }}
                  className="shrink-0"
                />
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 pr-4">
                  <div>
                    <span className="block text-sm font-medium text-neutral-900">Datos Anónimos</span>
                    <span className="block text-[10px] text-neutral-400 leading-tight mt-0.5">
                      Compartir estadísticas para mejorar servicios legales.
                    </span>
                  </div>
                </div>
                <Switch
                  checked={anonymousData}
                  onCheckedChange={(checked) => {
                    setAnonymousData(checked);
                    handleToggle('Datos Anónimos', checked);
                  }}
                  className="shrink-0"
                />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-4">
            <button 
              className="w-full py-3.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
              onClick={() => {
                toast({
                  title: "Contacta a soporte",
                  description: "Para eliminar tu cuenta, contacta a nuestro equipo de soporte.",
                });
              }}
            >
              Eliminar mi cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityEditor;
