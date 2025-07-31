import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Scale, Users, Phone, MessageCircle, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const Services = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const services = [
    {
      id: 'psychological',
      title: 'Apoyo Psicológico',
      description: 'Sesiones de chat en vivo con profesionales especializados en migración',
      icon: Heart,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      path: '/services/psychological',
      available: true
    },
    {
      id: 'legal',
      title: 'Información Legal',
      description: 'Guías completas sobre TPS, asilo, derechos laborales y más',
      icon: Scale,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      path: '/services/legal',
      available: true
    },
    {
      id: 'community',
      title: 'Red de Apoyo',
      description: 'Conecta con otros migrantes y comparte experiencias',
      icon: Users,
      color: 'text-accent-foreground',
      bgColor: 'bg-accent/30',
      path: '/community',
      available: true
    }
  ];

  const quickActions = [
    {
      title: 'Línea de Crisis',
      description: 'Ayuda inmediata 24/7',
      icon: Phone,
      action: () => window.open('tel:988'),
      urgent: true
    },
    {
      title: 'Chat Rápido',
      description: 'Inicia una consulta ahora',
      icon: MessageCircle,
      action: () => window.location.href = '/services/psychological',
      urgent: false
    },
    {
      title: 'Recursos Legales',
      description: 'Documentos y formularios',
      icon: FileText,
      action: () => window.location.href = '/services/legal',
      urgent: false
    }
  ];

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('id, question, answer, category')
        .eq('is_published', true)
        .order('order_index', { ascending: true })
        .limit(6);

      if (error) throw error;
      setFaqs(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las preguntas frecuentes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-hero text-white px-4 py-8">
        <div className="container mx-auto">
          <h1 className="text-white mb-2">Servicios Disponibles</h1>
          <p className="body text-white/90">
            Todo el apoyo que necesitas en un solo lugar
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <section>
          <h2 className="mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 gap-3">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  action.urgent ? 'border-destructive bg-destructive/5' : 'hover:shadow-card'
                }`}
                onClick={action.action}
              >
                <CardContent className="flex items-center p-4">
                  <div className={`p-3 rounded-lg mr-4 ${
                    action.urgent ? 'bg-destructive/10' : 'bg-muted'
                  }`}>
                    <action.icon className={`h-5 w-5 ${
                      action.urgent ? 'text-destructive' : 'text-foreground'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={action.urgent ? 'text-destructive' : 'text-foreground'}>
                      {action.title}
                    </h3>
                    <p className="body-small text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Main Services */}
        <section>
          <h2 className="mb-4">Nuestros Servicios</h2>
          <div className="grid grid-cols-1 gap-4">
            {services.map((service) => (
              <Card key={service.id} className="card-elevated hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${service.bgColor}`}>
                      <service.icon className={`h-6 w-6 ${service.color}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {service.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    asChild 
                    className="w-full btn-primary"
                    disabled={!service.available}
                  >
                    <Link to={service.path}>
                      {service.available ? 'Acceder' : 'Próximamente'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQs Section */}
        {faqs.length > 0 && (
          <section>
            <h2 className="mb-4">Preguntas Frecuentes</h2>
            <Card className="card-elevated">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={faq.id} value={`item-${index}`} className="px-4">
                      <AccordionTrigger className="text-left hover:no-underline">
                        <span className="body font-medium">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4">
                        <p className="body-small text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </section>
        )}

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;