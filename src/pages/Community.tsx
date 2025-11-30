import { useEffect, useState } from 'react';
import { Search, Heart, MessageCircle, PenLine, MoreHorizontal } from 'lucide-react';
import TestimonialComments from '@/components/community/TestimonialComments';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getUserInitials } from '@/lib/countries';

interface Testimonial {
  id: string;
  title: string;
  content: string;
  author_name: string;
  country_of_origin: string;
  category: string;
  tags?: string[];
  is_featured: boolean;
  created_at: string;
  like_count?: number;
  user_liked?: boolean;
  comment_count?: number;
}

const categories = [
  { id: 'destacados', label: 'Destacados', color: 'slate' },
  { id: 'trabajo', label: 'Trabajo', color: 'orange' },
  { id: 'legal', label: 'Legal', color: 'indigo' },
  { id: 'salud', label: 'Salud', color: 'emerald' },
  { id: 'educacion', label: 'Educación', color: 'blue' },
  { id: 'familia', label: 'Familia', color: 'pink' },
  { id: 'general', label: 'General', color: 'slate' }
];

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
  'Argentina': 'ar',
  'Chile': 'cl',
  'Bolivia': 'bo',
  'Paraguay': 'py',
  'Uruguay': 'uy',
  'República Dominicana': 'do',
  'Costa Rica': 'cr',
  'Panamá': 'pa',
  'Brasil': 'br'
};

const Community = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('destacados');
  const [activeTab, setActiveTab] = useState('historias');
  const [selectedTestimonialId, setSelectedTestimonialId] = useState<string | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    title: '',
    content: '',
    author_name: '',
    country_of_origin: '',
    category: 'general'
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select(`
          id, title, content, author_name, country_of_origin, category, tags, is_featured, created_at,
          testimonial_reactions!left(id),
          testimonial_comments!left(id)
        `)
        .eq('is_approved', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedTestimonials = await Promise.all(
        (data || []).map(async (testimonial: any) => {
          const like_count = testimonial.testimonial_reactions?.length || 0;
          const comment_count = testimonial.testimonial_comments?.length || 0;

          let user_liked = false;
          if (user) {
            const { data: userReaction } = await supabase
              .from('testimonial_reactions')
              .select('id')
              .eq('testimonial_id', testimonial.id)
              .eq('user_id', user.id)
              .single();
            user_liked = !!userReaction;
          }

          return {
            ...testimonial,
            like_count,
            comment_count,
            user_liked,
            testimonial_reactions: undefined,
            testimonial_comments: undefined
          };
        })
      );

      setTestimonials(processedTestimonials);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los testimonios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTestimonial = async () => {
    if (!user || !newTestimonial.title || !newTestimonial.content || !newTestimonial.author_name) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('testimonials').insert({
        user_id: user.id,
        title: newTestimonial.title,
        content: newTestimonial.content,
        author_name: newTestimonial.author_name,
        country_of_origin: newTestimonial.country_of_origin || null,
        category: newTestimonial.category,
        is_approved: false,
        is_featured: false
      });

      if (error) throw error;

      toast({
        title: "¡Testimonio enviado!",
        description: "Tu testimonio será revisado antes de publicarse"
      });

      setNewTestimonial({
        title: '',
        content: '',
        author_name: '',
        country_of_origin: '',
        category: 'general'
      });
      setShowForm(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo enviar el testimonio",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeTestimonial = async (testimonialId: string) => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para dar me gusta",
        variant: "destructive"
      });
      return;
    }

    try {
      const testimonial = testimonials.find(t => t.id === testimonialId);
      if (!testimonial) return;

      if (testimonial.user_liked) {
        await supabase
          .from('testimonial_reactions')
          .delete()
          .eq('testimonial_id', testimonialId)
          .eq('user_id', user.id);
      } else {
        await supabase.from('testimonial_reactions').insert({
          testimonial_id: testimonialId,
          user_id: user.id,
          reaction_type: 'like'
        });
      }

      setTestimonials(prev =>
        prev.map(t => {
          if (t.id === testimonialId) {
            return {
              ...t,
              like_count: t.user_liked ? (t.like_count || 1) - 1 : (t.like_count || 0) + 1,
              user_liked: !t.user_liked
            };
          }
          return t;
        })
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo procesar la reacción",
        variant: "destructive"
      });
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'hace unos segundos';
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 604800) return `hace ${Math.floor(diffInSeconds / 86400)} días`;
    return new Date(dateString).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  const getCountryCode = (country: string): string | null => {
    return countryToCode[country] || null;
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.color || 'slate';
  };

  const getFilteredTestimonials = () => {
    let filtered = testimonials;

    if (selectedCategory === 'destacados') {
      filtered = testimonials.filter(t => t.is_featured);
    } else {
      filtered = testimonials.filter(t => t.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.title.toLowerCase().includes(query) ||
          t.content.toLowerCase().includes(query) ||
          t.author_name.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const getUniqueCountries = () => {
    const countries = testimonials
      .filter(t => t.country_of_origin)
      .map(t => t.country_of_origin);
    return [...new Set(countries)];
  };

  const getTopCountries = () => {
    const countries = getUniqueCountries();
    return countries.slice(0, 3);
  };

  const filteredTestimonials = getFilteredTestimonials();
  const uniqueCountries = getUniqueCountries();
  const topCountries = getTopCountries();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Sticky */}
      <div className="px-6 pt-14 pb-0 bg-white sticky top-0 z-30">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Comunidad</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
              {user ? getUserInitials(user.user_metadata?.full_name) : 'U'}
            </div>
          </div>
        </div>

        {/* Search Input (Expandable) */}
        {showSearch && (
          <div className="mb-4 animate-slide-down">
            <Input
              type="text"
              placeholder="Buscar historias..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-auto p-0 bg-transparent border-b border-slate-100">
            <TabsTrigger
              value="historias"
              className="px-1 pb-3 text-sm font-semibold data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=inactive]:text-slate-500 mr-6 rounded-none bg-transparent"
            >
              Historias
            </TabsTrigger>
            <TabsTrigger
              value="categorias"
              className="px-1 pb-3 text-sm font-medium data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=inactive]:text-slate-500 rounded-none bg-transparent"
            >
              Categorías
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="historias" className="mt-0">
            {/* Stats Banner */}
            <div className="px-6 pt-6 pb-2">
              <div
                className="rounded-2xl p-4 text-white shadow-lg flex items-center justify-between"
                style={{
                  background: 'linear-gradient(135deg, rgb(79, 70, 229) 0%, rgb(139, 92, 246) 100%)'
                }}
              >
                <div>
                  <span className="block text-2xl font-bold">{testimonials.length}</span>
                  <span className="text-xs uppercase tracking-wide" style={{ color: 'rgb(199, 210, 254)' }}>
                    Voces Unidas
                  </span>
                </div>
                <div className="text-right">
                  <div className="flex -space-x-2 justify-end mb-1">
                    {topCountries.map((country, idx) => {
                      const code = getCountryCode(country);
                      return code ? (
                        <div
                          key={idx}
                          className="w-6 h-6 rounded-full border-2 bg-white overflow-hidden"
                          style={{ borderColor: 'rgb(99, 102, 241)' }}
                        >
                          <img
                            src={`https://flagcdn.com/w40/${code}.png`}
                            alt={country}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : null;
                    })}
                    {uniqueCountries.length > 3 && (
                      <div
                        className="w-6 h-6 rounded-full border-2 bg-slate-800 text-[8px] flex items-center justify-center font-bold text-white"
                        style={{ borderColor: 'rgb(99, 102, 241)' }}
                      >
                        +{uniqueCountries.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-xs" style={{ color: 'rgb(199, 210, 254)' }}>
                    {uniqueCountries.length} Países
                  </span>
                </div>
              </div>
            </div>

            {/* Filters (Horizontal Scroll) */}
            <div className="flex overflow-x-auto no-scrollbar px-6 gap-2 py-4">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Feed */}
            <div className="px-6 flex flex-col gap-4">
              {filteredTestimonials.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 text-sm mb-4">No hay historias en esta categoría</p>
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-slate-900 text-white hover:bg-slate-800"
                  >
                    <PenLine className="w-4 h-4 mr-2" />
                    Compartir Historia
                  </Button>
                </div>
              ) : (
                filteredTestimonials.map(testimonial => {
                  const categoryColor = getCategoryColor(testimonial.category);
                  const countryCode = getCountryCode(testimonial.country_of_origin);
                  const avatarColors = [
                    'bg-blue-100 text-blue-600',
                    'bg-orange-100 text-orange-600',
                    'bg-emerald-100 text-emerald-600',
                    'bg-pink-100 text-pink-600',
                    'bg-indigo-100 text-indigo-600'
                  ];
                  const avatarColor = avatarColors[testimonial.id.charCodeAt(0) % avatarColors.length];

                  return (
                    <Card key={testimonial.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center font-bold text-sm relative`}>
                            {getUserInitials(testimonial.author_name)}
                            {countryCode && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white overflow-hidden">
                                <img
                                  src={`https://flagcdn.com/w40/${countryCode}.png`}
                                  alt={testimonial.country_of_origin}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">{testimonial.author_name}</h3>
                            <p className="text-[10px] text-slate-400">
                              {formatRelativeTime(testimonial.created_at)} •{' '}
                              <span className="text-indigo-600 font-medium">
                                {categories.find(c => c.id === testimonial.category)?.label}
                              </span>
                            </p>
                          </div>
                        </div>
                        <button className="text-slate-400 hover:text-slate-600">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 mb-2 leading-tight">{testimonial.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-3">{testimonial.content}</p>

                      <div className="flex items-center gap-4 border-t border-slate-50 pt-3">
                        <button
                          onClick={() => handleLikeTestimonial(testimonial.id)}
                          className={`flex items-center gap-1.5 transition-colors group ${
                            testimonial.user_liked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${testimonial.user_liked ? 'fill-rose-500' : 'group-hover:fill-rose-500'}`}
                          />
                          <span className="text-xs font-medium">{testimonial.like_count || 0}</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTestimonialId(testimonial.id);
                            setCommentsOpen(true);
                          }}
                          className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">{testimonial.comment_count || 0}</span>
                        </button>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="categorias" className="mt-0">
            <div className="px-6 pt-6">
              <div className="grid grid-cols-2 gap-3 mb-6">
                {categories
                  .filter(c => c.id !== 'destacados')
                  .map(category => {
                    const count = testimonials.filter(t => t.category === category.id).length;
                    return (
                      <Card
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setActiveTab('historias');
                        }}
                        className="p-4 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all"
                      >
                        <h3 className="text-sm font-bold text-slate-900 mb-1">{category.label}</h3>
                        <p className="text-2xl font-bold text-indigo-600">{count}</p>
                        <p className="text-[10px] text-slate-400 mt-1">historias</p>
                      </Card>
                    );
                  })}
              </div>

              {/* Overall Stats */}
              <Card className="p-5 rounded-2xl shadow-sm border border-slate-100 mb-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Estadísticas Generales</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-600">Total Historias</span>
                    <span className="text-sm font-bold text-slate-900">{testimonials.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-600">Países Representados</span>
                    <span className="text-sm font-bold text-slate-900">{uniqueCountries.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-600">Historias Destacadas</span>
                    <span className="text-sm font-bold text-slate-900">
                      {testimonials.filter(t => t.is_featured).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-600">Reacciones Totales</span>
                    <span className="text-sm font-bold text-slate-900">
                      {testimonials.reduce((sum, t) => sum + (t.like_count || 0), 0)}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-slate-900 rounded-full text-white shadow-xl flex items-center justify-center hover:scale-105 transition-transform z-20"
        style={{ boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)' }}
      >
        <PenLine className="w-6 h-6" />
      </button>

      {/* Dialog: Compartir Historia */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Comparte tu Historia</DialogTitle>
            <DialogDescription>Tu testimonio puede inspirar y ayudar a otros migrantes</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título de tu historia</Label>
              <Input
                id="title"
                value={newTestimonial.title}
                onChange={e => setNewTestimonial({ ...newTestimonial, title: e.target.value })}
                placeholder="¿Cómo resumirías tu experiencia?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Tu nombre (o seudónimo)</Label>
              <Input
                id="author"
                value={newTestimonial.author_name}
                onChange={e => setNewTestimonial({ ...newTestimonial, author_name: e.target.value })}
                placeholder="Como quieres que te identifiquen"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">País de origen (opcional)</Label>
              <Input
                id="country"
                value={newTestimonial.country_of_origin}
                onChange={e => setNewTestimonial({ ...newTestimonial, country_of_origin: e.target.value })}
                placeholder="Tu país de origen"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={newTestimonial.category}
                onValueChange={value => setNewTestimonial({ ...newTestimonial, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter(c => c.id !== 'destacados')
                    .map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Tu historia</Label>
              <Textarea
                id="content"
                value={newTestimonial.content}
                onChange={e => setNewTestimonial({ ...newTestimonial, content: e.target.value })}
                placeholder="Comparte tu experiencia, los desafíos que has enfrentado y cómo has salido adelante..."
                className="min-h-[120px]"
              />
            </div>

            <Button onClick={handleSubmitTestimonial} disabled={submitting} className="w-full btn-primary">
              {submitting ? 'Enviando...' : 'Compartir Historia'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comments Modal */}
      {selectedTestimonialId && (
        <TestimonialComments
          testimonialId={selectedTestimonialId}
          isOpen={commentsOpen}
          onClose={() => {
            setCommentsOpen(false);
            setSelectedTestimonialId(null);
          }}
        />
      )}
    </div>
  );
};

export default Community;
