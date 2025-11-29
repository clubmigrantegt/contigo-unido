import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleDevAccess = async () => {
    setLoading(true);
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
        title: "¡Acceso Directo! 🔧",
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] p-6">
      <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto space-y-12">
        {/* Welcome text - left aligned */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Bienvenido
          </h1>
          <p className="text-lg text-muted-foreground">
            Tu camino comienza aquí
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-4">
          <Button
            onClick={() => navigate('/auth?mode=login')}
            className="w-full btn-primary"
            size="lg"
          >
            Iniciar Sesión
          </Button>
          
          <Button
            onClick={() => navigate('/auth?mode=signup')}
            variant="outline"
            className="w-full h-12 rounded-xl font-medium border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            size="lg"
          >
            Crear Cuenta
          </Button>

          {/* Dev mode access */}
          {import.meta.env.DEV && (
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center mb-3">
                🔧 Modo Desarrollo
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleDevAccess}
                disabled={loading}
                className="w-full bg-blue-50 border-2 border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900 font-semibold h-12 rounded-xl"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "🚀 "
                )}
                ACCESO RÁPIDO - SIN SMS
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Welcome;
