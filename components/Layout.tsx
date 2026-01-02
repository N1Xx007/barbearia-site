
import React from 'react';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const isAdmin = currentView === 'ADMIN_DASHBOARD' || currentView === 'ADMIN_LOGIN';

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('HOME')}>
            <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-black">
              <i className="fa-solid fa-scissors"></i>
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight">BARBA <span className="text-gold">&</span> ESTILO</span>
          </div>

          <nav className="hidden md:flex gap-10">
            <button onClick={() => onNavigate('HOME')} className={`text-sm font-bold uppercase tracking-widest transition-colors ${currentView === 'HOME' ? 'text-gold' : 'text-zinc-500 hover:text-zinc-200'}`}>Início</button>
            <button onClick={() => onNavigate('AI_STYLING')} className={`text-sm font-bold uppercase tracking-widest transition-colors ${currentView === 'AI_STYLING' ? 'text-gold' : 'text-zinc-500 hover:text-zinc-200'}`}>Consultor IA</button>
            <button onClick={() => onNavigate('MY_APPOINTMENTS')} className={`text-sm font-bold uppercase tracking-widest transition-colors ${currentView === 'MY_APPOINTMENTS' ? 'text-gold' : 'text-zinc-500 hover:text-zinc-200'}`}>Meus Horários</button>
          </nav>

          <button 
            onClick={() => onNavigate('BOOKING')}
            className="px-6 py-2.5 bg-gold text-black text-sm font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gold/10"
          >
            Agendar Agora
          </button>
        </div>
      </header>
      <main className="flex-grow">{children}</main>
    </div>
  );
};

export default Layout;
