import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bookmark, 
  Share, 
  CheckCircle2, 
  Sparkles, 
  Share2, 
  MessageSquare, 
  FileText, 
  Download, 
  Image as ImageIcon 
} from 'lucide-react';

interface Step {
  title: string;
  description: string;
  items?: string[];
  downloadLink?: string;
}

interface Resource {
  title: string;
  category: string;
  readTime: number;
  image: string;
  summary: string;
  steps: Step[];
}

// Demo data - en producción esto vendría de Supabase
const demoResources: Record<string, Resource> = {
  'tps-venezuela-update': {
    title: 'Solicitud de Asilo: Paso a Paso',
    category: 'Guía Legal',
    readTime: 5,
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=600',
    summary: 'Una guía simplificada para entender el proceso de solicitud afirmativa de asilo en Estados Unidos (Formulario I-589).',
    steps: [
      {
        title: 'Reunir Evidencia',
        description: 'Documentos de identidad, pruebas de persecución o temor fundado.',
        items: ['Declaración personal detallada', 'Fotos o reportes médicos']
      },
      {
        title: 'Formulario I-589',
        description: 'Llenar la solicitud en inglés. Es crucial la consistencia en las fechas.',
        downloadLink: 'Descargar Formulario PDF'
      },
      {
        title: 'Entrevista de Asilo',
        description: 'Preparación para la entrevista con el oficial de USCIS.'
      }
    ]
  },
  'taller-derechos-laborales': {
    title: 'Derechos Laborales del Migrante',
    category: 'Guía Legal',
    readTime: 7,
    image: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&q=80&w=600',
    summary: 'Conoce tus derechos fundamentales en el lugar de trabajo, sin importar tu estatus migratorio.',
    steps: [
      {
        title: 'Salario Mínimo',
        description: 'Tienes derecho a recibir al menos el salario mínimo federal o estatal.',
        items: ['Pago por horas trabajadas', 'Compensación por horas extras']
      },
      {
        title: 'Ambiente Seguro',
        description: 'Tu empleador debe proporcionar un ambiente de trabajo seguro.',
        items: ['Equipo de protección', 'Capacitación en seguridad']
      },
      {
        title: 'Protección contra Discriminación',
        description: 'Estás protegido contra discriminación por origen, raza o estatus migratorio.'
      }
    ]
  }
};

interface StepItemProps {
  number: number;
  isActive: boolean;
  isLast: boolean;
  title: string;
  description: string;
  items?: string[];
  downloadLink?: string;
}

const StepItem = ({ number, isActive, isLast, title, description, items, downloadLink }: StepItemProps) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shadow-sm z-10 ${
        isActive 
          ? 'bg-neutral-900 text-white' 
          : 'bg-white border border-neutral-300 text-neutral-500'
      }`}>
        {number}
      </div>
      {!isLast && <div className="w-px h-full bg-neutral-200 my-1" />}
    </div>
    <div className={isLast ? 'pb-2' : 'pb-6'}>
      <h4 className={`text-sm mb-1 ${isActive ? 'font-bold' : 'font-medium'} text-neutral-900`}>
        {title}
      </h4>
      <p className="text-xs text-neutral-500 leading-relaxed mb-3">
        {description}
      </p>
      
      {/* Optional: Items list */}
      {items && items.length > 0 && (
        <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
              <span className="text-xs text-neutral-600">{item}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Optional: Download link */}
      {downloadLink && (
        <button className="mt-2 text-xs font-medium text-indigo-600 flex items-center gap-1 hover:underline">
          <Download className="w-3 h-3" />
          {downloadLink}
        </button>
      )}
    </div>
  </div>
);

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState<Resource | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    // En producción, aquí se haría fetch a Supabase
    if (id && demoResources[id]) {
      setResource(demoResources[id]);
    } else {
      // Fallback al primer recurso
      setResource(demoResources['tps-venezuela-update']);
    }
  }, [id]);

  if (!resource) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Sticky Nav Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 pt-12 pb-4 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 -ml-2 rounded-full hover:bg-neutral-50 text-neutral-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsBookmarked(!isBookmarked)}
            className="p-2 rounded-full hover:bg-neutral-50 text-neutral-500 transition-colors"
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current text-neutral-900' : ''}`} />
          </button>
          <button className="p-2 -mr-2 rounded-full hover:bg-neutral-50 text-neutral-500 transition-colors">
            <Share className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-28">
        {/* Hero Image */}
        <div className="px-6 pt-4 pb-6">
          <div className="w-full aspect-video rounded-2xl bg-neutral-100 overflow-hidden relative shadow-sm">
            <img 
              src={resource.image} 
              className="w-full h-full object-cover" 
              alt={resource.title}
            />
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur rounded-md border border-black/5 shadow-sm">
              <span className="text-[10px] font-semibold text-neutral-900 uppercase tracking-wide flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Verificado
              </span>
            </div>
          </div>

          {/* Article Metadata */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {resource.category}
              </span>
              <span className="text-xs text-neutral-400">• {resource.readTime} min lectura</span>
            </div>
            <h1 className="text-2xl text-neutral-900 leading-tight tracking-tight mb-3 font-semibold">
              {resource.title}
            </h1>
            <p className="text-sm text-neutral-500 leading-relaxed">
              {resource.summary}
            </p>
          </div>
        </div>

        {/* Step-by-Step Content */}
        <div className="px-6 space-y-6">
          {resource.steps.map((step, index) => (
            <StepItem 
              key={index}
              number={index + 1}
              isActive={index === 0}
              isLast={index === resource.steps.length - 1}
              title={step.title}
              description={step.description}
              items={step.items}
              downloadLink={step.downloadLink}
            />
          ))}
        </div>

        {/* AI Insight Widget */}
        <div className="mx-6 mt-6 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-sm">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-semibold text-blue-900 mb-1">¿Dudas sobre tu caso?</h5>
              <p className="text-xs text-neutral-600 leading-relaxed">
                El asistente de IA puede ayudarte a practicar preguntas comunes de la entrevista.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="absolute bottom-0 w-full bg-white border-t border-neutral-100 p-6 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-4">
          <button className="w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate('/services/psychological')}
            className="flex-1 h-12 bg-neutral-900 text-white rounded-xl text-sm font-medium shadow-lg shadow-neutral-900/10 hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Consultar con IA
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetail;
