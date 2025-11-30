import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, ShieldCheck, Heart, Sparkles } from 'lucide-react';

const onboardingSteps = [
  {
    id: 1,
    step: "Paso 1",
    stepColor: "bg-neutral-100 text-neutral-600",
    title: "Información Legal",
    subtitle: "Sin Confusión.",
    description: "Navega el sistema migratorio con guías simplificadas y validadas por expertos. Entiende tus derechos desde el primer día.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800",
    accentColor: "bg-neutral-900",
    floatingElement: "legal" as const,
  },
  {
    id: 2,
    step: "Paso 2", 
    stepColor: "bg-indigo-50 text-indigo-600",
    title: "Una Comunidad",
    subtitle: "Que te Respalda.",
    description: "Conecta con personas que atraviesan tu misma situación. Comparte experiencias, consejos y apoyo emocional seguro.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800",
    accentColor: "bg-indigo-600",
    floatingElement: "community" as const,
  },
  {
    id: 3,
    step: "Paso 3",
    stepColor: "bg-blue-50 text-blue-600", 
    title: "Asistencia IA",
    subtitle: "Cuando la necesites.",
    description: "Resolvemos tus dudas al instante con tecnología entrenada en leyes migratorias, disponible 24/7 para ti.",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800",
    accentColor: "bg-blue-500",
    floatingElement: "ai" as const,
  },
];

interface FloatingElementProps {
  type: "legal" | "community" | "ai";
}

const FloatingElement = ({ type }: FloatingElementProps) => {
  if (type === "legal") {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px]">
        <div className="glass-card rounded-xl p-4 shadow-2xl animate-float">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="h-2 w-20 bg-white/40 rounded-full mb-1.5" />
              <div className="h-1.5 w-12 bg-white/20 rounded-full" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-white/90">Fuentes Verificadas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-white/90">Actualización Constante</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "community") {
    return (
      <>
        <div 
          className="absolute top-[35%] right-10 flex gap-2 items-center bg-white rounded-t-xl rounded-bl-xl rounded-br-none px-4 py-3 shadow-xl opacity-0 animate-slide-up"
          style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}
        >
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          <p className="text-[10px] font-medium text-neutral-800">¿Alguien sabe sobre el TPS?</p>
        </div>
        
        <div 
          className="absolute top-[50%] left-8 flex gap-2 items-center bg-indigo-600 rounded-t-xl rounded-br-xl rounded-bl-none px-4 py-3 shadow-xl opacity-0 animate-slide-up"
          style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}
        >
          <p className="text-[10px] font-medium text-white">¡Yo te ayudo! Aquí el link...</p>
          <Heart className="w-3 h-3 text-white/80 fill-white/20" />
        </div>
      </>
    );
  }

  if (type === "ai") {
    return (
      <>
        {/* Animated rings */}
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div 
            className="w-48 h-48 rounded-full border border-white/20 animate-ping-slow"
          />
          <div 
            className="w-48 h-48 rounded-full border border-white/10 animate-ping-slow absolute inset-0"
            style={{ animationDelay: '0.5s' }}
          />
        </div>

        {/* Central icon */}
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.3)] z-10 animate-float">
          <Sparkles className="w-8 h-8 text-blue-500" />
        </div>
      </>
    );
  }

  return null;
};

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const totalSteps = onboardingSteps.length;

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      navigate('/welcome');
    }
  };

  const skip = () => navigate('/welcome');

  const step = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col overflow-hidden">
      {/* Skip button - only visible on step 2 */}
      {currentStep === 1 && (
        <button 
          onClick={skip} 
          className="absolute top-6 right-6 z-20 text-white/60 text-xs font-medium hover:text-white transition-colors"
        >
          Omitir
        </button>
      )}

      {/* Image Area - Responsive */}
      <div className="relative flex-[3] min-h-[200px] max-h-[55vh] w-full overflow-hidden">
        <img 
          src={step.image} 
          alt={step.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-900/20 to-neutral-900" />
        
        {/* Floating element based on step */}
        <FloatingElement type={step.floatingElement} />
      </div>

      {/* Content Sheet - Responsive */}
      <div className="flex-[2] min-h-[280px] bg-white rounded-t-[32px] -mt-6 relative z-10 px-6 sm:px-8 pt-8 sm:pt-10 pb-6 sm:pb-8 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {/* Step badge */}
          <span className={`inline-block px-3 py-1 ${step.stepColor} rounded-full text-[10px] font-bold tracking-wider uppercase mb-6 w-fit`}>
            {step.step}
          </span>
          
          {/* Title with gray subtitle - Responsive */}
          <h2 className="text-2xl sm:text-3xl text-neutral-900 leading-[1.15] tracking-tight mb-3 sm:mb-4 font-semibold">
            {step.title}<br/>
            <span className="text-neutral-400">{step.subtitle}</span>
          </h2>
          
          {/* Description */}
          <p className="text-neutral-500 text-sm leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Bottom Navigation - Always at bottom */}
        <div className="mt-auto pt-4 flex-shrink-0">
          {/* Pagination dots */}
          <div className="flex gap-2 mb-6">
            {onboardingSteps.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep 
                    ? `w-6 ${step.accentColor}` 
                    : 'w-1.5 bg-neutral-200'
                }`} 
              />
            ))}
          </div>

          {/* Action button */}
          {currentStep < totalSteps - 1 ? (
            // Circular arrow button for steps 1-2
            <div className="flex justify-end">
              <button 
                onClick={nextStep}
                className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-neutral-800 transition-all hover:scale-105 shadow-lg shadow-neutral-900/20 group"
              >
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ) : (
            // Full-width "Unirme al Club" button for step 3
            <button 
              onClick={nextStep}
              className="w-full py-4 bg-neutral-900 text-white rounded-xl font-semibold text-sm hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-neutral-900/10 active:scale-[0.98] group"
            >
              <span>Unirme al Club</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
