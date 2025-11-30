import { useState } from 'react';
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

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu número de teléfono",
        variant: "destructive",
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
      toast({
        title: "Código Enviado",
        description: "Revisa tus mensajes de texto",
      });
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

  const handleVerifyOTP = async () => {
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
          description: "Inicio de sesión exitoso (modo desarrollo)",
        });
        
        navigate('/home');
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;

      if (data.user && mode === 'signup') {
        await supabase.from('profiles').upsert({
          user_id: data.user.id,
          full_name: fullName,
          phone_number: phoneNumber
        });
      }

      toast({
        title: "¡Bienvenido!",
        description: "Inicio de sesión exitoso",
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
        variant: "destructive",
      });
    }
  };

  if (otpSent) {
    return (
      <div className="min-h-screen bg-white flex flex-col animate-fade-in px-6">
        <div className="pt-14 pb-2 flex items-center justify-between">
          <button 
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-50 transition-colors"
            onClick={() => setOtpSent(false)}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-neutral-900" />
            <div className="w-2 h-2 rounded-full bg-neutral-900" />
            <div className="w-2 h-2 rounded-full bg-neutral-200" />
          </div>
          <div className="w-10" />
        </div>

        <div className="flex-1 pt-6 flex flex-col">
          <div className="animate-slide-up">
            <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-3">
              Ingresa el código
            </h2>
            <p className="text-sm text-neutral-500 leading-relaxed mb-8">
              Enviamos un código de 6 dígitos a {phoneNumber}
            </p>
          </div>

          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <Input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="h-14 rounded-xl border-neutral-200 text-center text-lg tracking-widest"
              maxLength={6}
            />
          </div>

          <div className="mt-auto mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
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
    <div className="min-h-screen bg-white flex flex-col animate-fade-in">
      {/* Header Nav */}
      <div className="px-6 pt-14 pb-2 flex items-center justify-between">
        <button 
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-50 transition-colors"
          onClick={() => navigate('/welcome')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-neutral-900" />
          <div className="w-2 h-2 rounded-full bg-neutral-200" />
          <div className="w-2 h-2 rounded-full bg-neutral-200" />
        </div>
        <div className="w-10" />
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pt-6 flex flex-col">
        <div className="animate-slide-up">
          <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-3">
            ¿Cuál es tu número?
          </h2>
          <p className="text-sm text-neutral-500 leading-relaxed mb-8">
            Usamos tu número para asegurar tu cuenta y verificar que eres una persona real. Es 100% confidencial.
          </p>
        </div>

        {/* Phone Input Group */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {mode === 'signup' && (
            <Input
              type="text"
              placeholder="Nombre completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-14 rounded-xl border-neutral-200"
            />
          )}

          <CountryPhoneInput
            value={phoneNumber}
            onChange={setPhoneNumber}
          />
          
          <div className="flex items-start gap-2 pt-2">
            <Checkbox 
              checked={smsConsent}
              onCheckedChange={(checked) => setSmsConsent(checked as boolean)}
              className="mt-0.5"
            />
            <p className="text-[11px] text-neutral-500 leading-tight">
              Acepto recibir códigos de verificación por SMS. Se pueden aplicar tarifas de mensajería.
            </p>
          </div>
        </div>

        <div className="mt-auto mb-8 space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-neutral-100" />
            <span className="flex-shrink-0 mx-4 text-xs text-neutral-400">O regístrate con</span>
            <div className="flex-grow border-t border-neutral-100" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline"
              className="h-12 rounded-xl border-neutral-200 hover:bg-neutral-50"
              onClick={handleGoogleSignIn}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </Button>
            <Button 
              variant="outline"
              className="h-12 rounded-xl border-neutral-200 hover:bg-neutral-50"
              disabled
            >
              <svg className="w-4 h-4 mr-2 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.35-1.09-.56-2.09-.48-3.08.35 1.04 1.39 2.48 1.69 3.08.35zm-2.16-11.2c.45-1.55 1.77-2.3 2.65-2.48-.46 1.77-1.52 2.64-2.65 2.48z" fill="currentColor"/>
              </svg>
              Apple
            </Button>
          </div>
          
          <Button 
            className="w-full py-4 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 shadow-lg shadow-neutral-900/10"
            onClick={handleSendOTP}
            disabled={loading || !phoneNumber || !smsConsent}
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
        </div>
      </div>
    </div>
  );
};

export default Auth;
