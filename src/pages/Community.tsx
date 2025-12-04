import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { Search, PenLine, Heart, MessageCircle, Scale, Briefcase, HeartPulse, Home as HomeIcon, GraduationCap, Utensils, ChevronRight, MessageSquareDashed, TrendingUp, ShieldCheck, ShoppingBag } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import TestimonialComments from '@/components/community/TestimonialComments';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
interface Testimonial {
  id: string;
  title: string;
  content: string;
  author_name: string;
  country_of_origin: string | null;
  category: string;
  is_featured: boolean;
  created_at: string;
  like_count?: number;
  user_liked?: boolean;
  comment_count?: number;
  user_id?: string;
}
const categories = [{
  id: 'destacados',
  label: 'Destacados',
  color: 'neutral',
  icon: null
}, {
  id: 'populares',
  label: 'Populares',
  color: 'rose',
  icon: TrendingUp
}, {
  id: 'casual',
  label: 'Casual',
  color: 'slate',
  icon: MessageCircle
}, {
  id: 'seguridad',
  label: 'Seguridad',
  color: 'red',
  icon: ShieldCheck
}, {
  id: 'ventas',
  label: 'Ventas',
  color: 'purple',
  icon: ShoppingBag
}, {
  id: 'trabajo',
  label: 'Trabajo',
  color: 'orange',
  icon: Briefcase
}, {
  id: 'legal',
  label: 'Legal',
  color: 'blue',
  icon: Scale
}, {
  id: 'salud',
  label: 'Salud',
  color: 'rose',
  icon: HeartPulse
}, {
  id: 'educacion',
  label: 'Educación',
  color: 'indigo',
  icon: GraduationCap
}, {
  id: 'vivienda',
  label: 'Vivienda',
  color: 'amber',
  icon: HomeIcon
}];
const categoryColors = {
  casual: {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-100',
    glow: 'bg-slate-100/50'
  },
  seguridad: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-100',
    glow: 'bg-red-100/50'
  },
  ventas: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-100',
    glow: 'bg-purple-100/50'
  },
  legal: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-100',
    glow: 'bg-blue-100/50'
  },
  trabajo: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-100',
    glow: 'bg-emerald-100/50'
  },
  salud: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-100',
    glow: 'bg-rose-100/50'
  },
  vivienda: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-100',
    glow: 'bg-amber-100/50'
  },
  educacion: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-100',
    glow: 'bg-indigo-100/50'
  },
  alimentacion: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-100',
    glow: 'bg-green-100/50'
  }
};
const countryToCode: Record<string, string> = {
  'Venezuela': 've',
  'Colombia': 'co',
  'México': 'mx',
  'Guatemala': 'gt',
  'El Salvador': 'sv',
  'Honduras': 'hn',
  'Nicaragua': 'ni',
  'Ecuador': 'ec',
  'Perú': 'pe',
  'Cuba': 'cu',
  'Ucrania': 'ua',
  'Siria': 'sy'
};
const Community = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'historias' | 'categorias'>('historias');
  const [selectedFilter, setSelectedFilter] = useState('destacados');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [uniqueUsersCount, setUniqueUsersCount] = useState(0);
  const [topCountries, setTopCountries] = useState<string[]>([]);
  const [totalCountries, setTotalCountries] = useState(0);
  const [commentsModalTestimonial, setCommentsModalTestimonial] = useState<string | null>(null);
  useEffect(() => {
    fetchTestimonials();
    fetchStats();
  }, []);
  const fetchStats = async () => {
    try {
      // Get unique users
      const {
        data: users,
        error: usersError
      } = await supabase.from('testimonials').select('user_id', {
        count: 'exact'
      });
      if (usersError) throw usersError;
      const uniqueUsers = new Set(users?.map(t => t.user_id).filter(Boolean));
      setUniqueUsersCount(uniqueUsers.size);

      // Get unique countries
      const {
        data: countries,
        error: countriesError
      } = await supabase.from('testimonials').select('country_of_origin');
      if (countriesError) throw countriesError;
      const uniqueCountries = Array.from(new Set(countries?.map(t => t.country_of_origin).filter(Boolean))) as string[];
      setTotalCountries(uniqueCountries.length);
      setTopCountries(uniqueCountries.slice(0, 3));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  const fetchTestimonials = async () => {
    try {
      let query = supabase.from('testimonials').select('*, testimonial_reactions(count), testimonial_comments(count)').order('created_at', {
        ascending: false
      });
      const {
        data,
        error
      } = await query;
      if (error) throw error;
      const processedData = await Promise.all((data || []).map(async testimonial => {
        const likeCount = testimonial.testimonial_reactions?.[0]?.count || 0;
        const commentCount = testimonial.testimonial_comments?.[0]?.count || 0;
        let userLiked = false;
        if (user) {
          const {
            data: reactionData
          } = await supabase.from('testimonial_reactions').select('id').eq('testimonial_id', testimonial.id).eq('user_id', user.id).maybeSingle();
          userLiked = !!reactionData;
        }
        return {
          ...testimonial,
          like_count: likeCount,
          comment_count: commentCount,
          user_liked: userLiked
        };
      }));
      setTestimonials(processedData);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Error al cargar las historias');
    } finally {
      setLoading(false);
    }
  };
  const handleLike = async (testimonialId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para dar like');
      return;
    }
    try {
      const testimonial = testimonials.find(t => t.id === testimonialId);
      if (!testimonial) return;
      if (testimonial.user_liked) {
        await supabase.from('testimonial_reactions').delete().eq('testimonial_id', testimonialId).eq('user_id', user.id);
      } else {
        await supabase.from('testimonial_reactions').insert({
          testimonial_id: testimonialId,
          user_id: user.id,
          reaction_type: 'like'
        });
      }
      setTestimonials(prev => prev.map(t => t.id === testimonialId ? {
        ...t,
        like_count: t.user_liked ? (t.like_count || 1) - 1 : (t.like_count || 0) + 1,
        user_liked: !t.user_liked
      } : t));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Error al actualizar el like');
    }
  };
  const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[1][0]}`.toUpperCase() : names[0][0].toUpperCase();
  };
  const getUserInitials = () => {
    if (!user?.user_metadata?.full_name) return 'U';
    return getInitials(user.user_metadata.full_name);
  };
  const getAvatarColor = (name: string) => {
    const colors = ['blue', 'orange', 'emerald', 'rose', 'purple', 'amber'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };
  const getCountryCode = (country: string | null): string => {
    if (!country) return '';
    return countryToCode[country] || '';
  };
  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / 3600000);
    if (diffInHours < 1) return 'hace menos de 1 hora';
    if (diffInHours < 24) return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `hace ${diffInWeeks} ${diffInWeeks === 1 ? 'semana' : 'semanas'}`;
  };
  const getCategoryInfo = (category: string) => {
    const colors = categoryColors[category as keyof typeof categoryColors];
    return colors || {
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-100',
      glow: 'bg-slate-100/50'
    };
  };
  const calculatePopularityScore = (testimonial: Testimonial) => {
    const likes = testimonial.like_count || 0;
    const comments = testimonial.comment_count || 0;

    // Pesos para el ranking
    const likeWeight = 1;
    const commentWeight = 2; // Comentarios valen más

    // Factor de tiempo (posts recientes tienen bonus)
    const hoursOld = (Date.now() - new Date(testimonial.created_at).getTime()) / 3600000;
    const timeDecay = Math.max(0.5, 1 - hoursOld / 168); // Decay over 1 week

    return (likes * likeWeight + comments * commentWeight) * timeDecay;
  };
  const getFilteredAndSortedTestimonials = () => {
    let filtered = testimonials.filter(t => {
      // Filtro de búsqueda
      const matchesSearch = searchQuery ? t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.content.toLowerCase().includes(searchQuery.toLowerCase()) : true;

      // Filtro por categoría
      if (selectedFilter === 'destacados' || selectedFilter === 'populares') {
        return matchesSearch; // Todos los posts
      }
      return t.category === selectedFilter && matchesSearch;
    });

    // Ordenamiento
    if (selectedFilter === 'populares') {
      // Ordenar por popularidad (descendente)
      filtered.sort((a, b) => calculatePopularityScore(b) - calculatePopularityScore(a));
    }
    // Para 'destacados' y categorías, ya viene ordenado por created_at desc

    return filtered;
  };
  const filteredTestimonials = getFilteredAndSortedTestimonials();
  const getCategoryCounts = () => {
    return {
      legal: testimonials.filter(t => t.category === 'legal').length,
      trabajo: testimonials.filter(t => t.category === 'trabajo').length,
      salud: testimonials.filter(t => t.category === 'salud').length,
      vivienda: testimonials.filter(t => t.category === 'vivienda').length
    };
  };
  const counts = getCategoryCounts();
  if (loading) {
    return <LoadingSpinner />;
  }
  return <div className="min-h-screen bg-white flex flex-col pb-24">
    {/* Header */}
    <div className="px-6 pb-0 bg-white sticky top-0 z-30 pt-[56px]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-jakarta">
          {activeTab === 'historias' ? 'Comunidad' : 'Explorar'}
        </h1>
        <div className="flex gap-2">
          <button onClick={() => setShowSearch(!showSearch)} className="w-9 h-9 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <Avatar className="w-9 h-9 bg-neutral-900">
            <AvatarFallback className="text-white text-xs font-bold font-manrope">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Search Input (expandable) */}
      {showSearch && <div className="mb-4">
        <Input placeholder="Buscar historias..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-slate-50 border-slate-200" />
      </div>}

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button onClick={() => setActiveTab('historias')} className={`px-1 pb-3 text-sm font-manrope mr-6 transition-colors ${activeTab === 'historias' ? 'font-semibold text-indigo-600 border-b-2 border-indigo-600' : 'font-medium text-muted-foreground hover:text-foreground'}`}>
          Historias
        </button>
        <button onClick={() => setActiveTab('categorias')} className={`px-1 pb-3 text-sm font-manrope transition-colors ${activeTab === 'categorias' ? 'font-semibold text-indigo-600 border-b-2 border-indigo-600' : 'font-medium text-muted-foreground hover:text-foreground'}`}>
          Categorías
        </button>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto no-scrollbar">
      {activeTab === 'historias' ? <>
        {/* Stats Banner */}
        <div className="px-6 pt-6 pb-2">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-4 text-white shadow-lg shadow-indigo-200 flex items-center justify-between">
            <div>
              <span className="block text-2xl font-bold font-jakarta">{uniqueUsersCount}</span>
              <span className="text-xs text-indigo-100 font-manrope uppercase tracking-wide">
                Voces Unidas
              </span>
            </div>
            <div className="text-right">
              <div className="flex -space-x-2 justify-end mb-1.5">
                {/* Mock flags - 4 banderas de países latinoamericanos */}
                <div className="w-6 h-6 rounded-full border-2 border-white/80 bg-white overflow-hidden shadow-sm">
                  <img src="https://flagcdn.com/w40/ve.png" alt="Venezuela" className="w-full h-full object-cover" />
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-white/80 bg-white overflow-hidden shadow-sm">
                  <img src="https://flagcdn.com/w40/mx.png" alt="México" className="w-full h-full object-cover" />
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-white/80 bg-white overflow-hidden shadow-sm">
                  <img src="https://flagcdn.com/w40/co.png" alt="Colombia" className="w-full h-full object-cover" />
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-white/80 bg-white overflow-hidden shadow-sm">
                  <img src="https://flagcdn.com/w40/ar.png" alt="Argentina" className="w-full h-full object-cover" />
                </div>
              </div>
              <span className="text-xs text-indigo-100 font-manrope">17 Países</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex overflow-x-auto no-scrollbar px-6 gap-2 py-4">
          {categories.map(cat => <button key={cat.id} onClick={() => setSelectedFilter(cat.id)} className={`px-4 py-1.5 rounded-full text-xs font-manrope whitespace-nowrap transition-colors ${selectedFilter === cat.id ? 'bg-neutral-900 text-white font-normal' : 'bg-background border border-border text-muted-foreground hover:bg-muted font-medium'}`}>
            {cat.label}
          </button>)}
        </div>

        {/* Feed */}
        {filteredTestimonials.length === 0 ? <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
          <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mb-6 relative animate-float">
            <div className="absolute inset-0 bg-muted/50 rounded-full blur-2xl"></div>
            <MessageSquareDashed className="w-12 h-12 text-muted-foreground/30" />
          </div>
          <h2 className="text-lg font-bold text-foreground font-jakarta mb-2">
            Todo está muy tranquilo
          </h2>
          <p className="text-sm text-muted-foreground font-manrope leading-relaxed mb-8 max-w-[240px]">
            Aún no hay publicaciones {selectedFilter !== 'destacados' && 'en esta categoría'}. Sé la primera persona en compartir algo.
          </p>
          <button onClick={() => navigate('/community/new')} className="w-full max-w-xs py-3.5 bg-neutral-900 text-white rounded-xl font-semibold text-sm hover:bg-neutral-800 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95">
            <PenLine className="w-4 h-4" />
            <span className="font-manrope">Iniciar conversación</span>
          </button>
        </div> : <div className="px-6 flex flex-col gap-4">
          {filteredTestimonials.map(testimonial => {
            const categoryInfo = getCategoryInfo(testimonial.category);
            const avatarColor = getAvatarColor(testimonial.author_name);
            const countryCode = getCountryCode(testimonial.country_of_origin);
            return <div key={testimonial.id} className="bg-background p-5 rounded-2xl shadow-sm border border-border cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/community/post/${testimonial.id}`)}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className={`w-10 h-10 bg-${avatarColor}-100 text-${avatarColor}-600`}>
                      <AvatarFallback className="font-bold font-manrope text-sm">
                        {getInitials(testimonial.author_name)}
                      </AvatarFallback>
                    </Avatar>
                    {countryCode && <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background overflow-hidden">
                      <img src={`https://flagcdn.com/w40/${countryCode}.png`} alt={testimonial.country_of_origin || ''} className="w-full h-full object-cover" />
                    </div>}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground font-jakarta">
                      {testimonial.author_name}
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-manrope">
                      {formatRelativeTime(testimonial.created_at)} •{' '}
                      <span className={`font-medium ${categoryInfo.text}`}>
                        {categories.find(c => c.id === testimonial.category)?.label || testimonial.category}
                      </span>
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
                <button onClick={e => {
                  e.stopPropagation();
                  handleLike(testimonial.id);
                }} className={`flex items-center gap-1.5 transition-colors group ${testimonial.user_liked ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'}`}>
                  <Heart className={`w-4 h-4 ${testimonial.user_liked ? 'fill-rose-500' : 'group-hover:fill-rose-500'}`} />
                  <span className="text-xs font-medium font-manrope">
                    {testimonial.like_count || 0}
                  </span>
                </button>
                <button onClick={e => {
                  e.stopPropagation();
                  setCommentsModalTestimonial(testimonial.id);
                }} className="flex items-center gap-1.5 text-muted-foreground hover:text-indigo-600 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs font-medium font-manrope">
                    {testimonial.comment_count || 0}
                  </span>
                </button>
              </div>
            </div>;
          })}
        </div>}
      </> : <>
        {/* Categories Tab */}
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-manrope mb-3">
            Temas Populares
          </h2>
          <Input placeholder="Buscar temas (ej. asilo, empleo)..." className="bg-slate-50 border-slate-200" />
        </div>

        <div className="px-6 pb-6">

          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Legal */}
            <button onClick={() => navigate('/community/category/legal')} className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-left hover:scale-[1.02] transition-transform group relative overflow-hidden">
              <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-blue-100/50 rounded-full blur-xl group-hover:bg-blue-200/50 transition-colors"></div>
              <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center shadow-sm mb-3 relative z-10">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900 font-jakarta mb-0.5">Legal</h3>
              <p className="text-[10px] text-blue-700/70 font-manrope">{counts.legal} publicaciones</p>
            </button>

            {/* Trabajo */}
            <button onClick={() => navigate('/community/category/trabajo')} className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-left hover:scale-[1.02] transition-transform group relative overflow-hidden">
              <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-emerald-100/50 rounded-full blur-xl group-hover:bg-emerald-200/50 transition-colors"></div>
              <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm mb-3 relative z-10">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900 font-jakarta mb-0.5">Trabajo</h3>
              <p className="text-[10px] text-emerald-700/70 font-manrope">{counts.trabajo} publicaciones</p>
            </button>

            {/* Salud */}
            <button onClick={() => navigate('/community/category/salud')} className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-left hover:scale-[1.02] transition-transform group relative overflow-hidden">
              <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-rose-100/50 rounded-full blur-xl group-hover:bg-rose-200/50 transition-colors"></div>
              <div className="w-10 h-10 rounded-xl bg-white text-rose-600 flex items-center justify-center shadow-sm mb-3 relative z-10">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900 font-jakarta mb-0.5">Salud</h3>
              <p className="text-[10px] text-rose-700/70 font-manrope">{counts.salud} publicaciones</p>
            </button>

            {/* Vivienda */}
            <button onClick={() => navigate('/community/category/vivienda')} className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-left hover:scale-[1.02] transition-transform group relative overflow-hidden">
              <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-amber-100/50 rounded-full blur-xl group-hover:bg-amber-200/50 transition-colors"></div>
              <div className="w-10 h-10 rounded-xl bg-white text-amber-600 flex items-center justify-center shadow-sm mb-3 relative z-10">
                <HomeIcon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900 font-jakarta mb-0.5">Vivienda</h3>
              <p className="text-[10px] text-amber-700/70 font-manrope">{counts.vivienda} publicaciones</p>
            </button>
          </div>

          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-manrope mb-4">OTROS TEMAS</h2>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/community/category/educacion')} className="w-full p-3 bg-background border border-border rounded-xl flex items-center justify-between hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-foreground font-manrope">Educación</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button onClick={() => navigate('/community/category/alimentacion')} className="w-full p-3 bg-background border border-border rounded-xl flex items-center justify-between hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-foreground font-manrope">Alimentación</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </>}
    </div>

    {/* FAB */}
    <button onClick={() => navigate('/community/new')} className="fixed bottom-24 right-6 w-14 h-14 bg-neutral-900 rounded-full text-white shadow-xl shadow-neutral-900/30 flex items-center justify-center hover:scale-105 transition-transform z-20">
      <PenLine className="w-6 h-6" />
    </button>

    {/* Comments Modal */}
    {commentsModalTestimonial && <TestimonialComments testimonialId={commentsModalTestimonial} isOpen={!!commentsModalTestimonial} onClose={() => setCommentsModalTestimonial(null)} />}
  </div>;
};
export default Community;