import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2, Rocket } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();
  const [isLoadingDev, setIsLoadingDev] = useState(false);

  const handleDevAccess = async () => {
    setIsLoadingDev(true);
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) throw error;

      if (data.user) {
        await supabase.from('profiles').upsert({
          user_id: data.user.id,
          full_name: 'Usuario de Desarrollo',
          phone_number: '+1 (555) 123-4567'
        });
      }

      toast({
        title: "¡Acceso Directo!",
        description: "Sesión de desarrollo iniciada",
      });
      
      navigate('/home');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingDev(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col animate-fade-in">
      {/* Main Content - Text + Buttons */}
      <div className="flex-1 flex flex-col justify-center px-6">
        {/* Welcome Text */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-3xl font-bold text-strong-black mb-2">
            Bienvenido
          </h1>
          <p className="text-lg text-muted-foreground">
            Tu camino comienza aquí
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            size="lg" 
            className="w-full text-lg h-14 animate-slide-up bg-brand hover:bg-brand-hover text-white rounded-full"
            style={{ animationDelay: '0.2s' }}
            onClick={() => navigate('/auth?mode=login')}
          >
            Iniciar Sesión
          </Button>
          
          <Button 
            size="lg" 
            variant="outline"
            className="w-full text-lg h-14 animate-slide-up border-slate-200 text-slate-900 rounded-full"
            style={{ animationDelay: '0.3s' }}
            onClick={() => navigate('/auth?mode=signup')}
          >
            Crear Cuenta
          </Button>
        </div>
      </div>

      {/* Dev Mode Access */}
      {import.meta.env.DEV && (
        <div className="px-6 pb-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="border-t border-divider-gray pt-6">
            <p className="text-sm text-muted-foreground text-center mb-3">
              Modo Desarrollo
            </p>
            <Button 
              size="lg"
              variant="secondary"
              className="w-full"
              onClick={handleDevAccess}
              disabled={isLoadingDev}
            >
              {isLoadingDev ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Accediendo...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-5 w-5" />
                  ACCESO RÁPIDO - SIN SMS
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Welcome;
