import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GratitudeEntry {
  id: number;
  date: string;
  title: string;
  entries: {
    one: string;
    two: string;
    three: string;
  };
}

const GratitudeDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [entry, setEntry] = useState<GratitudeEntry | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('gratitudeEntries');
    if (stored && id) {
      const entries = JSON.parse(stored);
      const reversed = [...entries].reverse();
      const index = parseInt(id);
      if (reversed[index]) {
        setEntry(reversed[index]);
      }
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const weekday = date.toLocaleDateString('es-ES', { weekday: 'long' });
    const day = date.getDate();
    const month = date.toLocaleDateString('es-ES', { month: 'long' });
    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${day} ${month}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  const handleShare = () => {
    if (entry) {
      const text = `${entry.title}\n\n1. ${entry.entries.one}\n2. ${entry.entries.two}\n3. ${entry.entries.three}`;
      
      if (navigator.share) {
        navigator.share({
          title: entry.title,
          text: text,
        }).catch(() => {});
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(text);
        toast({
          title: "Copiado",
          description: "Tu entrada ha sido copiada al portapapeles.",
        });
      }
    }
  };

  if (!entry) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-amber-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-amber-50">
      {/* Header */}
      <div className="px-6 pt-14 pb-6 flex justify-between items-center z-20">
        <button 
          onClick={() => navigate('/wellness/gratitude/history')}
          className="w-10 h-10 rounded-full bg-amber-100 hover:bg-amber-200 flex items-center justify-center text-amber-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          <button 
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-transparent hover:bg-amber-100 flex items-center justify-center text-amber-900/50 hover:text-amber-900 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-24">
        
        <div className="mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-widest mb-3">
            {formatDate(entry.date)}
          </span>
          <h1 className="text-3xl font-bold text-amber-950 leading-tight">
            {entry.title || 'Momentos de Luz'}
          </h1>
        </div>

        <div className="flex flex-col gap-6 relative">
          <div className="absolute top-4 left-3 bottom-4 w-0.5 bg-amber-200/50"></div>

          {/* Item 1 */}
          {entry.entries.one && (
            <div className="relative pl-10">
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white border-4 border-amber-200 flex items-center justify-center z-10">
                <span className="text-[10px] font-bold text-amber-900">1</span>
              </div>
              <p className="text-lg text-amber-900 leading-relaxed italic">
                "{entry.entries.one}"
              </p>
            </div>
          )}

          {/* Item 2 */}
          {entry.entries.two && (
            <div className="relative pl-10">
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white border-4 border-amber-200 flex items-center justify-center z-10">
                <span className="text-[10px] font-bold text-amber-900">2</span>
              </div>
              <p className="text-lg text-amber-900 leading-relaxed italic">
                "{entry.entries.two}"
              </p>
            </div>
          )}

          {/* Item 3 */}
          {entry.entries.three && (
            <div className="relative pl-10">
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white border-4 border-amber-200 flex items-center justify-center z-10">
                <span className="text-[10px] font-bold text-amber-900">3</span>
              </div>
              <p className="text-lg text-amber-900 leading-relaxed italic">
                "{entry.entries.three}"
              </p>
            </div>
          )}

        </div>
        
        <div className="mt-12 pt-8 border-t border-amber-200/50 text-center">
          <p className="text-xs text-amber-800/60 italic">
            Guardado a las {formatTime(entry.date)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GratitudeDetail;
