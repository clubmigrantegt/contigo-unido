import { useEffect, useState } from 'react';
import { Users, Plus, Heart, MessageCircle, Flag, Star, Search, Filter } from 'lucide-react';
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
  const { user } = useAuth();
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [newTestimonial, setNewTestimonial] = useState({
    title: '',
    content: '',
    author_name: '',
    country_of_origin: '',
    category: 'general'
  });

  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'general', label: 'General' },
    { id: 'trabajo', label: 'Trabajo' },
    { id: 'educacion', label: 'Educación' },
    { id: 'salud', label: 'Salud' },
    { id: 'legal', label: 'Legal' },
    { id: 'familia', label: 'Familia' }
  ];

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    filterTestimonials();
  }, [testimonials, searchQuery, selectedCategory]);

  const fetchTestimonials = async () => {
    try {
      // Fetch testimonials with like counts
      const { data, error } = await supabase
        .from('testimonials')
        .select(`
          id, title, content, author_name, country_of_origin, category, tags, is_featured, created_at,
          testimonial_reactions!left(id)
        `)
        .eq('is_approved', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process testimonials with like counts and user's like status
      const processedTestimonials = await Promise.all((data || []).map(async (testimonial: any) => {
        const like_count = testimonial.testimonial_reactions?.length || 0;
        
        // Check if current user liked this testimonial
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
          user_liked,
          testimonial_reactions: undefined // Remove the raw reactions data
        };
      }));

      setTestimonials(processedTestimonials);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los testimonios",
        variant: "destructive",
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
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.content.toLowerCase().includes(query) ||
        t.author_name.toLowerCase().includes(query) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    setFilteredTestimonials(filtered);
  };

  const handleSubmitTestimonial = async () => {
    if (!user || !newTestimonial.title || !newTestimonial.content || !newTestimonial.author_name) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('testimonials')
        .insert({
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
        description: "Tu testimonio será revisado antes de publicarse",
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
        variant: "destructive",
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
        variant: "destructive",
      });
      return;
    }

    try {
      const testimonial = testimonials.find(t => t.id === testimonialId);
      if (!testimonial) return;

      if (testimonial.user_liked) {
        // Remove like
        await supabase
          .from('testimonial_reactions')
          .delete()
          .eq('testimonial_id', testimonialId)
          .eq('user_id', user.id);
      } else {
        // Add like
        await supabase
          .from('testimonial_reactions')
          .insert({
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
        variant: "destructive",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-community text-strong-black px-4 py-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-strong-black/10 rounded-full p-3">
                <Users className="h-6 w-6 text-strong-black" />
              </div>
              <div>
                <h1 className="text-strong-black mb-1">Comunidad</h1>
                <p className="body text-strong-black/80">
                  Historias de esperanza y superación
                </p>
              </div>
            </div>
            
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button className="btn-secondary">
                  <Plus className="h-4 w-4 mr-2" />
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
                    <Input
                      id="title"
                      value={newTestimonial.title}
                      onChange={(e) => setNewTestimonial({...newTestimonial, title: e.target.value})}
                      placeholder="¿Cómo resumirías tu experiencia?"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="author">Tu nombre (o seudónimo)</Label>
                    <Input
                      id="author"
                      value={newTestimonial.author_name}
                      onChange={(e) => setNewTestimonial({...newTestimonial, author_name: e.target.value})}
                      placeholder="Como quieres que te identifiquen"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">País de origen (opcional)</Label>
                    <Input
                      id="country"
                      value={newTestimonial.country_of_origin}
                      onChange={(e) => setNewTestimonial({...newTestimonial, country_of_origin: e.target.value})}
                      placeholder="Tu país de origen"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Select 
                      value={newTestimonial.category} 
                      onValueChange={(value) => setNewTestimonial({...newTestimonial, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c.id !== 'todos').map((category) => (
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
                      onChange={(e) => setNewTestimonial({...newTestimonial, content: e.target.value})}
                      placeholder="Comparte tu experiencia, los desafíos que has enfrentado y cómo has salido adelante..."
                      className="min-h-[120px]"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSubmitTestimonial} 
                    disabled={submitting}
                    className="w-full btn-primary"
                  >
                    {submitting ? 'Enviando...' : 'Compartir Historia'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar historias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="text-xs"
                >
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary mb-1">
                {filteredTestimonials.length}
              </div>
              <p className="body-small text-muted-foreground">Historias encontradas</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-secondary mb-1">
                {new Set(filteredTestimonials.filter(t => t.country_of_origin).map(t => t.country_of_origin)).size}
              </div>
              <p className="body-small text-muted-foreground">Países representados</p>
            </CardContent>
          </Card>
        </div>

        {/* Testimonials */}
        {filteredTestimonials.length === 0 ? (
          <Card className="card-elevated">
            <CardContent className="text-center py-12">
              <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="mb-2">Sé el primero en compartir</h3>
              <p className="body text-muted-foreground mb-4">
                Tu historia puede inspirar a otros migrantes. Comparte tu experiencia y ayuda a crear una comunidad de apoyo.
              </p>
              <Button onClick={() => setShowForm(true)} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Compartir mi Historia
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className={`card-elevated hover:shadow-lg transition-all duration-300 ${
                testimonial.is_featured ? 'border-accent bg-accent/5' : ''
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(testimonial.author_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium">{testimonial.author_name}</h3>
                        {testimonial.country_of_origin && (
                          <span className="text-sm">
                            {getCountryFlag(testimonial.country_of_origin)}
                          </span>
                        )}
                        {testimonial.is_featured && (
                          <Badge className="bg-accent/20 text-accent-foreground border-accent/30">
                            <Star className="h-3 w-3 mr-1" />
                            Destacado
                          </Badge>
                        )}
                      </div>
                      <p className="caption text-muted-foreground">
                        {formatDate(testimonial.created_at)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardTitle className="text-lg mb-3 leading-tight">
                    {testimonial.title}
                  </CardTitle>
                  <p className="body text-foreground leading-relaxed mb-4">
                    {testimonial.content}
                  </p>
                  {/* Category and Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {categories.find(c => c.id === testimonial.category)?.label || testimonial.category}
                    </Badge>
                    {testimonial.tags && testimonial.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`text-muted-foreground ${testimonial.user_liked ? 'text-red-500' : ''}`}
                        onClick={() => handleLikeTestimonial(testimonial.id)}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${testimonial.user_liked ? 'fill-current' : ''}`} />
                        {testimonial.like_count || 0}
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;