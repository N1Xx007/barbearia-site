
import React from 'react';

interface HeroProps {
  onStartBooking: () => void;
  onAIStyle: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartBooking, onAIStyle }) => {
  return (
    <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat grayscale-[40%]"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=2070")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/50 to-slate-950"></div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <span className="inline-block px-4 py-1 bg-gold/20 text-gold border border-gold/30 rounded-full text-sm font-semibold mb-6">
          TRADIÇÃO & INOVAÇÃO
        </span>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
          Mais que um corte,<br /> 
          <span className="text-gold italic font-serif">uma experiência.</span>
        </h1>
        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
          Agende seu horário com os melhores especialistas e descubra seu novo estilo com nossa consultoria inteligente por IA.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={onStartBooking}
            className="px-8 py-4 bg-gold text-slate-950 rounded-xl font-bold text-lg hover:bg-amber-500 transition-all shadow-xl shadow-amber-900/30 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-calendar-check"></i>
            Reservar Agora
          </button>
          <button 
            onClick={onAIStyle}
            className="px-8 py-4 bg-slate-800 text-white rounded-xl font-bold text-lg hover:bg-slate-700 transition-all border border-slate-700 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-wand-magic-sparkles text-gold"></i>
            Descobrir Meu Estilo
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
