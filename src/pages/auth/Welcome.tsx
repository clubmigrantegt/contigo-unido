import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col">
      {/* Image Area - 65% height */}
      <div className="relative h-[65vh] w-full overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800" 
          className="absolute w-full h-full object-cover"
          alt="Community support"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-neutral-900" />
        
        {/* Floating Badge */}
        <div 
          className="absolute top-16 left-6 flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full"
        >
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-white tracking-wide">Comunidad Activa</span>
        </div>
      </div>

      {/* Content Sheet */}
      <div className="flex-1 bg-neutral-900 w-full rounded-t-[32px] -mt-8 relative z-10 px-8 pt-10 pb-10 flex flex-col justify-between">
        <div>
          <h1 className="text-3xl text-white leading-[1.1] tracking-tight mb-4 font-semibold">
            No estás solo en este camino.
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Únete a Club del Migrante. Accede a recursos legales verificados, apoyo psicológico y comunidad.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button 
            size="lg"
            className="w-full py-3.5 bg-white text-neutral-900 rounded-xl hover:bg-neutral-100 shadow-[0_0_20px_rgba(255,255,255,0.1)] group"
            onClick={() => navigate('/auth?mode=signup')}
          >
            <span>Comenzar ahora</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
          </Button>
          
          <div className="text-center">
            <button 
              className="text-xs text-neutral-500 hover:text-white transition-colors"
              onClick={() => navigate('/auth?mode=login')}
            >
              Ya tengo cuenta. <span className="underline underline-offset-2">Iniciar sesión</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
