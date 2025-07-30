import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Scale, Users, ChevronLeft, ChevronRight } from 'lucide-react';

const onboardingSteps = [
  {
    icon: Heart,
    iconBg: 'bg-primary',
    title: 'Apoyo Psicológico 24/7',
    description: 'Accede a apoyo emocional profesional en cualquier momento que lo necesites. Nuestro equipo está aquí para escucharte.',
    color: 'text-primary'
  },
  {
    icon: Scale,
    iconBg: 'bg-secondary',
    title: 'Orientación Legal',
    description: 'Conoce tus derechos y obtén información legal actualizada sobre TPS, asilo, derechos laborales y más.',
    color: 'text-secondary'
  },
  {
    icon: Users,
    iconBg: 'bg-accent',
    title: 'Comunidad Solidaria',
    description: 'Conecta con otros migrantes, comparte experiencias y encuentra el apoyo de quienes entienden tu camino.',
    color: 'text-accent-foreground'
  }
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/auth');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skip = () => {
    navigate('/auth');
  };

  const currentStepData = onboardingSteps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <Button
          variant="ghost"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="p-2"
        >
          <ChevronLeft size={20} />
        </Button>
        
        <div className="flex space-x-2">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-8 rounded-full transition-colors duration-200 ${
                index === currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          onClick={skip}
          className="text-muted-foreground text-sm"
        >
          Omitir
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className={`w-24 h-24 rounded-full ${currentStepData.iconBg} flex items-center justify-center`}>
              <IconComponent size={40} className="text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-2xl font-bold leading-tight">
              {currentStepData.title}
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              {currentStepData.description}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6">
        <Button
          onClick={nextStep}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          {currentStep < onboardingSteps.length - 1 ? (
            <>
              Siguiente
              <ChevronRight size={20} />
            </>
          ) : (
            'Comenzar'
          )}
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;