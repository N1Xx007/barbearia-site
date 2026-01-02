
import React, { useState, useEffect } from 'react';

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      // Impede o navegador de mostrar o banner automático para usarmos nosso botão
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      console.log('Site adicionado à tela inicial');
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Se não houver prompt, o navegador não detectou os requisitos ou já foi instalado
      console.log('Função de atalho não disponível no momento para este navegador.');
      return;
    }

    // Dispara o prompt nativo do navegador para "Adicionar à tela inicial"
    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-center gap-1">
      <button
        onClick={handleInstallClick}
        className="w-14 h-14 bg-gold text-slate-950 rounded-full shadow-2xl flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition-all animate-pulse shadow-gold/20"
        aria-label="Adicionar à tela inicial"
      >
        <i className="fa-solid fa-mobile-screen-button"></i>
      </button>
      <span className="text-[10px] font-bold text-gold uppercase tracking-tighter bg-slate-950/90 px-3 py-1 rounded-full shadow-sm whitespace-nowrap border border-gold/20">
        Adicionar à tela inicial
      </span>
    </div>
  );
};

export default InstallPWA;
