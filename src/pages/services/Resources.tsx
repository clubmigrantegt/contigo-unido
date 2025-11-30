import { useState } from 'react';
import { ArrowLeft, Search, Briefcase, Home, Heart, GraduationCap, ChevronRight, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Resources = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todo');

  const categories = [
    { id: 'todo', label: 'Todo' },
    { id: 'empleo', label: 'Empleo' },
    { id: 'vivienda', label: 'Vivienda' },
    { id: 'salud', label: 'Salud' },
    { id: 'educacion', label: 'Educación' }
  ];

  const resources = [
    {
      id: 'trabajo-sin-papeles',
      title: 'Cómo Encontrar Trabajo Sin Papeles',
      category: 'Guía Práctica',
      time: '7 min',
      icon: Briefcase,
      iconColor: 'group-hover:bg-blue-50 group-hover:text-blue-600',
      categoryTag: 'empleo'
    },
    {
      id: 'derechos-inquilino',
      title: 'Derechos del Inquilino',
      category: 'Información Legal',
      time: '5 min',
      icon: Home,
      iconColor: 'group-hover:bg-emerald-50 group-hover:text-emerald-600',
      categoryTag: 'vivienda'
    },
    {
      id: 'acceso-salud',
      title: 'Acceso a Servicios de Salud',
      category: 'Recursos',
      time: '6 min',
      icon: Heart,
      iconColor: 'group-hover:bg-rose-50 group-hover:text-rose-600',
      categoryTag: 'salud'
    },
    {
      id: 'becas-migrantes',
      title: 'Becas para Migrantes',
      category: 'Oportunidades',
      time: null,
      icon: GraduationCap,
      iconColor: 'group-hover:bg-indigo-50 group-hover:text-indigo-600',
      categoryTag: 'educacion'
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'todo' || resource.categoryTag === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white flex flex-col pb-24">
      {/* Sticky Top: Header & Tabs */}
      <div className="bg-white/95 backdrop-blur-sm sticky top-0 z-30 border-b border-neutral-100">
        {/* Header */}
        <div className="px-6 pt-14 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-neutral-50 text-neutral-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-neutral-900">Centro de Recursos</h1>
          </div>
          <button className="p-2 -mr-2 rounded-full hover:bg-neutral-50 text-neutral-500 transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar (Inline) */}
        <div className="px-6 pb-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Buscar recursos, guías..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-neutral-100 rounded-lg pl-9 pr-4 text-xs font-medium text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all"
            />
            <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-neutral-400">
              <Search className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Scrollable Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-6 pb-4">
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium flex-shrink-0 transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content List */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
        {/* Featured Card */}
        <div className="px-6 pt-4 mb-2">
          <div 
            className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-5 shadow-lg group cursor-pointer"
            onClick={() => navigate('/services/resources/ayuda-alquiler')}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8" />
            <div className="relative z-10">
              <span className="inline-block px-2 py-0.5 rounded bg-white/20 backdrop-blur-md text-[10px] font-semibold tracking-wide border border-white/10 mb-2">
                DESTACADO
              </span>
              <h3 className="text-lg font-bold leading-tight mb-2">Programas de Ayuda para Alquiler</h3>
              <p className="text-xs text-emerald-100 line-clamp-2 leading-relaxed opacity-90">
                Descubre los programas disponibles para asistencia con el alquiler y cómo aplicar.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-white">
                <span>Explorar recursos</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* List Items */}
        <div className="px-6 py-2 space-y-3">
          {filteredResources.map(resource => (
            <button 
              key={resource.id}
              onClick={() => navigate(`/services/resources/${resource.id}`)}
              className="w-full bg-white border border-neutral-100 rounded-xl p-3 flex gap-4 items-center hover:border-neutral-300 hover:shadow-sm transition-all group text-left"
            >
              <div className={`w-12 h-12 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center shrink-0 transition-colors text-neutral-500 ${resource.iconColor}`}>
                <resource.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-neutral-900">{resource.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 font-medium">
                    {resource.category}
                  </span>
                  {resource.time && (
                    <span className="text-[10px] text-neutral-400 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {resource.time}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500" />
            </button>
          ))}
        </div>

        {/* CTA Box */}
        <div className="mx-6 mt-4 p-4 bg-neutral-50 border border-dashed border-neutral-300 rounded-xl flex flex-col items-center text-center gap-2">
          <p className="text-xs text-neutral-500 max-w-[200px]">
            ¿Necesitas más información? Habla con nuestro asistente.
          </p>
          <button 
            onClick={() => navigate('/chat')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1"
          >
            Preguntar a la IA
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Resources;
