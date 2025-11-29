import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HeartHandshake, Scale, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import logoClub from '@/assets/logo-club-migrante.png';

const onboardingSteps = [
  {
    type: 'image' as const,
    image: logoClub,
    title: 'Bienvenido al Club del Migrante',
    description: 'Tu comunidad de apoyo para acompañarte en tu proceso migratorio.',
  },
  {
    type: 'icon' as const,
    icon: HeartHandshake,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    title: 'Apoyo Psicológico 24/7',
    description: 'Conversa con nuestra IA especializada en salud mental cuando lo necesites.',
  },
  {
    type: 'icon' as const,
    icon: Scale,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    title: 'Orientación Legal',
    description: 'Información legal confiable sobre procesos migratorios y tus derechos.',
  },
  {
    type: 'icon' as const,
    icon: Users,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    title: 'Comunidad Solidaria',
    description: 'Conecta con personas que comparten tu experiencia y encuentra apoyo mutuo.',
  },
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  const nextStep = () => {
    setSlideDirection('next');
    setIsAnimating(true);
    
    setTimeout(() => {
      if (currentStep < onboardingSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        navigate('/welcome');
      }
      setIsAnimating(false);
    }, 300);
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setSlideDirection('prev');
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const skip = () => {
    navigate('/welcome');
  };

  const currentStepData = onboardingSteps[currentStep];
  const IconComponent = currentStepData.type === 'icon' ? currentStepData.icon : null;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex justify-end items-center p-6">
        <Button
          variant="ghost"
          onClick={skip}
          className="text-muted-foreground text-sm"
        >
          Omitir
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div 
          key={currentStep}
          className={cn(
            "w-full max-w-md transition-all duration-300",
            !isAnimating && "animate-scale-fade-in"
          )}
        >
          {/* Icon or Image Container */}
          <div className="flex justify-center mb-8">
            {currentStepData.type === 'image' ? (
              <img 
                src={currentStepData.image} 
                alt="Club del Migrante" 
                className="w-48 h-auto animate-float"
              />
            ) : IconComponent ? (
              <div className={`${currentStepData.iconBg} rounded-3xl p-8 shadow-lg animate-float border-0`}>
                <IconComponent className={`w-20 h-20 ${currentStepData.iconColor}`} strokeWidth={1.5} />
              </div>
            ) : null}
          </div>
          
          {/* Text Content */}
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-bold text-strong-black text-center mb-4">
              {currentStepData.title}
            </h2>
            
            <p className="text-center text-muted-foreground text-lg px-4 mb-8">
              {currentStepData.description}
            </p>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? 'w-8 bg-brand' 
                  : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex space-x-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {currentStep > 0 && (
            <Button 
              variant="outline" 
              onClick={prevStep}
              className="flex-1"
              disabled={isAnimating}
            >
              Anterior
            </Button>
          )}
          
          <Button 
            onClick={nextStep}
            className="flex-1 bg-brand hover:bg-brand-hover text-white rounded-full"
            disabled={isAnimating}
          >
            {currentStep === onboardingSteps.length - 1 ? 'Comenzar' : 'Siguiente'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
