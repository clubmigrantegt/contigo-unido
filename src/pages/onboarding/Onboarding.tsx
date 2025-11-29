import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import logoClub from '@/assets/logo-club-migrante.png';
import illustrationSupport from '@/assets/illustration-support-onboarding.png';
import illustrationLegal from '@/assets/illustration-legal-onboarding.png';
import illustrationCommunity from '@/assets/illustration-community-onboarding.png';

const onboardingSteps = [
  {
    type: 'image' as const,
    image: logoClub,
    size: 'w-48',
    title: 'Bienvenido al Club del Migrante',
    description: 'Tu comunidad de apoyo para acompañarte en tu proceso migratorio.',
  },
  {
    type: 'image' as const,
    image: illustrationSupport,
    size: 'w-96',
    title: 'Apoyo Psicológico 24/7',
    description: 'Conversa con nuestra IA especializada en salud mental cuando lo necesites.',
  },
  {
    type: 'image' as const,
    image: illustrationLegal,
    size: 'w-96',
    title: 'Orientación Legal',
    description: 'Información legal confiable sobre procesos migratorios y tus derechos.',
  },
  {
    type: 'image' as const,
    image: illustrationCommunity,
    size: 'w-96',
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

      {/* Main Content - Layout con posiciones fijas */}
      <div className="flex-1 flex flex-col px-6 pb-12" key={currentStep}>
        {/* Sección de ilustración - altura fija */}
        <div className="flex-1 flex items-center justify-center min-h-[280px]">
          <div className="flex justify-center">
            {currentStepData.type === 'image' && (
              <img 
                src={currentStepData.image} 
                alt={currentStepData.title} 
                className={`${currentStepData.size || 'w-48'} h-auto max-h-[240px] object-contain`}
              />
            )}
          </div>
        </div>
        
        {/* Sección de texto - altura fija */}
        <div className="h-[140px] flex flex-col justify-start">
          <h2 className="text-2xl font-bold text-strong-black text-center mb-4">
            {currentStepData.title}
          </h2>
          
          <p className="text-center text-muted-foreground text-lg px-4">
            {currentStepData.description}
          </p>
        </div>

        {/* Progress Dots - posición fija */}
        <div className="flex justify-center space-x-2 py-6">
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

        {/* Navigation Buttons - posición fija al final */}
        <div className="flex space-x-4">
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
