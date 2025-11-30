import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Volume2, VolumeX } from 'lucide-react';

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

interface PhaseConfig {
  label: string;
  duration: number;
  instruction: string;
}

const PHASES: Record<BreathingPhase, PhaseConfig> = {
  inhale: {
    label: 'Inhala',
    duration: 4,
    instruction: 'Enfoca tu atención en el aire entrando lentamente por tu nariz.'
  },
  hold: {
    label: 'Mantén',
    duration: 2,
    instruction: 'Siente cómo el oxígeno llena tu cuerpo.'
  },
  exhale: {
    label: 'Exhala',
    duration: 4,
    instruction: 'Deja ir la tensión con cada exhalación.'
  },
  rest: {
    label: 'Relaja',
    duration: 2,
    instruction: 'Observa la calma en tu cuerpo.'
  }
};

const TOTAL_CYCLES = 6;
const PHASE_ORDER: BreathingPhase[] = ['inhale', 'hold', 'exhale', 'rest'];

const BreathingTool = () => {
  const navigate = useNavigate();
  const [currentCycle, setCurrentCycle] = useState(1);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const currentPhaseName = PHASE_ORDER[currentPhaseIndex];
  const currentPhase = PHASES[currentPhaseName];

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setPhaseTimer((prev) => {
        if (prev >= currentPhase.duration) {
          // Move to next phase
          const nextPhaseIndex = (currentPhaseIndex + 1) % PHASE_ORDER.length;
          
          if (nextPhaseIndex === 0) {
            // Completed a full cycle
            if (currentCycle >= TOTAL_CYCLES) {
              // Completed all cycles
              setIsActive(false);
              return 0;
            }
            setCurrentCycle((c) => c + 1);
          }
          
          setCurrentPhaseIndex(nextPhaseIndex);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, currentPhaseIndex, currentPhase.duration, currentCycle]);

  const handleClose = () => {
    navigate('/chat');
  };

  const handleEndSession = () => {
    navigate('/chat');
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const progress = (currentCycle - 1) / TOTAL_CYCLES + (currentPhaseIndex / PHASE_ORDER.length / TOTAL_CYCLES);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-teal-50 animate-fade-in">
      {/* Header */}
      <div className="absolute top-0 w-full px-6 pt-14 flex justify-between items-center z-20">
        <button 
          onClick={handleClose}
          className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 backdrop-blur-md flex items-center justify-center text-teal-900 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="bg-black/5 backdrop-blur-md px-3 py-1 rounded-full">
          <span className="text-xs font-semibold text-teal-900 uppercase tracking-widest">Relajación</span>
        </div>
        <button 
          onClick={toggleSound}
          className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 backdrop-blur-md flex items-center justify-center text-teal-900 transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="relative flex items-center justify-center">
          {/* Decorative glow */}
          <div className="absolute w-64 h-64 bg-teal-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
          
          {/* Breathing circles */}
          <div className="absolute w-72 h-72 border border-teal-500/10 rounded-full animate-breathe"></div>
          <div className="absolute w-60 h-60 border border-teal-500/20 rounded-full animate-breathe" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute w-48 h-48 bg-teal-200/20 rounded-full backdrop-blur-sm animate-breathe" style={{ animationDelay: '1s' }}></div>
          
          {/* Center circle */}
          <div className="relative w-40 h-40 bg-white rounded-full shadow-[0_0_40px_rgba(45,212,191,0.2)] flex items-center justify-center z-10 animate-breathe-inner">
            <div className="text-center">
              <span className="block text-2xl font-bold text-teal-900 animate-pulse-soft">
                {currentPhase.label}
              </span>
              <span className="block text-sm font-medium text-teal-600/70 mt-1">
                {currentPhase.duration} seg
              </span>
            </div>
          </div>
        </div>

        {/* Instruction text */}
        <div className="mt-12 text-center px-8 z-10 max-w-md">
          <p className="text-lg font-medium text-teal-900 leading-relaxed">
            {currentPhase.instruction}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full px-8 pb-10 flex flex-col gap-6 items-center z-10">
        {/* Progress bar */}
        <div className="w-full max-w-[200px] flex flex-col items-center gap-2">
          <span className="text-xs font-medium text-teal-700">
            Ciclo {currentCycle} de {TOTAL_CYCLES}
          </span>
          <div className="w-full h-1.5 bg-teal-900/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-teal-600 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progress * 100}%` }}
            ></div>
          </div>
        </div>

        {/* End session button */}
        <button 
          onClick={handleEndSession}
          className="px-8 py-3 bg-teal-900 text-white rounded-full font-semibold text-sm hover:bg-teal-800 transition-all shadow-lg shadow-teal-900/10 active:scale-95"
        >
          Terminar sesión
        </button>
      </div>
    </div>
  );
};

export default BreathingTool;
