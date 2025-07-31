import { useEffect, useState } from 'react';
import { ArrowLeft, FileText, ExternalLink, Search, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LegalTopic {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  slug: string;
}

const LegalInfo = () => {
  const [topics, setTopics] = useState<LegalTopic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<LegalTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const { toast } = useToast();

  const categories = [
    { id: 'todos', label: 'Todos', count: 0 },
    { id: 'tps', label: 'TPS', count: 0 },
    { id: 'asilo', label: 'Asilo', count: 0 },
    { id: 'derechos_laborales', label: 'Derechos Laborales', count: 0 },
    { id: 'inmigración', label: 'Inmigración', count: 0 },
    { id: 'documentos', label: 'Documentos', count: 0 }
  ];

  useEffect(() => {
    fetchLegalTopics();
  }, []);

  useEffect(() => {
    filterTopics();
  }, [topics, searchQuery, selectedCategory]);

  const fetchLegalTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_topics')
        .select('id, title, summary, content, category, slug')
        .eq('is_published', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setTopics(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los temas legales",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTopics = () => {
    let filtered = topics;

    // Filter by category
    if (selectedCategory !== 'todos') {
      filtered = filtered.filter(topic => topic.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(topic =>
        topic.title.toLowerCase().includes(query) ||
        topic.summary.toLowerCase().includes(query) ||
        topic.content.toLowerCase().includes(query)
      );
    }

    setFilteredTopics(filtered);
  };

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'todos') return topics.length;
    return topics.filter(topic => topic.category === categoryId).length;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'tps': 'bg-primary/10 text-primary border-primary/20',
      'asilo': 'bg-secondary/10 text-secondary border-secondary/20',
      'derechos_laborales': 'bg-accent/30 text-accent-foreground border-accent/40',
      'inmigración': 'bg-success/10 text-success border-success/20',
      'documentos': 'bg-muted text-muted-foreground border-border'
    };
    return colors[category as keyof typeof colors] || 'bg-muted text-muted-foreground border-border';
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
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/services" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Servicios
              </Link>
            </Button>
          </div>
          <div className="mt-4">
            <h1 className="flex items-center">
              <Scale className="h-6 w-6 mr-3 text-secondary" />
              Información Legal
            </h1>
            <p className="body text-muted-foreground mt-1">
              Recursos legales y guías para migrantes
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar temas legales..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="text-xs"
                >
                  {category.label}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {getCategoryCount(category.id)}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Results */}
        {filteredTopics.length === 0 ? (
          <Card className="card-elevated">
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-muted-foreground mb-2">No se encontraron resultados</h3>
              <p className="body-small text-muted-foreground">
                Intenta ajustar tu búsqueda o filtros
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTopics.map((topic) => (
              <Card key={topic.id} className="card-elevated hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getCategoryColor(topic.category)}>
                          {topic.category.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg leading-tight">
                        {topic.title}
                      </CardTitle>
                      <CardDescription className="mt-2 leading-relaxed">
                        {topic.summary}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State for no topics */}
        {topics.length === 0 && !loading && (
          <Card className="card-elevated">
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="mb-2">Contenido en desarrollo</h3>
              <p className="body text-muted-foreground">
                Estamos trabajando para traerte la mejor información legal.
                Vuelve pronto para encontrar recursos útiles.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LegalInfo;