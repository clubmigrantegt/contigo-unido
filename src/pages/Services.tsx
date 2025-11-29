import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Scale, Users, Phone, MessageCircle, FileText, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AppointmentScheduler from '@/components/services/AppointmentScheduler';

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
  
  // Feature flag to hide appointments
  const SHOW_APPOINTMENTS = false;

  const services = [
    {
      id: 'psychological',
      title: 'Apoyo Psicológico',
      description: 'Sesiones de chat en vivo con profesionales especializados en migración',
      icon: Heart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      path: '/services/psychological',
      available: true
    },
    {
      id: 'legal',
      title: 'Información Legal',
      description: 'Guías completas sobre TPS, asilo, derechos laborales y más',
      icon: Scale,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      path: '/services/legal',
      available: true
    },
    {
      id: 'community',
      title: 'Red de Apoyo',
      description: 'Conecta con otros migrantes y comparte experiencias',
      icon: Users,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      iconBg: 'bg-amber-100',
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
      bgColor: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      urgent: true
    },
    {
      title: 'Chat Rápido',
      description: 'Inicia una consulta ahora',
      icon: MessageCircle,
      action: () => window.location.href = '/services/psychological',
      bgColor: 'bg-violet-50',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      urgent: false
    },
    {
      title: 'Recursos Legales',
      description: 'Documentos y formularios',
      icon: FileText,
      action: () => window.location.href = '/services/legal',
      bgColor: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-background px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
            <span className="text-[15px] font-semibold text-white">SV</span>
          </div>
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight text-slate-900">Servicios</h1>
            <p className="text-[12px] text-slate-500">Todo el apoyo que necesitas</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <Tabs defaultValue="services" className="w-full">
          <TabsList className={`grid w-full ${SHOW_APPOINTMENTS ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="services">Servicios</TabsTrigger>
            {SHOW_APPOINTMENTS && <TabsTrigger value="schedule">Programar Citas</TabsTrigger>}
            <TabsTrigger value="emergency">Emergencias</TabsTrigger>
          </TabsList>
          
          <TabsContent value="services" className="space-y-6">
            {/* Main Services */}
            <section>
              <h2 className="text-[18px] font-semibold tracking-tight text-slate-900 mb-4">Nuestros Servicios</h2>
              <div className="grid grid-cols-1 gap-3">
                {services.map((service) => (
                  <Card key={service.id} className={`rounded-2xl border-0 shadow-none hover:shadow-md transition-all cursor-pointer ${service.bgColor}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full ${service.iconBg} flex items-center justify-center flex-shrink-0`}>
                          <service.icon className={`h-6 w-6 ${service.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-[15px] font-semibold text-slate-900">{service.title}</h3>
                          <p className="text-[12px] text-slate-500 mt-0.5">
                            {service.description}
                          </p>
                        </div>
                        <Link to={service.path}>
                          <Button 
                            size="sm"
                            className="rounded-xl bg-orange-500 text-white hover:bg-orange-600"
                            disabled={!service.available}
                          >
                            {service.available ? 'Acceder' : 'Pronto'}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>

          {SHOW_APPOINTMENTS && (
            <TabsContent value="schedule" className="space-y-6">
              <AppointmentScheduler />
            </TabsContent>
          )}

          <TabsContent value="emergency" className="space-y-6">
            {/* Quick Actions */}
            <section>
              <h2 className="text-[18px] font-semibold tracking-tight text-slate-900 mb-4">Ayuda Inmediata</h2>
              <div className="grid grid-cols-1 gap-3">
                {quickActions.map((action, index) => (
                  <Card 
                    key={index} 
                    className={`cursor-pointer transition-all hover:shadow-md rounded-2xl border-0 shadow-none ${action.bgColor}`}
                    onClick={action.action}
                  >
                    <CardContent className="flex items-center p-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${action.iconBg}`}>
                        <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-[15px] font-semibold ${action.urgent ? 'text-red-600' : 'text-slate-900'}`}>
                          {action.title}
                        </h3>
                        <p className="text-[12px] text-slate-500">
                          {action.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>
        </Tabs>

        {/* FAQs Section */}
        {faqs.length > 0 && (
          <section>
            <h2 className="text-[18px] font-semibold tracking-tight text-slate-900 mb-4">Preguntas Frecuentes</h2>
            <Card className="rounded-2xl ring-1 ring-slate-200">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={faq.id} value={`item-${index}`} className="px-4">
                      <AccordionTrigger className="text-left hover:no-underline">
                        <span className="text-[14px] font-medium text-slate-900">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4">
                        <p className="text-[13px] text-slate-600 leading-relaxed">
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