import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CountryPhoneInput, Country } from '@/components/ui/country-phone-input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [fullName, setFullName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [defaultCountryCode, setDefaultCountryCode] = useState<string>();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLogin(mode === 'login');
  }, [mode]);

  // Load user's preferred country
  useEffect(() => {
    const loadUserCountry = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('country_of_origin')
          .eq('user_id', user.id)
          .single();
        
        if (data?.country_of_origin) {
          setDefaultCountryCode(data.country_of_origin);
        }
      }
    };
    loadUserCountry();
  }, []);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
        options: {
          shouldCreateUser: false,
          channel: 'sms'
        }
      });

      if (error) throw error;

      setOtpSent(true);
      toast({
        title: "Código enviado",
        description: "Revisa tu teléfono para el código de verificación",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al enviar el código",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !otp) return;

    setLoading(true);
    try {
      // Development bypass
      if (import.meta.env.DEV && otp === '123456') {
        const { data, error } = await supabase.auth.signInAnonymously();
        
        if (error) throw error;

        if (data.user) {
          await supabase.from('profiles').upsert({
            user_id: data.user.id,
            full_name: fullName || 'Usuario de Prueba',
            phone_number: phone,
            country_of_origin: selectedCountry?.code
          });
        }

        toast({
          title: "¡Bienvenido! (Modo Desarrollo)",
          description: "Sesión iniciada con código de prueba",
        });
        
        navigate('/home');
        return;
      }

      // Production OTP verification
      const { error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: 'sms'
      });

      if (error) throw error;

      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión exitosamente",
      });
      
      navigate('/home');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Código inválido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !fullName) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
        options: {
          shouldCreateUser: true,
          channel: 'sms',
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;

      setOtpSent(true);
      toast({
        title: "Registro exitoso",
        description: "Revisa tu teléfono para el código de verificación",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error en el registro",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (otpSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOtpSent(false)}
            className="p-2 -ml-2"
          >
            <ArrowLeft size={20} />
          </Button>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Verificar Código
            </h1>
            <p className="text-muted-foreground">
              Ingresa el código que enviamos a {phone}
            </p>
            {import.meta.env.DEV && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  💡 Modo Desarrollo: usa <strong>123456</strong> para acceder
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="otp">Código de verificación</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="text-center text-2xl tracking-widest h-14"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-brand hover:bg-brand-hover text-white rounded-xl"
              disabled={loading || !otp}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verificar
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-md space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/welcome')}
          className="p-2 -ml-2"
        >
          <ArrowLeft size={20} />
        </Button>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h1>
          <p className="text-muted-foreground">
            {isLogin 
              ? 'Ingresa tu número de teléfono'
              : 'Únete a la comunidad'
            }
          </p>
        </div>

        <form onSubmit={isLogin ? handleSendOTP : handleSignUp} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Tu nombre completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-12"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="phone">Número de teléfono</Label>
            <CountryPhoneInput
              value={phone}
              onChange={setPhone}
              onCountryChange={setSelectedCountry}
              defaultCountryCode={defaultCountryCode}
              disabled={loading}
              required
              showValidation
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-brand hover:bg-brand-hover text-white rounded-xl"
            disabled={loading || !phone || (!isLogin && !fullName)}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLogin ? 'Enviar Código' : 'Crear Cuenta'}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              navigate(`/auth?mode=${isLogin ? 'signup' : 'login'}`);
            }}
            className="text-brand text-sm font-medium hover:underline"
          >
            {isLogin 
              ? '¿No tienes cuenta? Regístrate'
              : '¿Ya tienes cuenta? Inicia sesión'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
