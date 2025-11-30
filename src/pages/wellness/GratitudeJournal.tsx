import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sun, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

const GratitudeJournal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [entries, setEntries] = useState({
    one: '',
    two: '',
    three: ''
  });

  const today = new Date();
  const formattedDate = today.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'long', 
    weekday: 'long' 
  });

  const handleClose = () => {
    navigate('/chat');
  };

  const handleSave = () => {
    if (!entries.one && !entries.two && !entries.three) {
      toast({
        title: "Escribe algo primero",
        description: "Añade al menos una cosa por la que estés agradecido/a.",
        variant: "destructive",
      });
      return;
    }

    // Save to localStorage with unique ID
    const gratitudeEntries = JSON.parse(localStorage.getItem('gratitudeEntries') || '[]');
    gratitudeEntries.push({
      id: Date.now(),
      date: today.toISOString(),
      title: "Momentos de Luz",
      entries: entries
    });
    localStorage.setItem('gratitudeEntries', JSON.stringify(gratitudeEntries));

    toast({
      title: "✨ Guardado en tu diario",
      description: "Tus momentos de gratitud han sido guardados.",
    });

    // Reset and go to history
    setTimeout(() => {
      navigate('/wellness/gratitude/history');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-amber-50 animate-fade-in">
      {/* Header */}
      <div className="px-6 pt-14 pb-6 flex justify-between items-start z-20 bg-amber-50">
        <div>
          <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">
            {formattedDate}
          </p>
          <h1 className="text-2xl font-bold text-amber-950">Momentos de Luz</h1>
        </div>
        <button 
          onClick={handleClose}
          className="w-10 h-10 rounded-full bg-amber-100 hover:bg-amber-200 flex items-center justify-center text-amber-800 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-32">
        {/* Prompt Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-amber-100 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 mb-4">
            <Sun className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-amber-950 mb-2">Reflexión Diaria</h2>
          <p className="text-sm text-neutral-500 leading-relaxed">
            Incluso en tiempos difíciles, siempre hay algo pequeño que brilla. ¿Qué agradeces hoy?
          </p>
        </div>

        {/* Input Fields */}
        <div className="flex flex-col gap-4">
          <div className="group">
            <label className="block text-xs font-bold text-amber-900/50 uppercase tracking-wider mb-2 ml-1">
              Uno
            </label>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-transparent focus-within:border-amber-300 focus-within:ring-4 focus-within:ring-amber-100 transition-all">
              <Textarea
                value={entries.one}
                onChange={(e) => setEntries({ ...entries, one: e.target.value })}
                rows={2}
                placeholder="Haber hablado con mi familia..."
                className="w-full text-sm font-medium text-neutral-800 placeholder-neutral-300 outline-none resize-none bg-transparent border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-xs font-bold text-amber-900/50 uppercase tracking-wider mb-2 ml-1">
              Dos
            </label>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-transparent focus-within:border-amber-300 focus-within:ring-4 focus-within:ring-amber-100 transition-all">
              <Textarea
                value={entries.two}
                onChange={(e) => setEntries({ ...entries, two: e.target.value })}
                rows={2}
                placeholder="Un plato de comida caliente..."
                className="w-full text-sm font-medium text-neutral-800 placeholder-neutral-300 outline-none resize-none bg-transparent border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-xs font-bold text-amber-900/50 uppercase tracking-wider mb-2 ml-1">
              Tres
            </label>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-transparent focus-within:border-amber-300 focus-within:ring-4 focus-within:ring-amber-100 transition-all">
              <Textarea
                value={entries.three}
                onChange={(e) => setEntries({ ...entries, three: e.target.value })}
                rows={2}
                placeholder="Escribe aquí..."
                className="w-full text-sm font-medium text-neutral-800 placeholder-neutral-300 outline-none resize-none bg-transparent border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action - Sticky */}
      <div className="absolute bottom-0 w-full bg-white/50 backdrop-blur-md border-t border-amber-100 px-6 py-5 pb-8 z-30">
        <button 
          onClick={handleSave}
          className="w-full py-3.5 bg-amber-400 text-amber-950 rounded-xl font-bold text-sm hover:bg-amber-500 transition-colors shadow-lg shadow-amber-200 flex items-center justify-center gap-2 group active:scale-[0.98]"
        >
          <Check className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Guardar en mi diario
        </button>
      </div>
    </div>
  );
};

export default GratitudeJournal;
