
import React, { useState, useEffect } from 'react';

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIosTip, setShowIosTip] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('Evento beforeinstallprompt capturado');
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      console.log('App instalado com sucesso');
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android / Chrome
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // iOS ou Navegadores sem suporte a prompt automático
      setShowIosTip(true);
      setTimeout(() => setShowIosTip(false), 5000);
    }
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-center gap-1">
      {/* Balão de Dica (Aparece apenas se a instalação automática falhar) */}
      {showIosTip && (
        <div className="absolute bottom-20 right-0 bg-slate-900 border border-gold/40 p-4 rounded-2xl shadow-2xl w-64 animate-fadeIn text-sm">
          <p className="text-white">
            {isIOS ? (
              <>Toque em <i className="fa-solid fa-arrow-up-from-bracket text-gold mx-1"></i> <strong>Compartilhar</strong> e selecione <strong>"Adicionar à Tela de Início"</strong>.</>
            ) : (
              "Abra o menu do seu navegador e selecione 'Instalar App' ou 'Adicionar à tela inicial'."
            )}
          </p>
          <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-slate-900 border-r border-b border-gold/40 rotate-45"></div>
        </div>
      )}

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
