
import React, { useState, useRef } from 'react';
import { getStyleAdvice } from '../services/geminiService';

const AIConsultant: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string; image?: string }[]>([
    { role: 'ai', text: 'Olá! Sou seu Consultor de Estilo Virtual. 🧔 Posso te ajudar a escolher o corte ideal para seu formato de rosto ou sugerir uma barba que combine com você. Deseja me enviar uma foto ou apenas descrever o que procura?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async () => {
    if (!inputText && !selectedImage) return;

    const userMessage = { 
      role: 'user' as const, 
      text: inputText, 
      image: selectedImage || undefined 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInputText('');
    
    // Convert dataURL to base64 if needed (Gemini expects raw base64 without prefix)
    const base64Image = selectedImage ? selectedImage.split(',')[1] : undefined;
    
    const aiResponseText = await getStyleAdvice(inputText || "Analise meu visual e sugira estilos.", base64Image);
    
    setMessages(prev => [...prev, { role: 'ai', text: aiResponseText }]);
    setIsLoading(false);
    setSelectedImage(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section className="py-12 px-4 max-w-4xl mx-auto flex flex-col h-[70vh]">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-2">Consultor de Estilo <span className="text-gold">IA</span></h2>
        <p className="text-slate-400">Analise seu rosto e receba recomendações exclusivas</p>
      </div>

      <div className="flex-grow bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* Chat Messages */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-gold text-slate-950 rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                {m.image && <img src={m.image} className="w-48 rounded-lg mb-2 shadow-md" alt="User face" />}
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-400 p-4 rounded-2xl rounded-tl-none animate-pulse">
                Consultando mestre barbeiro...
              </div>
            </div>
          )}
        </div>

        {/* Selected Image Preview */}
        {selectedImage && (
          <div className="px-6 py-2 bg-slate-800/50 flex items-center gap-4">
            <div className="relative">
              <img src={selectedImage} className="w-16 h-16 rounded-lg object-cover border border-gold" alt="Preview" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                <i className="fa-solid fa-x"></i>
              </button>
            </div>
            <p className="text-xs text-slate-400">Imagem carregada. Clique em enviar para análise.</p>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2 items-center">
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            accept="image/*"
            onChange={handleImageChange}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors"
          >
            <i className="fa-solid fa-camera"></i>
          </button>
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Diga suas preferências ou envie uma foto..."
            className="flex-grow bg-slate-900 border border-slate-800 rounded-full px-6 py-3 text-white focus:outline-none focus:border-gold"
          />
          <button 
            onClick={handleSendMessage}
            className="w-12 h-12 bg-gold text-slate-950 rounded-full flex items-center justify-center hover:bg-amber-500 transition-all"
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </section>
  );
};

export default AIConsultant;
