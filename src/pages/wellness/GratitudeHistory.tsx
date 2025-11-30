import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, ArrowUpRight, BookOpen } from 'lucide-react';

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

const GratitudeHistory = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites'>('all');

  useEffect(() => {
    // Load entries from localStorage
    const stored = localStorage.getItem('gratitudeEntries');
    if (stored) {
      const parsed = JSON.parse(stored);
      setEntries(parsed.reverse()); // Most recent first
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time for comparison
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return { label: 'Hoy', isCurrent: true };
    if (date.getTime() === yesterday.getTime()) return { label: 'Ayer', isCurrent: false };

    const day = date.getDate();
    const month = date.toLocaleDateString('es-ES', { month: 'short' });
    return { label: `${day} ${month}`, isCurrent: false };
  };

  const formatDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.toLocaleDateString('es-ES', { weekday: 'long' });
    const dayNum = date.getDate();
    return `${day.charAt(0).toUpperCase() + day.slice(1)} ${dayNum}`;
  };

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const hasEntryToday = entries.some(entry => isToday(entry.date));

  const getPreviewText = (entry: GratitudeEntry) => {
    const parts = [];
    if (entry.entries.one) parts.push(`1. ${entry.entries.one}`);
    if (entry.entries.two) parts.push(`2. ${entry.entries.two}`);
    if (entry.entries.three) parts.push(`3. ${entry.entries.three}`);
    return parts.join(' ');
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 sticky top-0 z-20 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => navigate('/home')}
            className="p-2 -ml-2 rounded-full hover:bg-neutral-100 transition-colors text-neutral-600"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-neutral-900">Historial</h1>
        </div>
        
        <div className="flex gap-2 mb-2">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
              activeFilter === 'all' 
                ? 'bg-amber-100 text-amber-900' 
                : 'bg-transparent text-neutral-500 hover:bg-neutral-50'
            }`}
          >
            Todos
          </button>
          <button 
            onClick={() => setActiveFilter('favorites')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
              activeFilter === 'favorites' 
                ? 'bg-amber-100 text-amber-900' 
                : 'bg-transparent text-neutral-500 hover:bg-neutral-50'
            }`}
          >
            Favoritos
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24">
        {/* Timeline Line */}
        <div className="absolute left-[42px] top-40 bottom-0 w-[1px] bg-neutral-100 z-0"></div>

        {/* List of Entries */}
        <div className="flex flex-col gap-6 relative z-10">
          
          {/* Today Card - Create New Entry */}
          {!hasEntryToday && (
            <div className="flex gap-4 items-start opacity-60">
              <div className="w-10 flex flex-col items-center shrink-0 pt-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Hoy</span>
                <div className="w-3 h-3 rounded-full border-2 border-neutral-300 bg-white mt-1"></div>
              </div>
              <button
                onClick={() => navigate('/wellness/gratitude')}
                className="flex-1 border-2 border-dashed border-neutral-200 rounded-2xl p-4 flex items-center justify-center gap-2 text-neutral-400 hover:border-amber-300 hover:text-amber-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Escribir registro de hoy</span>
              </button>
            </div>
          )}

          {/* Entry List */}
          {entries.map((entry, index) => {
            const dateInfo = formatDate(entry.date);
            const isRecent = index === 0 || dateInfo.label === 'Ayer';
            
            return (
              <button
                key={entry.id}
                onClick={() => navigate(`/wellness/gratitude/${index}`)}
                className="flex gap-4 items-start group text-left w-full"
              >
                <div className="w-10 flex flex-col items-center shrink-0 pt-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">
                    {dateInfo.label}
                  </span>
                  <div 
                    className={`w-3 h-3 rounded-full mt-1 ${
                      isRecent 
                        ? 'bg-amber-400 ring-4 ring-amber-50' 
                        : 'bg-neutral-200'
                    }`}
                  ></div>
                </div>
                <div 
                  className={`flex-1 bg-white border rounded-2xl p-4 transition-all group-active:scale-[0.98] ${
                    isRecent 
                      ? 'border-amber-100 shadow-sm hover:shadow-md hover:border-amber-200' 
                      : 'border-neutral-100 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div 
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                        isRecent 
                          ? 'bg-amber-50 text-amber-700' 
                          : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {formatDayOfWeek(entry.date)}
                    </div>
                    {isRecent && (
                      <ArrowUpRight className="w-4 h-4 text-neutral-300 group-hover:text-amber-500" />
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 mb-1">
                    {entry.title || 'Momentos de Luz'}
                  </h3>
                  <p className="text-xs text-neutral-500 line-clamp-2">
                    {getPreviewText(entry)}
                  </p>
                </div>
              </button>
            );
          })}

          {/* Empty State */}
          {entries.length === 0 && hasEntryToday === false && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">
                Comienza tu diario
              </h3>
              <p className="text-sm text-neutral-500 mb-6 max-w-[250px]">
                Reflexiona sobre los momentos que iluminan tu día
              </p>
              <button
                onClick={() => navigate('/wellness/gratitude')}
                className="px-6 py-3 bg-amber-400 text-amber-950 rounded-xl font-bold text-sm hover:bg-amber-500 transition-colors"
              >
                Crear primera entrada
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GratitudeHistory;
