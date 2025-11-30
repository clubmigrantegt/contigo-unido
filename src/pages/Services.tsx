import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Phone,
  HeartHandshake,
  Scale,
  Users,
  FileText,
  MessageCircle,
  Download,
  Search,
  Sparkles,
  Calendar,
} from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const Services = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(true);
  const [showAllFaqs, setShowAllFaqs] = useState(false);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from("faqs")
        .select("id, question, answer, category")
        .eq("is_published", true)
        .order("order_index", { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las preguntas frecuentes",
        variant: "destructive",
      });
    } finally {
      setIsLoadingFaqs(false);
    }
  };

  const mainServices = [
    {
      icon: HeartHandshake,
      title: "Salud Mental",
      description: "Chat con profesionales",
      bgColor: "bg-cyan-50",
      iconColor: "text-cyan-600",
      borderColor: "border-cyan-100",
      onClick: () => navigate("/services/psychological"),
    },
    {
      icon: Scale,
      title: "Info Legal",
      description: "TPS, Asilo, Visas",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      borderColor: "border-indigo-100",
      onClick: () => navigate("/services/legal"),
    },
    {
      icon: Users,
      title: "Comunidad",
      description: "Foros y eventos",
      bgColor: "bg-violet-50",
      iconColor: "text-violet-600",
      borderColor: "border-violet-100",
      onClick: () => navigate("/community"),
    },
    {
      icon: FileText,
      title: "Recursos",
      description: "Guías y documentos",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      borderColor: "border-emerald-100",
      onClick: () => navigate("/services/legal"),
    },
  ];

  const quickActions = [
    {
      icon: MessageCircle,
      title: "Chat Rápido",
      description: "Consulta inmediata",
      bgColor: "bg-violet-50",
      iconColor: "text-violet-600",
      borderColor: "border-violet-100",
      onClick: () => navigate("/services/psychological"),
    },
    {
      icon: Download,
      title: "Formularios",
      description: "Documentos PDF",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      borderColor: "border-emerald-100",
      onClick: () => navigate("/services/legal"),
    },
    {
      icon: Search,
      title: "Buscar Abogado",
      description: "Directorio legal",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      borderColor: "border-amber-100",
      onClick: () => navigate("/services/legal"),
    },
    {
      icon: Calendar,
      title: "Agendar Cita",
      description: "Reserva tu turno",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-100",
      onClick: () => navigate("/services/legal"),
    },
  ];

  const displayedFaqs = showAllFaqs ? faqs : faqs.slice(0, 3);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
          Club del Migrante
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Servicios
        </h1>
      </div>

      {/* Hero Card - Emergencia */}
      <div className="mx-6 mb-6 p-5 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-0.5">Línea de Crisis 24/7</h3>
            <p className="text-sm text-white/90">Ayuda inmediata cuando más lo necesitas</p>
          </div>
          <a
            href="tel:988"
            className="px-4 py-2 bg-white text-red-600 rounded-xl font-medium text-sm hover:bg-red-50 transition-colors shrink-0"
          >
            Llamar
          </a>
        </div>
      </div>

      {/* Servicios Principales */}
      <div className="px-6 mb-8">
        <h2 className="text-sm font-bold text-foreground mb-4">Servicios Principales</h2>
        <div className="grid grid-cols-2 gap-3">
          {mainServices.map((service, index) => {
            const Icon = service.icon;
            return (
              <button
                key={index}
                onClick={service.onClick}
                className={`p-4 rounded-xl border ${service.borderColor} ${service.bgColor} hover:bg-white hover:shadow-md transition-all text-left flex flex-col gap-3`}
              >
                <div className={`w-10 h-10 rounded-lg ${service.bgColor} flex items-center justify-center ${service.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-sm font-medium text-foreground mb-0.5">
                    {service.title}
                  </span>
                  <span className="text-xs text-muted-foreground">{service.description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Acceso Rápido */}
      <div className="mb-8">
        <div className="px-6 mb-4">
          <h2 className="text-sm font-bold text-foreground">Acceso Rápido</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 px-6 no-scrollbar">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.onClick}
                className={`flex-shrink-0 w-36 p-4 rounded-xl ${action.bgColor} border ${action.borderColor} hover:shadow-md transition-all`}
              >
                <Icon className={`w-5 h-5 ${action.iconColor} mb-2`} />
                <span className="text-sm font-medium text-foreground block mb-0.5">
                  {action.title}
                </span>
                <span className="text-[10px] text-muted-foreground">{action.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preguntas Frecuentes */}
      {!isLoadingFaqs && faqs.length > 0 && (
        <div className="px-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-foreground">Preguntas Frecuentes</h2>
            {faqs.length > 3 && (
              <button
                onClick={() => setShowAllFaqs(!showAllFaqs)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showAllFaqs ? "Ver menos" : "Ver todas"}
              </button>
            )}
          </div>
          <div className="space-y-2">
            {displayedFaqs.map((faq) => (
              <Accordion key={faq.id} type="single" collapsible>
                <AccordionItem
                  value={faq.id}
                  className="border border-border rounded-xl px-4 bg-card"
                >
                  <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground pb-3 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {isLoadingFaqs && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* AI Assistant Widget */}
      <div className="mx-6 mb-8 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-sm">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-sm font-semibold text-blue-900 mb-1">
              ¿No encuentras lo que buscas?
            </h5>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Nuestro asistente de IA puede ayudarte 24/7
            </p>
          </div>
          <button
            onClick={() => navigate("/services/psychological")}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-medium hover:bg-blue-700 transition-colors shrink-0"
          >
            Chatear
          </button>
        </div>
      </div>
    </div>
  );
};

export default Services;
