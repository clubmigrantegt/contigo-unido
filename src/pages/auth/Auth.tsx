import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [fullName, setFullName] = useState('');
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/home`;
      
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
      const redirectUrl = `${window.location.origin}/home`;
      
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-calm-gray">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOtpSent(false)}
              className="absolute left-4 top-4 p-2"
            >
              <ArrowLeft size={20} />
            </Button>
            <CardTitle className="text-2xl font-bold text-primary">
              Verificar Código
            </CardTitle>
            <CardDescription>
              Ingresa el código que enviamos a {phone}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Código de verificación</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
              </div>
              <Button
                type="submit"
                className="w-full btn-primary"
                disabled={loading || !otp}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verificar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-calm-gray">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Ingresa tu número de teléfono para continuar'
              : 'Regístrate para acceder a todos nuestros servicios'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isLogin ? handleSendOTP : handleSignUp} className="space-y-4">
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
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="phone">Número de teléfono</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full btn-primary"
              disabled={loading || !phone || (!isLogin && !fullName)}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? 'Enviar Código' : 'Crear Cuenta'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary text-sm font-medium hover:underline"
            >
              {isLogin 
                ? '¿No tienes cuenta? Regístrate'
                : '¿Ya tienes cuenta? Inicia sesión'
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;