import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Image, Hash, Link as LinkIcon, EyeOff, ShieldCheck, X, ChevronDown, Scale, Briefcase, HeartPulse, Home as HomeIcon, GraduationCap } from 'lucide-react';

const categories = [
  { id: 'legal', label: 'Legal y Trámites', color: 'blue', icon: Scale },
  { id: 'trabajo', label: 'Trabajo', color: 'emerald', icon: Briefcase },
  { id: 'salud', label: 'Salud', color: 'rose', icon: HeartPulse },
  { id: 'vivienda', label: 'Vivienda', color: 'amber', icon: HomeIcon },
  { id: 'educacion', label: 'Educación', color: 'indigo', icon: GraduationCap },
];

const NewPost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getUserInitials = () => {
    if (!user?.user_metadata?.full_name) return 'U';
    const names = user.user_metadata.full_name.split(' ');
    return names.length > 1
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : names[0][0].toUpperCase();
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Por favor completa el título y el contenido');
      return;
    }

    if (!selectedCategory) {
      toast.error('Por favor selecciona una categoría');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('testimonials').insert({
        title: title.trim(),
        content: content.trim(),
        category: selectedCategory,
        user_id: user?.id,
        author_name: user?.user_metadata?.full_name || 'Usuario',
        country_of_origin: user?.user_metadata?.country_of_origin || null,
      });

      if (error) throw error;

      toast.success('Historia publicada con éxito');
      navigate('/community');
    } catch (error) {
      console.error('Error publishing post:', error);
      toast.error('Error al publicar. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (title || content) {
      if (window.confirm('¿Seguro que quieres descartar esta publicación?')) {
        navigate('/community');
      }
    } else {
      navigate('/community');
    }
  };

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);
  const CategoryIcon = selectedCategoryData?.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Actions */}
      <div className="px-6 pt-14 pb-4 flex justify-between items-center border-b border-border sticky top-0 z-30 bg-background">
        <button
          onClick={handleCancel}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors font-manrope"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !title.trim() || !content.trim() || !selectedCategory}
          className="px-5 py-1.5 bg-neutral-900 text-white text-sm font-bold rounded-full hover:bg-neutral-800 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-manrope"
        >
          {isSubmitting ? 'Publicando...' : 'Publicar'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-32">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-6">
          <Avatar className="w-10 h-10 ring-4 ring-muted">
            <AvatarFallback className="bg-neutral-900 text-white text-xs font-bold font-manrope">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="block text-sm font-bold text-foreground font-jakarta">
              {user?.user_metadata?.full_name || 'Usuario'}
            </span>
            <button className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full hover:bg-muted/80 transition-colors">
              Público
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Escribe un título interesante..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-lg font-bold text-foreground placeholder-muted-foreground outline-none font-jakarta bg-transparent"
            maxLength={100}
          />

          <textarea
            placeholder="Comparte tu experiencia, pregunta o consejo..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-40 text-sm font-manrope text-foreground placeholder-muted-foreground outline-none resize-none bg-transparent leading-relaxed"
            maxLength={1000}
          />
        </div>

        {/* Category Selection */}
        <div className="mt-6">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-manrope mb-3 block">
            Selecciona un tema
          </span>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                    isSelected
                      ? `bg-${category.color}-50 text-${category.color}-700 border-${category.color}-100`
                      : 'bg-background text-muted-foreground border-border hover:bg-muted'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {category.label}
                  {isSelected && <X className="w-3 h-3 ml-1 opacity-50" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="bg-background border-t border-border px-6 py-4 pb-8 sticky bottom-0 z-30">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mb-4">
          <button className="p-2.5 rounded-full text-muted-foreground hover:bg-muted hover:text-indigo-600 transition-colors">
            <Image className="w-5 h-5" />
          </button>
          <button className="p-2.5 rounded-full text-muted-foreground hover:bg-muted hover:text-indigo-600 transition-colors">
            <Hash className="w-5 h-5" />
          </button>
          <button className="p-2.5 rounded-full text-muted-foreground hover:bg-muted hover:text-indigo-600 transition-colors">
            <LinkIcon className="w-5 h-5" />
          </button>
          <div className="h-6 w-px bg-border mx-2"></div>
          <button className="p-2.5 rounded-full text-muted-foreground hover:bg-muted hover:text-indigo-600 transition-colors">
            <EyeOff className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-indigo-50 rounded-xl p-3 flex gap-3">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
          <p className="text-xs text-indigo-900/80 font-manrope leading-snug">
            Tu publicación respeta nuestras normas. Recuerda que este es un espacio seguro.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewPost;
