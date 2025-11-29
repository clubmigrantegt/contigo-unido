import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HeartHandshake, Scale, Users, Globe } from 'lucide-react';
import { 
  WelcomeIllustration, 
  PsychologicalIllustration, 
  LegalIllustration, 
  CommunityIllustration 
} from '@/components/illustrations/OnboardingIllustrations';
import { cn } from '@/lib/utils';

const onboardingSteps = [
  {
    illustration: WelcomeIllustration,
    title: 'Bienvenido al Club del Migrante',
    description: 'Tu comunidad de apoyo integral. Somos una plataforma diseñada para acompañarte en tu proceso migratorio con recursos de salud mental, orientación legal y una comunidad solidaria que entiende tu camino.',
    gradientBg: 'from-primary/10 via-secondary/10 to-accent/10',
  },
  {
    illustration: PsychologicalIllustration,
    title: 'Apoyo Psicológico 24/7',
    description: 'Conversa con nuestra IA especializada en salud mental para migrantes. Recibe apoyo emocional, técnicas de manejo del estrés y orientación personalizada cuando más lo necesites.',
    gradientBg: 'from-primary/10 to-primary/5',
  },
  {
    illustration: LegalIllustration,
    title: 'Orientación Legal',
    description: 'Accede a información legal confiable sobre procesos migratorios, derechos y procedimientos. Agenda consultas con profesionales especializados.',
    gradientBg: 'from-secondary/10 to-accent/10',
  },
  {
    illustration: CommunityIllustration,
    title: 'Comunidad Solidaria',
    description: 'Conecta con otras personas que comparten tu experiencia. Comparte testimonios, encuentra apoyo mutuo y construye una red de solidaridad.',
    gradientBg: 'from-accent/10 to-primary/10',
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
  const IllustrationComponent = currentStepData.illustration;

  return (
    <div className="min-h-screen flex flex-col bg-background">
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
          {/* Illustration */}
          <div className={`bg-gradient-to-br ${currentStepData.gradientBg} rounded-3xl p-8 mb-8 shadow-card`}>
            <IllustrationComponent />
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
                  ? 'w-8 bg-primary' 
                  : 'w-2 bg-muted'
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
            className="flex-1"
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
