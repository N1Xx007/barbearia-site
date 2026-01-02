
import React, { useState, useEffect } from 'react';

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Captura o evento de instalação do Chrome/Android
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Esconde se já estiver instalado
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // Caso não haja prompt (iOS ou já instalado), 
      // o navegador geralmente já oferece a opção no menu.
      console.log('Prompt de instalação não disponível no momento.');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-center gap-1">
      <button
        onClick={handleInstallClick}
        className="w-14 h-14 bg-gold text-slate-950 rounded-full shadow-2xl flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition-all animate-pulse shadow-gold/20 group relative"
        aria-label="Adicionar à tela inicial"
      >
        <i className="fa-solid fa-mobile-screen-button"></i>
      </button>
      <span className="text-[10px] font-bold text-gold uppercase tracking-tighter bg-slate-950/80 px-3 py-1 rounded-full shadow-sm whitespace-nowrap border border-gold/20">
        Adicionar à tela inicial
      </span>
    </div>
  );
};

export default InstallPWA;
