import { useEffect, useState } from 'react';
import { Users, Plus, Heart, MessageCircle, Flag, Star, Search, Filter, SlidersHorizontal } from 'lucide-react';
import TestimonialComments from '@/components/community/TestimonialComments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
}

const Community = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [activeTab, setActiveTab] = useState('historias');
  const [selectedTestimonialId, setSelectedTestimonialId] = useState<string | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    title: '',
    content: '',
    author_name: '',
    country_of_origin: '',
    category: 'general'
  });

  const categories = [{
    id: 'todos',
    label: 'Todos'
  }, {
    id: 'general',
    label: 'General'
  }, {
    id: 'trabajo',
    label: 'Trabajo'
  }, {
    id: 'educacion',
    label: 'Educación'
  }, {
    id: 'salud',
    label: 'Salud'
  }, {
    id: 'legal',
    label: 'Legal'
  }, {
    id: 'familia',
    label: 'Familia'
  }];

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    filterTestimonials();
  }, [testimonials, searchQuery, selectedCategory]);

  const fetchTestimonials = async () => {
    try {
      // Fetch testimonials with like counts
      const {
        data,
        error
      } = await supabase.from('testimonials').select(`
          id, title, content, author_name, country_of_origin, category, tags, is_featured, created_at,
          testimonial_reactions!left(id)
        `).eq('is_approved', true).order('is_featured', {
        ascending: false
      }).order('created_at', {
        ascending: false
      });
      if (error) throw error;

      // Process testimonials with like counts and user's like status
      const processedTestimonials = await Promise.all((data || []).map(async (testimonial: any) => {
        const like_count = testimonial.testimonial_reactions?.length || 0;

        // Check if current user liked this testimonial
        let user_liked = false;
        if (user) {
          const {
            data: userReaction
          } = await supabase.from('testimonial_reactions').select('id').eq('testimonial_id', testimonial.id).eq('user_id', user.id).single();
          user_liked = !!userReaction;
        }
        return {
          ...testimonial,
          like_count,
          user_liked,
          testimonial_reactions: undefined // Remove the raw reactions data
        };
      }));
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

  const filterTestimonials = () => {
    let filtered = testimonials;

    // Filter by category
    if (selectedCategory !== 'todos') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => t.title.toLowerCase().includes(query) || t.content.toLowerCase().includes(query) || t.author_name.toLowerCase().includes(query) || t.tags && t.tags.some(tag => tag.toLowerCase().includes(query)));
    }
    setFilteredTestimonials(filtered);
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
      const {
        error
      } = await supabase.from('testimonials').insert({
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
        // Remove like
        await supabase.from('testimonial_reactions').delete().eq('testimonial_id', testimonialId).eq('user_id', user.id);
      } else {
        // Add like
        await supabase.from('testimonial_reactions').insert({
          testimonial_id: testimonialId,
          user_id: user.id,
          reaction_type: 'like'
        });
      }

      // Update local state
      setTestimonials(prev => prev.map(t => {
        if (t.id === testimonialId) {
          return {
            ...t,
            like_count: t.user_liked ? (t.like_count || 1) - 1 : (t.like_count || 0) + 1,
            user_liked: !t.user_liked
          };
        }
        return t;
      }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo procesar la reacción",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      'El Salvador': '🇸🇻',
      'Honduras': '🇭🇳',
      'Guatemala': '🇬🇹',
      'Nicaragua': '🇳🇮',
      'Venezuela': '🇻🇪',
      'Colombia': '🇨🇴',
      'México': '🇲🇽',
      'Perú': '🇵🇪',
      'Ecuador': '🇪🇨'
    };
    return flags[country] || '🌎';
  };

  const getCategoryStats = () => {
    return categories.filter(c => c.id !== 'todos').map(category => ({
      ...category,
      count: testimonials.filter(t => t.category === category.id).length
    }));
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }

  return <div className="min-h-screen bg-white">
      {/* Header principal */}
      <div className="bg-background px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold tracking-tight text-slate-900">Comunidad</h1>
              <p className="text-[12px] text-slate-500">Historias de esperanza</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        {/* Sección de acciones */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input type="text" placeholder="Buscar historias..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-12" />
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 text-white hover:bg-orange-600 rounded-xl whitespace-nowrap gap-2">
                <Plus className="w-4 h-4" />
                Compartir
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Comparte tu Historia</DialogTitle>
                <DialogDescription>
                  Tu testimonio puede inspirar y ayudar a otros migrantes
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título de tu historia</Label>
                  <Input id="title" value={newTestimonial.title} onChange={e => setNewTestimonial({
                  ...newTestimonial,
                  title: e.target.value
                })} placeholder="¿Cómo resumirías tu experiencia?" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="author">Tu nombre (o seudónimo)</Label>
                  <Input id="author" value={newTestimonial.author_name} onChange={e => setNewTestimonial({
                  ...newTestimonial,
                  author_name: e.target.value
                })} placeholder="Como quieres que te identifiquen" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">País de origen (opcional)</Label>
                  <Input id="country" value={newTestimonial.country_of_origin} onChange={e => setNewTestimonial({
                  ...newTestimonial,
                  country_of_origin: e.target.value
                })} placeholder="Tu país de origen" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={newTestimonial.category} onValueChange={value => setNewTestimonial({
                  ...newTestimonial,
                  category: value
                })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c.id !== 'todos').map(category => <SelectItem key={category.id} value={category.id}>
                          {category.label}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Tu historia</Label>
                  <Textarea id="content" value={newTestimonial.content} onChange={e => setNewTestimonial({
                  ...newTestimonial,
                  content: e.target.value
                })} placeholder="Comparte tu experiencia, los desafíos que has enfrentado y cómo has salido adelante..." className="min-h-[120px]" />
                </div>
                
                <Button onClick={handleSubmitTestimonial} disabled={submitting} className="w-full btn-primary">
                  {submitting ? 'Enviando...' : 'Compartir Historia'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Navegación principal con Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="historias">Historias</TabsTrigger>
            <TabsTrigger value="categorias">Por Categorías</TabsTrigger>
          </TabsList>

          <TabsContent value="historias" className="space-y-4">
            {/* Filtros de categoría con Popover */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {filteredTestimonials.length} historias encontradas
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtrar
                    {selectedCategory !== 'todos' && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                        1
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48" align="end">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm mb-3">Categorías</h4>
                    <div className="space-y-1">
                      {categories.map(category => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "secondary" : "ghost"}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          {category.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-pink-50 border-0 shadow-none">
              <div className="text-center">
                <p className="text-[20px] font-semibold tracking-tight text-slate-900">
                  {filteredTestimonials.length}
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">Historias</p>
              </div>
              <div className="text-center border-l border-slate-200">
                <p className="text-[20px] font-semibold tracking-tight text-slate-900">
                  {new Set(filteredTestimonials.filter(t => t.country_of_origin).map(t => t.country_of_origin)).size}
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">Países</p>
              </div>
            </div>

            {/* Testimonials */}
            {filteredTestimonials.length === 0 ? <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-[18px] font-semibold text-slate-900 mb-2">Sé el primero</h3>
                  <p className="text-[13px] text-slate-500 mb-4">
                    Tu historia puede inspirar a otros
                  </p>
                  <Button onClick={() => setShowForm(true)} className="bg-slate-900 text-white rounded-xl hover:bg-slate-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Compartir Historia
                  </Button>
                </div> : <div className="space-y-4">
                {filteredTestimonials.map(testimonial => <Card key={testimonial.id} className={`rounded-2xl ring-1 ring-slate-200 overflow-hidden hover:shadow-md transition-all ${testimonial.is_featured ? 'ring-2 ring-emerald-200 bg-emerald-50/30' : ''}`}>
                    <CardHeader className="p-4 pb-0">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-white">
                          <AvatarFallback className="bg-slate-100 text-slate-700 text-[12px] font-semibold">
                            {getInitials(testimonial.author_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-semibold text-slate-900">{testimonial.author_name}</span>
                            {testimonial.country_of_origin && <span>{getCountryFlag(testimonial.country_of_origin)}</span>}
                            {testimonial.is_featured && <Badge variant="featured" className="text-[10px]">
                                Destacado
                              </Badge>}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {formatDate(testimonial.created_at)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-3">
                      <h3 className="text-[15px] font-semibold text-slate-900 mb-2">{testimonial.title}</h3>
                      <p className="text-[13px] text-slate-600 leading-relaxed">
                        {testimonial.content}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                        <Button variant="ghost" size="sm" className={`gap-1 ${testimonial.user_liked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`} onClick={() => handleLikeTestimonial(testimonial.id)}>
                          <Heart className={`w-4 h-4 ${testimonial.user_liked ? 'fill-red-500' : ''}`} />
                          <span className="text-[12px]">{testimonial.like_count || 0}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1 text-slate-500" onClick={() => {
                      setSelectedTestimonialId(testimonial.id);
                      setCommentsOpen(true);
                    }}>
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-[12px]">Comentar</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>}
          </TabsContent>

          <TabsContent value="categorias" className="space-y-6">
            {/* Vista por categorías */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getCategoryStats().map(category => <Card key={category.id} className="card-elevated hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => {
              setSelectedCategory(category.id);
              setActiveTab('historias');
            }}>
                  <CardHeader className="text-center">
                    <CardTitle className="text-lg">{category.label}</CardTitle>
                    <CardDescription>
                      {category.count} {category.count === 1 ? 'historia' : 'historias'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">
                        {category.count}
                      </div>
                      <Button variant="outline" className="w-full">
                        Ver historias
                      </Button>
                    </div>
                  </CardContent>
                </Card>)}
            </div>

            {/* Estadísticas generales */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Estadísticas de la Comunidad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{testimonials.length}</div>
                    <p className="text-sm text-muted-foreground">Total de historias</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-secondary">
                      {new Set(testimonials.filter(t => t.country_of_origin).map(t => t.country_of_origin)).size}
                    </div>
                    <p className="text-sm text-muted-foreground">Países</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent">
                      {testimonials.filter(t => t.is_featured).length}
                    </div>
                    <p className="text-sm text-muted-foreground">Destacadas</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-muted-foreground">
                      {testimonials.reduce((acc, t) => acc + (t.like_count || 0), 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">Me gusta totales</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
};

export default Community;
