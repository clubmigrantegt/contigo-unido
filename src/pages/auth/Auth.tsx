import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { CountryPhoneInput } from '@/components/ui/country-phone-input';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'signup';
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [smsConsent, setSmsConsent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (otpSent && resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (otpSent && resendCountdown === 0) {
      setCanResend(true);
    }
  }, [otpSent, resendCountdown]);

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu número de teléfono",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (error) throw error;

      setOtpSent(true);
      setResendCountdown(60);
      setCanResend(false);
      toast({
        title: "Código Enviado",
        description: "Revisa tus mensajes de texto"
      });
    } catch (error: any) {
      console.error('Send OTP error:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el código",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    // Dev bypass for testing
    if (import.meta.env.DEV && otp === '123456') {
      try {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').upsert({
            user_id: data.user.id,
            full_name: fullName || 'Usuario de Desarrollo',
            phone_number: phoneNumber
          });
        }
        toast({
          title: "¡Bienvenido!",
          description: "Inicio de sesión exitoso (modo desarrollo)"
        });
        navigate('/home');
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otp,
        type: 'sms'
      });

      if (error) throw error;

      // Si es signup y hay nombre, actualizar el perfil
      if (mode === 'signup' && fullName && data.user) {
        await supabase.from('profiles').upsert({
          user_id: data.user.id,
          full_name: fullName,
          phone_number: phoneNumber
        });
      }

      toast({
        title: "¡Bienvenido!",
        description: "Inicio de sesión exitoso"
      });
      navigate('/home');
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      
      // Limpiar el input del OTP después de un error
      setOtp('');
      
      // Detectar error de código expirado/inválido
      if (error.message?.includes('expired') || error.message?.includes('invalid') || error.message?.includes('Token')) {
        toast({
          title: "Código inválido o expirado",
          description: "Por favor solicita un nuevo código",
          variant: "destructive"
        });
        // Habilitar el botón de reenvío inmediatamente
        setCanResend(true);
        setResendCountdown(0);
      } else {
        toast({
          title: "Error",
          description: error.message || "No se pudo verificar el código",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setCanResend(false);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (error) throw error;

      setResendCountdown(60);
      toast({
        title: "Código Reenviado",
        description: "Revisa tus mensajes de texto"
      });
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      setCanResend(true);
      toast({
        title: "Error",
        description: error.message || "No se pudo reenviar el código",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/home`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (otpSent) {
    return (
      <div className="min-h-screen bg-white flex flex-col px-6">
        <div className="pt-14 pb-2 flex items-center justify-between">
          <button 
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-50 transition-colors" 
            onClick={() => setOtpSent(false)}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10" />
        </div>

        <div className="flex-1 pt-6 flex flex-col">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-3">
              Ingresa el código
            </h2>
            <p className="text-sm text-neutral-500 leading-relaxed mb-8">
              Enviamos un código de 6 dígitos a {phoneNumber}
            </p>
          </div>

          <div className="space-y-4">
            <Input 
              type="text" 
              placeholder="000000" 
              value={otp} 
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
              className="h-14 rounded-xl border-neutral-200 text-center text-lg tracking-widest" 
              maxLength={6} 
            />
            
            {/* Warning message */}
            <p className="text-xs text-amber-600 mt-2 text-center">
              ⚠️ El código se invalida después de un intento incorrecto
            </p>
            
            {/* Resend OTP section */}
            <div className="text-center pt-2">
              {canResend ? (
                <Button
                  variant="outline"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="w-full border-primary text-primary hover:bg-primary/10"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Solicitar nuevo código
                </Button>
              ) : resendCountdown > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Reenviar código en {resendCountdown}s
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-auto mb-8">
            <Button 
              className="w-full py-4 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800" 
              onClick={handleVerifyOTP} 
              disabled={loading || otp.length < 6}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <span>Verificar</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header Nav */}
      <div className="px-6 pt-14 pb-2 flex items-center justify-between">
        <button 
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-50 transition-colors" 
          onClick={() => navigate('/welcome')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10" />
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pt-6 flex flex-col">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-3">
            ¿Cuál es tu número?
          </h2>
          <p className="text-sm text-neutral-500 leading-relaxed mb-8">
            Usamos tu número para asegurar tu cuenta y verificar que eres una persona real. Es 100% confidencial.
          </p>
        </div>

        {/* Phone Input Group */}
        <div className="space-y-4">
          {mode === 'signup' && (
            <Input 
              type="text" 
              placeholder="Nombre completo" 
              value={fullName} 
              onChange={e => setFullName(e.target.value)} 
              className="h-14 rounded-xl border-neutral-200" 
            />
          )}

          <CountryPhoneInput value={phoneNumber} onChange={setPhoneNumber} />
          
          {mode === 'signup' && (
            <div className="flex items-start gap-2 pt-2">
              <Checkbox 
                checked={smsConsent} 
                onCheckedChange={checked => setSmsConsent(checked as boolean)} 
                className="mt-0.5" 
              />
              <p className="text-[11px] text-neutral-500 leading-tight">
                Acepto recibir códigos de verificación por SMS. Se pueden aplicar tarifas de mensajería.
              </p>
            </div>
          )}
        </div>

        <div className="mt-auto mb-8 space-y-4">
          <Button 
            className="w-full py-4 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 shadow-lg shadow-neutral-900/10" 
            onClick={handleSendOTP} 
            disabled={loading || !phoneNumber || (mode === 'signup' && !smsConsent)}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          <button 
            onClick={async () => {
              try {
                const { data, error } = await supabase.auth.signInAnonymously();
                if (error) throw error;
                if (data.user) {
                  await supabase.from('profiles').upsert({
                    user_id: data.user.id,
                    full_name: 'Usuario de Desarrollo',
                    phone_number: '+1234567890'
                  });
                }
                toast({
                  title: "¡Acceso Dev!",
                  description: "Entrando al app..."
                });
                navigate('/home');
              } catch (error: any) {
                toast({
                  title: "Error",
                  description: error.message,
                  variant: "destructive"
                });
              }
            }}
            className="text-xs text-neutral-400 hover:text-neutral-600 underline text-center"
          >
            🔧 Acceso Dev
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
