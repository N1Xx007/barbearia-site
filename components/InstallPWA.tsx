
import React, { useState, useEffect } from 'react';

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detecta iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Captura o evento de instalação do Chrome/Android
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    // Esconde se já estiver instalado
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      {/* Botão Flutuante (Bolinha) */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-center gap-1">
        {showGuide && (
          <div className="bg-slate-900 border border-gold/30 p-4 rounded-2xl shadow-2xl max-w-[250px] animate-fadeIn mb-2 relative self-end">
            <button 
              onClick={() => setShowGuide(false)}
              className="absolute -top-2 -right-2 bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
            >
              <i className="fa-solid fa-x"></i>
            </button>
            <h4 className="text-gold font-bold text-sm mb-2">Instalar Aplicativo</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              {isIOS ? (
                <>Toque no ícone de <strong>compartilhar</strong> <i className="fa-solid fa-arrow-up-from-bracket"></i> e depois em <strong>"Adicionar à Tela de Início"</strong>.</>
              ) : (
                "Para uma melhor experiência, adicione este site à sua tela inicial através do menu do seu navegador."
              )}
            </p>
          </div>
        )}
        
        <button
          onClick={handleInstallClick}
          className="w-14 h-14 bg-gold text-slate-950 rounded-full shadow-2xl flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition-all animate-pulse shadow-gold/20 group relative"
          title="Instalar App"
        >
          <i className="fa-solid fa-mobile-screen-button"></i>
        </button>
        <span className="text-[10px] font-bold text-gold uppercase tracking-tighter bg-slate-950/80 px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
          Instalar App
        </span>
      </div>
    </>
  );
};

export default InstallPWA;
