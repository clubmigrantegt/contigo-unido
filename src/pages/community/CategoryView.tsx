import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { ChevronLeft, Filter, MessageSquareDashed, X, Heart, MessageCircle, PenLine } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Testimonial {
  id: string;
  title: string;
  content: string;
  author_name: string;
  country_of_origin: string | null;
  category: string;
  created_at: string;
  like_count?: number;
  user_liked?: boolean;
  comment_count?: number;
}

const categories = {
  legal: { label: 'Legal y Trámites', color: 'indigo' },
  trabajo: { label: 'Trabajo', color: 'orange' },
  salud: { label: 'Salud', color: 'rose' },
  educacion: { label: 'Educación', color: 'blue' },
  vivienda: { label: 'Vivienda', color: 'amber' },
  familia: { label: 'Familia', color: 'pink' },
  general: { label: 'General', color: 'slate' },
  alimentacion: { label: 'Alimentación', color: 'green' },
};

const CategoryView = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryData = categories[categoryId as keyof typeof categories];

  useEffect(() => {
    fetchTestimonials();
  }, [categoryId]);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('category', categoryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.length > 1
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : names[0][0].toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = ['blue', 'orange', 'emerald', 'rose', 'purple', 'amber'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col pb-24">
      {/* Header */}
      <div className="px-6 pt-14 pb-0 bg-background sticky top-0 z-30">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/community')}
              className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-foreground font-jakarta">
              {categoryData?.label || 'Categoría'}
            </h1>
          </div>
          <button className="w-9 h-9 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Active Filters */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-4">
          <button className="flex items-center gap-1.5 px-3 py-1 bg-neutral-900 text-white rounded-full text-xs font-semibold font-manrope">
            Recientes
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      {testimonials.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 pb-32 text-center">
          <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mb-6 relative animate-float">
            <div className="absolute inset-0 bg-muted/50 rounded-full blur-2xl"></div>
            <MessageSquareDashed className="w-12 h-12 text-muted-foreground/30" />
          </div>

          <h2 className="text-lg font-bold text-foreground font-jakarta mb-2">Todo está muy tranquilo</h2>
          <p className="text-sm text-muted-foreground font-manrope leading-relaxed mb-8 max-w-[240px]">
            Aún no hay publicaciones en esta categoría. Sé la primera persona en compartir algo.
          </p>

          <button
            onClick={() => navigate('/community/new')}
            className="w-full py-3.5 bg-neutral-900 text-white rounded-xl font-semibold text-sm hover:bg-neutral-800 transition-all shadow-lg flex items-center justify-center gap-2 group active:scale-95"
          >
            <PenLine className="w-4 h-4" />
            <span className="font-manrope">Iniciar conversación</span>
          </button>

          <button
            onClick={() => navigate('/community')}
            className="mt-4 text-xs font-semibold text-indigo-600 hover:text-indigo-700 font-manrope"
          >
            Ver otras categorías
          </button>
        </div>
      ) : (
        <div className="px-6 pt-4 flex flex-col gap-4">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-background p-5 rounded-2xl shadow-sm border border-border">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className={`w-10 h-10 bg-${getAvatarColor(testimonial.author_name)}-100 text-${getAvatarColor(testimonial.author_name)}-600`}>
                    <AvatarFallback className="font-bold font-manrope text-sm">
                      {getInitials(testimonial.author_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm font-bold text-foreground font-jakarta">
                      {testimonial.author_name}
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-manrope">
                      hace {Math.floor((Date.now() - new Date(testimonial.created_at).getTime()) / 3600000)} horas
                    </p>
                  </div>
                </div>
              </div>

              <h4 className="text-sm font-bold text-foreground mb-2 font-jakarta leading-tight">
                {testimonial.title}
              </h4>
              <p className="text-xs text-muted-foreground font-manrope leading-relaxed mb-4 line-clamp-3">
                {testimonial.content}
              </p>

              <div className="flex items-center gap-4 border-t border-border/50 pt-3">
                <button className="flex items-center gap-1.5 text-muted-foreground hover:text-rose-500 transition-colors group">
                  <Heart className="w-4 h-4" />
                  <span className="text-xs font-medium font-manrope">{testimonial.like_count || 0}</span>
                </button>
                <button className="flex items-center gap-1.5 text-muted-foreground hover:text-indigo-600 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs font-medium font-manrope">{testimonial.comment_count || 0}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryView;
