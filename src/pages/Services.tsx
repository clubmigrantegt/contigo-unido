import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Scale, HeartHandshake, Users, BookOpen, Phone } from 'lucide-react';
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
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const services = [
    {
      id: 'legal',
      title: 'Legal',
      subtitle: 'TPS, asilo, visas',
      icon: Scale,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
      path: '/services/legal',
    },
    {
      id: 'mental',
      title: 'Salud Mental',
      subtitle: 'Apoyo emocional',
      icon: HeartHandshake,
      iconColor: 'text-cyan-600',
      iconBg: 'bg-cyan-50',
      path: '/services/psychological',
    },
    {
      id: 'community',
      title: 'Comunidad',
      subtitle: 'Foros y eventos',
      icon: Users,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
      path: '/community',
    },
    {
      id: 'resources',
      title: 'Recursos',
      subtitle: 'Guías y documentos',
      icon: BookOpen,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
      path: '/services/legal',
    },
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
    <div className="min-h-screen bg-white pb-24">
      {/* Header Minimalista */}
      <div className="px-6 pt-14 pb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-0.5">
              Club del Migrante
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Servicios
            </h1>
          </div>
          <button 
            onClick={() => window.open('tel:988')}
            className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center hover:bg-red-100 transition-colors"
          >
            <Phone className="w-4 h-4 text-red-500" />
          </button>
        </div>

        {/* AI Assistant Card (Hero) */}
        <div className="relative w-full rounded-2xl bg-neutral-900 p-6 text-white overflow-hidden shadow-lg mb-6">
          {/* Gradient blurs */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl -ml-5 -mb-5" />
          
          <div className="relative z-10 flex flex-col gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <h3 className="text-lg font-semibold">Asistente Virtual 24/7</h3>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Apoyo emocional y dudas legales. Confidencial y anónimo.
            </p>
            <button 
              onClick={() => navigate('/services/psychological')} 
              className="flex items-center gap-2 text-sm font-medium text-blue-300 hover:text-blue-200 transition-colors mt-1"
            >
              Iniciar chat seguro <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="px-6 space-y-8">
        {/* Grid de Servicios 2x2 */}
        <section>
          <h2 className="text-sm font-bold text-neutral-900 mb-4 uppercase tracking-wide">Servicios Esenciales</h2>
          <div className="grid grid-cols-2 gap-3">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => navigate(service.path)}
                className="p-4 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 hover:shadow-sm transition-all text-left flex flex-col gap-3 group"
              >
                <div className={`w-9 h-9 rounded-lg ${service.iconBg} flex items-center justify-center`}>
                  <service.icon className={`w-5 h-5 ${service.iconColor}`} />
                </div>
                <div>
                  <span className="block text-sm font-semibold text-neutral-900 group-hover:text-indigo-600 transition-colors mb-0.5">
                    {service.title}
                  </span>
                  <span className="text-xs text-neutral-500">{service.subtitle}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Sección de Emergencias */}
        <section>
          <h2 className="text-sm font-bold text-neutral-900 mb-4 uppercase tracking-wide">Ayuda Inmediata</h2>
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-900 mb-0.5">Línea de Crisis 24/7</h4>
              <p className="text-xs text-red-700/80">Llama al 988 para ayuda inmediata</p>
            </div>
            <button 
              onClick={() => window.open('tel:988')}
              className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors shrink-0"
            >
              Llamar
            </button>
          </div>
        </section>

        {/* FAQs Modernos */}
        {faqs.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-neutral-900 mb-4 uppercase tracking-wide">Preguntas Frecuentes</h2>
            <div className="rounded-xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden bg-white">
              <Accordion type="single" collapsible>
                {faqs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id} className="px-4 border-0">
                    <AccordionTrigger className="text-sm font-medium text-neutral-900 hover:no-underline py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-neutral-600 leading-relaxed pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        )}

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;