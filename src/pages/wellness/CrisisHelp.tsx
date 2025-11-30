import { useNavigate } from 'react-router-dom';
import { X, ShieldAlert, PhoneCall, MessageSquare, MapPin, Info } from 'lucide-react';

const CrisisHelp = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/chat');
  };

  const handleSOSCall = () => {
    // Emergency line - this should be updated with the actual emergency number
    window.location.href = 'tel:988'; // 988 is the suicide & crisis lifeline in the US
  };

  const handleWhatsApp = () => {
    // Replace with actual WhatsApp volunteer number
    window.open('https://wa.me/1234567890', '_blank');
  };

  const handleShelters = () => {
    // Navigate to shelters or open map
    navigate('/services/shelters');
  };

  const handleProtocol = () => {
    // Show safety protocol
    navigate('/services/safety-protocol');
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white animate-fade-in overflow-y-auto">
      {/* Header Alert */}
      <div className="bg-rose-50 border-b border-rose-100 pt-14 pb-6 px-6 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <button 
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <h1 className="text-2xl font-bold text-rose-950 mb-1">Zona de Ayuda</h1>
        <p className="text-sm text-rose-900/70">
          Estamos contigo. Selecciona la opción que necesitas ahora.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 bg-white pb-10">
        
        {/* Main SOS Button */}
        <button 
          onClick={handleSOSCall}
          className="w-full relative overflow-hidden bg-rose-600 rounded-2xl p-6 text-left mb-6 group active:scale-[0.98] transition-all duration-200 shadow-xl shadow-rose-200"
        >
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <span className="block text-rose-100 text-xs font-bold uppercase tracking-wider mb-1">
                Emergencia 24/7
              </span>
              <span className="block text-2xl font-bold text-white">
                Llamar a Línea SOS
              </span>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white animate-pulse-urgent">
              <PhoneCall className="w-6 h-6" />
            </div>
          </div>
        </button>

        {/* Secondary Options */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            onClick={handleWhatsApp}
            className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 hover:bg-white hover:shadow-md transition-all text-left flex flex-col gap-3 group"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-sm font-bold text-neutral-900">WhatsApp</span>
              <span className="text-xs text-neutral-500">Chat con voluntario</span>
            </div>
          </button>

          <button 
            onClick={handleShelters}
            className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 hover:bg-white hover:shadow-md transition-all text-left flex flex-col gap-3 group"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-sm font-bold text-neutral-900">Refugios</span>
              <span className="text-xs text-neutral-500">Cercanos a ti</span>
            </div>
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-neutral-900 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-bold text-sm mb-1">
                No compartimos tu ubicación
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Tu seguridad es prioridad. Esta llamada es anónima y no queda registrada en tu factura.
              </p>
            </div>
          </div>
        </div>

        {/* Protocol Link */}
        <div className="mt-8 flex justify-center">
          <button 
            onClick={handleProtocol}
            className="text-xs font-semibold text-rose-600/80 hover:text-rose-700 underline"
          >
            Ver protocolo de seguridad
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrisisHelp;
