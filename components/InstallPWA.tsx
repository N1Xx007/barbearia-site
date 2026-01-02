
import React, { useState, useEffect } from 'react';

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      // Previne o mini-infobar padrão do navegador no Android
      e.preventDefault();
      // Guarda o evento para ser disparado pelo nosso botão
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      // Limpa o prompt após a instalação bem-sucedida
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('O prompt de instalação ainda não está pronto ou não é suportado neste navegador.');
      return;
    }

    // Mostra o prompt de instalação nativo
    deferredPrompt.prompt();

    // Aguarda a escolha do usuário
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('Usuário aceitou a instalação');
      setDeferredPrompt(null);
    } else {
      console.log('Usuário recusou a instalação');
    }
  };

  // Se o prompt não estiver disponível (ex: iOS ou já instalado), 
  // poderíamos esconder o botão, mas manteremos visível conforme solicitado.
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
