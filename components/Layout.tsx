
import React from 'react';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const isAdminView = currentView === 'ADMIN_DASHBOARD' || currentView === 'ADMIN_LOGIN';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b px-4 py-4 transition-colors ${isAdminView ? 'bg-slate-950/80 border-slate-700' : 'bg-slate-900/80 border-slate-800'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => onNavigate('HOME')}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isAdminView ? 'bg-slate-200 text-slate-900' : 'bg-gold text-slate-900'}`}>
              <i className="fa-solid fa-scissors text-xl"></i>
            </div>
            <h1 className="text-2xl font-bold tracking-tighter">
              {isAdminView ? <span className="text-slate-200 tracking-widest uppercase text-lg font-mono">Panel_Admin</span> : <>BARBA <span className="text-gold">&</span> ESTILO</>}
            </h1>
          </div>

          <nav className="hidden md:flex gap-8 items-center">
            {isAdminView ? (
              <button onClick={() => onNavigate('HOME')} className="text-slate-400 hover:text-white transition-colors">Voltar ao Site</button>
            ) : (
              <>
                <button 
                  onClick={() => onNavigate('HOME')}
                  className={`${currentView === 'HOME' ? 'text-gold' : 'text-slate-300'} hover:text-gold transition-colors`}
                >
                  Início
                </button>
                <button 
                  onClick={() => onNavigate('AI_STYLING')}
                  className={`${currentView === 'AI_STYLING' ? 'text-gold font-bold' : 'text-slate-300'} hover:text-gold transition-colors flex items-center gap-2`}
                >
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  Consultor IA
                </button>
                <button 
                  onClick={() => onNavigate('MY_APPOINTMENTS')}
                  className={`${currentView === 'MY_APPOINTMENTS' ? 'text-gold' : 'text-slate-300'} hover:text-gold transition-colors`}
                >
                  Meus Horários
                </button>
              </>
            )}
          </nav>

          <button 
            onClick={() => onNavigate(isAdminView ? 'ADMIN_DASHBOARD' : 'BOOKING')}
            className={`px-6 py-2 rounded-full font-bold transition-all shadow-lg ${isAdminView ? 'bg-slate-200 text-slate-950' : 'bg-gold text-slate-950 hover:bg-amber-500 shadow-amber-900/20'}`}
          >
            {isAdminView ? 'Dashboard' : 'Agendar Agora'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-grow ${isAdminView ? 'bg-slate-950' : ''}`}>
        {children}
      </main>

      {/* Footer */}
      {!isAdminView && (
        <footer className="bg-slate-950 py-12 px-4 border-t border-slate-900">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="text-xl font-bold text-gold mb-4">BARBA & ESTILO</h3>
              <p className="text-slate-400">Excelência em serviços masculinos, unindo tradição artesanal com o futuro da consultoria via IA.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Unidade Premium</h3>
              <p className="text-slate-400">Av. da Elegância, 1000 - Centro</p>
              <p className="text-slate-400">Goiânia, GO</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Redes Sociais</h3>
              <div className="flex gap-4 justify-center md:justify-start">
                <a 
                  href="https://instagram.com/nexby__" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-2xl text-slate-500 hover:text-gold transition-colors"
                >
                  <i className="fa-brands fa-instagram"></i>
                </a>
                <a 
                  href="https://wa.me/5562991779494" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-2xl text-slate-500 hover:text-gold transition-colors"
                >
                  <i className="fa-brands fa-whatsapp"></i>
                </a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
